import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { toArabicDigits } from './arabic'
import { withTatweel } from './kashida'
import type { ColorMark, EditionColors } from './types'

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

/**
 * One verse half as shown: the edition's text with its printed colours, the tatweels that fit
 * it to the shared width (`ins`, see kashida.ts), search highlights (`hits`) and veiled words.
 * All positions are offsets in `text`. Each word holding a coloured piece is a tap target as a
 * whole, so a single coloured letter is still easy to hit.
 */
export function HalfText(p: {
  text: string
  marks: ColorMark[]
  onMark: (m: OpenMark) => void
  ins?: number[]
  hits?: [number, number][]
  /** Words (by index) drawn as a blank bar of the same width. */
  veil?: (word: number) => boolean
}) {
  const { text, marks, ins, hits, veil } = p
  if (!marks.length && !hits?.length && !veil) return <>{withTatweel(text, ins)}</>
  const out: ReactNode[] = []
  let last = 0
  let wi = -1
  for (const w of text.matchAll(/\S+/g)) {
    wi++
    const ws = w.index, we = ws + w[0].length
    const inWord = marks.filter((m) => m.s < we && m.e > ws)
    const inHits = hits?.filter(([s, e]) => s < we && e > ws) ?? []
    const veiled = veil?.(wi) ?? false
    if (!inWord.length && !inHits.length && !veiled) continue
    if (ws > last) out.push(withTatweel(text, ins, last, ws))
    last = we
    if (veiled) {
      out.push(
        <span key={ws} className="veil">
          {withTatweel(text, ins, ws, we)}
        </span>,
      )
      continue
    }
    // Cut the word at every mark and highlight edge inside it.
    const edges = [...inWord.flatMap((m) => [m.s, m.e]), ...inHits.flat()].filter((x) => x > ws && x < we)
    const cuts = [...new Set([ws, we, ...edges])].sort((a, b) => a - b)
    const pieces = cuts.slice(0, -1).map((a, i) => {
      const b = cuts[i + 1]
      const m = inWord.find((x) => x.s <= a && x.e >= b)
      const hit = inHits.some(([s, e]) => s <= a && e >= b)
      const t = withTatweel(text, ins, a, b)
      const inner = hit ? <mark>{t}</mark> : t
      return m ? (
        <span key={a} className={m.k === 'r' ? 'c-red' : 'c-green'}>
          {inner}
        </span>
      ) : (
        <Fragment key={a}>{inner}</Fragment>
      )
    })
    const target = inWord[0]
    out.push(
      target ? (
        <span
          key={ws}
          className="cw"
          onClick={(e) => {
            e.stopPropagation()
            p.onMark({ mark: target, text: target.w ?? text.slice(target.s, target.e), rect: e.currentTarget.getBoundingClientRect() })
          }}
        >
          {pieces}
        </span>
      ) : (
        <Fragment key={ws}>{pieces}</Fragment>
      ),
    )
  }
  if (last < text.length) out.push(withTatweel(text, ins, last, text.length))
  return <>{out}</>
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
