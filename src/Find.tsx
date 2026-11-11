// Search inside the reader's top bar: the page stays on screen, results drop down under the
// bar, and after choosing one the bar steps through the matches like find-in-page.
import { useEffect, useMemo, useRef } from 'react'
import { ChevronDown, ChevronUp, Hash, Search, SearchX, X } from 'lucide-react'
import { normalize, toArabicDigits, toLatinDigits } from './arabic'
import { verseRange } from './data'
import type { VerseHits } from './Reader'
import { Empty, Highlight, VerseHit } from './screens'
import { fold, matchRanges, matches, queryPattern } from './search'
import { plural, VERSES, VersePreview } from './sheets'
import type { Edition, Section } from './types'

export interface FindState {
  q: string
  /** The results list is showing (it closes once a result is chosen; the bar stays). */
  list: boolean
  /** Position in `verses` of the match last jumped to, or -1. */
  at: number
}

export interface FindResults {
  re: RegExp | null
  /** A verse number typed as the query, when it exists in this edition. */
  verse: number | null
  /** The query is a number with no such verse. */
  badNumber: number | null
  sections: Section[]
  verses: number[]
  /** Where to mark the matches in the reader. */
  hits: Map<number, VerseHits> | null
}

/** Everything the query matches. Matching ignores diacritics (search.ts). */
export function useFind(edition: Edition | null, q: string): FindResults {
  const index = useMemo(() => edition?.verses.map((v) => ({ v, text: fold(`${v.a} ${v.b}`).text })) ?? [], [edition])
  return useMemo(() => {
    if (!edition) return { re: null, verse: null, badNumber: null, sections: [], verses: [], hits: null }
    const query = normalize(toLatinDigits(q))
    const num = /^\d+$/.test(query) ? +query : null
    const all = verseRange(edition)
    const exists = num != null && num >= all.from && num <= all.to
    const re = num == null ? queryPattern(q) : null
    const empty: FindResults = { re, verse: exists ? num : null, badNumber: num != null && !exists ? num : null, sections: [], verses: [], hits: null }
    if (!re) return empty
    const found = index.filter((x) => {
      re.lastIndex = 0
      return re.test(x.text)
    })
    // One letter matches nearly every verse: list them, but don't paint the whole page.
    let hits: Map<number, VerseHits> | null = null
    if (fold(q).text.length >= 2) {
      hits = new Map()
      for (const { v } of found) {
        // Matched on both halves as one line, so a phrase across the two halves is found too.
        const cut = v.a.length
        const a: [number, number][] = []
        const b: [number, number][] = []
        for (const [s, e] of matchRanges(re, `${v.a} ${v.b}`)) {
          if (s < cut) a.push([s, Math.min(e, cut)])
          if (e > cut + 1) b.push([Math.max(0, s - cut - 1), e - cut - 1])
        }
        hits.set(v.n, { a, b })
      }
    }
    return { ...empty, sections: edition.sections.filter((s) => matches(re, s.title)), verses: found.map((x) => x.v.n), hits }
  }, [edition, index, q])
}

/** The search field that takes the title's place in the top bar. */
export function FindBar(p: {
  find: FindState
  results: FindResults
  onChange: (q: string) => void
  onStep: (d: 1 | -1) => void
  /** Enter: jump to the typed verse number or to the next match. */
  onEnter: () => void
  onFocus: () => void
  onClose: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])
  const n = p.results.verses.length
  return (
    <div className="find-bar" role="search">
      <label className="search-box">
        <Search size={18} />
        <input
          ref={input}
          type="search"
          enterKeyHint="search"
          placeholder="كلمة، أو رقم بيت، أو اسم باب"
          value={p.find.q}
          onChange={(e) => p.onChange(e.target.value)}
          onFocus={p.onFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (e.shiftKey) p.onStep(-1)
              else p.onEnter()
            } else if (e.key === 'Escape') p.onClose()
          }}
        />
        {n > 0 && (
          <span className="find-count" aria-live="polite">
            {p.find.at >= 0 ? `${toArabicDigits(p.find.at + 1)} من ${toArabicDigits(n)}` : toArabicDigits(n)}
          </span>
        )}
      </label>
      <button className="icon-btn" onClick={() => p.onStep(-1)} disabled={!n} aria-label="النتيجة السابقة">
        <ChevronUp size={21} />
      </button>
      <button className="icon-btn" onClick={() => p.onStep(1)} disabled={!n} aria-label="النتيجة التالية">
        <ChevronDown size={21} />
      </button>
      <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق البحث">
        <X size={21} />
      </button>
    </div>
  )
}

const LIST_MAX = 100

/** The results under the bar. */
export function FindList(p: { edition: Edition; find: FindState; results: FindResults; onJump: (n: number, at: number) => void; onDismiss: () => void }) {
  const { re, verse, badNumber, sections, verses } = p.results
  const byNumber = useMemo(() => new Map(p.edition.verses.map((v) => [v.n, v])), [p.edition])
  const query = p.find.q.trim()
  return (
    <div className="find-layer" onClick={p.onDismiss}>
      <div className="find-list" onClick={(e) => e.stopPropagation()}>
        {verse != null && (
          <button className="result" onClick={() => p.onJump(verse, -1)}>
            <VersePreview edition={p.edition} n={verse} />
          </button>
        )}
        {badNumber != null && (
          <Empty icon={<Hash size={26} />}>
            البيت {toArabicDigits(badNumber)} غير موجود في هذه النسخة{p.edition.partial ? ' التجريبية' : ''}.
          </Empty>
        )}
        {sections.length > 0 && <h2 className="group-title">الأبواب</h2>}
        {sections.map((s) => (
          <button key={s.id} className="result section-hit" onClick={() => p.onJump(s.start, -1)}>
            <strong className="verse-text">
              <Highlight text={s.title} ranges={matchRanges(re!, s.title)} />
            </strong>
            <small>
              {toArabicDigits(s.start)}–{toArabicDigits(s.end)}
            </small>
          </button>
        ))}
        {verses.length > 0 && (
          <h2 className="group-title">
            {plural(verses.length, VERSES)}
            {verses.length > LIST_MAX ? ` · أول ${toArabicDigits(LIST_MAX)}` : ''}
          </h2>
        )}
        {verses.slice(0, LIST_MAX).map((n, i) => (
          <button key={n} className={`result${i === p.find.at ? ' current' : ''}`} onClick={() => p.onJump(n, i)}>
            <VerseHit v={byNumber.get(n)!} re={re!} />
          </button>
        ))}
        {re && !sections.length && !verses.length && <Empty icon={<SearchX size={26} />}>لا نتائج لـ«{query}».</Empty>}
        {!query && <Empty icon={<Search size={26} />}>ابحث دون تشكيل، مثل: وانجلى، أو اكتب رقم البيت.</Empty>}
      </div>
    </div>
  )
}
