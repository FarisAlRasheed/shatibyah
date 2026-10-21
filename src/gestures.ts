import { useEffect, useRef, type RefObject } from 'react'

interface SwipeOptions {
  /** Pull down to dismiss (only starts when the element is scrolled to the top). */
  onDismiss?: () => void
  /** Horizontal swipe; dx > 0 means the finger moved right. */
  onSwipe?: (dir: 'left' | 'right') => void
}

const DISMISS_PX = 110
const SWIPE_PX = 60

// Touch gestures for full-screen views and sheets: the element follows the finger while
// pulled down, then either closes or springs back. Plain touch events, so it works in iOS standalone mode.
export function useSwipe<T extends HTMLElement>(opts: SwipeOptions): RefObject<T | null> {
  const ref = useRef<T>(null)
  const latest = useRef(opts)
  latest.current = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let x0 = 0
    let y0 = 0
    let axis: 'x' | 'y' | null = null
    let tracking = false
    let scrolled = false // started inside content that is scrolled down: let it scroll instead

    const reset = () => {
      el.classList.remove('dragging')
      el.classList.add('settling')
      el.style.transform = ''
      window.setTimeout(() => el.classList.remove('settling'), 260)
    }
    const start = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      scrolled = false
      for (let n: HTMLElement | null = target; n && n !== el.parentElement; n = n.parentElement) if (n.scrollTop > 0) scrolled = true
      x0 = e.touches[0].clientX
      y0 = e.touches[0].clientY
      axis = null
      tracking = true
    }
    const move = (e: TouchEvent) => {
      if (!tracking) return
      const dx = e.touches[0].clientX - x0
      const dy = e.touches[0].clientY - y0
      if (!axis && Math.hypot(dx, dy) > 10) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axis === 'y' && (dy < 0 || scrolled || !latest.current.onDismiss)) tracking = false
        if (axis === 'x' && !latest.current.onSwipe) tracking = false
        if (tracking && axis === 'y') el.classList.add('dragging')
      }
      if (tracking && axis === 'y') {
        e.preventDefault()
        el.style.transform = `translateY(${Math.max(0, dy)}px)`
      }
    }
    const end = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const t = e.changedTouches[0]
      const dx = t.clientX - x0
      const dy = t.clientY - y0
      if (axis === 'y') {
        if (dy > DISMISS_PX) latest.current.onDismiss?.()
        else reset()
      } else if (axis === 'x' && Math.abs(dx) > SWIPE_PX) {
        latest.current.onSwipe?.(dx > 0 ? 'right' : 'left')
      }
    }

    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', reset)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', reset)
    }
  }, [])

  return ref
}
