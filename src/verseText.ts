// One text model for a verse half: words, the letter-clusters inside them, and every range drawn
// on top (colour marks, search hits, veiled words, listener slips) moved onto cluster edges.
// A cluster is a letter with the harakat on it; «لا» (lam + alef, one shape in Arabic) is one
// cluster. No range ever starts or ends inside a cluster, so nothing can split a letter from its
// harakat or cut a ligature. All offsets are in the edition's text (no tatweel).

export interface Word {
  /** Index among the half's words (split on spaces, as slips.ts counts them). */
  i: number
  s: number
  e: number
}

export interface Span {
  s: number
  e: number
}

const ALEFS = 'اأإآٱ'
const LAM = 'ل'

const segmenter: { segment(t: string): Iterable<{ index: number }> } | null =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new (Intl as unknown as { Segmenter: new (l: string, o: object) => { segment(t: string): Iterable<{ index: number }> } }).Segmenter('ar', { granularity: 'grapheme' })
    : null

/** Arabic combining marks (harakat, shadda, sukun, dagger alif, Quranic marks): they sit on the letter before. */
const MARK = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ࣓-ࣿ‌‍]/

/** Grapheme starts, by Intl.Segmenter when there is one, else by Arabic marks. */
function graphemeStarts(text: string): number[] {
  if (segmenter) return [...segmenter.segment(text)].map((g) => g.index)
  const out: number[] = []
  for (let i = 0; i < text.length; i++) if (i === 0 || !MARK.test(text[i])) out.push(i)
  return out
}

/** Edges of the clusters of `text`: 0, …, text.length. «لا» is kept whole. */
export function clusterEdges(text: string): number[] {
  const starts = graphemeStarts(text)
  const edges: number[] = []
  for (let k = 0; k < starts.length; k++) {
    const at = starts[k]
    // An alef right after a lam (with harakat between) joins the lam's cluster: «لا» is one glyph.
    if (k > 0 && ALEFS.includes(text[at]) && text[starts[k - 1]] === LAM) continue
    edges.push(at)
  }
  edges.push(text.length)
  return edges
}

/** The words of `text`, with their offsets. */
export function wordsOf(text: string): Word[] {
  return [...text.matchAll(/\S+/g)].map((m, i) => ({ i, s: m.index, e: m.index + m[0].length }))
}

/** `[s, e)` widened to cluster edges: `s` down to the cluster it falls in, `e` up to its end. */
export function snapToClusters(edges: number[], s: number, e: number): Span {
  let lo = 0
  for (const x of edges) if (x <= s) lo = x
  let hi = edges[edges.length - 1]
  for (let k = edges.length - 1; k >= 0 && edges[k] >= e; k--) hi = edges[k]
  return { s: lo, e: Math.max(lo, hi) }
}

export interface HalfModel<M> {
  text: string
  words: Word[]
  edges: number[]
  /** Colour marks on cluster edges, each with the mark it came from. */
  marks: (Span & { mark: M })[]
  /** Search hits on cluster edges. */
  hits: Span[]
}

/** The model of one half: words, clusters, and the marks and hits moved onto cluster edges. */
export function halfModel<M extends { s: number; e: number }>(text: string, marks: M[], hits?: [number, number][]): HalfModel<M> {
  const edges = clusterEdges(text)
  const snap = (s: number, e: number) => snapToClusters(edges, Math.max(0, s), Math.min(text.length, e))
  return {
    text,
    words: wordsOf(text),
    edges,
    marks: marks.map((m) => ({ ...snap(m.s, m.e), mark: m })).filter((r) => r.e > r.s),
    hits: (hits ?? []).map(([s, e]) => snap(s, e)).filter((r) => r.e > r.s),
  }
}

/** Offset in the drawn string (with the tatweels of `ins` put in) of offset `x` in the edition text.
 *  A tatweel goes with the letter before it, so it is inside a range that ends after it. */
export function drawnOffset(ins: number[] | undefined, x: number): number {
  let out = x
  if (ins) for (let i = 0; i < ins.length; i += 2) if (ins[i] <= x) out += ins[i + 1]
  return out
}

// Arabic joining, for the fallback only (browsers without the Highlight API cut words into spans
// and need a zero-width joiner on each side of a cut between two joined letters).
// Joining types from Unicode's ArabicShaping.txt for the letters this poem uses.
const RIGHT_JOINING = 'آأؤإاةدذرزوٱۥۦ'
const NON_JOINING = 'ء'
/** Whether a letter joins to the letter after it (dual-joining or join-causing). */
function joinsForward(ch: string) {
  if (ch === 'ـ') return true
  const c = ch.charCodeAt(0)
  const arabicLetter = (c >= 0x0620 && c <= 0x064a) || (c >= 0x066e && c <= 0x06d3) || c === 0x06d5
  return arabicLetter && !RIGHT_JOINING.includes(ch) && !NON_JOINING.includes(ch)
}
/** Whether a letter joins to the letter before it (dual, right or join-causing). */
function joinsBack(ch: string) {
  if (ch === 'ـ') return true
  const c = ch.charCodeAt(0)
  const arabicLetter = (c >= 0x0620 && c <= 0x064a) || (c >= 0x066e && c <= 0x06d3) || c === 0x06d5
  return arabicLetter && !NON_JOINING.includes(ch)
}
/** Whether the letters on the two sides of a cluster edge at `x` are joined in the written word. */
export function joinedAt(text: string, x: number): boolean {
  let i = x - 1
  while (i >= 0 && MARK.test(text[i])) i--
  const next = text[x]
  return i >= 0 && next !== undefined && joinsForward(text[i]) && joinsBack(next)
}
