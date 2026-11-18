// The reader draws only the verses near the screen, like a game that draws only what the player
// can see: about one screen above and below. Everything else is two spacers, top and bottom, whose
// heights come from the verses' measured heights, or an estimate for those never drawn yet.
//
// Estimates are never exact. When a verse is drawn and turns out taller or shorter than guessed,
// the text on screen must not move: the top spacer absorbs the difference (`fudge`), so nothing is
// scrolled while a finger or a flick is moving the page (a scroll from code would stop the flick on
// iPhone). Once the page rests, the spacer is put right and the scroll position shifted by the same
// amount, which leaves the text exactly where it was.
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'

const CHUNK = 6 // the window moves in steps of this many verses, so it re-renders less often
const BUFFER = 1 // screens drawn above and below the visible part
const IDLE = 220 // ms without scrolling before the spacer is put right

export interface VerseWindow {
  start: number
  end: number
  /** Heights for the two spacers, in px. */
  top: number
  bottom: number
  /** Run `then` once block i is drawn (now, if it already is): for jumps to a far verse. */
  goTo: (i: number, then: () => void) => void
  /** Whether block i is drawn now. */
  drawn: (i: number) => boolean
}

interface Options {
  list: RefObject<HTMLElement | null>
  /** The top spacer, which is where the blocks begin. */
  topEl: RefObject<HTMLElement | null>
  count: number
  /** Blocks of the same kind (a verse, a verse under a chapter title, …) share a height estimate. */
  kind: (i: number) => string
  /** A first guess for a kind, before any block of it was measured. */
  guess: (kind: string, plain: number) => number
  /** When this changes (font, size, layout, width), every measured height is dropped. */
  resetKey: string
  /** The block to begin around (the last verse read). */
  initial: number
  /** Blocks to keep drawn while they are near the window (the group the explanation shows). */
  keep?: [number, number] | null
}

