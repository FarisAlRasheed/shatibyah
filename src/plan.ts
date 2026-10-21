// Memorization plan: pure schedule logic. No React, no storage, no clock (callers pass `today`).
// Dates are local calendar days as 'YYYY-MM-DD' strings, never UTC timestamps.
//
// Model: the plan is "next undone wird", not a fixed calendar. Finished wirds are logged as verse
// ranges; the remaining verses are cut into wirds of `perDay`. The schedule only says when the
// remaining wirds are due: wird k after the anchor is due on the k-th study day from `anchor`.
import type { Range } from './types'

export type PlanScope = { kind: 'all' } | { kind: 'sections'; ids: number[] } | { kind: 'range'; from: number; to: number }
export type PaceKind = 'perDay' | 'endDate'

export interface LogEntry {
  date: string
  from: number
  to: number
}

export interface Plan {
  version: 1
  scope: PlanScope
  /** Verses to memorize, as sorted, non-touching ranges (resolved from scope when the plan is saved). */
  segments: Range[]
  pace: PaceKind
  /** Verses per wird. In end-date mode this is derived from `endDate` when the plan is saved. */
  perDay: number
  /** The end date the owner asked for (end-date mode only). */
  endDate?: string
  start: string
  /** Weekdays off, 0 = Sunday … 6 = Saturday. */
  daysOff: number[]
  /** Review the verses of the last K wirds alongside the new one (0 = no review). */
  review: number
  /** Wirds done on or after this date count toward the current schedule (moved by rescheduling or editing). */
  anchor: string
  /** Finished wirds, in order. */
  log: LogEntry[]
}

// ---- Dates ----

const pad = (n: number) => String(n).padStart(2, '0')
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** Local noon, so adding days never trips over a DST change. */
export function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
export const todayISO = (now = new Date()) => toISO(now)
export function addDays(s: string, n: number): string {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export const weekday = (s: string) => fromISO(s).getDay()
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000)
export const isOff =(plan: Pick<Plan, 'daysOff'>, s: string) => plan.daysOff.includes(weekday(s))

/** The first study day on or after `s` (or `s` itself when every weekday is off, to avoid looping). */
export function nextStudyDay(daysOff: number[], s: string): string {
  if (daysOff.length >= 7) return s
  while (daysOff.includes(weekday(s))) s = addDays(s, 1)
  return s
}
/** The k-th study day (0-based) counting from `s`. */
export function nthStudyDay(daysOff: number[], s: string, k: number): string {
  let d = nextStudyDay(daysOff, s)
  for (let i = 0; i < k; i++) d = nextStudyDay(daysOff, addDays(d, 1))
  return d
}
/** Study days in [a, b), b excluded. */
export function studyDaysBetween(daysOff: number[], a: string, b: string): number {
  if (daysOff.length >= 7) return 0
  let n = 0
  for (let d = a; d < b; d = addDays(d, 1)) if (!daysOff.includes(weekday(d))) n++
  return n
}

// ---- Verses and wirds ----

const size = (r: Range) => r.to - r.from + 1

/** Sort, clamp to `avail`, and merge touching ranges. */
export function normalizeSegments(ranges: Range[], avail: Range): Range[] {
  const out: Range[] = []
  const sorted = ranges
    .map((r) => ({ from: Math.max(avail.from, Math.min(r.from, r.to)), to: Math.min(avail.to, Math.max(r.from, r.to)) }))
    .filter((r) => r.from <= r.to)
    .sort((a, b) => a.from - b.from)
  for (const r of sorted) {
    const last = out[out.length - 1]
    if (last && r.from <= last.to + 1) last.to = Math.max(last.to, r.to)
    else out.push({ ...r })
  }
  return out
}

export const totalVerses = (segments: Range[]) => segments.reduce((s, r) => s + size(r), 0)

/** `segments` minus every logged range. */
export function remainingSegments(segments: Range[], log: Range[]): Range[] {
  let out = segments.map((r) => ({ ...r }))
  for (const d of log) {
    out = out.flatMap((r) => {
      if (d.to < r.from || d.from > r.to) return [r]
      const parts: Range[] = []
      if (d.from > r.from) parts.push({ from: r.from, to: d.from - 1 })
      if (d.to < r.to) parts.push({ from: d.to + 1, to: r.to })
      return parts
    })
  }
  return out
}

/** Cut each range into wirds of `perDay`; a range's last wird may be shorter. */
export function chunksOf(segments: Range[], perDay: number): Range[] {
  const n = Math.max(1, Math.floor(perDay))
  const out: Range[] = []
  for (const s of segments) for (let f = s.from; f <= s.to; f += n) out.push({ from: f, to: Math.min(s.to, f + n - 1) })
  return out
}

/** Smallest verses-per-day that fits every wird into the study days from `start` to `end` (inclusive). */
export function perDayForEndDate(segments: Range[], daysOff: number[], start: string, end: string): number {
  const days = Math.max(1, studyDaysBetween(daysOff, start, addDays(end, 1)))
  const total = totalVerses(segments)
  let n = Math.max(1, Math.ceil(total / days))
  while (n < total && chunksOf(segments, n).length > days) n++
  return n
}

// ---- Schedule ----

/** The wirds still to do, in order. */
export const remainingWirds = (plan: Plan) => chunksOf(remainingSegments(plan.segments, plan.log), plan.perDay)
export const isFinished = (plan: Plan) => remainingSegments(plan.segments, plan.log).length === 0
export const versesDone = (plan: Plan) => totalVerses(plan.segments) - totalVerses(remainingSegments(plan.segments, plan.log))
const doneSinceAnchor = (plan: Plan) => plan.log.filter((e) => e.date >= plan.anchor).length

