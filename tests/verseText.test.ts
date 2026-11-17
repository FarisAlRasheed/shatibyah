// Whole-poem check of the text model (src/verseText.ts). Run: node tests/verseText.test.ts
// Every colour mark and its cluster-snapped range: no range starts or ends between a letter and
// its harakat or inside «لا», the drawn text is the edition's text, and snapping only widens.
import { readFileSync } from 'node:fs'
import { clusterEdges, halfModel, wordsOf } from '../src/verseText.ts'

const root = new URL('../data/editions/qasim/', import.meta.url)
const edition = JSON.parse(readFileSync(new URL('edition.json', root), 'utf8'))
const colors = JSON.parse(readFileSync(new URL('colors.json', root), 'utf8'))
const MARK = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ࣓-ࣿ]/

let fails = 0, halves = 0, marks = 0, moved = 0
const fail = (msg: string) => { if (++fails <= 30) console.log('FAIL', msg) }

for (const v of edition.verses) {
  for (const h of ['a', 'b'] as const) {
    const text: string = v[h]
    halves++
    const edges = clusterEdges(text)
    // Clusters cover the text exactly, and no cluster starts with a haraka (unless the text does).
    if (edges[0] !== 0 || edges[edges.length - 1] !== text.length) fail(`${v.n}${h}: edges do not cover the text`)
    for (const x of edges.slice(1, -1)) {
      if (MARK.test(text[x])) fail(`${v.n}${h}: cluster starts with a haraka at ${x}`)
      if ('اأإآٱ'.includes(text[x])) {
        let i = x - 1
        while (i >= 0 && MARK.test(text[i])) i--
        if (text[i] === 'ل') fail(`${v.n}${h}: «لا» split at ${x}`)
      }
    }
    const ms = (colors.verses[v.n] ?? []).filter((m: { h: string }) => m.h === h)
    const model = halfModel(text, ms, [[0, 1], [3, 5]])
    if (model.text !== text) fail(`${v.n}${h}: text changed`)
    if (model.words.map((w) => text.slice(w.s, w.e)).join(' ') !== text.trim().split(/\s+/).join(' ')) fail(`${v.n}${h}: words differ`)
    const set = new Set(edges)
    for (const r of [...model.marks, ...model.hits]) {
      if (!set.has(r.s) || !set.has(r.e)) fail(`${v.n}${h}: range ${r.s}-${r.e} is off cluster edges`)
    }
    for (const r of model.marks) {
      marks++
      if (r.s > r.mark.s || r.e < r.mark.e) fail(`${v.n}${h}: snapping shrank mark ${r.mark.s}-${r.mark.e}`)
      if (r.s !== r.mark.s || r.e !== r.mark.e) moved++
      // A mark stays inside one word (the tap target is the whole word).
      const ws = wordsOf(text).filter((w) => w.s < r.e && w.e > r.s)
      if (ws.length !== 1 && text.slice(r.s, r.e).trim().split(/\s+/).length === 1) fail(`${v.n}${h}: mark ${r.s}-${r.e} spans no word`)
    }
  }
}
console.log(`${halves} halves, ${marks} colour marks (${moved} widened to cluster edges), ${fails} failures`)
process.exit(fails ? 1 : 0)
