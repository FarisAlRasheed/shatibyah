// Listener mode (التسميع على مستمع): slip types, sessions, and the marks they leave on the text.
// A slip points at one word: verse, half-line, and the word's index among the half's words (split on spaces).

export interface SlipType {
  id: string
  name: string
  /** Any CSS colour; the editor stores #rrggbb. */
  color: string
}

export interface Slip {
  n: number
  h: 'a' | 'b'
  /** Word index inside the half-line. */
  w: number
  /** SlipType id. */
  t: string
}

export interface SlipSession {
  /** When the session started (ms since epoch); also its id. */
  id: number
  editionId: string
  from: number
  to: number
  slips: Slip[]
  /** Its marks are drawn in the reader («مسح العلامات» turns this off, the session stays in the history). */
  shown: boolean
}

export interface SlipTypesStore {
  list: SlipType[]
}
export interface SlipLog {
  sessions: SlipSession[]
}

export const DEFAULT_SLIP_TYPES: SlipType[] = [
  { id: 'letter', name: 'خطأ حرفي', color: '#d64545' },
  { id: 'vowel', name: 'خطأ تشكيل', color: '#e0a800' },
  { id: 'stop', name: 'توقّف', color: '#3b82c4' },
]
/** Colours offered in turn when the user adds a type. */
export const SLIP_PALETTE = ['#d64545', '#e0a800', '#3b82c4', '#3f9d6b', '#8e5bc0', '#e07b39', '#d1509b', '#5f6b7a']
/** Drawn for a slip whose type the user deleted since. */
export const GONE_TYPE: SlipType = { id: '', name: 'نوع محذوف', color: '#8a8780' }

export const slipKey = (s: Pick<Slip, 'n' | 'h' | 'w'>) => `${s.n}:${s.h}:${s.w}`
export const words = (text: string) => text.match(/\S+/g) ?? []

export const typeOf = (types: SlipType[], id: string) => types.find((t) => t.id === id) ?? GONE_TYPE

/** Tap on a word: mark it with the active type, change its type, or (same type again) clear it. */
export function toggleSlip(slips: Slip[], at: Pick<Slip, 'n' | 'h' | 'w'>, type: string): Slip[] {
  const key = slipKey(at)
  const cur = slips.find((s) => slipKey(s) === key)
  const rest = slips.filter((s) => slipKey(s) !== key)
  return cur?.t === type ? rest : [...rest, { ...at, t: type }]
}

/** Verses of a session that have a slip, in order. */
export const slipVerses = (s: SlipSession) => [...new Set(s.slips.map((x) => x.n))].sort((a, b) => a - b)

/** Slips per type id. */
export function countByType(slips: Slip[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const s of slips) out.set(s.t, (out.get(s.t) ?? 0) + 1)
  return out
}

/** Word index → slip type, for each half of a verse. */
export interface VerseSlips {
  a?: Map<number, SlipType>
  b?: Map<number, SlipType>
}

/**
 * The marks the reader draws. Sessions are applied oldest first, and a session wipes the earlier marks
 * of every verse it covers: reciting a verse again replaces what was marked on it before.
 */
export function readerMarks(log: SlipSession[], types: SlipType[], editionId: string): Map<number, VerseSlips> {
  const out = new Map<number, VerseSlips>()
  const sessions = log.filter((s) => s.shown && s.editionId === editionId).sort((x, y) => x.id - y.id)
  for (const s of sessions) {
    for (const n of out.keys()) if (n >= s.from && n <= s.to) out.delete(n)
    for (const slip of s.slips) {
      const v = out.get(slip.n) ?? {}
      ;(v[slip.h] ??= new Map()).set(slip.w, typeOf(types, slip.t))
      out.set(slip.n, v)
    }
  }
  return out
}

export function newTypeId(types: SlipType[]) {
  let i = types.length + 1
  while (types.some((t) => t.id === `t${i}`)) i++
  return `t${i}`
}
