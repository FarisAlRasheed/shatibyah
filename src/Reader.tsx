import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { Bookmark, Check, Pencil } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { HalfText, veilFor, type OpenMark } from './colors'
import { DEFAULT_HALF_EM, type Fits, type HalfFit } from './kashida'
import type { Bookmarks, Mastered, Notes, VerseLayout } from './store'
import { clampSize, layoutFor, sizeLimits, usePinch } from './zoom'
import type { ColorMark, Edition, EditionColors, Section } from './types'

const NO_MARKS: ColorMark[] = []

interface Props {
  edition: Edition
  selected: number | null
  playing: number | null
  notes: Notes
  bookmarks: Bookmarks
  mastered: Mastered
  scrollTarget: { n: number; key: number } | null
  colors: EditionColors | null // null hides the colours
  /** Equal half-line widths (kashida.ts); null shows the halves at their natural widths. */
  fits: Fits | null
  fontSize: number
  layout: VerseLayout
  /** Search matches to mark, by verse number. */
  hits: Map<number, VerseHits> | null
  /** «إخفاء تدريجي»: the verse being repeated and the share of its words to hide now. */
  veil?: { n: number; share: number } | null
  /** The reader is on screen with nothing over it (pinch and zoom keys work). */
  active: boolean
  onFontSize: (px: number) => void
  /** A tap on the page outside any verse. */
  onBackgroundTap?: () => void
  onTap: (n: number) => void
  onMark: (m: OpenMark) => void
  onSectionChange: (s: Section | null) => void
}

export interface VerseHits {
  a: [number, number][]
  b: [number, number][]
}

/** The room a verse list has: its text width, the shared half-line width, and the size limits that follow. */
function useVerseBox(ref: RefObject<HTMLElement | null>, fits: Fits | null, pref: VerseLayout) {
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current!
    const read = () => el.clientWidth > 40 && setWidth(el.clientWidth - 20) // 20 = the list's side padding
    const ro = new ResizeObserver(read)
    ro.observe(el)
    read()
    return () => ro.disconnect()
  }, [ref])
  const half = fits?.width ?? DEFAULT_HALF_EM
  return { width, half, limits: sizeLimits(width, half, pref) }
}

