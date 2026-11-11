import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Bookmark, Check, Pencil } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { HalfText, veilFor, type OpenMark } from './colors'
import { DEFAULT_HALF_EM, type Fits, type HalfFit } from './kashida'
import type { Bookmarks, Mastered, Notes, VerseLayout } from './store'
import { anchorAt, clampSize, holdAnchor, layoutFor, sizeLimits, usePinch, type Anchor } from './zoom'
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
  /** Everything else that changes how tall the rows are (spacing, font, numbers…): when any of it
   *  changes, the verse at the top of the screen is kept where it was. */
  look: string
  /** Search matches to mark, by verse number. */
  hits: Map<number, VerseHits> | null
  /** «إخفاء تدريجي»: the verse being repeated and the share of its words to hide now. */
  veil?: { n: number; share: number } | null
  /** The small action bar, drawn under verse `n`. */
  bar?: { n: number; el: ReactNode } | null
  /** Range being picked in the text: tinted from `from` to `to` (only `from` before the end is chosen). */
  pick?: { from: number; to: number } | null
  /** The range a running repeat walks: its first and last verse carry a marker. */
  run?: { from: number; to: number } | null
  /** The verse repeating now and its count, shown as a ring on its number. */
  count?: { n: number; round: number; times: number } | null
  /** Recitation curtain: every second half-line veiled, except in the verses in `revealed`. */
  curtain?: { revealed: Set<number> } | null
  /** The group the explanation panel shows, and the verse it was opened from (tinted more strongly). */
  explain?: { from: number; to: number; n: number | null } | null
  /** Printed page that begins at each verse (page markers). */
  pageStarts?: Map<number, number> | null
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
/** Height on screen, below the title bar, where the reader's place is read. */
const TOP_Y = 120

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

  // A change of look re-lays the whole list: keep the verse at the top of the screen in place.
  // The anchor is read while rendering, i.e. from the page as it still is, before React applies it.
  const lookKey = `${size}|${layout}|${half}|${p.fits ? 1 : 0}|${p.look}`
  const lastLook = useRef(lookKey)
  const lookAnchor = useRef<Anchor | null>(null)
  if (lookKey !== lastLook.current && ref.current && !lookAnchor.current) {
    lookAnchor.current = anchorAt(ref.current, TOP_Y)
  }
  useLayoutEffect(() => {
    lastLook.current = lookKey
    if (lookAnchor.current) holdAnchor(lookAnchor.current)
    lookAnchor.current = null
  }, [lookKey])

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
          {p.pageStarts?.has(v.n) && (
            <div className="page-mark" role="separator">
              <span>صفحة {toArabicDigits(p.pageStarts.get(v.n)!)}</span>
            </div>
          )}
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
            curtain={!!p.curtain && !p.curtain.revealed.has(v.n)}
            pick={roleIn(p.pick, v.n, true)}
            run={roleIn(p.run, v.n, false)}
            explain={roleIn(p.explain, v.n, true)}
            explainHere={p.explain?.n === v.n}
            round={p.count?.n === v.n ? p.count.round : undefined}
            times={p.count?.n === v.n ? p.count.times : undefined}
            below={p.bar?.n === v.n ? p.bar.el : undefined}
            onTap={p.onTap}
            onMark={p.onMark}
          />
        </Fragment>
      ))}
    </main>
  )
}

type RangeRole = 'start' | 'end' | 'both' | 'mid'

/** Where verse n sits in a range; `mid` only when the inside is tinted too. */
function roleIn(r: { from: number; to: number } | null | undefined, n: number, inside: boolean): RangeRole | undefined {
  if (!r || n < r.from || n > r.to) return undefined
  if (r.from === r.to) return 'both'
  if (n === r.from) return 'start'
  if (n === r.to) return 'end'
  return inside ? 'mid' : undefined
}

const ALL_WORDS = () => true

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
  /** Second half veiled (recitation curtain). */
  curtain?: boolean
  /** Part of the range being picked. */
  pick?: RangeRole
  /** First or last verse of the range a repeat is playing. */
  run?: RangeRole
  /** Part of the group the explanation panel shows; `explainHere` = the verse it was opened from. */
  explain?: RangeRole
  explainHere?: boolean
  /** Repeat count while this verse plays more than once (times 0 = endless). */
  round?: number
  times?: number
  /** Drawn right under the verse (the action bar). */
  below?: ReactNode
  /** Drawn in a preview: no element id, so it never shadows the reader's own row. */
  sample?: boolean
  onTap: (n: number) => void
  onMark: (m: OpenMark) => void
}

/** One half-line; a half wider than the shared width is squeezed back into it. */
function Half(p: {
  h: 'a' | 'b'
  text: string
  marks: ColorMark[]
  fit?: HalfFit
  hits?: [number, number][]
  veil?: number
  curtain?: boolean
  onMark: (m: OpenMark) => void
}) {
  const veil = p.curtain ? ALL_WORDS : p.veil ? veilFor(p.text, p.veil) : undefined
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

/** The verse number; while the verse repeats, its count «٢/٣» with a ring (a bar in the plain style). */
function VerseNumber({ n, round, times }: { n: number; round?: number; times?: number }) {
  if (round == null || times == null) return <span className="vnum">{toArabicDigits(n)}</span>
  const label = `${toArabicDigits(round)}/${times === 0 ? '∞' : toArabicDigits(times)}`
  const share = times === 0 ? 1 : Math.min(1, round / times)
  return (
    <span className="vnum counting" style={{ '--share': share } as CSSProperties} aria-label={`البيت ${toArabicDigits(n)}، المرة ${label}`}>
      <span className={`count${label.length > 4 ? ' long' : ''}`}>{label}</span>
    </span>
  )
}

const VerseRow = memo(function VerseRow(p: RowProps) {
  const cls = `verse${p.isSelected ? ' selected' : ''}${p.isPlaying ? ' playing' : ''}${p.pick ? ` pick pick-${p.pick}` : ''}${p.run ? ` run-${p.run}` : ''}${p.explain ? ` ex ex-${p.explain}${p.explainHere ? ' ex-here' : ''}` : ''}`
  return (
    <article id={p.sample ? undefined : `v-${p.n}`} className={cls}>
      <button className="verse-body" onClick={() => p.onTap(p.n)}>
        <span className="vnum-col">
          <VerseNumber n={p.n} round={p.round} times={p.times} />
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
          <Half h="b" text={p.b} marks={p.marks} fit={p.fitB} hits={p.hits?.b} veil={p.veil} curtain={p.curtain} onMark={p.onMark} />
        </span>
      </button>
      {p.below}
    </article>
  )
})
