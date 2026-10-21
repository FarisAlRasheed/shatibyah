import { Fragment, memo, useEffect } from 'react'
import { Bookmark, Check, Pencil } from 'lucide-react'
import { toArabicDigits } from './arabic'
import type { Bookmarks, Mastered, Notes } from './store'
import type { Edition, Section } from './types'

interface Props {
  edition: Edition
  selected: number | null
  playing: number | null
  notes: Notes
  bookmarks: Bookmarks
  mastered: Mastered
  scrollTarget: { n: number; key: number } | null
  onTap: (n: number) => void
  onSectionChange: (s: Section | null) => void
}

export default function Reader(p: Props) {
  const { edition, scrollTarget, onSectionChange } = p

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
    <main className="reader">
      {edition.verses.map((v) => (
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
            onTap={p.onTap}
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
  onTap: (n: number) => void
}

const VerseRow = memo(function VerseRow(p: RowProps) {
  return (
    <article id={`v-${p.n}`} className={`verse${p.isSelected ? ' selected' : ''}${p.isPlaying ? ' playing' : ''}`}>
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
          <span className="half a">{p.a}</span>
          <span className="half b">{p.b}</span>
        </span>
      </button>
    </article>
  )
})
