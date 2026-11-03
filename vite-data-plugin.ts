// Serves the agents' `data/` folder at /data in dev and copies it into dist on build.
// Skips working files (_source, _progress.json, reports) and writes data/manifest.json.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const DATA = path.resolve('data')
const skip = (rel: string) =>
  rel.split('/').some((p) => p.startsWith('_') || p.startsWith('.')) || rel.endsWith('.md')

function walk(dir: string, base = ''): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name
    if (skip(rel)) return []
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel]
  })
}

function manifest() {
  const read = (kind: string, file: string) =>
    fs.existsSync(path.join(DATA, kind))
      ? fs.readdirSync(path.join(DATA, kind)).flatMap((id) => {
          const p = path.join(DATA, kind, id, file)
          return fs.existsSync(p) ? [JSON.parse(fs.readFileSync(p, 'utf8'))] : []
        })
      : []
  return {
    editions: read('editions', 'edition.json').map((e) => ({ id: e.id, name: e.name })),
    reciters: read('reciters', 'reciter.json').map((r) => ({ id: r.id, name: r.name, editionId: r.editionId })),
  }
}

const MIME: Record<string, string> = { '.json': 'application/json', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4' }

type Timing = { n: number; file: string; start: number; end: number; checked?: boolean }

/** Write one verse's approved cut into reciter.json (dev only; used by tools/cut-editor.html). */
function approveCut(body: string) {
  const { reciter, n, start, end } = JSON.parse(body)
  if (!/^[\w-]+$/.test(reciter)) throw new Error('bad reciter')
  const file = path.join(DATA, 'reciters', reciter, 'reciter.json')
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'))
  const verses: Timing[] = doc.verses
  const i = verses.findIndex((v) => v.n === n)
  const v = verses[i]
  const s = Math.round(start * 100) / 100, e = Math.round(end * 100) / 100
  if (!v || !Number.isFinite(s) || !Number.isFinite(e) || s < 0 || s >= e) throw new Error('bad cut')
  const prev = verses[i - 1], next = verses[i + 1]
  if (prev?.file === v.file && s < prev.end) throw new Error(`يتداخل مع البيت ${prev.n}`)
  if (next?.file === v.file && e > next.start) throw new Error(`يتداخل مع البيت ${next.n}`)
  Object.assign(v, { start: s, end: e, checked: true })
  fs.writeFileSync(file + '.tmp', JSON.stringify(doc, null, 2))
  fs.renameSync(file + '.tmp', file)
  return v
}

const REVIEW = path.join(DATA, 'editions', 'qasim', '_text-review.json')
const readReview = (): Record<string, { text?: string; at: string }> =>
  fs.existsSync(REVIEW) ? JSON.parse(fs.readFileSync(REVIEW, 'utf8')) : {}

/**
 * Approve one uncertain text item of the Qasim edition (dev only; the النص tab of tools/cut-editor.html).
 * A changed reading is written into edition.json; every approval is logged in _text-review.json.
 */
function approveText(body: string) {
  const { id, kind, n, half, section, text } = JSON.parse(body)
  if (typeof id !== 'string' || !/^[\w-]+$/.test(id)) throw new Error('bad id')
  const entry: { text?: string; at: string } = { at: new Date().toISOString() }
  if (kind !== 'rule') {
    const t = typeof text === 'string' ? text.normalize('NFC').trim() : ''
    if (!t) throw new Error('النص فارغ')
    const file = path.join(DATA, 'editions', 'qasim', 'edition.json')
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (kind === 'heading') {
      const s = doc.sections.find((s: { id: number }) => s.id === section)
      if (!s) throw new Error('bad section')
      s.title = t
    } else {
      const v = doc.verses.find((v: { n: number }) => v.n === n)
      if (!v || (half !== 'a' && half !== 'b')) throw new Error('bad verse')
      v[half] = t
    }
    fs.writeFileSync(file + '.tmp', JSON.stringify(doc, null, 2))
    fs.renameSync(file + '.tmp', file)
    entry.text = t
  }
  const log = readReview()
  log[id] = entry
  fs.writeFileSync(REVIEW, JSON.stringify(log, null, 2) + '\n')
  return entry
}

const JOINS = path.resolve('tools/colors/joins.json')

/**
 * The owner's decision on a doubtful join (the الألوان tab of tools/cut-editor.html): one Quran phrase
 * («approved») or two separate words («rejected»). Rebuilds colors.json with tools/colors/annotate.py.
 */
function decideJoin(body: string) {
  const { id, status } = JSON.parse(body)
  if (status !== 'approved' && status !== 'rejected') throw new Error('bad status')
  const joins = JSON.parse(fs.readFileSync(JOINS, 'utf8'))
  if (!joins[id]) throw new Error('bad id')
  joins[id].status = status
  fs.writeFileSync(JOINS, JSON.stringify(joins, null, 1) + '\n')
  execFileSync('python3', ['tools/colors/annotate.py'])
  return joins[id]
}

export default function dataPlugin(): Plugin {
  return {
    name: 'shatibiyyah-data',
    configureServer(server) {
      server.middlewares.use('/api/approve-cut', (req, res) => {
        if (req.method !== 'POST') return void (res.statusCode = 405, res.end())
        let body = ''
        req.on('data', (d) => (body += d))
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            res.end(JSON.stringify(approveCut(body)))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: (err as Error).message }))
          }
        })
      })
      server.middlewares.use('/api/approve-text', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method === 'GET') return res.end(JSON.stringify(readReview()))
        if (req.method !== 'POST') return void (res.statusCode = 405, res.end())
        let body = ''
        req.on('data', (d) => (body += d))
        req.on('end', () => {
          try {
            res.end(JSON.stringify(approveText(body)))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: (err as Error).message }))
          }
        })
      })
      server.middlewares.use('/api/join', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method === 'GET') return res.end(fs.readFileSync(JOINS))
        if (req.method !== 'POST') return void (res.statusCode = 405, res.end())
        let body = ''
        req.on('data', (d) => (body += d))
        req.on('end', () => {
          try {
            res.end(JSON.stringify(decideJoin(body)))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: (err as Error).message }))
          }
        })
      })
      server.middlewares.use('/data', (req, res, next) => {
        const rel = decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, '')
        if (rel === 'manifest.json') {
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify(manifest()))
        }
        const file = path.join(DATA, rel)
        if (skip(rel) || !file.startsWith(DATA) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next()
        const size = fs.statSync(file).size
        res.setHeader('Content-Type', MIME[path.extname(file)] ?? 'application/octet-stream')
        res.setHeader('Accept-Ranges', 'bytes')
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '')
        if (m && (m[1] || m[2])) {
          // "a-b", "a-" (to the end) or "-n" (the last n bytes)
          const start = m[1] ? +m[1] : Math.max(0, size - +m[2])
          const end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1
          if (start >= size || start > end || (!m[1] && +m[2] === 0)) {
            res.statusCode = 416
            res.setHeader('Content-Range', `bytes */${size}`)
            return res.end()
          }
          res.statusCode = 206
          res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
          res.setHeader('Content-Length', end - start + 1)
          return fs.createReadStream(file, { start, end }).pipe(res)
        }
        res.setHeader('Content-Length', size)
        fs.createReadStream(file).pipe(res)
      })
    },
    generateBundle() {
      for (const rel of walk(DATA)) {
        this.emitFile({ type: 'asset', fileName: `data/${rel}`, source: fs.readFileSync(path.join(DATA, rel)) })
      }
      this.emitFile({ type: 'asset', fileName: 'data/manifest.json', source: JSON.stringify(manifest()) })
    },
  }
}
