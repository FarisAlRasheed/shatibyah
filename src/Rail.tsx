// Fast-scroll rail on the edge of the reader: drag it to move through the whole poem.
// A bubble names the chapter and verse at the middle of the screen. It shows while the
// page scrolls and fades afterwards.
import { useEffect, useRef, useState } from 'react'
import { toArabicDigits } from './arabic'
import { sectionOf } from './data'
import type { Edition } from './types'

const THUMB = 44 // px tall
const LINGER = 1400 // ms the rail stays after the last scroll

export default function Rail({ edition }: { edition: Edition }) {
  const track = useRef<HTMLDivElement>(null)
  const [frac, setFrac] = useState(0)
  const [shown, setShown] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [where, setWhere] = useState<{ n: number; title: string } | null>(null)
  const drag = useRef(false)

  useEffect(() => {
    let frame = 0
    let timer = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - innerHeight
      setFrac(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0)
      if (drag.current) {
        const id = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('.verse')?.id
        const n = id ? +id.slice(2) : 0
        if (n) setWhere({ n, title: sectionOf(edition, n)?.title ?? '' })
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
      setShown(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => !drag.current && setShown(false), LINGER)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [edition])

  // The track as it was when the drag began, and where on the thumb the finger took hold. Read once:
  // the bars hide and return while the page moves, which resizes the track, and following that
  // would feed the scroll back into itself (the page swinging up and down under a still finger).
  const grip = useRef({ top: 0, height: 1, offset: 0 })
  const moveTo = (clientY: number) => {
    const g = grip.current
    const f = Math.min(1, Math.max(0, (clientY - g.offset - g.top) / (g.height - THUMB)))
    window.scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight))
  }
  const stop = () => {
    drag.current = false
    delete document.documentElement.dataset.railDrag
    setDragging(false)
    setWhere(null)
  }

  return (
    <div className={`rail${shown || dragging ? ' shown' : ''}${dragging ? ' dragging' : ''}`} ref={track} aria-hidden="true">
      <div
        className="rail-thumb"
        style={{ top: `calc(${frac} * (100% - ${THUMB}px))`, height: THUMB }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          const r = track.current!.getBoundingClientRect()
          // Taking hold moves nothing: the thumb stays under the finger where it was touched.
          grip.current = { top: r.top, height: r.height, offset: e.clientY - e.currentTarget.getBoundingClientRect().top }
          drag.current = true
          document.documentElement.dataset.railDrag = '1' // App: leave the bars as they are meanwhile
          setDragging(true)
        }}
        onPointerMove={(e) => drag.current && moveTo(e.clientY)}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {dragging && where && (
          <span className="rail-bubble">
            <span className="verse-text">{where.title}</span> · {toArabicDigits(where.n)}
          </span>
        )}
      </div>
    </div>
  )
}
