// The explanation (الشرح) panel, EXPLANATION-PLAN A: a bottom sheet with three heights on a phone that
// leaves the poem above it usable, or the side panel on a wide screen.
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageSquareText, Trash2, Type, X } from 'lucide-react'
import { HL_COLORS, coverOf, selectionPlace, type Highlight } from './highlights'
import type { SetState } from './sheets'
import { toArabicDigits } from './arabic'
import { locate, paragraphs, type ExplainGroup, type Located } from './commentary'
import type { CommentaryNote, Edition, Range } from './types'

/** Verse n's group; `opened` is the verse the panel was opened from (null after previous/next). */
export interface ExplainTarget {
  n: number
  opened: number | null
  key: number
}

/** How the explanation text looks: its own font, size and line spacing, apart from the poem's. */
export interface ExplainLook {
  font: 'ui' | 'amiri' | 'scheherazade' | 'naskh'
  size: number
  line: number
}
const EX_FONTS: [ExplainLook['font'], string, string][] = [
  ['ui', 'حديث', 'var(--ui-font)'],
  ['naskh', 'نسخ', "'Noto Naskh Arabic', serif"],
  ['amiri', 'أميري', "'Amiri', serif"],
  ['scheherazade', 'شهرزاد', "'Scheherazade New', serif"],
]
const EX_SIZE = { min: 13, max: 26 }
const EX_LINE = { min: 1.5, max: 2.6 }

/** Highlights of the shown book, and what a tap on one or a new selection does. */
interface HlCtx {
  list: Highlight[]
  open: number | null
  onOpen: (id: number) => void
}

/** Sheet heights, as shares of the window. */
const SNAPS = [0.35, 0.6, 0.92]

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const verses = (from: number, to: number) =>
  from === to ? `البيت ${toArabicDigits(from)}` : `الأبيات ${toArabicDigits(from)} – ${toArabicDigits(to)}`
/** «الوافي» from «الوافي في شرح الشاطبية». */
const shortName = (name: string) => name.split(' في ')[0]

/** Scroll the reader so verses from–to show between the top bar and `floor` (px from the top of the window). */
function reveal(from: number, to: number, opened: number | null, floor: number) {
  const first = document.getElementById(`v-${from}`)
  const last = document.getElementById(`v-${to}`)
  if (!first || !last) return
  const top = (document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0) + 8
  const bottom = floor - 8
  const a = first.getBoundingClientRect().top
  const b = last.getBoundingClientRect().bottom
  let dy = 0
  if (b - a <= bottom - top) {
    if (a < top) dy = a - top
    else if (b > bottom) dy = b - bottom
  } else {
    // Taller than the room: the group's start at the top, unless that hides the verse it was opened from.
    dy = a - top
    const o = opened != null ? document.getElementById(`v-${opened}`)?.getBoundingClientRect() : null
    if (o && o.bottom - dy > bottom) dy = o.bottom - bottom
  }
  if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: reduced() ? 'auto' : 'smooth' })
}

/** Height of the bottom dock (mini-player and tab bar, with the safe area under them). */
function useDockHeight() {
  const [h, setH] = useState(() => (document.querySelector('.bottom-dock') as HTMLElement | null)?.offsetHeight ?? 0)
  useEffect(() => {
    const dock = document.querySelector('.bottom-dock') as HTMLElement | null
    if (!dock) return
    const ro = new ResizeObserver(() => setH(dock.offsetHeight))
    ro.observe(dock)
    return () => ro.disconnect()
  }, [])
  return h
}

