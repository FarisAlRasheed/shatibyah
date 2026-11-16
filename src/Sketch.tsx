// Sketch notes: hand drawing over a verse (IMPROVEMENTS-PLAN 4).
// Points are stored as shares of the verse's box (0…1000 across, 0…1000 down), so a sketch follows
// the verse when the text size or the screen changes.
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { Check, Eraser, Trash2, Undo2 } from 'lucide-react'

export interface Stroke {
  /** 'ink' follows the theme's text colour; otherwise a CSS colour. */
  c: string
  /** Line width in screen pixels. */
  s: number
  /** x0, y0, x1, y1 … in thousandths of the verse box. */
  p: number[]
}
export interface Sketch {
  strokes: Stroke[]
  at: number
}
export type Sketches = Record<number, Sketch>

const PEN_COLORS = ['ink', '#d64545', '#2f6fd0', '#2f9e62']
const PEN_SIZES = [2.5, 5]
const css = (c: string) => (c === 'ink' ? 'var(--text)' : c)
const path = (p: number[]) => {
  if (p.length === 2) return `M${p[0]} ${p[1]}l0.01 0`
  let d = `M${p[0]} ${p[1]}`
  for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`
  return d
}

function Strokes({ strokes }: { strokes: Stroke[] }) {
  return (
    <>
      {strokes.map((s, i) => (
        <path key={i} d={path(s.p)} stroke={css(s.c)} strokeWidth={s.s} fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </>
  )
}

/** The saved sketch, drawn over the verse (taps pass through it). */
export function SketchView({ sketch }: { sketch: Sketch }) {
  return (
    <svg className="sketch-view" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden>
      <Strokes strokes={sketch.strokes} />
    </svg>
  )
}

/**
 * Drawing on a verse. Rendered right under the verse (inside its <article>): the canvas is laid over
 * the verse's text, the tools stay below it.
 */
export function SketchEditor(p: { sketch: Sketch | undefined; onSave: (strokes: Stroke[]) => void; onCancel: () => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>(p.sketch?.strokes ?? [])
  const [color, setColor] = useState(PEN_COLORS[1])
  const [size, setSize] = useState(PEN_SIZES[0])
  const [erasing, setErasing] = useState(false)
  const [height, setHeight] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const live = useRef<number[] | null>(null)
  /** A pointer is down on the canvas. */
  const held = useRef(false)
  const [, redraw] = useState(0)

  // The canvas takes the height of the verse's text, the element just before this one.
  useLayoutEffect(() => {
    const body = root.current?.parentElement?.querySelector<HTMLElement>('.verse-body')
    if (!body) return
    const measure = () => setHeight(body.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(body)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && p.onCancel()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [p])

  const point = (e: RPointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    return [Math.round(((e.clientX - r.left) / r.width) * 1000), Math.round(((e.clientY - r.top) / r.height) * 1000)]
  }
  /** Removes every stroke that passes near the pointer. */
  const eraseAt = (e: RPointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const [x, y] = point(e)
    const near = (s: Stroke) => {
      for (let i = 0; i < s.p.length; i += 2) {
        const dx = ((s.p[i] - x) / 1000) * r.width, dy = ((s.p[i + 1] - y) / 1000) * r.height
        if (dx * dx + dy * dy < 14 * 14) return true
      }
      return false
    }
    setStrokes((all) => (all.some(near) ? all.filter((s) => !near(s)) : all))
  }
  const down = (e: RPointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* the pointer is already gone */
    }
    held.current = true
    if (erasing) return eraseAt(e)
    live.current = point(e)
    redraw((x) => x + 1)
  }
  const move = (e: RPointerEvent) => {
    if (!held.current) return
    if (erasing) return eraseAt(e)
    const cur = live.current
    if (!cur) return
    const [x, y] = point(e)
    if (Math.abs(x - cur[cur.length - 2]) + Math.abs(y - cur[cur.length - 1]) < 3) return
    cur.push(x, y)
    redraw((n) => n + 1)
  }
  const up = () => {
    held.current = false
    const cur = live.current
    live.current = null
    if (cur) setStrokes((all) => [...all, { c: color, s: size, p: cur }])
  }

  return (
    <div ref={root} className="sketch-editor">
      <svg
        ref={svg}
        className="sketch-pad"
        style={{ height }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        role="img"
        aria-label="لوحة الرسم على البيت"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <Strokes strokes={live.current ? [...strokes, { c: color, s: size, p: live.current }] : strokes} />
      </svg>
      <div className="sketch-tools" role="toolbar" aria-label="أدوات الرسم">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            className={`sk-color${!erasing && color === c ? ' on' : ''}`}
            style={{ color: css(c) }}
            aria-label={c === 'ink' ? 'قلم بلون النص' : 'لون القلم'}
            aria-pressed={!erasing && color === c}
            onClick={() => {
              setColor(c)
              setErasing(false)
            }}
          >
            <i />
          </button>
        ))}
        <span className="sk-sep" />
        {PEN_SIZES.map((s) => (
          <button key={s} className={`sk-size${size === s ? ' on' : ''}`} aria-label={s === PEN_SIZES[0] ? 'خط رفيع' : 'خط عريض'} aria-pressed={size === s} onClick={() => setSize(s)}>
            <i style={{ height: s + 1 }} />
          </button>
        ))}
        <span className="sk-sep" />
        <button className={erasing ? 'on' : ''} aria-label="ممحاة" aria-pressed={erasing} onClick={() => setErasing((x) => !x)}>
          <Eraser size={19} />
        </button>
        <button aria-label="تراجع" disabled={!strokes.length} onClick={() => setStrokes((all) => all.slice(0, -1))}>
          <Undo2 size={19} />
        </button>
        <button aria-label="مسح الكل" disabled={!strokes.length} onClick={() => setStrokes([])}>
          <Trash2 size={19} />
        </button>
        <button className="sk-done" onClick={() => p.onSave(strokes)}>
          <Check size={18} /> تم
        </button>
      </div>
    </div>
  )
}
