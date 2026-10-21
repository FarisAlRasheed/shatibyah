// Audio for offline use lives in the "audio" Cache Storage bucket. The service worker
// (vite.config.ts, runtimeCaching) answers playback from it, including Range requests.
// URLs carry a version (`?v=`, see audioUrl), and only one version per file is kept.
const CACHE = 'audio'

export const offlineSupported = () => typeof caches !== 'undefined'

export type OfflineStatus = 'downloaded' | 'stale' | 'missing'

const samePath = (a: string, b: string) => new URL(a).pathname === new URL(b).pathname

/** Cached copies of the same file under another version (or no version at all). */
async function otherVersions(cache: Cache, url: string) {
  return (await cache.keys()).filter((req) => req.url !== url && samePath(req.url, url))
}

/** 'stale' = an older cut of this file is cached; it is not used for playback and should be re-downloaded. */
export async function offlineStatus(url: string): Promise<OfflineStatus> {
  if (!offlineSupported()) return 'missing'
  const cache = await caches.open(CACHE)
  if (await cache.match(url)) return 'downloaded'
  return (await otherVersions(cache, url)).length ? 'stale' : 'missing'
}

export async function isDownloaded(url: string) {
  return (await offlineStatus(url)) === 'downloaded'
}

export async function download(url: string, onProgress: (loaded: number, total: number) => void) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
  const total = Number(res.headers.get('content-length')) || 0
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress(loaded, total)
  }
  const type = res.headers.get('content-type') ?? 'audio/mpeg'
  const blob = new Blob(chunks as BlobPart[], { type })
  const cache = await caches.open(CACHE)
  await cache.put(url, new Response(blob, { headers: { 'Content-Type': type, 'Content-Length': String(blob.size) } }))
  await Promise.all((await otherVersions(cache, url)).map((req) => cache.delete(req)))
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* best effort */
  }
}

/** Removes this file from offline storage, every version of it. */
export async function remove(url: string) {
  if (!offlineSupported()) return
  const cache = await caches.open(CACHE)
  await cache.delete(url)
  await Promise.all((await otherVersions(cache, url)).map((req) => cache.delete(req)))
}

export const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} م.ب`
