// Audio for offline use lives in the "audio" Cache Storage bucket. The service worker
// (vite.config.ts, runtimeCaching) answers playback from it, including Range requests.
const CACHE = 'audio'

export const offlineSupported = () => typeof caches !== 'undefined'

export async function isDownloaded(url: string) {
  if (!offlineSupported()) return false
  const cache = await caches.open(CACHE)
  return !!(await cache.match(url))
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
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* best effort */
  }
}

export async function remove(url: string) {
  if (!offlineSupported()) return
  const cache = await caches.open(CACHE)
  await cache.delete(url)
}

export const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} م.ب`
