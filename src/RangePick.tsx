// Choosing a range to repeat by tapping verses in the text (UX-PLAN 3.2).
import { Pencil, Play, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { plural, VERSES } from './sheets'

/** `anchor` is the first verse tapped; `end` the second (either may come first in the poem). */
export interface PickState {
  anchor: number | null
  end: number | null
}

/** The chosen range in reading order, or just the anchor while the end is still open. */
export function pickSpan(pick: PickState | null): { from: number; to: number } | null {
  if (pick?.anchor == null) return null
  const end = pick.end ?? pick.anchor
  return { from: Math.min(pick.anchor, end), to: Math.max(pick.anchor, end) }
}

/** The next state after tapping verse n. Once both ends are set, a tap moves the end. */
export const pickTap = (pick: PickState, n: number): PickState => (pick.anchor == null ? { anchor: n, end: null } : { ...pick, end: n })

/** «اختر بيت البداية / النهاية», at the top while an end is still open. */
export function PickBanner({ pick, onCancel }: { pick: PickState; onCancel: () => void }) {
  return (
    <div className="pick-banner" role="status">
      <span>
        {pick.anchor == null ? 'اختر بيت البداية' : `من البيت ${toArabicDigits(pick.anchor)} · اختر بيت النهاية`}
      </span>
      <button className="x" onClick={onCancel}>
        <X size={15} /> إلغاء
      </button>
    </div>
  )
}

/** «الأبيات ٢–٦ · ٥ أبيات» with ابدأ and تعديل, once both ends are chosen. */
export function PickBar(p: { from: number; to: number; canPlay: boolean; onStart: () => void; onEdit: () => void; onCancel: () => void }) {
  const count = p.to - p.from + 1
  return (
    <div className="pick-bar" role="status">
      <span className="pick-what">
        <span>{count === 1 ? `البيت ${toArabicDigits(p.from)}` : `الأبيات ${toArabicDigits(p.from)}–${toArabicDigits(p.to)}`}</span>
        <small>{plural(count, VERSES)}</small>
      </span>
      {p.canPlay && (
        <button className="go" onClick={p.onStart}>
          <Play size={16} /> ابدأ
        </button>
      )}
      <button onClick={p.onEdit}>
        <Pencil size={15} /> تعديل
      </button>
      <button className="x" onClick={p.onCancel} aria-label="إلغاء">
        <X size={17} />
      </button>
    </div>
  )
}
