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
/** Half-lines side by side, stacked, or whichever fits the screen. */
export type VerseLayout = 'auto' | 'side' | 'stack'

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
  lineHeight: number // line height of the verse text
  layout: VerseLayout
  kashida: boolean // equal half-line widths, short ones stretched with tatweel (display only)
  numberStyle: 'circle' | 'plain'
  // Optional extras (الإعدادات ← مزايا إضافية)
  immersive: boolean // hide the bars while reading
  rail: boolean // fast-scroll rail
  backPill: boolean // «رجوع» after a jump
  curtain: boolean // show the recitation-curtain button
  twins: boolean // same-ending verses
  wirdStrip: boolean // today's wird at the top of the reader
  pageMarks: boolean // printed page markers
  sidePanel: boolean // verse details beside the text on wide screens
  commentary: string // last commentary book chosen in the explanation panel
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
  cumulative: boolean // 1, 2, 1–2, 3, 1–3 … over a range
  echo: boolean // pause as long as the verse just played, instead of `pause` seconds
  fade: boolean // hide more of the verse with each repetition
  recent: [number, number][] // last ranges repeated, newest first
}

/** Verses the user marked «لم أتقنه»: how many times, and when last (ms since epoch). */
export type Weak = Record<number, { count: number; at: number }>
