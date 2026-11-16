// «مراجعة اليوم» and the test-yourself verse lists (IMPROVEMENTS-PLAN 3).
import type { Mastered, Weak } from './store'

/** How many verses «مراجعة اليوم» offers. */
export const REVIEW_SIZE = 20
const DAY = 86_400_000

/** Verses marked «لم أتقنه» and not mastered since, the most missed first. */
export function weakNow(weak: Weak, mastered: Mastered, has: (n: number) => boolean): number[] {
  return Object.entries(weak)
    .map(([n, w]) => ({ n: +n, ...w }))
    .filter((w) => has(w.n) && !((mastered[w.n] ?? 0) > w.at))
    .sort((x, y) => y.count - x.count || y.at - x.at)
    .map((w) => w.n)
}

/**
 * The app's own review list: the weak verses first, then the mastered verses whose last «أتقنته»
 * is the oldest (at least a day old), up to `size` verses.
 */
export function reviewDue(weak: Weak, mastered: Mastered, has: (n: number) => boolean, now = Date.now(), size = REVIEW_SIZE): number[] {
  const first = weakNow(weak, mastered, has).slice(0, size)
  const taken = new Set(first)
  const old = Object.entries(mastered)
    .map(([n, at]) => ({ n: +n, at: Number(at) || 0 }))
    .filter((m) => has(m.n) && !taken.has(m.n) && now - m.at >= DAY)
    .sort((x, y) => x.at - y.at || x.n - y.n)
    .slice(0, size - first.length)
    .map((m) => m.n)
  return [...first, ...old]
}

/** A new array in random order. */
export function shuffled<T>(list: T[], random = Math.random): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
