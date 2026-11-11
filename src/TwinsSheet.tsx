// Same-ending verses (UX-PLAN 5.3): the verses that end with the same word as verse n.
import { toArabicDigits } from './arabic'
import { Sheet, plural, VERSES } from './sheets'
import { lastWordRange } from './twins'
import type { Edition, Verse } from './types'

/** The second half with its last word marked. */
function MarkedEnd({ b }: { b: string }) {
  const r = lastWordRange(b)
  if (!r) return <>{b}</>
  return (
    <>
      {b.slice(0, r[0])}
      <mark>{b.slice(r[0], r[1])}</mark>
      {b.slice(r[1])}
    </>
  )
}

export default function TwinsSheet(p: { n: number; edition: Edition; twins: number[]; onJump: (n: number) => void; onClose: () => void }) {
  const byN = new Map(p.edition.verses.map((v) => [v.n, v]))
  const own = byN.get(p.n)
  const r = own && lastWordRange(own.b)
  const word = own && r ? own.b.slice(r[0], r[1]) : ''
  const rows = p.twins.map((n) => byN.get(n)).filter((v): v is Verse => !!v)
  return (
    <Sheet title={`أبيات تنتهي بـ«${word}»`} onClose={p.onClose}>
      <p className="muted">
        {rows.length ? `${plural(rows.length, VERSES)} غير البيت ${toArabicDigits(p.n)}` : 'لا أبيات أخرى تنتهي بهذه الكلمة.'}
      </p>
      {rows.map((v) => (
        <button key={v.n} className="result" onClick={() => p.onJump(v.n)}>
          <div className="preview">
            <span className="vnum small">{toArabicDigits(v.n)}</span>
            <span className="verse-text">
              {v.a} <span className="sep">...</span> <MarkedEnd b={v.b} />
            </span>
          </div>
        </button>
      ))}
    </Sheet>
  )
}
