import type { VerseTiming } from './types'

export interface PlayOptions {
  verseTimes: number // 0 = endless
  rangeTimes: number // 0 = endless
  pause: number // seconds between repeats
  speed: number
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
  error?: string
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
}

// Plays a queue of verses, each repeated `verseTimes`, the whole queue repeated `rangeTimes`.
// One <audio> element; verse ends are enforced with a timer plus timeupdate, so it keeps
// working while the phone is locked (requestAnimationFrame would stop there).
export class RepeatPlayer {
  readonly audio = new Audio()
  private queue: VerseTiming[] = []
  private opts: PlayOptions = { verseTimes: 1, rangeTimes: 1, pause: 0, speed: 1 }
  private state: PlayState = idleState
  private endTimer = 0
  private gapTimer = 0
  private token = 0 // invalidates stale async steps after stop/jump

  constructor(
    private urlFor: (fileId: string) => string,
    private onState: (s: PlayState) => void,
  ) {
    this.audio.preload = 'auto'
    this.audio.addEventListener('timeupdate', () => this.checkEnd())
    this.audio.addEventListener('ended', () => this.verseEnded())
    this.audio.addEventListener('ratechange', () => this.scheduleEnd())
    this.setupMediaSession()
  }

  start(queue: VerseTiming[], opts: PlayOptions, startIndex = 0) {
    this.stop()
    if (!queue.length) return
    this.queue = queue
    this.opts = opts
    this.audio.playbackRate = opts.speed
    this.set({
      status: 'loading',
      verse: queue[startIndex].n,
      index: startIndex,
      total: queue.length,
      verseRound: 1,
      verseTimes: opts.verseTimes,
      rangeRound: 1,
      rangeTimes: opts.rangeTimes,
    })
    void this.playCurrent(true)
  }

  /** Change speed or pause length while playing. */
  update(opts: Pick<PlayOptions, 'pause' | 'speed'>) {
    this.opts = { ...this.opts, ...opts }
    this.audio.playbackRate = opts.speed
  }

  stop() {
    this.token++
    this.clearTimers()
    this.audio.pause()
    this.queue = []
    this.set({ ...idleState })
  }

  pause() {
    if (this.state.status === 'idle') return
    this.token++
    this.clearTimers()
    this.audio.pause()
    this.set({ status: 'paused' })
  }

  resume() {
    if (this.state.status !== 'paused') return
    const t = this.current()
    if (t && this.audio.currentTime >= t.start && this.audio.currentTime < t.end - 0.05) {
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

  /** Jump to the next/previous verse in the queue, resetting that verse's count. */
  step(delta: 1 | -1) {
    if (this.state.status === 'idle') return
    const index = Math.min(this.queue.length - 1, Math.max(0, this.state.index + delta))
    this.token++
    this.clearTimers()
    this.set({ index, verse: this.queue[index].n, verseRound: 1 })
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
      if (seek) this.audio.currentTime = t.start
      this.audio.playbackRate = this.opts.speed
      await this.audio.play()
      if (token !== this.token) return
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
    const ms = ((t.end - this.audio.currentTime) / (this.audio.playbackRate || 1)) * 1000
    this.endTimer = window.setTimeout(() => this.checkEnd(), Math.max(0, ms - 30))
  }

  private checkEnd() {
    const t = this.current()
    if (!t || this.state.status !== 'playing') return
    if (this.audio.currentTime >= t.end - 0.04) this.verseEnded()
    else this.scheduleEnd()
  }

  private verseEnded() {
    if (this.state.status !== 'playing') return
    const cur = this.current()
    const { verseTimes, rangeTimes, pause } = this.opts
    let { index, verseRound, rangeRound } = this.state

    if (verseTimes === 0 || verseRound < verseTimes) {
      verseRound++
    } else {
      verseRound = 1
      index++
      if (index >= this.queue.length) {
        if (rangeTimes === 0 || rangeRound < rangeTimes) {
          index = 0
          rangeRound++
        } else {
          this.audio.pause()
          this.clearTimers()
          this.set({ ...idleState })
          return
        }
      }
    }

    const next = this.queue[index]
    // Consecutive verses in one file with no pause: let the audio run on, no seek click.
    const flows = pause === 0 && next !== cur && next.file === cur.file && Math.abs(next.start - cur.end) < 0.35
    this.set({ index, verse: next.n, verseRound, rangeRound })
    if (flows) {
      this.updateMediaMetadata()
      this.scheduleEnd()
      return
    }
    this.audio.pause()
    if (pause > 0) {
      const token = ++this.token
      this.set({ status: 'gap' })
      this.gapTimer = window.setTimeout(() => {
        if (token === this.token) void this.playCurrent(true)
      }, pause * 1000)
    } else {
      void this.playCurrent(true)
    }
  }

  private fail(e: unknown) {
    this.clearTimers()
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
      navigator.mediaSession.playbackState =
        this.state.status === 'playing' || this.state.status === 'gap' ? 'playing' : this.state.status === 'paused' ? 'paused' : 'none'
    }
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    ms.setActionHandler('play', () => this.resume())
    ms.setActionHandler('pause', () => this.pause())
    ms.setActionHandler('nexttrack', () => this.step(1))
    ms.setActionHandler('previoustrack', () => this.step(-1))
  }

  private updateMediaMetadata() {
    if (!('mediaSession' in navigator) || this.state.verse == null) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `البيت ${this.state.verse.toLocaleString('ar-EG')}`,
      artist: 'متن الشاطبية',
    })
  }
}
