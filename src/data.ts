import type { AudioFile, Edition, Manifest, Reciter, Section } from './types'

const BASE = import.meta.env.BASE_URL

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}data/${path}`)
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return res.json()
}

export const loadManifest = () => getJson<Manifest>('manifest.json')
export const loadEdition = (id: string) => getJson<Edition>(`editions/${id}/edition.json`)
export const loadReciter = (id: string) => getJson<Reciter>(`reciters/${id}/reciter.json`)

// `?v=` changes whenever a file is re-cut, so an offline copy of an older cut is never
// served with the new timings (the service worker and offline.ts key on the full URL).
export const audioUrl = (reciter: Reciter, file: AudioFile) =>
  new URL(`${BASE}data/reciters/${reciter.id}/${file.path}?v=${file.bytes}`, location.href).href

/** Innermost section containing verse n. */
export function sectionOf(edition: Edition, n: number): Section | undefined {
  return edition.sections
    .filter((s) => s.start <= n && n <= s.end)
    .sort((a, b) => a.end - a.start - (b.end - b.start))[0]
}

export function verseRange(edition: Edition) {
  return { from: edition.verses[0]?.n ?? 1, to: edition.verses[edition.verses.length - 1]?.n ?? 1 }
}
