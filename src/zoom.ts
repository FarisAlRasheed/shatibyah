// Verse size and layout from the room there is. Pinching changes the verse font size only;
// the page itself never zooms (see `touch-action` on html in styles.css).
import { useEffect, useRef, type RefObject } from 'react'
import type { VerseLayout } from './store'

export const DEFAULT_SIZE = 22
const GAP_EM = 2.6 // between the two halves when side by side (matches .halves column-gap)
const NUM_EM = 1.36 // the verse number circle (matches .vnum)
const CHROME = 22 // px beside the text that do not scale: gap after the number, row padding
const FLOOR = 11
const CEILING = 56

/** Largest font size (px) at which both halves fit side by side in `width` px. */
export const sideMax = (width: number, half: number) => (width - CHROME) / (2 * half + GAP_EM + NUM_EM)
/** Largest font size at which one half-line fits the row. */
export const stackMax = (width: number, half: number) => (width - CHROME) / (half + NUM_EM)

export function sizeLimits(width: number, half: number, pref: VerseLayout) {
  const side = sideMax(width, half)
  const stack = stackMax(width, half)
  // Zooming out stops where the two halves sit side by side (a phone) or at a readable size.
  const min = Math.max(FLOOR, Math.min(16, Math.floor(side * 2) / 2))
  const max = Math.max(min, Math.min(CEILING, Math.floor((pref === 'side' ? side : stack) * 2) / 2))
  return { min, max }
}

export const clampSize = (size: number, l: { min: number; max: number }) => Math.min(l.max, Math.max(l.min, size))

export function layoutFor(size: number, width: number, half: number, pref: VerseLayout): 'side' | 'stack' {
  if (pref === 'stack') return 'stack'
  return size <= sideMax(width, half) + 0.01 ? 'side' : 'stack'
}

interface PinchOptions {
  /** Off while another screen or a sheet covers the reader. */
  active: boolean
  size: () => number
  limits: () => { min: number; max: number }
  /** Show a size right away (no React render); called on every frame of a gesture. */
  preview: (size: number) => void
  /** The gesture ended: keep this size. */
  commit: (size: number) => void
}

/**
 * Pinch (touch), trackpad pinch / Ctrl+wheel, and ⌘ + − 0 change the verse size, live: the text is
 * laid out at the new size on every frame (cheap, since rows off screen skip layout: styles.css),
 * and the verse under the fingers is held where it is.
 */
export function usePinch(ref: RefObject<HTMLElement | null>, opts: PinchOptions) {
  const latest = useRef(opts)
  latest.current = opts

  useEffect(() => {
    const el = ref.current
    if (!el || !opts.active) return
    let size = 0 // the size being previewed; 0 = no gesture running
    let frame = 0
    let commitTimer = 0
    let anchor: { el: Element; frac: number; y: number } | null = null

    const begin = (y: number) => {
      size = latest.current.size()
      anchor = anchorAt(el, y)
    }
    const show = (s: number) => {
      latest.current.preview(s)
      if (anchor) holdAnchor(anchor)
    }
    const apply = (next: number) => {
      size = clamp(next)
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (size) show(size)
      })
    }
    const clamp = (s: number) => {
      const { min, max } = latest.current.limits()
      return Math.min(max, Math.max(min, s))
    }
    const end = () => {
      if (!size) return
      const final = Math.round(size * 2) / 2
      size = 0
      // A frame may still be waiting (or never come, in a background tab): settle now.
      cancelAnimationFrame(frame)
      frame = 0
      show(final)
      latest.current.commit(final)
    }
    /** Wheel and key steps have no "end" event: commit shortly after the last one. */
    const endSoon = () => {
      window.clearTimeout(commitTimer)
      commitTimer = window.setTimeout(end, 220)
    }

    // Touch: two fingers.
    let startDist = 0
    let startSize = 0
    const dist = (e: TouchEvent) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      begin((e.touches[0].clientY + e.touches[1].clientY) / 2)
      startDist = dist(e)
      startSize = size
    }
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !startDist) return
      e.preventDefault()
      apply(startSize * (dist(e) / startDist))
    }
    const touchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2 && startDist) {
        startDist = 0
        end()
      }
    }

    // Safari on a Mac: trackpad pinch arrives as gesture events.
    type GestureEvent = Event & { scale: number; clientY: number }
    const gestureStart = (e: Event) => {
      e.preventDefault()
      if (startDist) return // the touch handlers have it
      begin((e as GestureEvent).clientY || innerHeight / 2)
      startSize = size
    }
    const gestureChange = (e: Event) => {
      e.preventDefault()
      if (!startDist && startSize) apply(startSize * (e as GestureEvent).scale)
    }
    const gestureEnd = (e: Event) => {
      e.preventDefault()
      if (!startDist && startSize) {
        startSize = 0
        end()
      }
    }

    // Other browsers: trackpad pinch and Ctrl/⌘ + wheel are wheel events with ctrlKey.
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      if (!size) begin(e.clientY)
      apply(size * Math.exp(-e.deltaY * 0.01))
      endSoon()
    }

    const key = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const step = e.key === '=' || e.key === '+' ? 1.1 : e.key === '-' ? 1 / 1.1 : e.key === '0' ? 0 : null
      if (step == null) return
      e.preventDefault()
      if (!size) begin(innerHeight / 2)
      apply(step ? size * step : DEFAULT_SIZE)
      endSoon()
    }

    el.addEventListener('touchstart', touchStart, { passive: true })
    el.addEventListener('touchmove', touchMove, { passive: false })
    el.addEventListener('touchend', touchEnd)
    el.addEventListener('touchcancel', touchEnd)
    el.addEventListener('gesturestart', gestureStart)
    el.addEventListener('gesturechange', gestureChange)
    el.addEventListener('gestureend', gestureEnd)
    el.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(commitTimer)
      el.removeEventListener('touchstart', touchStart)
      el.removeEventListener('touchmove', touchMove)
      el.removeEventListener('touchend', touchEnd)
      el.removeEventListener('touchcancel', touchEnd)
      el.removeEventListener('gesturestart', gestureStart)
      el.removeEventListener('gesturechange', gestureChange)
      el.removeEventListener('gestureend', gestureEnd)
      el.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
    }
  }, [ref, opts.active])
}

export type Anchor = { el: Element; frac: number; y: number }

/** The verse (or chapter title) at height `y` on screen, and how far down it `y` falls. */
export function anchorAt(list: HTMLElement, y: number): Anchor | null {
  const hit = document.elementFromPoint(innerWidth / 2, y)?.closest('.verse, .banner')
  const target = hit && list.contains(hit) ? hit : [...list.querySelectorAll('.verse')].find((v) => v.getBoundingClientRect().bottom > y)
  if (!target) return null
  const r = target.getBoundingClientRect()
  return { el: target, frac: r.height ? (y - r.top) / r.height : 0, y }
}

/** Scroll so the anchored point is back at its height on screen. */
export function holdAnchor(a: Anchor) {
  const r = a.el.getBoundingClientRect()
  const off = r.top + a.frac * r.height - a.y
  if (Math.abs(off) >= 0.5) window.scrollBy(0, off)
}
