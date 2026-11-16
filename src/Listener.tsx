import { useMemo, useState, type CSSProperties } from 'react'
import { Check, ChevronDown, ChevronLeft, Ear, Plus, Repeat, Trash2 } from 'lucide-react'
import { toArabicDigits, toLatinDigits } from './arabic'
import { sectionOf, verseRange } from './data'
import {
  SLIP_PALETTE,
  countByType,
  newTypeId,
  slipKey,
  slipVerses,
  toggleSlip,
  typeOf,
  words,
  type Slip,
  type SlipLog,
  type SlipSession,
  type SlipType,
} from './slips'
import type { SetState } from './sheets'
import type { Edition, Range, Verse } from './types'
import './listener.css'

const ar = toArabicDigits
const dateFmt = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })
const when = (at: number) => ar(dateFmt.format(new Date(at)))
const rangeLabel = (r: Range) => (r.from === r.to ? `البيت ${ar(r.from)}` : `الأبيات ${ar(r.from)}–${ar(r.to)}`)
const slipsLabel = (n: number) => (n === 0 ? 'بلا أخطاء' : n === 1 ? 'خطأ واحد' : n === 2 ? 'خطآن' : n <= 10 ? `${ar(n)} أخطاء` : `${ar(n)} خطأً`)
const versesWord = (n: number) => (n === 1 ? 'بيت واحد' : n === 2 ? 'بيتان' : n <= 10 ? `${ar(n)} أبيات` : `${ar(n)} بيتًا`)
const dot = (color: string) => ({ '--slip': color }) as CSSProperties

/** The row in الحفظ (inside the «الاختبار والتسميع» group). */
export function ListenerCard({ sessions, onOpen }: { sessions: number; onOpen: () => void }) {
  return (
        <button className="check-row" onClick={onOpen}>
          <Ear size={20} className="lis-icon" />
          <span className="list-main">
            التسميع على مستمع
            <small className="muted">
              يمسك المستمع الجهاز ويلمس كل كلمة أخطأت فيها{sessions > 0 ? ` · ${sessions === 1 ? 'جلسة واحدة محفوظة' : `${ar(sessions)} جلسات محفوظة`}` : ''}
            </small>
          </span>
          <ChevronLeft size={18} className="chev" />
        </button>
  )
}

/** One verse with tappable words; a marked word carries its slip type's colour. */
function SlipVerse(p: { v: Verse; marks: Map<string, SlipType>; onWord?: (h: 'a' | 'b', w: number) => void }) {
  const half = (h: 'a' | 'b') => (
    <span className={`lis-half ${h}`}>
      {words(p.v[h]).map((word, w) => {
        const t = p.marks.get(slipKey({ n: p.v.n, h, w }))
        const cls = `lis-word${t ? ' slip' : ''}`
        return p.onWord ? (
          <button key={w} className={cls} style={t && dot(t.color)} aria-pressed={!!t} aria-label={t ? `${word} (${t.name})` : word} onClick={() => p.onWord!(h, w)}>
            {word}
          </button>
        ) : (
          <span key={w} className={cls} style={t && dot(t.color)} title={t?.name}>
            {word}
          </span>
        )
      })}
    </span>
  )
  return (
    <div className="lis-verse">
      <span className="lis-num">{ar(p.v.n)}</span>
      <div className="lis-text verse-text">
        {half('a')}
        {half('b')}
      </div>
    </div>
  )
}

const marksOf = (slips: Slip[], types: SlipType[]) => new Map(slips.map((s) => [slipKey(s), typeOf(types, s.t)]))

type Stage = { at: 'setup' } | { at: 'run'; session: SlipSession } | { at: 'report'; id: number; fresh: boolean }

