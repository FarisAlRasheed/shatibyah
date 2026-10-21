// Diacritic-insensitive search that can point back into the original (displayed) text.
// Same folding as `normalize` in arabic.ts, plus a word-final ى and ا are one letter
// (Zu'bi writes وانجلا where Al-Qasim writes وانجلى).

const MARK = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/

export const isMark = (c: string) => MARK.test(c)

/** Folded text plus, for each folded character, its index in the source string. */
export interface Folded {
  text: string
  map: number[]
}

export function fold(s: string): Folded {
  const out: string[] = []
  const map: number[] = []
  for (let i = 0; i < s.length; i++) {
    let c = s[i]
    if (isMark(c)) continue
    if (/\s/.test(c)) {
      if (out.length && out[out.length - 1] !== ' ') {
        out.push(' ')
        map.push(i)
      }
      continue
    }
    if ('\u0623\u0625\u0622\u0671'.includes(c)) c = 'ا' // أ إ آ ٱ
    else if (c === 'ة') c = 'ه'
    else if (!/[\u0621-\u064a0-9]/.test(c)) continue
    out.push(c)
    map.push(i)
  }
  if (out[out.length - 1] === ' ') {
    out.pop()
    map.pop()
  }
  // ى is ا at the end of a word, ي elsewhere.
  for (let i = 0; i < out.length; i++) {
    if (out[i] === 'ى') out[i] = i + 1 === out.length || out[i + 1] === ' ' ? 'ا' : 'ي'
  }
  return { text: out.join(''), map }
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A matcher for the query, or null for an empty query. A word-final ي typed in the query
 * also matches ا, since many keyboards give ي for ى.
 */
export function queryPattern(q: string): RegExp | null {
  const t = fold(q).text
  if (!t) return null
  const words = t.split(' ').map((w) => {
    const e = escape(w)
    return w.length > 1 && (w.endsWith('ي') || w.endsWith('ا')) ? `${e.slice(0, -1)}[اي]` : e
  })
  return new RegExp(words.join(' '), 'g')
}

export function matches(re: RegExp, s: string) {
  re.lastIndex = 0
  return re.test(fold(s).text)
}

/** Source-string [start, end) ranges of every match, with trailing marks included. */
export function matchRanges(re: RegExp, s: string): [number, number][] {
  const { text, map } = fold(s)
  const ranges: [number, number][] = []
  re.lastIndex = 0
  for (const m of text.matchAll(re)) {
    if (!m[0]) continue
    const start = map[m.index]
    let end = map[m.index + m[0].length - 1] + 1
    while (end < s.length && isMark(s[end])) end++
    ranges.push([start, end])
  }
  return ranges
}
