// Same-ending verses (UX-PLAN 5.3): verses whose second half ends with the same word.
// Uses the search folding, so marks, tatweel and punctuation are ignored and a final ى is ا.
import { fold, isMark } from './search'
import type { Edition } from './types'

/** The folded last word of a verse half ('' when it has none). */
export function lastWord(b: string): string {
  const t = fold(b).text
  return t.slice(t.lastIndexOf(' ') + 1)
}

/** Source [start, end) of the last word as printed, with its marks; null when there is none. */
export function lastWordRange(b: string): [number, number] | null {
  const { text, map } = fold(b)
  if (!text) return null
  const start = map[text.lastIndexOf(' ') + 1]
  let end = map[map.length - 1] + 1
  while (end < b.length && isMark(b[end])) end++
  return [start, end]
}

/** Verse → the other verses ending with the same word, ascending. Verses with no twin are left out. */
export function buildTwins(edition: Edition): Map<number, number[]> {
  const groups = new Map<string, number[]>()
  for (const v of edition.verses) {
    const w = lastWord(v.b)
    if (!w) continue
    const g = groups.get(w)
    if (g) g.push(v.n)
    else groups.set(w, [v.n])
  }
  const twins = new Map<number, number[]>()
  for (const g of groups.values()) {
    if (g.length < 2) continue
    g.sort((x, y) => x - y)
    for (const n of g) twins.set(n, g.filter((m) => m !== n))
  }
  return twins
}
