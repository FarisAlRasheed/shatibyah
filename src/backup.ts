// Backup and restore of everything the user creates on this device (الإعدادات ← النسخ الاحتياطي).
// The file is plain JSON: { app, format, version, at, data: { <storage key>: <stored value> } }.
import { APP_VERSION } from './config'
import type { Bookmarks, Mastered, Notes, Weak } from './store'
import type { SlipLog, SlipTypesStore } from './slips'

const PREFIX = 'shatibiyyah:'
/** Stored keys that go into a backup. Caches and per-day UI state are left out. */
export const BACKUP_KEYS = ['settings', 'repeat', 'notes', 'bookmarks', 'mastered', 'weak', 'plan', 'slipTypes', 'slipLog', 'markNames', 'sketches', 'highlights'] as const
type Key = (typeof BACKUP_KEYS)[number]

export interface Backup {
  app: 'shatibiyyah'
  format: 1
  version: string
  /** When the backup was made (ms since epoch). */
  at: number
  data: Partial<Record<Key, unknown>>
}

export interface BackupSummary {
  at: number
  notes: number
  bookmarks: number
  mastered: number
  weak: number
  sessions: number
  sketches: number
  highlights: number
  plan: boolean
  settings: boolean
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

export function makeBackup(now = Date.now()): Backup {
  const data: Backup['data'] = {}
  for (const k of BACKUP_KEYS) {
    const v = read(k)
    if (isObject(v)) data[k] = v
  }
  return { app: 'shatibiyyah', format: 1, version: APP_VERSION, at: now, data }
}

/** Reads a backup file's text. Throws an Arabic message the screen can show as it is. */
export function parseBackup(text: string): Backup {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('الملف ليس نسخة احتياطية صالحة.')
  }
  if (!isObject(raw) || raw.app !== 'shatibiyyah' || !isObject(raw.data)) throw new Error('الملف ليس نسخة احتياطية من هذا التطبيق.')
  if (raw.format !== 1) throw new Error('هذه النسخة من إصدار أحدث من التطبيق. حدّث التطبيق ثم أعد المحاولة.')
  const data: Backup['data'] = {}
  for (const k of BACKUP_KEYS) if (isObject(raw.data[k])) data[k] = raw.data[k]
  return { app: 'shatibiyyah', format: 1, version: String(raw.version ?? ''), at: Number(raw.at) || 0, data }
}

const count = (v: unknown) => (isObject(v) ? Object.keys(v).length : 0)

export function summarize(b: Backup): BackupSummary {
  const plan = b.data.plan
  return {
    at: b.at,
    notes: count(b.data.notes),
    bookmarks: count(b.data.bookmarks),
    mastered: count(b.data.mastered),
    weak: count(b.data.weak),
    sketches: count(b.data.sketches),
    highlights: isObject(b.data.highlights) && Array.isArray(b.data.highlights.list) ? b.data.highlights.list.length : 0,
    sessions: isObject(b.data.slipLog) && Array.isArray(b.data.slipLog.sessions) ? b.data.slipLog.sessions.length : 0,
    plan: isObject(plan) && isObject(plan.plan),
    settings: isObject(b.data.settings),
  }
}

/** True when this device holds something a backup would protect. */
export function hasUserData(): boolean {
  const s = summarize(makeBackup())
  return s.notes + s.bookmarks + s.mastered + s.weak + s.sessions + s.sketches + s.highlights > 0 || s.plan
}

// ---- Merge rules: nothing on the device is lost ----

/** Notes of both; where a verse has two different notes, the file's is added under the device's. */
export function mergeNotes(mine: Notes, theirs: Notes): Notes {
  const out: Notes = { ...mine }
  for (const [n, text] of Object.entries(theirs)) {
    const cur = out[+n]
    if (typeof text !== 'string' || !text.trim()) continue
    if (!cur?.trim()) out[+n] = text
    else if (cur.trim() !== text.trim() && !cur.includes(text.trim())) out[+n] = `${cur}\n${text}`
  }
  return out
}

/** Entries of both; for the same verse the one with the later time wins. */
function mergeByTime<T>(mine: Record<number, T>, theirs: Record<number, T>, time: (v: T) => number): Record<number, T> {
  const out = { ...mine }
  for (const [n, v] of Object.entries(theirs)) {
    const cur = out[+n]
    if (cur === undefined || time(v) > time(cur)) out[+n] = v
  }
  return out
}

