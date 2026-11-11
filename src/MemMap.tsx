// Memorization map (UX-PLAN 5.2): one square per verse, grouped by chapter.
// The squares are plain spans drawn once; selection is a class toggled on the DOM and one
// delegated pointer handler, so tapping or dragging never re-renders 1173 elements.
import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { sectionOf } from './data'
import type { Mastered, Weak } from './store'
import type { Edition, Range } from './types'
import './memmap.css'

type Status = 'mastered' | 'progress' | 'weak' | 'none'

const LABEL: Record<Status, string> = {
  mastered: 'متقَن',
  progress: 'قيد الحفظ',
  weak: 'ضعيف',
  none: 'لم يُبدأ',
}

const ar = toArabicDigits

export interface MemMapProps {
  edition: Edition
  mastered: Mastered
  weak: Weak
  inProgress: Range[]
  onJump: (n: number) => void
}

interface Chapter {
  title: string
  from: number
  to: number
  verses: number[]
}

function chaptersOf(edition: Edition): Chapter[] {
  const tops = edition.sections.filter((s) => s.parent == null).sort((a, b) => a.start - b.start)
  const chapters: Chapter[] = tops.map((s) => ({ title: s.title, from: s.start, to: s.end, verses: [] }))
  const rest: number[] = []
  for (const v of edition.verses) {
    const c = chapters.find((x) => x.from <= v.n && v.n <= x.to)
    if (c) c.verses.push(v.n)
    else rest.push(v.n)
  }
  if (rest.length) chapters.push({ title: 'أبيات أخرى', from: rest[0], to: rest[rest.length - 1], verses: rest })
  return chapters.filter((c) => c.verses.length)
}

export default function MemMap(p: MemMapProps) {
  const chapters = useMemo(() => chaptersOf(p.edition), [p.edition])
  const status = useMemo(() => {
    const m = new Map<number, Status>()
    for (const v of p.edition.verses) {
      const n = v.n
      m.set(
        n,
        p.mastered[n] != null ? 'mastered' : p.weak[n] ? 'weak' : p.inProgress.some((r) => r.from <= n && n <= r.to) ? 'progress' : 'none',
      )
    }
    return m
  }, [p.edition, p.mastered, p.weak, p.inProgress])
  const counts = useMemo(() => {
    const c: Record<Status, number> = { mastered: 0, progress: 0, weak: 0, none: 0 }
    for (const s of status.values()) c[s]++
    return c
  }, [status])

  const [sel, setSel] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const selRef = useRef<number | null>(null)
  const dragging = useRef(false)

  const select = useCallback((n: number | null) => {
    if (n === selRef.current) return
    const root = gridRef.current
    root?.querySelector('.mm-sq.sel')?.classList.remove('sel')
    if (n != null) root?.querySelector(`[data-n="${n}"]`)?.classList.add('sel')
    selRef.current = n
    setSel(n)
  }, [])

  // A status change re-renders the squares and drops the class; put it back.
  useEffect(() => {
    if (selRef.current != null) gridRef.current?.querySelector(`[data-n="${selRef.current}"]`)?.classList.add('sel')
  }, [status])

  const pick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null
    const n = el?.dataset?.n
    if (n && gridRef.current?.contains(el)) select(+n)
  }

  const onDown = (e: PointerEvent) => {
    dragging.current = true
    pick(e.clientX, e.clientY)
  }
  const onMove = (e: PointerEvent) => {
    if (dragging.current) pick(e.clientX, e.clientY)
  }
  const onUp = () => {
    dragging.current = false
  }
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0 // RTL: left is forward
    if (step) {
      e.preventDefault()
      const ns = p.edition.verses.map((v) => v.n)
      const i = selRef.current == null ? -1 : ns.indexOf(selRef.current)
      select(ns[Math.min(ns.length - 1, Math.max(0, i + step))] ?? null)
    } else if (e.key === 'Enter' && selRef.current != null) p.onJump(selRef.current)
    else if (e.key === 'Escape') select(null)
  }

  const s = sel != null ? status.get(sel) : undefined
  return (
    <div className="memmap">
      <p className="mm-summary">
        <span>
          <strong>{ar(counts.mastered)}</strong> متقَن
        </span>
        <span>
          <strong>{ar(counts.progress)}</strong> قيد الحفظ
        </span>
        <span>
          <strong>{ar(counts.weak)}</strong> ضعيف
        </span>
      </p>
      <div className="mm-legend" aria-hidden="true">
        {(['mastered', 'progress', 'weak', 'none'] as Status[]).map((k) => (
          <span key={k}>
            <i className={`mm-sq ${k}`} /> {LABEL[k]}
          </span>
        ))}
      </div>
      <div
        ref={gridRef}
        className="mm-chapters"
        tabIndex={0}
        role="group"
        aria-label="خريطة الحفظ: المس مربعًا لترى بيته، أو استعمل الأسهم"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        onKeyDown={onKey}
      >
        <Squares chapters={chapters} status={status} />
      </div>
      {sel != null && s && (
        <div className="mm-readout" role="status">
          <button className="mm-close" onClick={() => select(null)} aria-label="إغلاق">
            <X size={16} />
          </button>
          <span className="mm-readout-text">
            <i className={`mm-sq ${s}`} />
            <span className="mm-nowrap">البيت {ar(sel)} ·</span>
            <span className="mm-title">{sectionOf(p.edition, sel)?.title ?? ''}</span>
            <span className="mm-nowrap">· {LABEL[s]}</span>
          </span>
          <button className="btn mm-go" onClick={() => p.onJump(sel)}>
            انتقال <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// Re-renders only when the statuses change, never on selection.
const Squares = memo(function Squares({ chapters, status }: { chapters: Chapter[]; status: Map<number, Status> }) {
  return (
    <>
      {chapters.map((c) => (
        <section key={c.from} className="mm-chapter">
          <h3>
            <span>{c.title}</span>
            <small>
              الأبيات {ar(c.from)}–{ar(c.to)}
            </small>
          </h3>
          <div className="mm-grid">
            {c.verses.map((n) => (
              <span key={n} className={`mm-sq ${status.get(n)}`} data-n={n} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
})
