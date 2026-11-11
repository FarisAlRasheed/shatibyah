// Equal half-line widths, as in the printed book: every half is set to one shared width.
// Short halves are stretched with tatweel (kashida), long ones are squeezed a little.
// Display only: the edition's text is never changed, and positions are counted in that text
// so colour marks and search highlights keep lining up.
import { useEffect, useState } from 'react'
import { APP_VERSION } from './config'
import type { Edition, EditionColors } from './types'

/** How one half-line is fitted to the shared width. */
export interface HalfFit {
  /** Flat pairs [position, count, …]: `count` tatweels go before the character at `position`. */
  ins: number[]
  /** Horizontal squeeze (< 1) for a half wider than the shared width; 1 otherwise. */
  squeeze: number
}

export interface Fits {
  /** The shared half-line width, in em of the verse font size. */
  width: number
  /** Per verse (by position in edition.verses); a hole means "not worked out yet". */
  a: (HalfFit | undefined)[]
  b: (HalfFit | undefined)[]
}

export const DEFAULT_HALF_EM = 11.5
const ALGO = 3 // bump to drop cached results when the rules below change
const REF = 100 // px; widths scale with the font size, so everything is measured once in em
const TATWEEL = 'ـ'
const MARK = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/
const DUAL = 'بتثجحخسشصضطظعغفقكلمنهيئ' // letters that join to the next letter
const LETTER = /[آ-غف-يٱ]/ // can be joined from the right (not ء, not ـ)
const ALEFS = 'اأإآٱ'
const GOD = /^[وفبتك]{0,2}[اٱ]?لله(?:م)?$/ // the word الله is never stretched
const MAX_SQUEEZE = 0.8

interface Slot {
  pos: number
  score: number
}

/** Places inside each word where a tatweel may go, best first. */
function wordSlots(text: string, blocked: [number, number][]): Slot[][] {
  const words: Slot[][] = []
  for (const w of text.matchAll(/\S+/g)) {
    const ws = w.index
    const we = ws + w[0].length
    if (w[0].includes(TATWEEL) || blocked.some(([s, e]) => s < we && e > ws)) continue
    // Clusters: a base character with the marks that sit on it.
    const base: string[] = []
    const at: number[] = []
    for (let i = 0; i < w[0].length; i++) {
      if (MARK.test(w[0][i]) && base.length) continue
      base.push(w[0][i])
      at.push(ws + i)
    }
    if (GOD.test(base.join(''))) continue
    const slots: Slot[] = []
    for (let i = 0; i + 1 < base.length; i++) {
      const A = base[i]
      const B = base[i + 1]
      if (!DUAL.includes(A) || !LETTER.test(B)) continue
      if (A === 'ل' && ALEFS.includes(B)) continue // لا is one shape
      let score = i * 0.01 // later joins win ties
      if (i + 2 === base.length) score += 3 // before the last letter, the printed habit
      if ('سشصض'.includes(A)) score += 3
      if ('ةهدذالكطظ'.includes(B)) score += 2
      if (A === 'ل') score -= 4
      if (A === 'ك') score -= 1
      if ('رزو'.includes(B)) score -= 2
      if ('يى'.includes(B)) score -= 1
      if ('جحخ'.includes(B)) score -= 1
      if (i === 0 && base.length > 2) score -= 1
      if (base.length <= 2) score -= 2
      slots.push({ pos: at[i + 1], score })
    }
    if (slots.length) words.push(slots.sort((x, y) => y.score - x.score))
  }
  return words
}

/** The order in which tatweels are handed out: one per word per round, best words first. */
function fillOrder(words: Slot[][]): number[] {
  const order: number[] = []
  const best = words.map((w) => w[0]).sort((x, y) => y.score - x.score)
  const good = best.filter((s) => s.score >= 0)
  for (let round = 0; round < 3; round++) for (const s of good) order.push(s.pos)
  const second = words
    .flatMap((w) => (w[1] && w[1].score >= 1 ? [w[1]] : []))
    .concat(best.filter((s) => s.score < 0 && s.score >= -2))
    .sort((x, y) => y.score - x.score)
  for (let round = 0; round < 2; round++) for (const s of second) order.push(s.pos)
  return order
}

/** `text[from, to)` with the tatweels of `ins` put in (those before a character in (from, to]). */
export function withTatweel(text: string, ins: number[] | undefined, from = 0, to = text.length) {
  if (!ins?.length) return from === 0 && to === text.length ? text : text.slice(from, to)
  let out = ''
  let last = from
  for (let i = 0; i < ins.length; i += 2) {
    const pos = ins[i]
    if (pos <= from || pos > to) continue
    out += text.slice(last, pos) + TATWEEL.repeat(ins[i + 1])
    last = pos
  }
  return out + text.slice(last, to)
}

const pairs = (counts: Map<number, number>) =>
  [...counts].filter(([, c]) => c > 0).sort((x, y) => x[0] - y[0]).flat()

