// Today's wird at the top of the reader (UX-PLAN 5.4).
import { Play, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import type { Range } from './types'

export default function WirdStrip({ wird, onStart, onHide }: { wird: Range; onStart: () => void; onHide: () => void }) {
  const what = wird.from === wird.to ? `البيت ${toArabicDigits(wird.from)}` : `الأبيات ${toArabicDigits(wird.from)}–${toArabicDigits(wird.to)}`
  return (
    <div className="wird-strip">
      <span>ورد اليوم: {what}</span>
      <button className="go" onClick={onStart}>
        <Play size={14} /> ابدأ
      </button>
      <button className="x" onClick={onHide} aria-label="إخفاء اليوم">
        <X size={16} />
      </button>
    </div>
  )
}
