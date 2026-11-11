import type { VerseTiming } from './types'

export interface PlayOptions {
  verseTimes: number // 0 = endless
  rangeTimes: number // 0 = endless
  pause: number // seconds between repeats
  speed: number
  /** Pause as long as the verse just played (so the listener can repeat it), instead of `pause`. */
  echo?: boolean
}

/**
 * One stage of a playback programme: queue positions `from`…`to`, each verse `verseTimes`,
 * the stage `rangeTimes`. Plain repeats are a single stage; cumulative repeat is many.
 */
export interface Stage {
  from: number
  to: number
  verseTimes: number // 0 = endless
  rangeTimes: number // 0 = endless
}

/** Cumulative repeat over `count` verses: 1 ×n, 2 ×n, 1–2 ×m, 3 ×n, 1–3 ×m, … */
export function cumulativeStages(count: number, verseTimes: number, groupTimes: number): Stage[] {
  const stages: Stage[] = []
  for (let i = 0; i < count; i++) {
    stages.push({ from: i, to: i, verseTimes, rangeTimes: 1 })
    if (i > 0) stages.push({ from: 0, to: i, verseTimes: 1, rangeTimes: groupTimes })
  }
  return stages
}

export interface PlayState {
  status: 'idle' | 'loading' | 'playing' | 'gap' | 'paused'
  verse: number | null
  index: number // position in the queue, 0-based
  total: number
  verseRound: number
  verseTimes: number
  rangeRound: number
  rangeTimes: number
  /** Stage of the programme, 0-based, and how many there are (1 unless cumulative). */
  stage: number
  stages: number
  error?: string
}

/** Lock-screen details for a verse: section/chapter title and reciter name. */
export interface VerseMeta {
  album: string
  artist: string
}

export const idleState: PlayState = {
  status: 'idle',
  verse: null,
  index: 0,
  total: 0,
  verseRound: 1,
  verseTimes: 1,
  rangeRound: 1,
  rangeTimes: 1,
  stage: 0,
  stages: 1,
}

// Plays a queue of verses, each repeated `verseTimes`, the whole queue repeated `rangeTimes`
// (or, for cumulative repeat, a list of such stages over parts of the queue).
// One <audio> element; verse ends are enforced with a timer plus timeupdate, so it keeps
// working while the phone is locked (requestAnimationFrame would stop there).
// During the pause between repeats a second element loops silence, so iOS keeps the
// audio session (and the page's timers) alive while the screen is locked.
// Consecutive verses play straight through the file. Wherever playback must jump (a repeat,
// a pause, a skipped verse), it starts a little before the verse and stops a little after it,
// inside the silence between verses, so the jump never clips the reciter.
export class RepeatPlayer {
  readonly audio = new Audio()
  private keepAlive = new Audio(silentWav())
  private meta: (verse: number) => VerseMeta = () => ({ album: '', artist: 'متن الشاطبية' })
  private queue: VerseTiming[] = []
  private stages: Stage[] = []
  private opts: PlayOptions = { verseTimes: 1, rangeTimes: 1, pause: 0, speed: 1 }
  private state: PlayState = idleState
  private endTimer = 0
  private gapTimer = 0
  private token = 0 // invalidates stale async steps after stop/jump
  private bounds = new Map<string, { from: number; to: number }>() // padded play range per verse

  constructor(
    private urlFor: (fileId: string) => string,
    private onState: (s: PlayState) => void,
  ) {
    this.audio.preload = 'auto'
    this.audio.addEventListener('timeupdate', () => this.checkEnd())
    this.audio.addEventListener('ended', () => this.verseEnded())
    this.audio.addEventListener('ratechange', () => {
      this.scheduleEnd()
      this.updatePosition()
    })
    this.keepAlive.loop = true
    this.keepAlive.preload = 'auto'
    this.setupMediaSession()
  }

  /** Where the lock screen gets its album (section) and artist (reciter) for a verse. */
  setMeta(fn: (verse: number) => VerseMeta) {
    this.meta = fn
    this.updateMediaMetadata()
  }

