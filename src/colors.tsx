import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { toArabicDigits } from './arabic'
import { withTatweel } from './kashida'
import { drawnOffset, halfModel, joinedAt } from './verseText'
import type { ColorMark, EditionColors } from './types'
import type { SlipType } from './slips'

export const SURAHS = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس',
]

const KIND_LABEL = { letter: 'رمز', group: 'رمز جماعي', word: 'رمز كلمة', name: 'اسم صريح' } as const

/** What a tap on a coloured word opens. */
export interface OpenMark {
  mark: ColorMark
  text: string // the coloured letters as printed
  rect: DOMRect
}

/** Whether this browser paints CSS Custom Highlights (`::highlight()`): Safari/iOS 17.2+, Chrome 105+. */
const HIGHLIGHTS = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined'

/** The page's shared highlights: red codes, green Quran words, search hits (styles.css `::highlight`). */
type Paint = 'c-red' | 'c-green' | 'hit'
let paints: Record<Paint, Highlight> | null = null
function paint(name: Paint): Highlight {
  if (!paints) {
    paints = { 'c-red': new Highlight(), 'c-green': new Highlight(), hit: new Highlight() }
    for (const k of Object.keys(paints) as Paint[]) CSS.highlights.set(k, paints[k])
    paints.hit.priority = 1
    // In the app, verse text is selectable to the engine only so that WebKit paints on it
    // (styles.css): a long press outside a button must not leave a selection behind.
    document.addEventListener('selectionchange', () => {
      if (!document.documentElement.classList.contains('native')) return
      const sel = getSelection()
      const at = sel?.anchorNode
      if (sel?.rangeCount && at && (at instanceof Element ? at : at.parentElement)?.closest('.ht')) sel.removeAllRanges()
    })
  }
  return paints[name]
}

/** The text node and offset inside `root` at offset `x` of its whole text. */
function pointAt(root: Node, x: number): [Text, number] | null {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let seen = 0
  for (let n = walk.nextNode() as Text | null; n; n = walk.nextNode() as Text | null) {
    const len = n.data.length
    if (x <= seen + len) return [n, x - seen]
    seen += len
  }
  return null
}

/**
 * One verse half as shown: the edition's text with its printed colours, the tatweels that fit
 * it to the shared width (`ins`, see kashida.ts), search highlights (`hits`) and veiled words.
 * All positions are offsets in `text`.
 *
 * A word is never cut inside: in Safari each piece of a cut word is shaped on its own and loses
 * its joined letters. Whole words are wrapped where a word needs it (the tap target of a coloured
 * word, a veiled word, a listener slip); colour and hits inside a word are painted on top with the
 * CSS Custom Highlight API, so the text stays one run and the font shapes it as printed.
 * Browsers without that API get spans cut only between whole letter-clusters (verseText.ts).
 */
