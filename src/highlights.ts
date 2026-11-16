// Highlights in the explanation text (IMPROVEMENTS-PLAN 5). A block's text is a list of pieces; a
// highlight runs from an offset in one piece to an offset in the same or a later piece of that block.

export const HL_COLORS = ['#f2c744', '#6cc48a', '#6aa9e9', '#ef8fb5'] as const

export interface Highlight {
  /** When it was made (ms since epoch); also its id. */
  id: number
  book: string
  block: string
  /** First verse of the explained group, for jumping back to it. */
  n: number
  /** Start: piece index and offset in that piece. */
  p0: number
  o0: number
  /** End (exclusive offset). */
  p1: number
  o1: number
  color: number
  note: string
  /** The highlighted words, for the list in الفهرس. */
  quote: string
}

export interface HighlightStore {
  list: Highlight[]
}

/** The parts of piece `i` (length `len`) that highlights cover: sorted, non-overlapping [start, end, highlight]. */
export function coverOf(list: Highlight[], i: number, len: number): [number, number, Highlight][] {
  const out: [number, number, Highlight][] = []
  // Newer highlights win where two overlap.
  for (const h of [...list].sort((a, b) => b.id - a.id)) {
    if (i < h.p0 || i > h.p1) continue
    let s = i === h.p0 ? h.o0 : 0
    let e = i === h.p1 ? h.o1 : len
    s = Math.max(0, Math.min(len, s))
    e = Math.max(0, Math.min(len, e))
    // Cut away what earlier (newer) entries already took.
    let spans: [number, number][] = [[s, e]]
    for (const [a, b] of out) spans = spans.flatMap(([x, y]) => (b <= x || a >= y ? [[x, y]] : [[x, a], [b, y]])) as [number, number][]
    for (const [x, y] of spans) if (y > x) out.push([x, y, h])
  }
  return out.sort((a, b) => a[0] - b[0])
}

/** Offset of (node, offset) inside `root`, counted in characters of its text. */
function offsetIn(root: Element, node: Node, offset: number) {
  const r = document.createRange()
  r.selectNodeContents(root)
  r.setEnd(node, offset)
  return r.toString().length
}

const pieceOf = (node: Node | null) => (node instanceof Element ? node : node?.parentElement)?.closest<HTMLElement>('[data-piece]') ?? null

/** The current text selection as a place in one block's pieces; null when it isn't inside a single block. */
export function selectionPlace(): { block: string; p0: number; o0: number; p1: number; o1: number; quote: string } | null {
  const sel = getSelection()
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null
  const range = sel.getRangeAt(0)
  let a = pieceOf(range.startContainer)
  let b = pieceOf(range.endContainer)
  const blockEl = (a ?? b)?.closest<HTMLElement>('[data-block]')
  if (!blockEl) return null
  // An end that fell between pieces (on the paragraph or the space) snaps to the nearest piece inside.
  const pieces = [...blockEl.querySelectorAll<HTMLElement>('[data-piece]')].filter((el) => range.intersectsNode(el))
  if (!pieces.length) return null
  let o0: number, o1: number
  if (a && pieces.includes(a)) o0 = offsetIn(a, range.startContainer, range.startOffset)
  else [a, o0] = [pieces[0], 0]
  if (b && pieces.includes(b)) o1 = offsetIn(b, range.endContainer, range.endOffset)
  else [b, o1] = [pieces[pieces.length - 1], pieces[pieces.length - 1].textContent!.length]
  if (a.closest('[data-block]') !== blockEl || b.closest('[data-block]') !== blockEl) return null
  const p0 = +a.dataset.piece!, p1 = +b.dataset.piece!
  if (p0 > p1 || (p0 === p1 && o0 >= o1)) return null
  const quote = sel.toString().replace(/\s+/g, ' ').trim()
  if (!quote) return null
  return { block: blockEl.dataset.block!, p0, o0, p1, o1, quote: quote.length > 160 ? `${quote.slice(0, 160)}…` : quote }
}