  /** All of the reciter's timings, so each verse can be padded into the silence around it. */
  setTimings(verses: VerseTiming[]) {
    this.bounds.clear()
    const sorted = verses.slice().sort((a, b) => a.n - b.n)
    sorted.forEach((t, i) => {
      const prev = sorted[i - 1]?.file === t.file ? sorted[i - 1] : null
      const next = sorted[i + 1]?.file === t.file ? sorted[i + 1] : null
      // The lead takes the larger share of the gap: a soft opening (a و) can begin before t.start.
      const lead = prev ? Math.min(MAX_PAD, Math.max(0, t.start - prev.end) * 0.6) : Math.min(FIRST_LEAD, t.start)
      const tail = next ? Math.min(MAX_PAD, Math.max(0, next.start - t.end) * 0.4) : MAX_PAD
      this.bounds.set(key(t), { from: t.start - lead, to: t.end + tail })
    })
  }

  private range(t: VerseTiming) {
    return this.bounds.get(key(t)) ?? { from: t.start, to: t.end }
  }

  /** `stages` (cumulative repeat) replaces the single stage that `opts` describes; it starts at its first stage. */
  start(queue: VerseTiming[], opts: PlayOptions, startIndex = 0, stages?: Stage[]) {
    this.stop()
    if (!queue.length) return
    this.primeKeepAlive()
    this.queue = queue
    this.opts = opts
    this.stages = stages?.length ? stages : [{ from: 0, to: queue.length - 1, verseTimes: opts.verseTimes, rangeTimes: opts.rangeTimes }]
    const first = this.stages[0]
    const index = stages?.length ? first.from : startIndex
    this.audio.playbackRate = opts.speed
    this.set({
      status: 'loading',
      verse: queue[index].n,
      index,
      total: queue.length,
      verseRound: 1,
      verseTimes: first.verseTimes,
      rangeRound: 1,
      rangeTimes: first.rangeTimes,
      stage: 0,
      stages: this.stages.length,
    })
    void this.playCurrent(true)
  }

  /** Change speed or pause length while playing. */
  update(opts: Pick<PlayOptions, 'pause' | 'speed' | 'echo'>) {
    this.opts = { ...this.opts, ...opts }
    this.audio.playbackRate = opts.speed
  }

  stop() {
    this.token++
    this.clearTimers()
    this.stopKeepAlive()
    this.audio.pause()
    this.queue = []
    this.set({ ...idleState })
  }

  pause() {
    if (this.state.status === 'idle') return
    this.token++
    this.clearTimers()
    this.stopKeepAlive()
    this.audio.pause()
    this.set({ status: 'paused' })
  }

  resume() {
    if (this.state.status !== 'paused') return
    this.primeKeepAlive()
    const t = this.current()
    if (t && this.audio.currentTime >= this.range(t).from && this.audio.currentTime < this.stopAt() - 0.05) {
      this.set({ status: 'playing' })
      void this.audio.play().catch((e) => this.fail(e))
      this.scheduleEnd()
    } else {
      void this.playCurrent(true)
    }
  }

  toggle() {
    if (this.state.status === 'paused') this.resume()
    else if (this.state.status !== 'idle') this.pause()
  }

  /**
   * Jump to the next/previous verse in the queue, resetting that verse's count.
   * In a programme of several stages it moves between stages instead: forward to the next
   * stage, back to the start of this one (or of the one before, when already there).
   */
  step(delta: 1 | -1) {
    if (this.state.status === 'idle') return
    this.token++
    this.clearTimers()
    if (this.stages.length > 1) {
      const atStart = this.state.index === this.stages[this.state.stage].from && this.state.rangeRound === 1
      const stage = Math.min(this.stages.length - 1, Math.max(0, this.state.stage + (delta > 0 ? 1 : atStart ? -1 : 0)))
      const s = this.stages[stage]
      this.set({ stage, index: s.from, verse: this.queue[s.from].n, verseRound: 1, rangeRound: 1, verseTimes: s.verseTimes, rangeTimes: s.rangeTimes })
    } else {
      const index = Math.min(this.queue.length - 1, Math.max(0, this.state.index + delta))
      this.set({ index, verse: this.queue[index].n, verseRound: 1 })
    }
    void this.playCurrent(true)
  }

  /** Play the current verse again from its start, resetting its count. */
  replay() {
    if (this.state.status === 'idle') return
    this.token++
    this.clearTimers()
    this.set({ verseRound: 1 })
    void this.playCurrent(true)
  }

  get snapshot() {
    return this.state
  }

  private current() {
    return this.queue[this.state.index]
  }

