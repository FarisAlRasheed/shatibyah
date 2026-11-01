import { useCallback, useState } from 'react'

// Device-only storage. Every access is guarded: private mode or blocked storage must not break the app.
export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`shatibiyyah:${key}`)
    return raw == null ? fallback : { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(`shatibiyyah:${key}`, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export function useStored<T extends object>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStored(key, fallback))
  const update = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        writeStored(key, v)
        return v
      }),
    [key],
  )
  return [value, update] as const
}

export interface Bookmark {
  label: string
  at: number
}

export type Notes = Record<number, string>
export type Bookmarks = Record<number, Bookmark>
/** Verses the user marked as mastered in test-yourself mode (verse → time marked). */
export type Mastered = Record<number, number>

export type Theme = 'auto' | 'light' | 'sepia' | 'dark'
export type VerseFont = 'amiri' | 'scheherazade' | 'naskh'
export type HideMode = 'none' | 'b' | 'all'

export interface Settings {
  editionId: string
  reciterId: string
  fontSize: number
  autoScroll: boolean
  lastVerse: number
  theme: Theme
  font: VerseFont
  hide: HideMode
  colors: boolean // show the printed colours (red codes, green Quranic words) in the reader
  memorizeColors: boolean // …and in memorization mode
}

export interface RepeatSettings {
  scope: 'verse' | 'range' | 'section' | 'all'
  from: number
  to: number
  sectionId: number
  verseTimes: number // 0 = endless
  rangeTimes: number // 0 = endless
  pause: number // seconds
  speed: number
}
