// الحفظ tab: memorization plan builder and today's wird. Track D owns this file (see SWEEP-PLAN.md).
import { GraduationCap } from 'lucide-react'
import type { Mastered } from './store'
import type { Edition } from './types'

export interface PlanScreenProps {
  edition: Edition
  mastered: Mastered
  /** Open memorization mode on verses from..to (repeat set to that range). */
  onStartSession: (from: number, to: number) => void
  /** Open memorization mode on the current verse, without a plan. */
  onFreeSession: () => void
  onJump: (n: number) => void
}

export default function PlanScreen(p: PlanScreenProps) {
  return (
    <section className="screen">
      <h1 className="large-title">الحفظ</h1>
      <button className="btn wide" onClick={p.onFreeSession}>
        <GraduationCap size={20} /> ابدأ جلسة حفظ
      </button>
      <p className="muted center">خطة الحفظ قيد البناء.</p>
    </section>
  )
}
