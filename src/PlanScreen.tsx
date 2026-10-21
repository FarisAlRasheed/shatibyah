// الحفظ tab: memorization plan builder, today's wird and progress. Track D owns this file (see SWEEP-PLAN.md).
// Schedule logic lives in plan.ts; this file is the UI only.
import { useEffect, useMemo, useState } from 'react'
import {
  AlarmClock,
  CalendarCheck,
  Check,
  ChevronLeft,
  Coffee,
  Flame,
  GraduationCap,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react'
import { toArabicDigits, toLatinDigits } from './arabic'
import { verseRange } from './data'
import * as P from './plan'
import { useStored, type Mastered } from './store'
import type { Edition, Range } from './types'
import './plan.css'

export interface PlanScreenProps {
  edition: Edition
  mastered: Mastered
  /** Open memorization mode on verses from..to (repeat set to that range). */
  onStartSession: (from: number, to: number) => void
  /** Open memorization mode on the current verse, without a plan. */
  onFreeSession: () => void
  onJump: (n: number) => void
}

// ---- Arabic wording ----

const ar = toArabicDigits
const fmt = (opts: Intl.DateTimeFormatOptions, cal = 'gregory') => new Intl.DateTimeFormat(`ar-SA-u-ca-${cal}-nu-arab`, opts)
const fmtDay = fmt({ weekday: 'long', day: 'numeric', month: 'long' })
const fmtShort = fmt({ day: 'numeric', month: 'long' })
const fmtWeekday = fmt({ weekday: 'long' })
const fmtHijri = fmt({ day: 'numeric', month: 'long', year: 'numeric' }, 'islamic-umalqura')
const dayLong = (s: string) => fmtDay.format(P.fromISO(s))
const dayShort = (s: string) => fmtShort.format(P.fromISO(s))
const hijri = (s: string) => fmtHijri.format(P.fromISO(s))
// 2026-10-18 is a Sunday, so day i of that week is weekday i.
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => fmtWeekday.format(P.fromISO(P.addDays('2026-10-18', i))))
const WEEKDAY_SHORT = WEEKDAYS.map((w) => w.replace(/^ال/, ''))

/** Arabic counted noun: 1 → singular, 2 → dual, 3–10 → plural, 11+ → accusative singular. */
function counted(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one
  if (n === 2) return two
  return `${ar(n)} ${n % 100 >= 3 && n % 100 <= 10 ? few : many}`
}
const daysWord = (n: number) => counted(n, 'يوم واحد', 'يومان', 'أيام', 'يومًا')
const versesWord = (n: number) => counted(n, 'بيت واحد', 'بيتان', 'أبيات', 'بيتًا')
const lateWord = (n: number) => (n === 1 ? 'متأخر بيوم' : n === 2 ? 'متأخر بيومين' : `متأخر ${daysWord(n)}`)

const rangeLabel = (r: Range) => (r.from === r.to ? `البيت ${ar(r.from)}` : `الأبيات ${ar(r.from)}–${ar(r.to)}`)
const verseCount = (r: Range) => r.to - r.from + 1

/** Chapter name(s) a range falls in (the deepest section containing each end). */
function chapterOf(edition: Edition, r: Range) {
  const at = (n: number) =>
    edition.sections.filter((s) => s.start <= n && n <= s.end).sort((a, b) => b.start - a.start)[0]?.title ?? ''
  const a = at(r.from)
  const b = at(r.to)
  return a === b ? a : `${a} ← ${b}`
}

// ---- Screen ----

function useToday() {
  const [today, setToday] = useState(() => P.todayISO())
  useEffect(() => {
    const tick = () => setToday(P.todayISO())
    const id = setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])
  return today
}

