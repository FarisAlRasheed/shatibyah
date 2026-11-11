// Details of the selected verse in the empty margin of a wide screen (UX-PLAN 6.2).
import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { SURAHS } from './colors'
import { sectionOf } from './data'
import type { ColorMark, Edition, EditionColors } from './types'

// Smallest window that leaves room for the panel beside the verses (the reader moves over for it;
// extras.css uses the same width).
const WIDE = '(min-width: 1180px)'

export function useWide() {
  const [wide, setWide] = useState(() => matchMedia(WIDE).matches)
  useEffect(() => {
    const m = matchMedia(WIDE)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

const markText = (m: ColorMark, a: string, b: string) => m.w ?? (m.h === 'a' ? a : b).slice(m.s, m.e)

export default function SidePanel(p: {
  n: number
  edition: Edition
  colors: EditionColors | null
  note: string
  /** Same-ending verses; null when that feature is off. */
  twins: number[] | null
  onNote: () => void
  onJump: (n: number) => void
}) {
  const v = p.edition.verses.find((x) => x.n === p.n)
  if (!v) return null
  const byN = new Map(p.edition.verses.map((x) => [x.n, x]))
  const marks = p.colors?.verses[p.n] ?? []
  const seen = new Set<string>()
  const codes = marks
    .filter((m) => m.k === 'r')
    .map((m) => ({ m, text: markText(m, v.a, v.b), code: m.c ? p.colors?.codes[m.c] : undefined }))
    .filter(({ m, text }) => !seen.has(`${m.c}|${text}`) && seen.add(`${m.c}|${text}`))
  const words = marks.filter((m) => m.k === 'g' && m.q?.length)
  return (
    <aside className="side-panel" aria-label="تفاصيل البيت">
      <p className="sp-kicker">
        البيت {toArabicDigits(p.n)} · {sectionOf(p.edition, p.n)?.title}
      </p>
      <p className="sp-verse verse-text">
        {v.a}
        <br />
        {v.b}
      </p>

      {codes.length > 0 && (
        <section>
          <h4>الرموز</h4>
          <ul>
            {codes.map(({ m, text, code }) => (
              <li key={`${m.h}${m.s}`}>
                <span className="sp-word c-red verse-text">{text}</span>
                <span>
                  {code?.label ?? m.c}
                  {code?.note && <small>{code.note}</small>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {words.length > 0 && (
        <section>
          <h4>الكلمات القرآنية</h4>
          <ul>
            {words.map((m) => (
              <li key={`${m.h}${m.s}`}>
                <span className="sp-word c-green verse-text">{markText(m, v.a, v.b)}</span>
                <span>
                  {m.q!.map(([s, a]) => `${SURAHS[s - 1]} ${toArabicDigits(a)}`).join('، ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!codes.length && !words.length && p.colors && <p className="muted">لا رموز ولا كلمات قرآنية ملوّنة في هذا البيت.</p>}

      <section>
        <h4>ملاحظتك</h4>
        {p.note.trim() && <p className="sp-note">{p.note}</p>}
        <button className="sp-link" onClick={p.onNote}>
          <Pencil size={14} /> {p.note.trim() ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
        </button>
      </section>

      {p.twins && p.twins.length > 0 && (
        <section>
          <h4>أبيات تنتهي بالكلمة نفسها ({toArabicDigits(p.twins.length)})</h4>
          <ul className="sp-twins">
            {p.twins.map((n) => (
              <li key={n}>
                <button onClick={() => p.onJump(n)}>
                  <span className="vnum small">{toArabicDigits(n)}</span>
                  <span className="verse-text">{byN.get(n)?.b}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