  private async playCurrent(seek: boolean) {
    const t = this.current()
    if (!t) return
    const token = ++this.token
    this.clearTimers()
    const url = this.urlFor(t.file)
    try {
      if (this.audio.src !== url) {
        this.set({ status: 'loading' })
        this.audio.src = url
        await new Promise<void>((resolve, reject) => {
          const ok = () => (cleanup(), resolve())
          const bad = () => (
            cleanup(),
            reject(new Error(navigator.onLine ? 'تعذّر تحميل الملف الصوتي' : 'لا يوجد اتصال وهذه السورة غير منزّلة. نزّلها من زر ⤓'))
          )
          const cleanup = () => {
            this.audio.removeEventListener('loadedmetadata', ok)
            this.audio.removeEventListener('error', bad)
          }
          this.audio.addEventListener('loadedmetadata', ok)
          this.audio.addEventListener('error', bad)
          this.audio.load()
        })
        seek = true
      }
      if (token !== this.token) return
      if (seek) this.audio.currentTime = this.range(t).from
      this.audio.playbackRate = this.opts.speed
      await this.audio.play()
      if (token !== this.token) return
      this.stopKeepAlive()
      this.set({ status: 'playing', verse: t.n, error: undefined })
      this.updateMediaMetadata()
      this.scheduleEnd()
    } catch (e) {
      if (token === this.token) this.fail(e)
    }
  }

  private scheduleEnd() {
    window.clearTimeout(this.endTimer)
    const t = this.current()
    if (!t || this.state.status !== 'playing') return
    const ms = ((this.stopAt() - this.audio.currentTime) / (this.audio.playbackRate || 1)) * 1000
    this.endTimer = window.setTimeout(() => this.checkEnd(), Math.max(0, ms - 30))
  }

  private checkEnd() {
    const t = this.current()
    if (!t || this.state.status !== 'playing') return
    if (this.audio.currentTime >= this.stopAt() - 0.04) this.verseEnded()
    else this.scheduleEnd()
  }

  /** What comes after the current verse: the next queue position and counts, or null at the end. */
  private advance() {
    let { index, verseRound, rangeRound, stage } = this.state
    const s = this.stages[stage]
    if (!s) return null
    if (s.verseTimes === 0 || verseRound < s.verseTimes) {
      verseRound++
    } else {
      verseRound = 1
      index++
      if (index > s.to) {
        if (s.rangeTimes === 0 || rangeRound < s.rangeTimes) {
          index = s.from
          rangeRound++
        } else {
          stage++
          if (stage >= this.stages.length) return null
          index = this.stages[stage].from
          rangeRound = 1
        }
      }
    }
    return { index, verseRound, rangeRound, stage }
  }

  /** The next verse follows this one in the same file with no pause, so the audio just runs on. */
  private flowsInto(next: VerseTiming | undefined) {
    const cur = this.current()
    return !!next && this.opts.pause === 0 && !this.opts.echo && next.file === cur.file && next.n === cur.n + 1
  }

  /** Where the current verse hands over: its own end when the audio runs on, else its padded end. */
  private stopAt() {
    const t = this.current()
    const step = this.advance()
    return this.flowsInto(step ? this.queue[step.index] : undefined) ? t.end : this.range(t).to
  }

  private verseEnded() {
    if (this.state.status !== 'playing') return
    const step = this.advance()
    if (!step) {
      this.audio.pause()
      this.clearTimers()
      this.set({ ...idleState })
      return
    }
    const { index, verseRound, rangeRound, stage } = step
    const next = this.queue[index]
    const flows = this.flowsInto(next)
    const played = this.current()
    // Echo: silence as long as the verse just heard took at this speed.
    const pause = this.opts.echo ? (played.end - played.start) / (this.opts.speed || 1) : this.opts.pause
    const { verseTimes, rangeTimes } = this.stages[stage]
    this.set({ index, verse: next.n, verseRound, rangeRound, stage, verseTimes, rangeTimes })
    if (flows) {
      this.updateMediaMetadata()
      this.scheduleEnd()
      return
    }
    this.audio.pause()
    if (pause > 0) {
      const token = ++this.token
      this.set({ status: 'gap' })
      this.startKeepAlive()
      this.gapTimer = window.setTimeout(() => {
        if (token === this.token) void this.playCurrent(true)
      }, pause * 1000)
    } else {
      void this.playCurrent(true)
    }
  }

