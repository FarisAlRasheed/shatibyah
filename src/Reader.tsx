import type { SlipType, VerseSlips } from './slips'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Bookmark, Check, Pencil, PenLine } from 'lucide-react'
import { MARK_COLORS, markSlot } from './marks'
import { SketchView, type Sketch, type Sketches } from './Sketch'
import { toArabicDigits } from './arabic'
import { localNumbers } from './data'
import { plural, VERSES } from './sheets'
import { HalfText, veilFor, type OpenMark } from './colors'
import { DEFAULT_HALF_EM, type Fits, type HalfFit } from './kashida'
import type { Bookmarks, Mastered, Notes, VerseLayout } from './store'
import { anchorAt, clampSize, GUESS, holdAnchor, layoutFor, measureRoom, sizeLimits, usePinch, type Anchor, type Room } from './zoom'
import type { ColorMark, Edition, EditionColors, Section } from './types'
import { useVerseWindow } from './virtual'

const NO_MARKS: ColorMark[] = []

interface Props {
  edition: Edition
  selected: number | null
  playing: number | null
  notes: Notes
  bookmarks: Bookmarks
  /** Sketch notes by verse, and whether they are drawn (the small pen icon shows either way). */
  sketches?: Sketches
  showSketches?: boolean
  /** The verse being drawn on: its saved sketch is hidden while the editor shows the live one. */
  drawing?: number | null
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
  /** Listener-mode slips to draw on the words, by verse. */
  slips?: Map<number, VerseSlips> | null
  /** The small action bar, drawn under verse `n`. */
  bar?: { n: number; el: ReactNode } | null
  /** Range being picked in the text: tinted from `from` to `to` (only `from` before the end is chosen). */
  pick?: { from: number; to: number } | null
  /** The range a running repeat walks: its first and last verse carry a marker. */
  run?: { from: number; to: number } | null
  /** Show each verse's number within its bab beside its number in the poem («٢ | ١٠١»). */
  bothNumbers?: boolean
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

/** The room a verse list has: its text width, the shared half-line width, and the size limits that follow.
 *  Measured from the page (zoom.ts `measureRoom`) on resize and whenever `look` changes. */
function useVerseBox(ref: RefObject<HTMLElement | null>, fits: Fits | null, pref: VerseLayout, look: string, isReader: boolean) {
  const [room, setRoom] = useState<Room | null>(null)
  const read = useRef(() => {})
  read.current = () => {
    const el = ref.current
    const r = el && measureRoom(el, isReader)
    if (r) setRoom((prev) => (prev && sameRoom(prev, r) ? prev : r))
  }
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => read.current())
    ro.observe(ref.current!)
    read.current()
    return () => ro.disconnect()
  }, [ref])
  useLayoutEffect(() => read.current(), [look])
  const half = fits?.width ?? DEFAULT_HALF_EM
  const width = room?.width ?? 0
  const g = room?.g ?? GUESS
  return { width, half, g, limits: sizeLimits(width, half, pref, g) }
}
const sameRoom = (a: Room, b: Room) =>
  Math.abs(a.width - b.width) < 0.5 && Math.abs(a.g.numEm - b.g.numEm) < 0.02 && Math.abs(a.g.gapEm - b.g.gapEm) < 0.01 && Math.abs(a.g.chrome - b.g.chrome) < 0.5

/**
 * The check after layout: every half-line whose drawn text is wider than its box is squeezed into
 * it (`--fix` on the half, used by `.fit` in styles.css). The kashida work is measured in a canvas,
 * and the page can still differ (font hinting, a font that loaded late, a narrow row), so the page
 * itself has the last word: nothing is cut off and nothing spills out.
 */
export function fitHalves(root: ParentNode) {
  const halves = [...root.querySelectorAll<HTMLElement>('.half')]
  for (const h of halves) if (h.style.getPropertyValue('--fix')) h.style.removeProperty('--fix')
  const range = document.createRange()
  const fix: [HTMLElement, number][] = []
  for (const h of halves) {
    const box = h.getBoundingClientRect().width
    if (!box) continue
    range.selectNodeContents(h)
    const drawn = range.getBoundingClientRect().width
    if (drawn > box + 0.5) fix.push([h, box / drawn])
  }
  for (const [h, f] of fix) h.style.setProperty('--fix', (Math.floor(f * 1000) / 1000).toString())
  return fix.length
}