export default function Listener(p: {
  edition: Edition
  types: SlipType[]
  log: SlipLog
  setLog: SetState<SlipLog>
  /** The verse the reader is on: its باب is the range offered first. */
  at: number
  /** Today's wird, when a plan has one due. */
  wird: Range | null
  hasAudio: boolean
  /** A session ended with these verses slipped (feeds the weak list). */
  onFinish: (verses: number[]) => void
  /** Repeat these verses in the reader. */
  onRepeat: (verses: number[]) => void
  onClose: () => void
}) {
  const { edition, types } = p
  const all = verseRange(edition)
  const here = sectionOf(edition, p.at)
  const [stage, setStage] = useState<Stage>({ at: 'setup' })
  const [from, setFrom] = useState(String(p.wird?.from ?? here?.start ?? all.from))
  const [to, setTo] = useState(String(p.wird?.to ?? here?.end ?? all.to))
  const [active, setActive] = useState(types[0]?.id ?? '')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const num = (s: string) => parseInt(toLatinDigits(s).replace(/\D/g, ''), 10)
  const a = num(from), b = num(to)
  const valid = a >= all.from && b <= all.to && a <= b
  const sessions = useMemo(() => p.log.sessions.filter((s) => s.editionId === edition.id).sort((x, y) => y.id - x.id), [p.log, edition.id])

  const begin = () =>
    valid && setStage({ at: 'run', session: { id: Date.now(), editionId: edition.id, from: a, to: b, slips: [], shown: true } })

  const finish = (session: SlipSession) => {
    p.setLog((l) => ({ sessions: [...l.sessions, session] }))
    p.onFinish(slipVerses(session))
    setStage({ at: 'report', id: session.id, fresh: true })
  }
  const remove = (id: number) => {
    p.setLog((l) => ({ sessions: l.sessions.filter((s) => s.id !== id) }))
    setConfirmDelete(null)
    setStage({ at: 'setup' })
  }

  // ---- The session: the listener taps the slipped words ----
  if (stage.at === 'run') {
    const { session } = stage
    const marks = marksOf(session.slips, types)
    const verses = edition.verses.filter((v) => v.n >= session.from && v.n <= session.to)
    const tap = (n: number, h: 'a' | 'b', w: number) =>
      setStage({ at: 'run', session: { ...session, slips: toggleSlip(session.slips, { n, h, w }, active) } })
    return (
      <div className="listener run" role="dialog" aria-label="التسميع">
        <header className="lis-top">
          <span className="lis-title">
            {rangeLabel(session)}
            <small>{slipsLabel(session.slips.length)}</small>
          </span>
          <button className="btn" onClick={() => finish(session)}>
            <Check size={18} /> إنهاء
          </button>
        </header>
        <div className="lis-body">
          {verses.map((v) => (
            <SlipVerse key={v.n} v={v} marks={marks} onWord={(h, w) => tap(v.n, h, w)} />
          ))}
        </div>
        <footer className="lis-types" role="radiogroup" aria-label="نوع الخطأ">
          {types.map((t) => (
            <button key={t.id} role="radio" aria-checked={active === t.id} className={`lis-type${active === t.id ? ' on' : ''}`} style={dot(t.color)} onClick={() => setActive(t.id)}>
              <i /> {t.name}
            </button>
          ))}
        </footer>
      </div>
    )
  }

  // ---- The report of one session ----
  const shownSession = stage.at === 'report' ? sessions.find((s) => s.id === stage.id) : undefined
  if (stage.at === 'report' && shownSession) {
    const s = shownSession
    const marks = marksOf(s.slips, types)
    const counts = countByType(s.slips)
    const slipped = slipVerses(s)
    const verses = edition.verses.filter((v) => slipped.includes(v.n))
    const total = s.to - s.from + 1
    return (
      <div className="listener" role="dialog" aria-label="تقرير التسميع">
        <header className="lis-top">
          <button className="icon-btn" onClick={() => (stage.fresh ? p.onClose() : setStage({ at: 'setup' }))} aria-label="إغلاق">
            <ChevronDown size={26} />
          </button>
          <span className="lis-title">
            تقرير التسميع
            <small>
              {rangeLabel(s)} · {when(s.id)}
            </small>
          </span>
          <button className="icon-btn" onClick={() => setConfirmDelete(s.id)} aria-label="حذف الجلسة">
            <Trash2 size={20} />
          </button>
        </header>
        <div className="lis-body">
          {confirmDelete === s.id && (
            <div className="lis-confirm">
              <span>حذف هذه الجلسة وعلاماتها من النص؟</span>
              <button className="btn danger" onClick={() => remove(s.id)}>
                حذف
              </button>
              <button className="btn secondary" onClick={() => setConfirmDelete(null)}>
                إلغاء
              </button>
            </div>
          )}
          <div className="lis-summary">
            <strong>{slipsLabel(s.slips.length)}</strong>
            <span>
              {slipped.length === 0 ? `${versesWord(total)} دون خطأ` : `في ${slipped.length === 2 ? 'بيتين' : versesWord(slipped.length)} من أصل ${ar(total)}`}
            </span>
          </div>
          {counts.size > 0 && (
            <ul className="lis-counts">
              {[...counts].map(([id, n]) => {
                const t = typeOf(types, id)
                return (
                  <li key={id} style={dot(t.color)}>
                    <i /> {t.name} <b>{ar(n)}</b>
                  </li>
                )
              })}
            </ul>
          )}
          {verses.map((v) => (
            <SlipVerse key={v.n} v={v} marks={marks} />
          ))}
        </div>
        <footer className="lis-actions">
          {slipped.length > 0 && p.hasAudio && (
            <button className="btn" onClick={() => p.onRepeat(slipped)}>
              <Repeat size={18} /> تكرار أبيات الأخطاء
            </button>
          )}
          <button className="btn secondary" onClick={() => (stage.fresh ? p.onClose() : setStage({ at: 'setup' }))}>
            تم
          </button>
        </footer>
      </div>
    )
  }

  // ---- Setup: the range, then the earlier sessions ----
  const setRange = (r: Range) => {
    setFrom(String(r.from))
    setTo(String(r.to))
  }
  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="lis-field">
      <span>{label}</span>
      <input type="text" inputMode="numeric" value={ar(value)} onChange={(e) => set(toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 4))} onFocus={(e) => e.target.select()} />
    </label>
  )
  const sectionId = edition.sections.find((s) => s.start === a && s.end === b)?.id ?? ''
  return (
    <div className="listener" role="dialog" aria-label="التسميع على مستمع">
      <header className="lis-top">
        <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
          <ChevronDown size={26} />
        </button>
        <span className="lis-title">التسميع على مستمع</span>
        <span className="lis-spacer" />
      </header>
      <div className="lis-body">
        <p className="muted lis-hint">اختر الأبيات، ثم أعطِ الجهاز للمستمع. يلمس المستمع كل كلمة أخطأت فيها بعد أن يختار نوع الخطأ من أسفل الشاشة.</p>
        <h2 className="group-title">الأبيات</h2>
        <div className="group">
          <div className="lis-range">
            {field('من البيت', from, setFrom)}
            {field('إلى البيت', to, setTo)}
          </div>
          <label className="field-row">
            <span>الباب</span>
            <select
              value={sectionId}
              onChange={(e) => {
                const s = edition.sections.find((x) => x.id === +e.target.value)
                if (s) setRange({ from: s.start, to: s.end })
              }}
            >
              <option value="">—</option>
              {edition.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          {p.wird && (
            <button className="check-row" onClick={() => setRange(p.wird!)}>
              <span className="list-main">ورد اليوم</span>
              <small>{rangeLabel(p.wird)}</small>
            </button>
          )}
        </div>
        {!valid && (
          <p className="err lis-hint">
            اختر أبياتًا بين {ar(all.from)} و{ar(all.to)}، والبداية قبل النهاية.
          </p>
        )}
        <button className="btn wide" disabled={!valid} onClick={begin}>
          ابدأ التسميع{valid ? ` · ${versesWord(b - a + 1)}` : ''}
        </button>

        {sessions.length > 0 && (
          <>
            <h2 className="group-title">الجلسات السابقة</h2>
            <ul className="group list">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button className="check-row" onClick={() => setStage({ at: 'report', id: s.id, fresh: false })}>
                    <span className="list-main">
                      {rangeLabel(s)}
                      <small className="muted">{when(s.id)}</small>
                    </span>
                    <small className={s.slips.length ? 'lis-bad' : 'lis-good'}>{slipsLabel(s.slips.length)}</small>
                    <ChevronLeft size={18} className="chev" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

/** الإعدادات ← التسميع: marks in the reader, and the user's own slip types (name and colour). */
export function ListenerSettings(p: {
  types: SlipType[]
  setTypes: (list: SlipType[]) => void
  showMarks: boolean
  setShowMarks: (on: boolean) => void
  /** Sessions whose marks are drawn in the reader now. */
  marked: number
  onClearMarks: () => void
}) {
  const { types } = p
  const edit = (id: string, patch: Partial<SlipType>) => p.setTypes(types.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const add = () => {
    const color = SLIP_PALETTE.find((c) => !types.some((t) => t.color.toLowerCase() === c)) ?? SLIP_PALETTE[types.length % SLIP_PALETTE.length]
    p.setTypes([...types, { id: newTypeId(types), name: 'نوع جديد', color }])
  }
  return (
    <>
      <h2 className="group-title">التسميع</h2>
      <div className="group">
        <label className="field-row">
          <span className="list-main">
            إظهار أخطاء التسميع في النص
            <small className="muted">تبقى الكلمات التي أخطأت فيها ملوّنة في صفحة القراءة</small>
          </span>
          <input type="checkbox" className="switch" checked={p.showMarks} onChange={(e) => p.setShowMarks(e.target.checked)} />
        </label>
        {p.marked > 0 && (
          <button className="check-row lis-clear" onClick={p.onClearMarks}>
            <span className="list-main">
              مسح علامات الأخطاء من النص
              <small className="muted">تبقى الجلسات وتقاريرها محفوظة في الحفظ</small>
            </span>
          </button>
        )}
      </div>
      <h2 className="group-title">أنواع الأخطاء</h2>
      <div className="group">
        {types.map((t) => (
          <div key={t.id} className="lis-type-row">
            <input type="color" value={t.color} aria-label={`لون «${t.name}»`} onChange={(e) => edit(t.id, { color: e.target.value })} />
            <input type="text" value={t.name} maxLength={24} aria-label="اسم النوع" onChange={(e) => edit(t.id, { name: e.target.value })} />
            <button className="icon-btn" aria-label={`حذف «${t.name}»`} disabled={types.length <= 1} onClick={() => p.setTypes(types.filter((x) => x.id !== t.id))}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button className="check-row" onClick={add} disabled={types.length >= 8}>
          <Plus size={18} className="lis-icon" />
          <span className="list-main">إضافة نوع</span>
        </button>
      </div>
    </>
  )
}