/** A few real verses drawn exactly as the reader draws them, for the appearance panel. */
export function VerseSample(p: {
  edition: Edition
  from: number
  count: number
  colors: EditionColors | null
  fits: Fits | null
  fontSize: number
  layout: VerseLayout
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { width, half, limits } = useVerseBox(ref, p.fits, p.layout)
  const size = width ? clampSize(p.fontSize, limits) : p.fontSize
  const start = Math.max(0, Math.min(p.edition.verses.length - p.count, p.edition.verses.findIndex((v) => v.n >= p.from)))
  return (
    <div
      className="reader sample"
      ref={ref}
      data-layout={width ? layoutFor(size, width, half, p.layout) : 'stack'}
      data-even={p.fits ? 1 : 0}
      style={{ ['--verse-size' as string]: `${size}px`, ['--half-w' as string]: `${half}em` }}
    >
      {p.edition.verses.slice(start, start + p.count).map((v, k) => (
        <VerseRow
          key={v.n}
          n={v.n}
          a={v.a}
          b={v.b}
          sample
          isSelected={false}
          isPlaying={false}
          hasNote={false}
          hasBookmark={false}
          isMastered={false}
          marks={p.colors?.verses[v.n] ?? NO_MARKS}
          fitA={p.fits?.a[start + k]}
          fitB={p.fits?.b[start + k]}
          onTap={noop}
          onMark={noop}
        />
      ))}
    </div>
  )
}
const noop = () => {}

export default function Reader(p: Props) {
  const { edition, scrollTarget, onSectionChange } = p
  const ref = useRef<HTMLElement>(null)

  // Verse size and layout follow the room there is.
  const { width, half, limits } = useVerseBox(ref, p.fits, p.layout)
  const pinched = useRef<number | null>(null) // size shown during a pinch, before it is saved
  useEffect(() => {
    pinched.current = null
  }, [p.fontSize])
  const size = pinched.current ?? (width ? clampSize(p.fontSize, limits) : p.fontSize)
  const layout = width ? layoutFor(size, width, half, p.layout) : 'stack'
  usePinch(ref, {
    active: p.active,
    size: () => size,
    limits: () => limits,
    preview: (px) => {
      pinched.current = px
      const el = ref.current!
      el.style.setProperty('--verse-size', `${px}px`)
      el.dataset.layout = layoutFor(px, width, half, p.layout)
    },
    commit: p.onFontSize,
  })

  useEffect(() => {
    if (!scrollTarget) return
    const behavior = scrollTarget.key === 0 ? 'auto' : 'smooth'
    // A chapter's first verse: bring its banner to the top, so the title bar and the page agree.
    const opening = edition.sections.filter((s) => s.start === scrollTarget.n).sort((a, b) => b.end - a.end)[0]
    if (opening) document.getElementById(`s-${opening.id}`)?.scrollIntoView({ block: 'start', behavior })
    else document.getElementById(`v-${scrollTarget.n}`)?.scrollIntoView({ block: 'center', behavior })
  }, [scrollTarget]) // eslint-disable-line react-hooks/exhaustive-deps

  // Report the section at the top of the screen, for the title bar.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current: Section | null = null
      for (const s of edition.sections) {
        const el = document.getElementById(`s-${s.id}`)
        if (el && el.getBoundingClientRect().top < 120) {
          if (!current || s.start >= current.start) current = s
        }
      }
      onSectionChange(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [edition, onSectionChange])

  // Sections that open at each verse, outermost first.
  const headers = new Map<number, Section[]>()
  for (const s of [...edition.sections].sort((a, b) => b.end - b.start - (a.end - a.start))) {
    headers.set(s.start, [...(headers.get(s.start) ?? []), s])
  }

  return (
    <main
      className="reader"
      ref={ref}
      data-layout={layout}
      data-even={p.fits ? 1 : 0}
      style={{ ['--verse-size' as string]: `${size}px`, ['--half-w' as string]: `${half}em` }}
      onClick={(e) => e.target === e.currentTarget && p.onBackgroundTap?.()}
    >
      {edition.verses.map((v, i) => (
        <Fragment key={v.n}>
          {headers.get(v.n)?.map((s) => (
            <h2 key={s.id} id={`s-${s.id}`} className={`banner ${s.kind}`}>
              <span>{s.title}</span>
            </h2>
          ))}
          <VerseRow
            n={v.n}
            a={v.a}
            b={v.b}
            isSelected={p.selected === v.n}
            isPlaying={p.playing === v.n}
            hasNote={!!p.notes[v.n]}
            hasBookmark={!!p.bookmarks[v.n]}
            isMastered={!!p.mastered[v.n]}
            marks={p.colors?.verses[v.n] ?? NO_MARKS}
            fitA={p.fits?.a[i]}
            fitB={p.fits?.b[i]}
            hits={p.hits?.get(v.n)}
            veil={p.veil?.n === v.n ? p.veil.share : 0}
            onTap={p.onTap}
            onMark={p.onMark}
          />
        </Fragment>
      ))}
    </main>
  )
}

interface RowProps {
  n: number
  a: string
  b: string
  isSelected: boolean
  isPlaying: boolean
  hasNote: boolean
  hasBookmark: boolean
  isMastered: boolean
  marks: ColorMark[]
  fitA?: HalfFit
  fitB?: HalfFit
  hits?: VerseHits
  /** Share of the words to veil (0 = none). */
  veil?: number
  /** Drawn in a preview: no element id, so it never shadows the reader's own row. */
  sample?: boolean
  onTap: (n: number) => void
  onMark: (m: OpenMark) => void
}

/** One half-line; a half wider than the shared width is squeezed back into it. */
function Half(p: { h: 'a' | 'b'; text: string; marks: ColorMark[]; fit?: HalfFit; hits?: [number, number][]; veil?: number; onMark: (m: OpenMark) => void }) {
  const veil = p.veil ? veilFor(p.text, p.veil) : undefined
  const body = <HalfText text={p.text} marks={p.marks.filter((m) => m.h === p.h)} onMark={p.onMark} ins={p.fit?.ins} hits={p.hits} veil={veil} />
  const s = p.fit?.squeeze ?? 1
  return (
    <span className={`half ${p.h}`}>
      {s < 1 ? (
        <span className="fit" style={{ width: `${100 / s}%`, transform: `scaleX(${s})` }}>
          {body}
        </span>
      ) : (
        body
      )}
    </span>
  )
}

const VerseRow = memo(function VerseRow(p: RowProps) {
  return (
    <article id={p.sample ? undefined : `v-${p.n}`} className={`verse${p.isSelected ? ' selected' : ''}${p.isPlaying ? ' playing' : ''}`}>
      <button className="verse-body" onClick={() => p.onTap(p.n)}>
        <span className="vnum-col">
          <span className="vnum">{toArabicDigits(p.n)}</span>
          {(p.hasBookmark || p.hasNote || p.isMastered) && (
            <span className="marks">
              {p.hasBookmark && <Bookmark size={12} aria-label="علامة" />}
              {p.hasNote && <Pencil size={12} aria-label="ملاحظة" />}
              {p.isMastered && <Check size={12} aria-label="متقَن" />}
            </span>
          )}
        </span>
        <span className="halves verse-text">
          <Half h="a" text={p.a} marks={p.marks} fit={p.fitA} hits={p.hits?.a} veil={p.veil} onMark={p.onMark} />
          <Half h="b" text={p.b} marks={p.marks} fit={p.fitB} hits={p.hits?.b} veil={p.veil} onMark={p.onMark} />
        </span>
      </button>
    </article>
  )
})