function fitHalf(
  text: string,
  natural: number,
  width: number,
  tatweel: number,
  blocked: [number, number][],
  measure: (s: string) => number,
): HalfFit {
  if (natural >= width) return { ins: [], squeeze: Math.max(MAX_SQUEEZE, width / natural) }
  let n = Math.floor((width - natural - 0.03) / tatweel)
  if (n <= 0) return NONE
  const counts = new Map<number, number>()
  const added: number[] = []
  for (const pos of fillOrder(wordSlots(text, blocked))) {
    if (!n) break
    counts.set(pos, (counts.get(pos) ?? 0) + 1)
    added.push(pos)
    n--
  }
  // Joined shapes can be a touch wider than the estimate: take tatweels back until it fits.
  let ins = pairs(counts)
  for (let guard = 0; ins.length && guard < 6 && measure(withTatweel(text, ins)) > width; guard++) {
    const pos = added.pop()!
    counts.set(pos, counts.get(pos)! - 1)
    ins = pairs(counts)
  }
  return ins.length ? { ins, squeeze: 1 } : NONE
}

const NONE: HalfFit = { ins: [], squeeze: 1 }
const pause = () => new Promise<void>((r) => setTimeout(r, 0))

function greenRanges(colors: EditionColors | null, n: number, h: 'a' | 'b'): [number, number][] {
  const marks = colors?.verses[n]
  if (!marks) return []
  return marks.filter((m) => m.k === 'g' && m.h === h).map((m) => [m.s, m.e])
}

/**
 * Work out the fit of every half-line for this font. `colors` is undefined while still loading
 * (the work waits, since Quranic words are left unstretched). `stretch` off keeps the shared
 * width and the squeeze but adds no tatweel. `near` is the verse to do first.
 */
export function useFits(
  edition: Edition | null,
  colors: EditionColors | null | undefined,
  fontKey: string,
  family: string,
  stretch: boolean,
  near: number,
): Fits | null {
  const [fits, setFits] = useState<Fits | null>(null)

  useEffect(() => {
    setFits(null)
    if (!edition || colors === undefined) return
    let live = true
    const cacheKey = `shatibiyyah:fits:${ALGO}:${APP_VERSION}:${edition.id}:${fontKey}:${colors ? 'c' : 'n'}:${stretch ? 1 : 0}`
    const run = async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null') as Fits | null
        if (cached?.a?.length === edition.verses.length) return setFits(cached)
      } catch {
        /* no cache */
      }
      try {
        await document.fonts.load(`${REF}px ${family}`)
        await document.fonts.ready
      } catch {
        /* measure with whatever is loaded */
      }
      if (!live) return
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return
      ctx.font = `${REF}px ${family}`
      const measure = (s: string) => ctx.measureText(s).width / REF
      const tatweel = Math.max(0.05, measure('ب' + TATWEEL + 'ب') - measure('بب'))

      // Pass 1: natural widths, which set the shared width.
      const verses = edition.verses
      const wa: number[] = []
      const wb: number[] = []
      for (let i = 0; i < verses.length; i++) {
        wa.push(measure(verses[i].a))
        wb.push(measure(verses[i].b))
        if (i % 400 === 399) {
          await pause()
          if (!live) return
        }
      }
      const sorted = [...wa, ...wb].sort((x, y) => x - y)
      const width = +Math.max(sorted[Math.floor(sorted.length * 0.92)], sorted[sorted.length - 1] * MAX_SQUEEZE).toFixed(2)

      // Pass 2: verses nearest the reader's place first, so what is on screen settles at once.
      const start = Math.max(0, verses.findIndex((v) => v.n >= near))
      const order = verses.map((_, i) => i).sort((x, y) => Math.abs(x - start) - Math.abs(y - start))
      const out: Fits = { width, a: [], b: [] }
      for (let k = 0; k < order.length; k++) {
        const i = order[k]
        const v = verses[i]
        out.a[i] = stretch || wa[i] > width ? fitHalf(v.a, wa[i], width, stretch ? tatweel : Infinity, greenRanges(colors, v.n, 'a'), measure) : NONE
        out.b[i] = stretch || wb[i] > width ? fitHalf(v.b, wb[i], width, stretch ? tatweel : Infinity, greenRanges(colors, v.n, 'b'), measure) : NONE
        if (k === 39 || k % 240 === 239) {
          setFits({ width, a: out.a.slice(), b: out.b.slice() })
          await pause()
          if (!live) return
        }
      }
      setFits(out)
      try {
        localStorage.setItem(cacheKey, JSON.stringify(out))
      } catch {
        /* storage full or blocked: recompute next time */
      }
    }
    void run()
    return () => {
      live = false
    }
  }, [edition, colors, fontKey, family, stretch]) // eslint-disable-line react-hooks/exhaustive-deps

  return fits
}
