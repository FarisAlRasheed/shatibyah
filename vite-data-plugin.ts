// Serves the agents' `data/` folder at /data in dev and copies it into dist on build.
// Skips working files (_source, _progress.json, reports) and writes data/manifest.json.
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

export default function dataPlugin(): Plugin {
  return {
    name: 'shatibiyyah-data',
    configureServer(server) {
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
        const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '')
        if (m) {
          const start = m[1] ? +m[1] : 0
          const end = m[2] ? +m[2] : size - 1
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