export function useVerseWindow(o: Options): VerseWindow {
  const { count } = o
  const m = useRef({
    heights: new Float64Array(count),
    sums: new Map<string, [number, number]>(), // kind → [total height, how many]
    offs: new Float64Array(count + 1),
    dirty: true,
    fudge: 0,
    reset: o.resetKey,
    pending: null as null | { i: number; then: () => void },
    justReset: false,
    touching: false,
  }).current
  const opts = useRef(o)
  opts.current = o

  if (m.heights.length !== count) {
    m.heights = new Float64Array(count)
    m.offs = new Float64Array(count + 1)
    m.dirty = true
  }
  if (m.reset !== o.resetKey) {
    m.reset = o.resetKey
    m.heights.fill(0)
    m.sums.clear()
    m.dirty = true
    m.justReset = true
  }

  const plain = () => {
    const s = m.sums.get('')
    return s ? s[0] / s[1] : opts.current.guess('', 0)
  }
  const estimate = (i: number) => {
    if (m.heights[i]) return m.heights[i]
    const k = opts.current.kind(i)
    const s = m.sums.get(k)
    return s ? s[0] / s[1] : opts.current.guess(k, plain())
  }
  const offsets = () => {
    if (m.dirty) {
      for (let i = 0; i < count; i++) m.offs[i + 1] = m.offs[i] + estimate(i)
      m.dirty = false
    }
    return m.offs
  }

  const around = (i: number) => ({
    start: Math.max(0, Math.floor((i - 12) / CHUNK) * CHUNK),
    end: Math.min(count, Math.ceil((i + 24) / CHUNK) * CHUNK),
  })
  const [win, setWin] = useState(() => around(o.initial))
  const winRef = useRef(win)
  winRef.current = win

  /** The window the screen needs now, or null when the page is not laid out. */
  const wanted = () => {
    const topEl = opts.current.topEl.current
    if (!topEl || !topEl.isConnected) return null
    const offs = offsets()
    // Page y of block i is (top of the spacer) + offs[i] + fudge.
    const y = -topEl.getBoundingClientRect().top - m.fudge
    const vh = Math.max(innerHeight, 500) // a hidden page can report 0
    const pad = vh * BUFFER
    const from = y - pad
    const to = y + vh + pad
    let s = upper(offs, from) - 1
    let e = upper(offs, to)
    s = Math.max(0, Math.floor(s / CHUNK) * CHUNK)
    e = Math.min(count, Math.ceil(e / CHUNK) * CHUNK)
    const keep = opts.current.keep
    if (keep && keep[1] >= s - 40 && keep[0] <= e + 40) {
      s = Math.max(0, Math.min(s, keep[0]))
      e = Math.min(count, Math.max(e, keep[1] + 1))
    }
    return { start: s, end: Math.max(e, s + 1) }
  }
  const update = () => {
    if (m.pending) return // a jump is on its way: the window is already where it lands
    const w = wanted()
    const cur = winRef.current
    if (w && (w.start !== cur.start || w.end !== cur.end)) flushSync(() => setWin(w))
  }

  /** Put the top spacer at height `h` and scroll by the same change, so the text stays put. */
  const setTop = (h: number, scroll: boolean) => {
    const topEl = opts.current.topEl.current
    if (!topEl) return
    const before = parseFloat(topEl.style.height) || 0
    topEl.style.height = `${h}px`
    if (scroll && Math.abs(h - before) >= 0.5) window.scrollBy(0, h - before)
  }
  const settle = () => {
    // Put the spacer right: its true height, no fudge.
    if (!m.fudge) return
    const offs = offsets()
    m.fudge = 0
    setTop(offs[winRef.current.start], true)
  }

  // After every change: measure what is drawn, hold the text in place, run a pending jump.
  useLayoutEffect(() => {
    const listEl = opts.current.list.current
    const topEl = opts.current.topEl.current
    const bottomEl = listEl?.querySelector<HTMLElement>(':scope > .vspacer.bottom')
    if (!listEl || !topEl) return
    // Where each block was in the model (and so on the page) before this change.
    const before = offsets().slice()
    const fresh = m.justReset
    m.justReset = false
    const drawn = [...listEl.querySelectorAll<HTMLElement>('.vgroup')]
    for (const el of drawn) {
      const i = +el.dataset.i!
      const h = el.offsetHeight
      if (!h || Math.abs(m.heights[i] - h) < 0.5) continue
      const k = opts.current.kind(i)
      const s = m.sums.get(k) ?? [0, 0]
      if (m.heights[i]) s[0] += h - m.heights[i]
      else (s[0] += h), s[1]++
      m.sums.set(k, s)
      m.heights[i] = h
      m.dirty = true
    }
    const offs = offsets()
    const { start, end } = winRef.current
    // Hold the block at the top of the screen where it was: its page position was
    // spacer + before[j] + fudge, and must stay so with the new heights. Worked out from the model
    // alone, so a scroll that lands while React is busy is never undone. After a change of look
    // there is no "before": the look anchor in Reader.tsx holds the place instead.
    if (fresh) m.fudge = 0
    else {
      const j = drawn.find((el) => el.getBoundingClientRect().bottom > 0)
      if (j) m.fudge += before[+j.dataset.i!] - offs[+j.dataset.i!]
    }
    topEl.style.height = `${Math.max(0, offs[start] + m.fudge)}px`
    if (bottomEl) bottomEl.style.height = `${offs[count] - offs[end]}px`

    // The spacer can't be negative, and at the very top it must be exact: settle at once.
    if (offs[start] + m.fudge < 0 || (start === 0 && m.fudge)) settle()

    const p = m.pending
    if (p && p.i >= start && p.i < end) {
      m.pending = null
      p.then() // its scroll event then moves the window to where the jump landed
    }
  })

  useEffect(() => {
    let idle = 0
    const onScroll = () => {
      // Right away, not a frame later: scroll events come just before the page is painted, so the
      // verses for the new place are there in the same frame (a jump along the rail shows no gap).
      update()
      window.clearTimeout(idle)
      idle = window.setTimeout(() => !m.touching && settle(), IDLE)
    }
    const down = () => (m.touching = true)
    const up = () => {
      m.touching = false
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, IDLE)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up, { passive: true })
    window.addEventListener('touchcancel', up, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('touchstart', down)
      window.removeEventListener('touchend', up)
      window.removeEventListener('touchcancel', up)
      window.clearTimeout(idle)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A change of look re-estimates everything: work out the window again.
  useEffect(() => {
    const f = requestAnimationFrame(update)
    return () => cancelAnimationFrame(f)
  }, [o.resetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const offs = offsets()
  return {
    start: win.start,
    end: win.end,
    top: Math.max(0, offs[win.start] + m.fudge),
    bottom: offs[count] - offs[win.end],
    drawn: (i) => i >= winRef.current.start && i < winRef.current.end,
    goTo: (i, then) => {
      const cur = winRef.current
      if (i >= cur.start && i < cur.end) return then()
      m.pending = { i, then }
      m.fudge = 0
      setWin(around(i))
    },
  }
}

/** The first index whose value is greater than x (offsets are sorted). */
function upper(a: Float64Array, x: number) {
  let lo = 0
  let hi = a.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (a[mid] > x) hi = mid
    else lo = mid + 1
  }
  return lo
}