export function mergeWeak(mine: Weak, theirs: Weak): Weak {
  const out: Weak = { ...mine }
  for (const [n, v] of Object.entries(theirs)) {
    const cur = out[+n]
    out[+n] = cur ? { count: Math.max(cur.count, v.count), at: Math.max(cur.at, v.at) } : v
  }
  return out
}

/** The merged value for each key (a pure function, so it can be checked without storage). */
export function mergeData(mine: Backup['data'], theirs: Backup['data']): Backup['data'] {
  const obj = <T,>(v: unknown) => (isObject(v) ? (v as T) : ({} as T))
  const out: Backup['data'] = { ...mine }
  if (theirs.notes) out.notes = mergeNotes(obj<Notes>(mine.notes), obj<Notes>(theirs.notes))
  if (theirs.bookmarks) out.bookmarks = mergeByTime(obj<Bookmarks>(mine.bookmarks), obj<Bookmarks>(theirs.bookmarks), (b) => b?.at ?? 0)
  if (theirs.mastered) out.mastered = mergeByTime(obj<Mastered>(mine.mastered), obj<Mastered>(theirs.mastered), (t) => Number(t) || 0)
  if (theirs.weak) out.weak = mergeWeak(obj<Weak>(mine.weak), obj<Weak>(theirs.weak))
  if (theirs.slipLog) {
    const a = obj<SlipLog>(mine.slipLog).sessions ?? []
    const b = obj<SlipLog>(theirs.slipLog).sessions ?? []
    out.slipLog = { sessions: [...a, ...b.filter((s) => !a.some((x) => x.id === s.id))].sort((x, y) => x.id - y.id) }
  }
  if (theirs.slipTypes) {
    // The device's slip types stay as they are; types only the file has are added.
    const a = obj<SlipTypesStore>(mine.slipTypes).list
    const b = obj<SlipTypesStore>(theirs.slipTypes).list ?? []
    out.slipTypes = { list: a ? [...a, ...b.filter((t) => !a.some((x) => x.id === t.id))] : b }
  }
  if (theirs.highlights) {
    const a = obj<{ list?: { id: number }[] }>(mine.highlights).list ?? []
    const b = obj<{ list?: { id: number }[] }>(theirs.highlights).list ?? []
    out.highlights = { list: [...a, ...b.filter((h) => !a.some((x) => x.id === h.id))] }
  }
  // A verse sketched on both keeps this device's sketch; mark names of this device stay.
  if (theirs.sketches) out.sketches = { ...obj<Record<number, unknown>>(theirs.sketches), ...obj<Record<number, unknown>>(mine.sketches) }
  if (!mine.markNames && theirs.markNames) out.markNames = theirs.markNames
  // The plan, settings and repeat settings of this device stay; the file's are used only where the device has none.
  const minePlan = mine.plan
  if (!(isObject(minePlan) && isObject(minePlan.plan)) && theirs.plan) out.plan = theirs.plan
  if (!mine.settings && theirs.settings) out.settings = theirs.settings
  if (!mine.repeat && theirs.repeat) out.repeat = theirs.repeat
  return out
}

/**
 * Writes a backup to the device. 'replace' makes the device equal to the file; 'merge' adds the file to
 * what is here. The app must be reloaded afterwards, because the screens hold their own copies in memory.
 */
export function restoreBackup(b: Backup, mode: 'replace' | 'merge') {
  const data = mode === 'replace' ? b.data : mergeData(makeBackup().data, b.data)
  for (const k of BACKUP_KEYS) {
    const v = data[k]
    if (v === undefined) localStorage.removeItem(PREFIX + k)
    else localStorage.setItem(PREFIX + k, JSON.stringify(v))
  }
}

// ---- Saving the file ----

export function backupFileName(at: number) {
  const d = new Date(at)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `shatibiyyah-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`
}

/**
 * Hands the backup file to the user: the share sheet where it takes files (the installed app on iPhone has
 * no downloads), a normal download elsewhere. Returns false when the user closed the share sheet.
 */
export async function saveBackupFile(b: Backup): Promise<boolean> {
  const text = JSON.stringify(b, null, 1)
  const name = backupFileName(b.at)
  const file = new File([text], name, { type: 'application/json' })
  const touch = navigator.maxTouchPoints > 0
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false
      // Any other failure falls through to a download.
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}