export function HalfText(p: {
  text: string
  marks: ColorMark[]
  onMark: (m: OpenMark) => void
  ins?: number[]
  hits?: [number, number][]
  /** Words (by index) drawn as a blank bar of the same width. */
  veil?: (word: number) => boolean
  /** Words (by index) the listener marked as slipped, with the slip's type. */
  slips?: Map<number, SlipType>
}) {
  const { text, ins, veil, slips } = p
  const model = useMemo(() => halfModel(text, p.marks, p.hits), [text, p.marks, p.hits])
  const root = useRef<HTMLSpanElement>(null)
  const veiled = (i: number) => veil?.(i) ?? false

  // Paint the colours and hits over the drawn text. Ranges are in the drawn string (tatweels in),
  // which is exactly the text of `root`.
  useLayoutEffect(() => {
    const el = root.current
    if (!HIGHLIGHTS || !el) return
    const added: [Highlight, Range][] = []
    const add = (name: Paint, s: number, e: number) => {
      const a = pointAt(el, drawnOffset(ins, s))
      const b = pointAt(el, drawnOffset(ins, e))
      if (!a || !b) return
      const r = new Range()
      r.setStart(a[0], a[1])
      r.setEnd(b[0], b[1])
      paint(name).add(r)
      added.push([paint(name), r])
    }
    const hidden = (s: number, e: number) => model.words.some((w) => w.s < e && w.e > s && veiled(w.i))
    for (const m of model.marks) if (!hidden(m.s, m.e)) add(m.mark.k === 'r' ? 'c-red' : 'c-green', m.s, m.e)
    for (const h of model.hits) if (!hidden(h.s, h.e)) add('hit', h.s, h.e)
    return () => {
      for (const [hl, r] of added) hl.delete(r)
    }
  })

  /** Wraps a finished word in its slip mark, if it has one. */
  const marked = (key: number, slip: SlipType | undefined, node: ReactNode) =>
    slip ? (
      <span key={key} className="slip-mark" style={{ '--slip': slip.color } as CSSProperties} title={slip.name}>
        {node}
      </span>
    ) : (
      node
    )

  const out: ReactNode[] = []
  let plain = '' // text between wrapped words, kept as one text node
  let last = 0
  const flush = () => {
    if (plain) out.push(plain)
    plain = ''
  }
  for (const w of model.words) {
    const inWord = model.marks.filter((m) => m.s < w.e && m.e > w.s)
    const inHits = HIGHLIGHTS ? [] : model.hits.filter((h) => h.s < w.e && h.e > w.s)
    const hide = veiled(w.i)
    const slip = hide ? undefined : slips?.get(w.i)
    if (!inWord.length && !inHits.length && !hide && !slip) continue
    plain += withTatweel(text, ins, last, w.s)
    flush()
    last = w.e
    const word = withTatweel(text, ins, w.s, w.e)
    if (hide) {
      out.push(
        <span key={w.s} className="veil">
          {word}
        </span>,
      )
      continue
    }
    const body = HIGHLIGHTS ? word : cutWord(text, ins, model.edges, w.s, w.e, inWord, inHits)
    const target = inWord[0]?.mark
    out.push(
      marked(w.s, slip, target ? (
        <span
          key={w.s}
          className="cw"
          onClick={(e) => {
            e.stopPropagation()
            p.onMark({ mark: target, text: target.w ?? text.slice(target.s, target.e), rect: e.currentTarget.getBoundingClientRect() })
          }}
        >
          {body}
        </span>
      ) : (
        <Fragment key={w.s}>{body}</Fragment>
      )),
    )
  }
  plain += withTatweel(text, ins, last, text.length)
  flush()
  return (
    <span className="ht" ref={root}>
      {out}
    </span>
  )
}

/**
 * Fallback for browsers without the Highlight API: a word cut into coloured pieces, only between
 * whole letter-clusters, with a zero-width joiner on each side of a cut between joined letters.
 */
function cutWord(
  text: string,
  ins: number[] | undefined,
  edges: number[],
  ws: number,
  we: number,
  marks: { s: number; e: number; mark: ColorMark }[],
  hits: { s: number; e: number }[],
): ReactNode[] {
  const ZWJ = '‍'
  const inner = [...marks, ...hits].flatMap((r) => [r.s, r.e]).filter((x) => x > ws && x < we && edges.includes(x))
  const cuts = [...new Set([ws, we, ...inner])].sort((a, b) => a - b)
  return cuts.slice(0, -1).map((a, i) => {
    const b = cuts[i + 1]
    const m = marks.find((r) => r.s <= a && r.e >= b)?.mark
    const hit = hits.some((r) => r.s <= a && r.e >= b)
    const t = (i > 0 && joinedAt(text, a) ? ZWJ : '') + withTatweel(text, ins, a, b) + (i < cuts.length - 2 && joinedAt(text, b) ? ZWJ : '')
    const body = hit ? <mark>{t}</mark> : t
    return m ? (
      <span key={a} className={m.k === 'r' ? 'c-red' : 'c-green'}>
        {body}
      </span>
    ) : (
      <Fragment key={a}>{body}</Fragment>
    )
  })
}

/**
 * Which words of a half-line to veil when `share` (0…1) of them should be hidden.
 * Every second word goes first and the opening word last, so there is always a cue to start from.
 */
