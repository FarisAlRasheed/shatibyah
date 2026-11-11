// The small action bar under a tapped verse (UX-PLAN 3.1). «المزيد» opens the full verse sheet.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Bookmark, BookmarkCheck, Ellipsis, Pencil, Play, Repeat, Rows3 } from 'lucide-react'
import { toArabicDigits } from './arabic'

export default function VerseBar(p: {
  n: number
  canPlay: boolean
  bookmarked: boolean
  /** Same-ending verses, 0 to hide the button. */
  twins: number
  onPlayFrom: () => void
  onRepeatFrom: () => void
  onBookmark: () => void
  onNote: () => void
  onTwins: () => void
  onMore: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [above, setAbove] = useState(false)
  const onClose = useRef(p.onClose)
  onClose.current = p.onClose

  // Below the verse, unless the bottom bars would cover it there; then above.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const verse = el.parentElement!
    let frame = 0
    const place = () => {
      frame = 0
      const v = verse.getBoundingClientRect()
      const dock = document.querySelector('.bottom-dock')?.getBoundingClientRect().top ?? innerHeight
      const floor = Math.min(dock, innerHeight) - 8
      setAbove(v.bottom + el.offsetHeight > floor && v.top - el.offsetHeight > 70)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(place)
    }
    place()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [p.n])

  // Goes away on a tap anywhere but this verse (a tap on the verse itself toggles it) and on Escape.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element
      if (!ref.current?.parentElement?.contains(t)) onClose.current()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose.current()
    addEventListener('pointerdown', onDown, true)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('pointerdown', onDown, true)
      removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className={`verse-bar${above ? ' above' : ''}`} role="toolbar" aria-label={`البيت ${toArabicDigits(p.n)}`}>
      {p.canPlay && (
        <>
          <button onClick={p.onPlayFrom}>
            <Play size={19} />
            <span>تشغيل من هنا</span>
          </button>
          <button onClick={p.onRepeatFrom}>
            <Repeat size={19} />
            <span>تكرار من هنا</span>
          </button>
        </>
      )}
      <button onClick={p.onBookmark} className={p.bookmarked ? 'on' : ''} aria-pressed={p.bookmarked}>
        {p.bookmarked ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        <span>{p.bookmarked ? 'معلَّم' : 'علامة'}</span>
      </button>
      <button onClick={p.onNote}>
        <Pencil size={19} />
        <span>ملاحظة</span>
      </button>
      {p.twins > 0 && (
        <button onClick={p.onTwins}>
          <Rows3 size={19} />
          <span>متشابهات ({toArabicDigits(p.twins)})</span>
        </button>
      )}
      <button onClick={p.onMore}>
        <Ellipsis size={19} />
        <span>المزيد</span>
      </button>
    </div>
  )
}