/** Due date of the k-th remaining wird (0 = the next one) on the current schedule. */
export const dueDate = (plan: Plan, k: number) => nthStudyDay(plan.daysOff, plan.anchor, doneSinceAnchor(plan) + k)

/** Date the last wird is due on the current schedule. */
export function finishDate(plan: Plan): string {
  const left = remainingWirds(plan).length
  if (left === 0) return plan.log[plan.log.length - 1]?.date ?? plan.start
  return dueDate(plan, left - 1)
}

/** Wirds due before `today` on the current schedule that are still not done. */
export function behindBy(plan: Plan, today: string): number {
  const due = today > plan.anchor ? studyDaysBetween(plan.daysOff, plan.anchor, today) : 0
  const done = doneSinceAnchor(plan)
  return Math.max(0, Math.min(due - done, remainingWirds(plan).length))
}

/** Restart the schedule from today: the next undone wird is due today, and the end date moves. */
export const reschedule = (plan: Plan, today: string): Plan => ({ ...plan, anchor: today < plan.start ? plan.start : today })

export function markDone(plan: Plan, today: string): Plan {
  const next = remainingWirds(plan)[0]
  return next ? { ...plan, log: [...plan.log, { date: today, ...next }] } : plan
}
export const undoLast = (plan: Plan): Plan => ({ ...plan, log: plan.log.slice(0, -1) })

/** Review range: up to `plan.review` logged wirds before log index `end` (exclusive), while they run on without a gap. */
export function reviewRange(plan: Plan, end = plan.log.length): Range | null {
  if (plan.review <= 0 || end <= 0) return null
  let first = end - 1
  while (first > 0 && end - first < plan.review && plan.log[first - 1].to + 1 === plan.log[first].from) first--
  return { from: plan.log[first].from, to: plan.log[end - 1].to }
}

export type TodayState =
  | { kind: 'finished' }
  | { kind: 'wird'; wird: Range; review: Range | null; offDay: boolean; notStarted: boolean }
  | { kind: 'doneToday'; wird: Range; review: Range | null; next: Range | null; offDay: boolean }

/** What the today card shows. The next undone wird drives it, not the calendar. */
export function todayState(plan: Plan, today: string): TodayState {
  const offDay = isOff(plan, today)
  const last = plan.log.length - 1
  if (last >= 0 && plan.log[last].date === today) {
    const e = plan.log[last]
    return { kind: 'doneToday', wird: e, review: reviewRange(plan, last), next: remainingWirds(plan)[0] ?? null, offDay }
  }
  const next = remainingWirds(plan)[0]
  if (!next) return { kind: 'finished' }
  return { kind: 'wird', wird: next, review: reviewRange(plan), offDay, notStarted: today < plan.start }
}

/** Consecutive study days with a wird done, ending today (or yesterday while today is still open). Days off don't break it. */
export function streak(plan: Plan, today: string): number {
  const days = new Set(plan.log.map((e) => e.date))
  const first = plan.log.reduce((m, e) => (e.date < m ? e.date : m), plan.start)
  let d = days.has(today) ? today : addDays(today, -1)
  let n = 0
  for (; d >= first; d = addDays(d, -1)) {
    if (days.has(d)) n++
    else if (!isOff(plan, d)) break
  }
  return n
}

export type DayStatus = 'done' | 'missed' | 'off' | 'today' | 'future' | 'none'

/** Status of one calendar day, for the heatmap. */
export function dayStatus(plan: Plan, d: string, today: string): DayStatus {
  if (plan.log.some((e) => e.date === d)) return 'done'
  if (d < plan.start) return 'none'
  const finished = isFinished(plan)
  const lastDone = plan.log[plan.log.length - 1]?.date ?? ''
  if (finished && d > lastDone) return 'none'
  if (isOff(plan, d)) return 'off'
  if (d === today) return 'today'
  return d > today ? 'future' : 'missed'
}

/** The next `n` undone wirds with their due dates (overdue ones show today). */
export function upcoming(plan: Plan, today: string, n: number) {
  return remainingWirds(plan)
    .slice(0, n)
    .map((wird, k) => {
      const due = dueDate(plan, k)
      return { wird, date: due < today ? today : due, late: due < today }
    })
}

export interface PlanInput {
  scope: PlanScope
  segments: Range[]
  pace: PaceKind
  perDay: number
  endDate?: string
  start: string
  daysOff: number[]
  review: number
}

/**
 * Build a plan from builder input. Editing keeps `log`, so finished verses stay finished, and the
 * schedule restarts from today (or the start date, if later). In end-date mode the daily wird is
 * worked out from the verses still left.
 */
export function makePlan(input: PlanInput, today: string, log: LogEntry[] = []): Plan {
  const anchor = input.start > today ? input.start : log.length ? today : input.start
  const left = remainingSegments(input.segments, log)
  const perDay =
    input.pace === 'endDate' && input.endDate
      ? left.length
        ? perDayForEndDate(left, input.daysOff, anchor, input.endDate)
        : Math.max(1, Math.floor(input.perDay))
      : Math.max(1, Math.floor(input.perDay))
  return {
    version: 1,
    scope: input.scope,
    segments: input.segments,
    pace: input.pace,
    perDay,
    endDate: input.pace === 'endDate' ? input.endDate : undefined,
    start: input.start,
    daysOff: [...input.daysOff].sort((a, b) => a - b),
    review: Math.max(0, Math.floor(input.review)),
    anchor,
    log,
  }
}

/** Builder preview: wird size, number of memorizing days, expected finish. */
export function preview(plan: Plan) {
  return {
    perDay: plan.perDay,
    days: remainingWirds(plan).length,
    total: totalVerses(plan.segments),
    finish: finishDate(plan),
  }
}
