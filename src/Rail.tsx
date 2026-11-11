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

  const moveTo = (clientY: number) => {
    const r = track.current!.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (clientY - r.top - THUMB / 2) / (r.height - THUMB)))
    window.scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight))
  }

  return (
    <div className={`rail${shown || dragging ? ' shown' : ''}${dragging ? ' dragging' : ''}`} ref={track} aria-hidden="true">
      <div
        className="rail-thumb"
        style={{ top: `calc(${frac} * (100% - ${THUMB}px))`, height: THUMB }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = true
          setDragging(true)
          moveTo(e.clientY)
        }}
        onPointerMove={(e) => drag.current && moveTo(e.clientY)}
        onPointerUp={() => {
          drag.current = false
          setDragging(false)
          setWhere(null)
        }}
        onPointerCancel={() => {
          drag.current = false
          setDragging(false)
          setWhere(null)
        }}
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
