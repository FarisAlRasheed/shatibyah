// Verse marks in five colours (IMPROVEMENTS-PLAN 4). A mark is a bookmark with a colour slot 0–4;
// the user names each slot. Bookmarks saved before this have no slot and count as slot 0.

export const MARK_COLORS = ['#d9534f', '#e09b2d', '#3f9d6b', '#3b82c4', '#8e5bc0'] as const
export const DEFAULT_MARK_NAMES = ['مراجعة', 'مهم', 'سؤال', 'متشابه', 'علامة']

export interface MarkNames {
  list: string[]
}

export const markSlot = (color: number | undefined) => (color != null && color >= 0 && color < MARK_COLORS.length ? color : 0)
export const markName = (names: string[], slot: number) => names[slot]?.trim() || DEFAULT_MARK_NAMES[slot]