  private fail(e: unknown) {
    this.clearTimers()
    this.stopKeepAlive()
    this.audio.pause()
    this.set({ status: 'paused', error: e instanceof Error ? e.message : String(e) })
  }

  private clearTimers() {
    window.clearTimeout(this.endTimer)
    window.clearTimeout(this.gapTimer)
  }

  private set(patch: Partial<PlayState>) {
    this.state = { ...this.state, ...patch }
    this.onState(this.state)
    if ('mediaSession' in navigator) {
      // 'gap' and 'loading' are part of playing, so the lock screen keeps showing a pause button.
      const { status } = this.state
      navigator.mediaSession.playbackState = status === 'idle' ? 'none' : status === 'paused' ? 'paused' : 'playing'
      if (status === 'idle') navigator.mediaSession.metadata = null
    }
  }

  // iOS lets an element play from a timer only after it played once inside a user gesture,
  // so start() and resume() (tap handlers) bless the silent element without letting it sound.
  private primeKeepAlive() {
    if (!this.keepAlive.paused) return
    this.keepAlive.play().catch(() => {})
    this.keepAlive.pause()
  }

  private startKeepAlive() {
    this.keepAlive.currentTime = 0
    this.keepAlive.play().catch(() => {})
  }

  private stopKeepAlive() {
    if (!this.keepAlive.paused) this.keepAlive.pause()
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    ms.setActionHandler('play', () => this.resume())
    ms.setActionHandler('pause', () => this.pause())
    ms.setActionHandler('nexttrack', () => this.step(1))
    ms.setActionHandler('previoustrack', () => this.step(-1))
    // seekbackward/seekforward are left unset on purpose: iOS would swap the next/previous
    // verse buttons for ±10 s buttons.
    const optional: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['stop', () => this.stop()],
      // The scrubber spans the current verse only.
      ['seekto', (d) => this.seekInVerse(d.seekTime ?? 0)],
    ]
    for (const [action, fn] of optional) {
      try {
        ms.setActionHandler(action, fn)
      } catch {
        /* action not supported by this browser */
      }
    }
  }

  private seekInVerse(offset: number) {
    const t = this.current()
    if (!t || this.state.status === 'idle') return
    const time = Math.min(t.end - 0.1, t.start + Math.max(0, offset))
    if (this.state.status === 'playing' && this.audio.src === this.urlFor(t.file)) {
      this.audio.currentTime = time
      this.scheduleEnd()
      this.updatePosition()
    }
  }

  private updateMediaMetadata() {
    if (!('mediaSession' in navigator) || this.state.verse == null) return
    const n = this.state.verse
    const { album, artist } = this.meta(n)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `البيت ${n.toLocaleString('ar-EG')}`,
      artist,
      album,
      artwork: [192, 512].map((size) => ({
        src: new URL(`${import.meta.env.BASE_URL}icon-${size}.png`, location.href).href,
        sizes: `${size}x${size}`,
        type: 'image/png',
      })),
    })
    this.updatePosition()
  }

  private updatePosition() {
    const t = this.current()
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState || !t) return
    const duration = Math.max(0.1, t.end - t.start)
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(duration, Math.max(0, this.audio.currentTime - t.start)),
        playbackRate: this.audio.playbackRate || 1,
      })
    } catch {
      /* best effort */
    }
  }
}

const MAX_PAD = 0.3 // seconds of padding at most on each side of a verse
const FIRST_LEAD = 0.15 // before a file's first verse the spoken title sits close, so stay short
const key = (t: VerseTiming) => `${t.file}:${t.n}`

// One second of 8 kHz 8-bit mono silence as a WAV data URL (built here, nothing to download).
function silentWav() {
  const rate = 8000
  const bytes = new Uint8Array(44 + rate)
  const view = new DataView(bytes.buffer)
  const text = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + rate, true)
  text(8, 'WAVEfmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, rate, true)
  view.setUint32(28, rate, true) // byte rate
  view.setUint16(32, 1, true) // block align
  view.setUint16(34, 8, true) // bits per sample
  text(36, 'data')
  view.setUint32(40, rate, true)
  bytes.fill(128, 44) // 8-bit PCM is unsigned: 128 is silence
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return `data:audio/wav;base64,${btoa(bin)}`
}