/** Runs `fitHalves` over a verse list after each change of `key`, on resize and when a font loads. */
function useFitCheck(ref: RefObject<HTMLElement | null>, key: string) {
  const frame = useRef(0)
  const schedule = useRef(() => {})
  schedule.current = () => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => ref.current && fitHalves(ref.current))
  }
  useLayoutEffect(() => {
    if (ref.current) fitHalves(ref.current)
  }, [ref, key])
  useEffect(() => {
    const again = () => schedule.current()
    const ro = new ResizeObserver(again)
    ro.observe(ref.current!)
    document.fonts?.addEventListener('loadingdone', again)
    return () => {
      ro.disconnect()
      document.fonts?.removeEventListener('loadingdone', again)
      cancelAnimationFrame(frame.current)
    }
  }, [ref])
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
  bothNumbers?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const locals = useMemo(() => (p.bothNumbers ? localNumbers(p.edition) : null), [p.bothNumbers, p.edition])
  const { width, half, g, limits } = useVerseBox(ref, p.fits, p.layout, '', false)
  const size = width ? clampSize(p.fontSize, limits) : p.fontSize
  const layout = width ? layoutFor(size, width, half, p.layout, g) : 'stack'
  useFitCheck(ref, `${size}|${layout}|${half}|${p.fits ? 1 : 0}|${p.from}`)
  const start = Math.max(0, Math.min(p.edition.verses.length - p.count, p.edition.verses.findIndex((v) => v.n >= p.from)))
  return (
    <div
      className="reader sample"
      ref={ref}
      data-layout={layout}
      data-even={p.fits ? 1 : 0}
      style={{ ['--verse-size' as string]: `${size}px`, ['--half-w' as string]: `${half}em` }}
    >
      {p.edition.verses.slice(start, start + p.count).map((v, k) => (
        <VerseRow
          key={v.n}
          n={v.n}
          local={locals?.get(v.n)}
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
  const { width, half, g, limits } = useVerseBox(ref, p.fits, p.layout, p.look, true)
  const pinched = useRef<number | null>(null) // size laid out after a pinch, before it is saved
  const zoomBase = useRef(1) // size the text is laid out at while a pinch scales it
  useEffect(() => {
    pinched.current = null
  }, [p.fontSize])
  const size = pinched.current ?? (width ? clampSize(p.fontSize, limits) : p.fontSize)
  const layout = width ? layoutFor(size, width, half, p.layout, g) : 'stack'
  usePinch(ref, {
    active: p.active,
    size: () => size,
    limits: () => limits,
    start: (y) => {
      const el = ref.current!
      const r = el.getBoundingClientRect()
      zoomBase.current = size
      // The scaled page reaches past the screen edges: clip it while the gesture runs.
      document.documentElement.classList.add('pinching')
      el.style.transformOrigin = `${r.width / 2}px ${y - r.top}px`
      el.style.willChange = 'transform'
    },
    preview: (px) => {
      ref.current!.style.transform = `scale(${px / zoomBase.current})`
    },
    settle: (px) => {
      pinched.current = px
      const el = ref.current!
      el.style.transform = el.style.transformOrigin = el.style.willChange = ''
      document.documentElement.classList.remove('pinching')
      el.style.setProperty('--verse-size', `${px}px`)
      el.dataset.layout = layoutFor(px, width, half, p.layout, g)
      fitHalves(el)
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

  // Only the verses near the screen are drawn (virtual.ts). A block is a verse with the page mark
  // and chapter titles that come just before it.
  const blocks = useMemo(() => {
    const headers = new Map<number, Section[]>()
    for (const s of [...edition.sections].sort((a, b) => b.end - b.start - (a.end - a.start))) {
      headers.set(s.start, [...(headers.get(s.start) ?? []), s])
    }
    return edition.verses.map((v) => ({ v, banners: headers.get(v.n) ?? [] }))
  }, [edition])
  const indexOf = useMemo(() => new Map(edition.verses.map((v, i) => [v.n, i])), [edition])
  const locals = useMemo(() => localNumbers(edition), [edition])
  const topRef = useRef<HTMLDivElement>(null)
  const explainAt = p.explain && [indexOf.get(p.explain.from) ?? 0, indexOf.get(p.explain.to) ?? 0]
  const vw = useVerseWindow({
    list: ref,
    topEl: topRef,
    count: blocks.length,
    kind: (i) => `${blocks[i].banners.map((b) => b.kind).join(',')}${p.pageStarts?.has(blocks[i].v.n) ? '|p' : ''}`,
    guess: (kind, plain) => {
      const row = plain || size * (layout === 'side' ? 2.3 : 4.4) + 10
      if (!kind) return row
      const [titles, page] = kind.split('|')
      return row + (titles ? titles.split(',').length * (size * 1.9 + 44) : 0) + (page ? 32 : 0)
    },
    resetKey: `${lookKey}|${Math.round(width)}`,
    initial: indexOf.get(scrollTarget?.n ?? p.selected ?? 0) ?? 0,
    keep: explainAt ? [explainAt[0], explainAt[1]] : null,
  })
  const vwRef = useRef(vw)
  vwRef.current = vw
  useLayoutEffect(() => {
    lastLook.current = lookKey
    if (lookAnchor.current) holdAnchor(lookAnchor.current)
    lookAnchor.current = null
  }, [lookKey])
  useFitCheck(ref, `${lookKey}|${vw.start}|${vw.end}`)

  useEffect(() => {
    if (!scrollTarget) return
    const i = indexOf.get(scrollTarget.n)
    if (i == null) return
    // Smooth only to a verse already drawn nearby; a far one is drawn first and jumped to.
    const behavior = scrollTarget.key === 0 || !vwRef.current.drawn(i) ? 'auto' : 'smooth'
    // A chapter's first verse: bring its banner to the top, so the title bar and the page agree.
    const opening = edition.sections.filter((s) => s.start === scrollTarget.n).sort((a, b) => b.end - a.end)[0]
    vwRef.current.goTo(i, () => {
      if (opening) document.getElementById(`s-${opening.id}`)?.scrollIntoView({ block: 'start', behavior })
      else document.getElementById(`v-${scrollTarget.n}`)?.scrollIntoView({ block: 'center', behavior })
    })
  }, [scrollTarget]) // eslint-disable-line react-hooks/exhaustive-deps

  // Report the section at the top of the screen, for the title bar.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current: Section | null = null
      // A title above the drawn verses is above the screen; one below them is below it.
      const { start, end } = vwRef.current
      for (const s of edition.sections) {
        const i = indexOf.get(s.start) ?? 0
        const el = i >= start && i < end ? document.getElementById(`s-${s.id}`) : null
        const above = i < start || (!!el && el.getBoundingClientRect().top < 120)
        if (above && (!current || s.start >= current.start)) current = s
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
  }, [edition, onSectionChange, indexOf])

  return (
    <main
      className="reader"
      ref={ref}
      data-layout={layout}
      data-even={p.fits ? 1 : 0}
      style={{ ['--verse-size' as string]: `${size}px`, ['--half-w' as string]: `${half}em` }}
      onClick={(e) => (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('vgroup')) && p.onBackgroundTap?.()}
    >
      <div className="vspacer top" ref={topRef} style={{ height: vw.top }} />
      {blocks.slice(vw.start, vw.end).map(({ v, banners }, k) => {
        const i = vw.start + k
        return (
        <div key={v.n} className="vgroup" data-i={i}>
          {p.pageStarts?.has(v.n) && (
            <div className="page-mark" role="separator">
              <span>صفحة {toArabicDigits(p.pageStarts.get(v.n)!)}</span>
            </div>
          )}
          {banners.map((s) => (
            <h2 key={s.id} id={`s-${s.id}`} className={`banner ${s.kind}`}>
              <span>
                {s.title}
                <small className="banner-count">{plural(s.end - s.start + 1, VERSES)}</small>
              </span>
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
            mark={p.bookmarks[v.n] ? markSlot(p.bookmarks[v.n].color) : undefined}
            sketch={p.sketches?.[v.n]}
            showSketch={!!p.showSketches && p.drawing !== v.n}
            isMastered={!!p.mastered[v.n]}
            marks={p.colors?.verses[v.n] ?? NO_MARKS}
            fitA={p.fits?.a[i]}
            fitB={p.fits?.b[i]}
            hits={p.hits?.get(v.n)}
            veil={p.veil?.n === v.n ? p.veil.share : 0}
            slips={p.slips?.get(v.n)}
            curtain={!!p.curtain && !p.curtain.revealed.has(v.n)}
            pick={roleIn(p.pick, v.n, true)}
            run={roleIn(p.run, v.n, false)}
            explain={roleIn(p.explain, v.n, true)}
            explainHere={p.explain?.n === v.n}
            local={p.bothNumbers ? locals.get(v.n) : undefined}
            round={p.count?.n === v.n ? p.count.round : undefined}
            times={p.count?.n === v.n ? p.count.times : undefined}
            below={p.bar?.n === v.n ? p.bar.el : undefined}
            onTap={p.onTap}
            onMark={p.onMark}
          />
        </div>
        )
      })}
      <div className="vspacer bottom" style={{ height: vw.bottom }} />
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
  /** The verse's number within its bab, when shown beside the poem's number. */
  local?: number
  a: string
  b: string
  isSelected: boolean
  isPlaying: boolean
  hasNote: boolean
  hasBookmark: boolean
  /** Mark colour slot; the whole verse is tinted with it. */
  mark?: number
  sketch?: Sketch
  showSketch?: boolean
  isMastered: boolean
  marks: ColorMark[]
  fitA?: HalfFit
  fitB?: HalfFit
  hits?: VerseHits
  /** Share of the words to veil (0 = none). */
  veil?: number
  slips?: VerseSlips
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
  slips?: Map<number, SlipType>
  onMark: (m: OpenMark) => void
}) {
  const veil = p.curtain ? ALL_WORDS : p.veil ? veilFor(p.text, p.veil) : undefined
  const body = <HalfText text={p.text} marks={p.marks.filter((m) => m.h === p.h)} onMark={p.onMark} ins={p.fit?.ins} hits={p.hits} veil={veil} slips={p.slips} />
  const s = p.fit?.squeeze ?? 1
  // `.fit` carries the squeeze: the kashida's (`--sq`) and the after-layout check's (`--fix`).
  return (
    <span className={`half ${p.h}`}>
      <span className="fit" style={s < 1 ? ({ '--sq': s } as CSSProperties) : undefined}>
        {body}
      </span>
    </span>
  )
}

/** The verse number; while the verse repeats, its count «٢/٣» with a ring (a bar in the plain style). */
function VerseNumber({ n, local, round, times }: { n: number; local?: number; round?: number; times?: number }) {
  if ((round == null || times == null) && local != null)
    return (
      <span className="vnum dual" aria-label={`البيت ${toArabicDigits(local)} من الباب، ${toArabicDigits(n)} من المتن`}>
        <span className="vn-local">{toArabicDigits(local)}</span>
        <span className="vn-sep" aria-hidden="true" />
        <span className="vn-poem">{toArabicDigits(n)}</span>
      </span>
    )
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
    <article id={p.sample ? undefined : `v-${p.n}`} className={`${cls}${p.mark != null ? ' marked' : ''}`} style={p.mark != null ? ({ '--mark': MARK_COLORS[p.mark] } as CSSProperties) : undefined}>
      <button className="verse-body" onClick={() => p.onTap(p.n)}>
        <span className="vnum-col">
          <VerseNumber n={p.n} local={p.local} round={p.round} times={p.times} />
          {(p.hasBookmark || p.hasNote || p.isMastered || p.sketch) && (
            <span className="marks">
              {p.hasBookmark && <Bookmark size={12} aria-label="علامة" />}
              {p.hasNote && <Pencil size={12} aria-label="ملاحظة" />}
              {p.sketch && <PenLine size={12} aria-label="رسم" />}
              {p.isMastered && <Check size={12} aria-label="متقَن" />}
            </span>
          )}
        </span>
        <span className="halves verse-text">
          <Half h="a" text={p.a} marks={p.marks} fit={p.fitA} hits={p.hits?.a} veil={p.veil} slips={p.slips?.a} onMark={p.onMark} />
          <Half h="b" text={p.b} marks={p.marks} fit={p.fitB} hits={p.hits?.b} veil={p.veil} curtain={p.curtain} slips={p.slips?.b} onMark={p.onMark} />
        </span>
        {p.sketch && p.showSketch && <SketchView sketch={p.sketch} />}
      </button>
      {p.below}
    </article>
  )
})