function useWindowHeight() {
  const [h, setH] = useState(innerHeight)
  useEffect(() => {
    const on = () => setH(innerHeight)
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  return h
}

/** One piece of the text, cut where the user's highlights start and end. */
function Piece({ text, i, hit, hl }: { text: string; i: number; hit: boolean; hl?: HlCtx & { block: string } }) {
  const mine = hl ? hl.list.filter((h) => h.block === hl.block) : []
  const cover = mine.length ? coverOf(mine, i, text.length) : []
  let last = 0
  const out: ReactNode[] = []
  for (const [s, e, h] of cover) {
    if (s > last) out.push(text.slice(last, s))
    out.push(
      <mark
        key={`${h.id}:${s}`}
        className={`ex-hl${hl!.open === h.id ? ' open' : ''}${h.note ? ' noted' : ''}`}
        style={{ '--hl': HL_COLORS[h.color] ?? HL_COLORS[0] } as CSSProperties}
        onClick={() => hl!.onOpen(h.id)}
      >
        {text.slice(s, e)}
      </mark>,
    )
    last = e
  }
  if (last < text.length) out.push(text.slice(last))
  return (
    <span data-piece={i} className={hit ? 'ex-hit' : undefined}>
      {out}
    </span>
  )
}

function Paragraphs({ text, breaks, hit, hl }: { text: string[]; breaks: number[]; hit?: Set<number>; hl?: HlCtx & { block: string } }) {
  return (
    <>
      {paragraphs(text, breaks).map((para) => (
        <p key={para[0]}>
          {para.map((i, k) => (
            <Fragment key={i}>
              {k > 0 && ' '}
              <Piece text={text[i]} i={i} hit={!!hit?.has(i)} hl={hl} />
            </Fragment>
          ))}
        </p>
      ))}
    </>
  )
}

function Notes({ notes }: { notes?: CommentaryNote[] }) {
  if (!notes?.length) return null
  return (
    <ol className="ex-notes">
      {notes.map((x, i) => (
        <li key={i}>
          <span className="ex-mark">({x.mark})</span> {x.text}
        </li>
      ))}
    </ol>
  )
}

function GroupText({ group, opened, hl }: { group: ExplainGroup; opened: number | null; hl: HlCtx }) {
  const [introOpen, setIntroOpen] = useState(false)
  return (
    <>
      {group.intros.length > 0 && (
        <div className="ex-intro">
          <button className="ex-intro-toggle" onClick={() => setIntroOpen((x) => !x)} aria-expanded={introOpen}>
            <ChevronDown size={16} className={introOpen ? 'up' : ''} /> تمهيد الباب
          </button>
          {introOpen &&
            group.intros.map((b) => (
              <section key={b.id} data-block={b.id}>
                {b.title && <h4>{b.title}</h4>}
                <Paragraphs text={b.text} breaks={b.breaks} hl={{ ...hl, block: b.id }} />
                <Notes notes={b.notes} />
              </section>
            ))}
        </div>
      )}
      {group.blocks.map((b) => (
        <section key={b.id} className="ex-block" data-block={b.id}>
          {group.blocks.length > 1 && <h4>شرح {verses(b.from, b.to)}</h4>}
          <Paragraphs text={b.text} breaks={b.breaks} hit={opened != null ? new Set(b.parts?.[opened] ?? []) : undefined} hl={{ ...hl, block: b.id }} />
          <Notes notes={b.notes} />
        </section>
      ))}
    </>
  )
}

export default function ExplainPanel(p: {
  edition: Edition
  books: { id: string; name: string }[]
  bookId: string
  onBook: (id: string) => void
  target: ExplainTarget
  /** In the side panel of a wide screen instead of a bottom sheet. */
  side: boolean
  /** The group now shown, for the tint in the reader. */
  onGroup: (g: Range | null) => void
  /** Show the group that starts at verse n (previous / next). */
  onGo: (n: number) => void
  onClose: () => void
  look: ExplainLook
  onLook: (patch: Partial<ExplainLook>) => void
  highlights: Highlight[]
  setHighlights: SetState<{ list: Highlight[] }>
}) {
  const { edition, bookId, target, side, onGroup, onClose } = p
  const [found, setFound] = useState<{ key: string; at: Located } | null>(null)
  const [ends, setEnds] = useState<{ prev: number | null; next: number | null } | null>(null)
  const [failed, setFailed] = useState(false)
  const key = `${bookId}|${target.n}`
  const at = found?.key === key ? found.at : null
  const group = at?.group ?? null

  useEffect(() => {
    let live = true
    setFailed(false)
    setEnds(null)
    locate(bookId, edition, target.n).then(
      (x) => {
        if (!live) return
        setFound({ key, at: x })
        // Also loads the neighbouring section files, so moving on is instant.
        Promise.all([x.prev(), x.next()]).then(([prev, next]) => live && setEnds({ prev, next }), () => live && setEnds({ prev: null, next: null }))
      },
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [bookId, edition, target.n]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (at) onGroup(group ? { from: group.from, to: group.to } : null)
  }, [at, group, onGroup])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A sheet opened over the panel closes first.
      if (e.key === 'Escape' && !document.querySelector('.overlay')) onClose()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onClose])

  // Sheet height: one of three, or wherever the finger is while dragging.
  const dockH = useDockHeight()
  const winH = useWindowHeight()
  const [snap, setSnap] = useState(0)
  const [dragH, setDragH] = useState<number | null>(null)
  const maxH = Math.max(160, winH - dockH - 52) // clear of the status bar; CSS also caps it at the safe area
  const heights = SNAPS.map((s) => Math.min(Math.round(s * winH), maxH))
  const height = dragH ?? heights[snap]

  // The reader, the follow pill and the range bar make room for the sheet.
  useLayoutEffect(() => {
    if (side) return
    const root = document.documentElement.style
    root.setProperty('--explain-h', `${height}px`)
    return () => void root.removeProperty('--explain-h')
  }, [side, height])

  // Bring the explained group into view on opening and on every change of group.
  const floor = side ? winH - dockH : winH - dockH - heights[snap]
  const floorRef = useRef(floor)
  floorRef.current = floor
  const groupKey = group ? `${bookId}|${group.from}` : ''
  useEffect(() => {
    if (group) reveal(group.from, group.to, target.opened, floorRef.current)
  }, [groupKey, target.key]) // eslint-disable-line react-hooks/exhaustive-deps

  // The explanation opens on the pieces about the verse it was opened from, else at the top.
  const body = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = body.current
    if (!el || !group) return
    const hit = el.querySelector('.ex-hit')
    el.scrollTop = hit ? el.scrollTop + hit.getBoundingClientRect().top - el.getBoundingClientRect().top - 12 : 0
  }, [groupKey, target.key, target.opened]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drag the header to resize; a tap on it (not on a button) moves to the next height. The move and
  // release are followed on the window, since a mouse quickly leaves the header.
  const dragged = useRef(false)
  const nextSnap = () => setSnap((s) => (s + 1) % SNAPS.length)
  const onDown = (e: ReactPointerEvent) => {
    if (side || e.button > 0) return
    const y0 = e.clientY
    const h0 = height
    const onButton = !!(e.target as Element).closest('button')
    let moved = false
    dragged.current = false
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - y0
      if (!moved && Math.abs(dy) < 6) return
      moved = dragged.current = true
      setDragH(Math.max(80, Math.min(maxH, h0 - dy)))
    }
    const end = (ev: PointerEvent) => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', end)
      removeEventListener('pointercancel', end)
      setDragH(null)
      if (ev.type === 'pointercancel') return
      if (!moved) return void (!onButton && nextSnap())
      const h = h0 - (ev.clientY - y0)
      if (h < heights[0] - 70) return onClose()
      let best = 0
      heights.forEach((x, i) => Math.abs(x - h) < Math.abs(heights[best] - h) && (best = i))
      setSnap(best)
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', end)
    addEventListener('pointercancel', end)
  }

  // ---- Appearance and highlights ----
  const [tools, setTools] = useState(false)
  const [sel, setSel] = useState<ReturnType<typeof selectionPlace>>(null)
  const [openHl, setOpenHl] = useState<number | null>(null)
  const [noting, setNoting] = useState(false)
  const mine = p.highlights.filter((h) => h.book === bookId)
  const opened = mine.find((h) => h.id === openHl) ?? null
  useEffect(() => {
    setOpenHl(null)
    setNoting(false)
  }, [groupKey])
  // The selection inside the explanation text; it lingers a moment after it collapses, so a tap on a colour still finds it.
  useEffect(() => {
    let timer = 0
    const onSel = () => {
      clearTimeout(timer)
      const place = selectionPlace()
      const inside = place && body.current?.contains(getSelection()!.anchorNode)
      if (inside) {
        setSel(place)
        setOpenHl(null)
      } else timer = window.setTimeout(() => setSel(null), 250)
    }
    document.addEventListener('selectionchange', onSel)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('selectionchange', onSel)
    }
  }, [])
  const addHighlight = (color: number) => {
    if (!sel || !group) return
    p.setHighlights((s) => ({ list: [...s.list, { id: Date.now(), book: bookId, n: group.from, ...sel, color, note: '' }] }))
    getSelection()?.removeAllRanges()
    setSel(null)
  }
  const editHighlight = (id: number, patch: Partial<Highlight>) => p.setHighlights((s) => ({ list: s.list.map((h) => (h.id === id ? { ...h, ...patch } : h)) }))
  const size = (d: number) => p.onLook({ size: Math.max(EX_SIZE.min, Math.min(EX_SIZE.max, p.look.size + d)) })
  const line = (d: number) => p.onLook({ line: Math.max(EX_LINE.min, Math.min(EX_LINE.max, Math.round((p.look.line + d) * 100) / 100)) })
  const keep = (e: ReactPointerEvent) => e.preventDefault() // a tap on the bar must not drop the selection

  const pages = group ? [...new Set(group.blocks.map((b) => b.page))] : []
  const head = (
    <header
      className="ex-head"
      onPointerDown={onDown}
    >
      {!side && (
        <button
          className="ex-grab"
          aria-label="تغيير ارتفاع الشرح"
          onClick={() => (dragged.current ? (dragged.current = false) : nextSnap())}
        >
          <span className="grabber" />
        </button>
      )}
      <div className="ex-books">
        <div className="ex-chips" role="tablist" aria-label="كتب الشرح">
          {p.books.map((b) => (
            <button
              key={b.id}
              role="tab"
              className={`chip${b.id === bookId ? ' on' : ''}`}
              aria-selected={b.id === bookId}
              title={b.name}
              onClick={() => p.onBook(b.id)}
            >
              {shortName(b.name)}
            </button>
          ))}
        </div>
        <button className={`icon-btn ex-close${tools ? ' on' : ''}`} onClick={() => setTools((x) => !x)} aria-label="مظهر الشرح" aria-expanded={tools}>
          <Type size={19} />
        </button>
        <button className="icon-btn ex-close" onClick={onClose} aria-label="إغلاق الشرح">
          <X size={20} />
        </button>
      </div>
      <p className="ex-title">{group ? `شرح ${verses(group.from, group.to)}` : at ? `البيت ${toArabicDigits(target.n)}` : ' '}</p>
      {tools && (
        <div className="ex-look" onPointerDown={(e) => e.stopPropagation()}>
          <div className="ex-look-row">
            <button onClick={() => size(-1)} disabled={p.look.size <= EX_SIZE.min} aria-label="تصغير الخط">
              أ−
            </button>
            <span>{toArabicDigits(p.look.size)}</span>
            <button onClick={() => size(1)} disabled={p.look.size >= EX_SIZE.max} aria-label="تكبير الخط">
              أ+
            </button>
            <i />
            <button onClick={() => line(-0.15)} disabled={p.look.line <= EX_LINE.min} aria-label="تقريب الأسطر">
              ≡−
            </button>
            <button onClick={() => line(0.15)} disabled={p.look.line >= EX_LINE.max} aria-label="تبعيد الأسطر">
              ≡+
            </button>
          </div>
          <div className="ex-look-row">
            {EX_FONTS.map(([id, label, family]) => (
              <button key={id} className={p.look.font === id ? 'on' : ''} style={{ fontFamily: family }} aria-pressed={p.look.font === id} onClick={() => p.onLook({ font: id })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )

  const content = (
    <>
      {head}
      <div
        className="ex-body"
        dir="rtl"
        ref={body}
        style={{ fontFamily: EX_FONTS.find((f) => f[0] === p.look.font)?.[2], fontSize: p.look.size, lineHeight: p.look.line }}
      >
        {failed ? (
          <p className="muted">تعذّر تحميل الشرح.</p>
        ) : !at ? (
          <p className="muted">جارٍ التحميل…</p>
        ) : !group ? (
          <p className="muted">لا يوجد شرح لهذا البيت في هذا الكتاب.</p>
        ) : (
          <GroupText key={groupKey} group={group} opened={target.opened} hl={{ list: mine, open: openHl, onOpen: (id) => { if (!selectionPlace()) { setOpenHl(id); setNoting(false) } } }} />
        )}
      </div>
      {(sel || opened) && (
        <div className="ex-hlbar" onPointerDown={keep}>
          <span className="ex-hlbar-label">{opened ? 'التظليل' : 'تظليل'}</span>
          {HL_COLORS.map((c, i) => (
            <button
              key={c}
              className={`ex-hl-dot${opened?.color === i ? ' on' : ''}`}
              style={{ '--hl': c } as CSSProperties}
              aria-label={`لون ${toArabicDigits(i + 1)}`}
              onClick={() => (opened ? editHighlight(opened.id, { color: i }) : addHighlight(i))}
            />
          ))}
          {opened && (
            <>
              <i />
              <button className={`ex-hl-btn${noting || opened.note ? ' on' : ''}`} onClick={() => setNoting((x) => !x)} aria-label="ملاحظة على التظليل" aria-expanded={noting}>
                <MessageSquareText size={19} />
              </button>
              <button
                className="ex-hl-btn"
                aria-label="حذف التظليل"
                onClick={() => {
                  p.setHighlights((s) => ({ list: s.list.filter((h) => h.id !== opened.id) }))
                  setOpenHl(null)
                }}
              >
                <Trash2 size={19} />
              </button>
              <button className="ex-hl-btn" aria-label="إغلاق" onClick={() => setOpenHl(null)}>
                <X size={19} />
              </button>
            </>
          )}
          {opened && (noting || opened.note) && (
            <textarea
              className="ex-hl-note"
              placeholder="ملاحظة على هذا التظليل"
              value={opened.note}
              rows={2}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => editHighlight(opened.id, { note: e.target.value })}
            />
          )}
        </div>
      )}
      <footer className="ex-foot">
        <button disabled={ends?.prev == null} onClick={() => ends?.prev != null && p.onGo(ends.prev)}>
          <ChevronRight size={18} /> السابق
        </button>
        <span className="ex-page">{pages.length ? `ص ${pages.map((x) => toArabicDigits(x)).join('، ')}` : ''}</span>
        <button disabled={ends?.next == null} onClick={() => ends?.next != null && p.onGo(ends.next)}>
          التالي <ChevronLeft size={18} />
        </button>
      </footer>
    </>
  )

  if (side)
    return (
      <aside className="side-panel ex-side" aria-label="الشرح">
        {content}
      </aside>
    )
  return (
    <section
      className={`ex-sheet${dragH != null ? ' dragging' : ''}`}
      aria-label="الشرح"
      style={{ height, bottom: dockH }}
    >
      {content}
    </section>
  )
}