export default function PlanScreen(p: PlanScreenProps) {
  const [stored, setStored] = useStored<{ plan: P.Plan | null }>('plan', { plan: null })
  const [editing, setEditing] = useState(false)
  const today = useToday()
  const plan = stored.plan?.version === 1 ? stored.plan : null
  const setPlan = (next: P.Plan | null) => setStored({ plan: next })

  return (
    <section className="screen plan-screen">
      <header className="plan-head">
        <h1 className="large-title">الحفظ</h1>
        <small>
          {dayLong(today)} · {hijri(today)}
        </small>
      </header>

      {!plan || editing ? (
        <Builder
          edition={p.edition}
          today={today}
          plan={plan}
          onSave={(next) => {
            setPlan(next)
            setEditing(false)
          }}
          onCancel={plan ? () => setEditing(false) : undefined}
        />
      ) : (
        <PlanView
          {...p}
          plan={plan}
          today={today}
          setPlan={setPlan}
          onEdit={() => setEditing(true)}
        />
      )}

      <button className="btn secondary wide" onClick={p.onFreeSession}>
        <GraduationCap size={20} /> جلسة حفظ حرة
      </button>
    </section>
  )
}

// ---- Plan overview ----

function PlanView(
  p: PlanScreenProps & { plan: P.Plan; today: string; setPlan: (plan: P.Plan | null) => void; onEdit: () => void },
) {
  const { plan, today, edition } = p
  const [confirmDelete, setConfirmDelete] = useState(false)
  const state = P.todayState(plan, today)
  const behind = P.behindBy(plan, today)
  const done = P.versesDone(plan)
  const total = P.totalVerses(plan.segments)
  const streak = P.streak(plan, today)
  const finish = P.finishDate(plan)
  const next = P.upcoming(plan, today, 7)
  const start = (r: Range) => p.onStartSession(r.from, r.to)

  return (
    <>
      <TodayCard edition={edition} state={state} plan={plan} today={today} start={start} setPlan={p.setPlan} />

      {behind > 0 && (
        <div className="plan-behind">
          <AlarmClock size={20} />
          <span>
            <strong>{lateWord(behind)}</strong>
            <small>عن الجدول الأصلي</small>
          </span>
          <button className="btn secondary" onClick={() => p.setPlan(P.reschedule(plan, today))}>
            <RotateCcw size={16} /> إعادة الجدولة
          </button>
        </div>
      )}

      <h2 className="group-title">التقدّم</h2>
      <div className="progress-card">
        <strong>
          {ar(done)} <small>من {versesWord(total)}</small>
        </strong>
        <div className="bar">
          <div style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
        <div className="plan-stats">
          <div>
            <Flame size={18} />
            <strong>{ar(streak)}</strong>
            <small>{streak === 1 ? 'يوم متتالٍ' : 'أيام متتالية'}</small>
          </div>
          <div>
            <CalendarCheck size={18} />
            <strong>{dayShort(finish)}</strong>
            <small>{P.isFinished(plan) ? 'تاريخ الختم' : 'الختم المتوقع'}</small>
          </div>
          <div>
            <GraduationCap size={18} />
            <strong>{ar(plan.perDay)}</strong>
            <small>{plan.perDay === 1 ? 'بيت في اليوم' : 'أبيات في اليوم'}</small>
          </div>
        </div>
      </div>

      <Heatmap plan={plan} today={today} />

      {next.length > 0 && (
        <>
          <h2 className="group-title">الأوراد القادمة</h2>
          <ul className="group list">
            {next.map(({ wird, date, late }) => (
              <li key={wird.from}>
                <button onClick={() => p.onJump(wird.from)}>
                  <span className="plan-up">
                    <span>{rangeLabel(wird)}</span>
                    <small>{chapterOf(edition, wird)}</small>
                  </span>
                  <small className={late ? 'err' : ''}>{late ? 'متأخر' : date === today ? 'اليوم' : date === P.addDays(today, 1) ? 'غدًا' : dayShort(date)}</small>
                  <ChevronLeft size={18} className="chev" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="group-title">الخطة</h2>
      <div className="group">
        <div className="field-row">
          <span>النطاق</span>
          <small className="muted">{scopeLabel(edition, plan)}</small>
        </div>
        <div className="field-row">
          <span>أيام الراحة</span>
          <small className="muted">{plan.daysOff.length ? plan.daysOff.map((d) => WEEKDAYS[d]).join('، ') : 'لا يوجد'}</small>
        </div>
        <div className="field-row">
          <span>المراجعة</span>
          <small className="muted">{plan.review ? `آخر ${daysWord(plan.review)}` : 'بلا مراجعة'}</small>
        </div>
        <button className="field-row plan-action" onClick={p.onEdit}>
          <span>
            <Pencil size={18} /> تعديل الخطة
          </span>
          <ChevronLeft size={18} className="chev" />
        </button>
        {confirmDelete ? (
          <div className="field-row plan-confirm">
            <span>حذف الخطة وسجلّها؟</span>
            <span className="row">
              <button className="btn secondary" onClick={() => setConfirmDelete(false)}>
                إلغاء
              </button>
              <button className="btn danger" onClick={() => p.setPlan(null)}>
                احذف
              </button>
            </span>
          </div>
        ) : (
          <button className="field-row plan-action danger" onClick={() => setConfirmDelete(true)}>
            <span>
              <Trash2 size={18} /> حذف الخطة
            </span>
          </button>
        )}
      </div>
    </>
  )
}

function scopeLabel(edition: Edition, plan: P.Plan) {
  const s = plan.scope
  if (s.kind === 'all') return edition.partial ? 'كل المتاح' : 'المتن كاملًا'
  if (s.kind === 'range') return `${ar(s.from)}–${ar(s.to)}`
  const titles = edition.sections.filter((x) => s.ids.includes(x.id)).map((x) => x.title)
  return titles.length > 2 ? `${ar(titles.length)} أبواب` : titles.join('، ')
}

function TodayCard(p: {
  edition: Edition
  state: P.TodayState
  plan: P.Plan
  today: string
  start: (r: Range) => void
  setPlan: (plan: P.Plan) => void
}) {
  const { state, plan, today } = p
  if (state.kind === 'finished') {
    return (
      <div className="today-card done">
        <Check size={28} />
        <strong>ختمت الخطة، بارك الله فيك</strong>
        <span className="muted">أنهيت {versesWord(P.totalVerses(plan.segments))}. عدّل الخطة لتضيف أبياتًا جديدة.</span>
      </div>
    )
  }

  if (state.kind === 'doneToday') {
    return (
      <div className="today-card done">
        <span className="today-kicker">
          <Check size={16} /> أنهيت ورد اليوم
        </span>
        <strong className="today-range">{rangeLabel(state.wird)}</strong>
        <span className="muted">{chapterOf(p.edition, state.wird)}</span>
        <div className="today-actions">
          {state.review && (
            <button className="btn secondary" onClick={() => p.start(state.review!)}>
              <RotateCcw size={16} /> مراجعة {ar(state.review.from)}–{ar(state.review.to)}
            </button>
          )}
          {state.next && (
            <button className="btn secondary" onClick={() => p.start(state.next!)}>
              <Play size={16} /> الورد التالي
            </button>
          )}
        </div>
        {state.next && (
          <button className="link-btn" onClick={() => p.setPlan(P.markDone(plan, today))}>
            أنهيت الورد التالي أيضًا ({rangeLabel(state.next)})
          </button>
        )}
        <button className="link-btn muted" onClick={() => p.setPlan(P.undoLast(plan))}>
          <Undo2 size={14} /> تراجع
        </button>
      </div>
    )
  }

  const { wird, review, offDay, notStarted } = state
  return (
    <div className={`today-card${offDay || notStarted ? ' rest' : ''}`}>
      {notStarted ? (
        <span className="today-kicker">
          <CalendarCheck size={16} /> تبدأ الخطة {dayLong(plan.start)}
        </span>
      ) : offDay ? (
        <span className="today-kicker">
          <Coffee size={16} /> اليوم يوم راحة، والورد التالي ينتظرك
        </span>
      ) : (
        <span className="today-kicker">ورد اليوم</span>
      )}
      <strong className="today-range">{rangeLabel(wird)}</strong>
      <span className="muted">
        {chapterOf(p.edition, wird)} · {versesWord(verseCount(wird))}
      </span>
      {review && (
        <span className="today-review">
          <RotateCcw size={14} /> المراجعة: {rangeLabel(review)}
        </span>
      )}
      <div className="today-actions">
        <button className={`btn${offDay || notStarted ? ' secondary' : ''}`} onClick={() => p.start(wird)}>
          <Play size={18} /> {offDay || notStarted ? 'احفظه الآن' : 'ابدأ ورد اليوم'}
        </button>
        {review && (
          <button className="btn secondary" onClick={() => p.start(review)}>
            <RotateCcw size={16} /> مراجعة
          </button>
        )}
      </div>
      <button className="btn wide today-done" onClick={() => p.setPlan(P.markDone(plan, today))}>
        <Check size={20} /> {offDay || notStarted ? 'أنهيت هذا الورد' : 'أنهيت ورد اليوم'}
      </button>
    </div>
  )
}

const STATUS_LABEL: Record<P.DayStatus, string> = {
  done: 'أُنجز',
  missed: 'فات',
  off: 'راحة',
  today: 'اليوم',
  future: 'قادم',
  none: '',
}

function Heatmap({ plan, today }: { plan: P.Plan; today: string }) {
  // From the plan's first week (at most 4 weeks back) through next week, Sunday to Saturday.
  const sunday = (d: string) => P.addDays(d, -P.weekday(d))
  const earliest = P.addDays(sunday(today), -28)
  const startWeek = sunday(plan.log[0]?.date && plan.log[0].date < plan.start ? plan.log[0].date : plan.start)
  const first = startWeek < earliest ? earliest : startWeek > sunday(today) ? sunday(today) : startWeek
  const weeks = P.daysBetween(first, sunday(today)) / 7 + 2
  const days = Array.from({ length: weeks * 7 }, (_, i) => P.addDays(first, i))
  return (
    <>
      <h2 className="group-title">آخر الأسابيع</h2>
      <div className="group heatmap-card">
        <div className="heatmap">
          {WEEKDAY_SHORT.map((l, i) => (
            <span key={i} className="hm-head" title={WEEKDAYS[i]}>
              {l}
            </span>
          ))}
          {days.map((d) => {
            const s = P.dayStatus(plan, d, today)
            return (
              <span key={d} className={`hm-day ${s}${d === today ? ' is-today' : ''}`} title={`${dayLong(d)} ${STATUS_LABEL[s]}`}>
                {ar(P.fromISO(d).getDate())}
              </span>
            )
          })}
        </div>
        <div className="hm-legend">
          <span>
            <i className="hm-day done" /> أُنجز
          </span>
          <span>
            <i className="hm-day missed" /> فات
          </span>
          <span>
            <i className="hm-day off" /> راحة
          </span>
        </div>
      </div>
    </>
  )
}

// ---- Builder ----

type ScopeKind = P.PlanScope['kind']

function Builder(p: { edition: Edition; today: string; plan: P.Plan | null; onSave: (plan: P.Plan) => void; onCancel?: () => void }) {
  const { edition, today, plan } = p
  const avail = edition.partial ?? verseRange(edition)
  const [scope, setScope] = useState<ScopeKind>(plan?.scope.kind ?? 'all')
  const [ids, setIds] = useState<number[]>(plan?.scope.kind === 'sections' ? plan.scope.ids : [])
  const [from, setFrom] = useState(plan?.scope.kind === 'range' ? plan.scope.from : avail.from)
  const [to, setTo] = useState(plan?.scope.kind === 'range' ? plan.scope.to : avail.to)
  const [pace, setPace] = useState<P.PaceKind>(plan?.pace ?? 'perDay')
  const [perDay, setPerDay] = useState(plan?.perDay ?? 5)
  const [endDate, setEndDate] = useState(plan?.endDate ?? P.addDays(today, 30))
  const [start, setStart] = useState(plan?.start ?? today)
  const [daysOff, setDaysOff] = useState<number[]>(plan?.daysOff ?? [5])
  const [review, setReview] = useState(plan?.review ?? 7)

  const sections = edition.sections.filter((s) => s.end >= avail.from && s.start <= avail.to)
  const planScope: P.PlanScope =
    scope === 'all' ? { kind: 'all' } : scope === 'sections' ? { kind: 'sections', ids } : { kind: 'range', from, to }
  const ranges: Range[] =
    scope === 'all' ? [avail] : scope === 'sections' ? sections.filter((s) => ids.includes(s.id)).map((s) => ({ from: s.start, to: s.end }))
        : [{ from, to }]
  const segments = P.normalizeSegments(ranges, avail)

  const draft = useMemo(
    () =>
      segments.length
        ? P.makePlan({ scope: planScope, segments, pace, perDay, endDate, start, daysOff, review }, today, plan?.log ?? [])
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify([planScope, segments, pace, perDay, endDate, start, daysOff, review, today]), plan],
  )
  const pv = draft && P.preview(draft)
  const allOff = daysOff.length >= 7
  const endTooEarly = pace === 'endDate' && endDate < (start > today ? start : today)
  const valid = !!draft && !allOff && !endTooEarly

  const num = (s: string) => +toLatinDigits(s) || 0

  return (
    <>
      <p className="muted">
        {plan ? 'عدّل خطتك. ما أنهيته يبقى محفوظًا، ويُعاد حساب الجدول من اليوم.' : 'ضع خطة حفظ بورد يومي، وتابع تقدّمك يومًا بيوم.'}
      </p>

      <h2 className="group-title">ماذا تحفظ</h2>
      <div className="group">
        <div className="field-col">
          <div className="seg">
            {(
              [
                ['all', edition.partial ? 'كل المتاح' : 'المتن كاملًا'],
                ['sections', 'أبواب مختارة'],
                ['range', 'من بيت إلى بيت'],
              ] as [ScopeKind, string][]
            ).map(([k, label]) => (
              <button key={k} className={scope === k ? 'on' : ''} onClick={() => setScope(k)}>
                {label}
              </button>
            ))}
          </div>
          {scope === 'all' && (
            <small className="muted">
              الأبيات {ar(avail.from)}–{ar(avail.to)}
              {edition.partial ? ' (المتاح في النسخة التجريبية)' : ''}
            </small>
          )}
        </div>
        {scope === 'sections' &&
          sections.map((s) => {
            const on = ids.includes(s.id)
            return (
              <button
                key={s.id}
                className={`field-row plan-check${s.parent != null ? ' child' : ''}`}
                onClick={() => setIds(on ? ids.filter((x) => x !== s.id) : [...ids, s.id])}
              >
                <span>{s.title}</span>
                <span className="plan-check-end">
                  <small className="muted">
                    {ar(Math.max(s.start, avail.from))}–{ar(Math.min(s.end, avail.to))}
                  </small>
                  <span className={`check${on ? ' on' : ''}`}>{on && <Check size={14} />}</span>
                </span>
              </button>
            )
          })}
        {scope === 'range' && (
          <div className="field-row">
            <label className="plan-num">
              من
              <input type="number" inputMode="numeric" min={avail.from} max={avail.to} value={from} onChange={(e) => setFrom(num(e.target.value))} />
            </label>
            <label className="plan-num">
              إلى
              <input type="number" inputMode="numeric" min={avail.from} max={avail.to} value={to} onChange={(e) => setTo(num(e.target.value))} />
            </label>
          </div>
        )}
      </div>

      <h2 className="group-title">الوتيرة</h2>
      <div className="group">
        <div className="field-col">
          <div className="seg">
            <button className={pace === 'perDay' ? 'on' : ''} onClick={() => setPace('perDay')}>
              عدد أبيات في اليوم
            </button>
            <button className={pace === 'endDate' ? 'on' : ''} onClick={() => setPace('endDate')}>
              تاريخ الختم
            </button>
          </div>
        </div>
        {pace === 'perDay' ? (
          <div className="field-row">
            <span>أبيات كل يوم</span>
            <Stepper value={perDay} min={1} max={50} onChange={setPerDay} />
          </div>
        ) : (
          <div className="field-row">
            <span>أختم يوم</span>
            <input className="plan-date" type="date" value={endDate} min={today} onChange={(e) => e.target.value && setEndDate(e.target.value)} />
          </div>
        )}
        <div className="field-row">
          <span>تاريخ البدء</span>
          <input className="plan-date" type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
        </div>
      </div>

      <h2 className="group-title">أيام الراحة</h2>
      <div className="group">
        <div className="field-col">
          <div className="weekday-pick">
            {WEEKDAYS.map((w, i) => (
              <button
                key={i}
                className={`chip${daysOff.includes(i) ? ' on' : ''}`}
                onClick={() => setDaysOff(daysOff.includes(i) ? daysOff.filter((d) => d !== i) : [...daysOff, i])}
              >
                {WEEKDAY_SHORT[i]}
              </button>
            ))}
          </div>
          <small className="muted">{daysOff.length ? 'لا ورد جديد في هذه الأيام.' : 'ورد كل يوم دون راحة.'}</small>
        </div>
      </div>

      <h2 className="group-title">المراجعة اليومية</h2>
      <div className="group">
        <div className="field-row">
          <span>{review ? `راجع أوراد آخر ${daysWord(review)}` : 'بلا مراجعة'}</span>
          <Stepper value={review} min={0} max={30} onChange={setReview} />
        </div>
      </div>

      <div className="plan-preview">
        {pv && valid ? (
          <>
            <div>
              <strong>{ar(pv.perDay)}</strong>
              <small>{pv.perDay === 1 ? 'بيت يوميًا' : 'أبيات يوميًا'}</small>
            </div>
            <div>
              <strong>{ar(pv.days)}</strong>
              <small>{pv.days === 1 ? 'يوم حفظ' : 'أيام حفظ'}</small>
            </div>
            <div>
              <strong>{dayShort(pv.finish)}</strong>
              <small>{fmtWeekday.format(P.fromISO(pv.finish))}</small>
            </div>
          </>
        ) : (
          <span className="err">
            {!draft
              ? 'اختر أبياتًا للحفظ.'
              : allOff
                ? 'اترك يومًا واحدًا على الأقل للحفظ.'
                : 'تاريخ الختم قبل تاريخ البدء.'}
          </span>
        )}
      </div>

      <button className="btn wide" disabled={!valid} onClick={() => draft && p.onSave(draft)}>
        <Check size={20} /> {plan ? 'احفظ التعديل' : 'ابدأ الخطة'}
      </button>
      {p.onCancel && (
        <button className="btn secondary wide" onClick={p.onCancel}>
          إلغاء
        </button>
      )}
    </>
  )
}

function Stepper(p: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <span className="stepper">
      <button onClick={() => p.onChange(Math.max(p.min, p.value - 1))} disabled={p.value <= p.min} aria-label="أنقص">
        −
      </button>
      <output>{ar(p.value)}</output>
      <button onClick={() => p.onChange(Math.min(p.max, p.value + 1))} disabled={p.value >= p.max} aria-label="زد">
        +
      </button>
    </span>
  )
}