export function veilFor(text: string, share: number): ((word: number) => boolean) | undefined {
  const n = text.trim().split(/\s+/).length
  const hide = Math.round(Math.min(1, Math.max(0, share)) * n)
  if (!hide) return undefined
  const evens = Math.ceil(n / 2)
  const rank = (i: number) => (i % 2 ? (i - 1) / 2 : Math.floor(n / 2) + (evens - 1 - i / 2))
  return (i) => rank(i) < hide
}

/**
 * How much of a verse to hide on this repetition when «إخفاء تدريجي» is on: nothing the first
 * time, everything the last. Follows the verse's own count, or the rounds when each verse plays once.
 */
export function fadeShare(s: { verseRound: number; verseTimes: number; rangeRound: number; rangeTimes: number }) {
  const [round, times] = s.verseTimes !== 1 ? [s.verseRound, s.verseTimes] : [s.rangeRound, s.rangeTimes]
  if (times === 1) return 0
  if (times === 0) return [0, 0.5, 1][(round - 1) % 3] // endless: a cycle of three
  return (round - 1) / (times - 1)
}

/** The small card beside a tapped colour: whom a code stands for, or where a Quranic word is. */
export function ColorCard(p: { open: OpenMark; colors: EditionColors; onClose: () => void }) {
  const { mark, text, rect } = p.open
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const onClose = useRef(p.onClose)
  onClose.current = p.onClose

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const w = el.offsetWidth, h = el.offsetHeight, gap = 8, margin = 12
    const left = Math.min(Math.max(rect.left + rect.width / 2 - w / 2, margin), innerWidth - w - margin)
    const above = rect.top - h - gap
    const top = above > 60 ? above : Math.min(rect.bottom + gap, innerHeight - h - margin)
    setPos({ top, left })
  }, [rect])

  useEffect(() => {
    const close = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return
      if (e.type === 'pointerdown' && ref.current?.contains(e.target as Node)) return
      onClose.current()
    }
    // Deferred, so the tap that opened the card doesn't close it.
    const t = setTimeout(() => {
      addEventListener('pointerdown', close, true)
      addEventListener('scroll', close, true)
      addEventListener('keydown', close)
    })
    return () => {
      clearTimeout(t)
      removeEventListener('pointerdown', close, true)
      removeEventListener('scroll', close, true)
      removeEventListener('keydown', close)
    }
  }, [])

  const code = mark.c ? p.colors.codes[mark.c] : undefined
  // Green without a Quran place: letters of the باب (إدغام, مخارج الحروف), not a Quranic word.
  const greenLabel = mark.q?.length ? 'كلمة قرآنية' : 'حرف'
  return (
    <div
      ref={ref}
      className={`color-card ${mark.k === 'r' ? 'red' : 'green'}`}
      role="dialog"
      aria-label={mark.k === 'r' ? 'رمز القارئ' : greenLabel}
      style={pos ?? { visibility: 'hidden', top: 0, left: 0 }}
    >
      <div className="cc-head">
        <span className="cc-word verse-text">{text}</span>
        <span className="cc-kind">
          {mark.k === 'g' ? greenLabel : code?.kind === 'letter' || code?.kind === 'group' ? `${KIND_LABEL[code.kind]} «${mark.c}»` : code ? KIND_LABEL[code.kind] : 'رمز'}
        </span>
      </div>
      {mark.k === 'r' ? (
        <>
          <p className="cc-main">{code?.label ?? mark.c}</p>
          {code?.note && <p className="cc-sub">{code.note}</p>}
        </>
      ) : (
        <>
          <ul className="cc-places">
            {mark.q?.map(([s, a]) => (
              <li key={`${s}:${a}`}>
                سورة {SURAHS[s - 1]} <span className="sep">·</span> الآية {toArabicDigits(a)}
              </li>
            ))}
          </ul>
          {mark.x && <p className="cc-ayah verse-text">﴿{mark.x}﴾</p>}
          {mark.note && <p className="cc-sub">{mark.note}</p>}
        </>
      )}
    </div>
  )
}
