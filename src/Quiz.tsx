import { useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronLeft, Eye, GraduationCap, RotateCcw } from 'lucide-react'
import { toArabicDigits, toLatinDigits } from './arabic'
import { sectionOf, verseRange } from './data'
import { reviewDue, shuffled, weakNow } from './review'
import type { Mastered, Weak } from './store'
import type { Edition, Range, Verse } from './types'
import './listener.css'
import './quiz.css'

const ar = toArabicDigits
const versesWord = (n: number) => (n === 1 ? 'بيت واحد' : n === 2 ? 'بيتان' : n <= 10 ? `${ar(n)} أبيات` : `${ar(n)} بيتًا`)

type Source = 'range' | 'weak' | 'review'
type Kind = 'b' | 'all' | 'next' | 'twins'
const KINDS: [Kind, string, string][] = [
  ['b', 'إخفاء العجز', 'يظهر الشطر الأول وتُكمل الثاني'],
  ['all', 'إخفاء البيت', 'يظهر رقم البيت وبابه فقط'],
  ['next', 'ما البيت التالي؟', 'يظهر البيت السابق وتأتي بما بعده'],
  ['twins', 'المتشابهات', 'الأبيات التي تنتهي بالكلمة نفسها، مع عرض أشباهها بعد الجواب'],
]

/** The group in الحفظ that holds the test and the listener rows. */
export function PracticeGroup({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 className="group-title">الاختبار والتسميع</h2>
      <div className="group">{children}</div>
    </>
  )
}

export function QuizRow({ due, onOpen }: { due: number; onOpen: () => void }) {
  return (
    <button className="check-row" onClick={onOpen}>
      <GraduationCap size={20} className="lis-icon" />
      <span className="list-main">
        اختبر نفسك
        <small className="muted">اختر الأبيات ونوع السؤال{due > 0 ? ` · مراجعة اليوم: ${versesWord(due)}` : ''}</small>
      </span>
      <ChevronLeft size={18} className="chev" />
    </button>
  )
}

type Stage = { at: 'setup' } | { at: 'run'; list: number[]; i: number; shown: boolean; missed: number[]; kind: Kind } | { at: 'done'; total: number; missed: number[]; kind: Kind }

export default function Quiz(p: {
  edition: Edition
  mastered: Mastered
  weak: Weak
  twins: Map<number, number[]>
  /** The verse the reader is on: its باب is the range offered first. */
  at: number
  wird: Range | null
  /** Open on «مراجعة اليوم». */
  startOnReview?: boolean
  onGrade: (n: number, yes: boolean) => void
  onJump: (n: number) => void
  onClose: () => void
}) {
  const { edition } = p
  const all = verseRange(edition)
  const here = sectionOf(edition, p.at)
  const byN = useMemo(() => new Map(edition.verses.map((v, i) => [v.n, i])), [edition])
  const verse = (n: number): Verse | undefined => edition.verses[byN.get(n) ?? -1]
  const has = (n: number) => byN.has(n)

  // The lists are fixed when the screen opens, so grading a verse doesn't reshuffle them under the user.
  const [weakList] = useState(() => weakNow(p.weak, p.mastered, has))
  const [dueList] = useState(() => reviewDue(p.weak, p.mastered, has))

  const [stage, setStage] = useState<Stage>({ at: 'setup' })
  const [source, setSource] = useState<Source>(p.startOnReview && dueList.length ? 'review' : 'range')
  const [from, setFrom] = useState(String(here?.start ?? all.from))
  const [to, setTo] = useState(String(here?.end ?? all.to))
  const [kind, setKind] = useState<Kind>('b')
  const [random, setRandom] = useState(false)

  const num = (s: string) => parseInt(toLatinDigits(s).replace(/\D/g, ''), 10)
  const a = num(from), b = num(to)
  const validRange = a >= all.from && b <= all.to && a <= b
  const base = source === 'weak' ? weakList : source === 'review' ? dueList : validRange ? edition.verses.filter((v) => v.n >= a && v.n <= b).map((v) => v.n) : []
  // «ما البيت التالي؟» needs a verse before it; the drill needs a twin.
  const list = base.filter((n) => (kind === 'next' ? (byN.get(n) ?? 0) > 0 : kind === 'twins' ? p.twins.has(n) : true))

  const begin = (verses: number[], k: Kind) => {
    const ordered = source === 'range' && !random ? [...verses].sort((x, y) => x - y) : random ? shuffled(verses) : verses
    setStage({ at: 'run', list: ordered, i: 0, shown: false, missed: [], kind: k })
  }

  // ---- A question ----
  if (stage.at === 'run') {
    const n = stage.list[stage.i]
    const v = verse(n)!
    const prev = edition.verses[(byN.get(n) ?? 0) - 1]
    const section = sectionOf(edition, n)
    const k = stage.kind
    const grade = (yes: boolean) => {
      p.onGrade(n, yes)
      const missed = yes ? stage.missed : [...stage.missed, n]
      if (stage.i + 1 >= stage.list.length) setStage({ at: 'done', total: stage.list.length, missed, kind: k })
      else setStage({ ...stage, i: stage.i + 1, shown: false, missed })
    }
    const twins = k === 'twins' && stage.shown ? (p.twins.get(n) ?? []).map(verse).filter((x): x is Verse => !!x) : []
    return (
      <div className="listener quiz" role="dialog" aria-label="اختبر نفسك">
        <header className="lis-top">
          <button className="icon-btn" onClick={() => setStage({ at: 'done', total: stage.i, missed: stage.missed, kind: k })} aria-label="إنهاء الاختبار">
            <ChevronDown size={26} />
          </button>
          <span className="lis-title">
            {KINDS.find((x) => x[0] === k)![1]}
            <small>
              {ar(stage.i + 1)} من {ar(stage.list.length)}
            </small>
          </span>
          <span className="lis-spacer" />
        </header>
        <div className="quiz-bar">
          <div style={{ width: `${(stage.i / stage.list.length) * 100}%` }} />
        </div>
        <div className="lis-body quiz-body" onClick={() => !stage.shown && setStage({ ...stage, shown: true })}>
          {k === 'next' ? (
            <>
              <p className="quiz-kicker">ما البيت الذي بعد هذا؟</p>
              <div className="quiz-cue verse-text">
                <p>{prev?.a}</p>
                <p>{prev?.b}</p>
              </div>
            </>
          ) : (
            <p className="quiz-kicker">
              {section?.title} · البيت {ar(n)}
            </p>
          )}
          <div className={`quiz-verse verse-text${stage.shown ? ' shown' : ''}`}>
            {k === 'b' || k === 'twins' || stage.shown ? <p>{v.a}</p> : <p className="hidden-half">الصدر</p>}
            {stage.shown ? <p>{v.b}</p> : <p className="hidden-half">{k === 'b' || k === 'twins' ? 'اضغط لإظهار العجز' : 'اضغط لإظهار البيت'}</p>}
          </div>
          {stage.shown && k === 'next' && (
            <p className="quiz-kicker">
              {section?.title} · البيت {ar(n)}
            </p>
          )}
          {twins.length > 0 && (
            <div className="quiz-twins">
              <span className="muted">يشبهه في الخاتمة:</span>
              {twins.slice(0, 6).map((t) => (
                <p key={t.n}>
                  <span className="verse-text">{t.b}</span> <small className="muted">({ar(t.n)})</small>
                </p>
              ))}
              {twins.length > 6 && <small className="muted">و{versesWord(twins.length - 6)} أخرى</small>}
            </div>
          )}
        </div>
        <footer className="lis-actions">
          {stage.shown ? (
            <>
              <button className="btn secondary" onClick={() => grade(false)}>
                <RotateCcw size={18} /> لم أتقنه
              </button>
              <button className="btn" onClick={() => grade(true)}>
                <Check size={18} /> أتقنته
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => setStage({ ...stage, shown: true })}>
              <Eye size={18} /> أظهر الجواب
            </button>
          )}
        </footer>
      </div>
    )
  }

  // ---- The result ----
  if (stage.at === 'done') {
    const right = stage.total - stage.missed.length
    return (
      <div className="listener quiz" role="dialog" aria-label="نتيجة الاختبار">
        <header className="lis-top">
          <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
            <ChevronDown size={26} />
          </button>
          <span className="lis-title">نتيجة الاختبار</span>
          <span className="lis-spacer" />
        </header>
        <div className="lis-body">
          <div className="lis-summary">
            <strong>
              {ar(right)} من {ar(stage.total)}
            </strong>
            <span>{stage.total === 0 ? 'لم تُجب عن أي بيت.' : stage.missed.length === 0 ? 'أتقنت كل الأبيات، بارك الله فيك.' : `لم تتقن ${stage.missed.length === 1 ? 'بيتًا واحدًا' : stage.missed.length === 2 ? 'بيتين' : versesWord(stage.missed.length)}`}</span>
          </div>
          {stage.missed.length > 0 && (
            <ul className="group list">
              {stage.missed.map((n) => {
                const v = verse(n)
                return (
                  <li key={n}>
                    <button
                      className="check-row"
                      onClick={() => {
                        p.onJump(n)
                        p.onClose()
                      }}
                    >
                      <span className="list-main">
                        <span className="verse-text quiz-line">{v?.a}</span>
                        <small className="muted">
                          البيت {ar(n)} · {sectionOf(edition, n)?.title}
                        </small>
                      </span>
                      <ChevronLeft size={18} className="chev" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <footer className="lis-actions">
          {stage.missed.length > 0 && (
            <button className="btn" onClick={() => setStage({ at: 'run', list: stage.missed, i: 0, shown: false, missed: [], kind: stage.kind })}>
              <RotateCcw size={18} /> أعد ما لم أتقنه
            </button>
          )}
          <button className="btn secondary" onClick={() => setStage({ at: 'setup' })}>
            اختبار جديد
          </button>
        </footer>
      </div>
    )
  }

  // ---- Setup ----
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
  const SOURCES: [Source, string, number | null][] = [
    ['range', 'أبيات أختارها', null],
    ['review', 'مراجعة اليوم', dueList.length],
    ['weak', 'الأبيات الضعيفة', weakList.length],
  ]
  return (
    <div className="listener quiz" role="dialog" aria-label="اختبر نفسك">
      <header className="lis-top">
        <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
          <ChevronDown size={26} />
        </button>
        <span className="lis-title">اختبر نفسك</span>
        <span className="lis-spacer" />
      </header>
      <div className="lis-body">
        <h2 className="group-title">الأبيات</h2>
        <div className="group">
          {SOURCES.map(([id, label, count]) => (
            <button key={id} className="check-row" aria-pressed={source === id} disabled={count === 0} onClick={() => setSource(id)}>
              <span className="list-main">
                {label}
                {id === 'review' && <small className="muted">الضعيف أولًا، ثم أقدم ما أتقنته</small>}
              </span>
              {count != null && <small>{count === 0 ? 'لا شيء' : versesWord(count)}</small>}
              {source === id && <Check size={20} className="check" />}
            </button>
          ))}
        </div>
        {source === 'range' && (
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
                <small>
                  {ar(p.wird.from)}–{ar(p.wird.to)}
                </small>
              </button>
            )}
          </div>
        )}
        {source === 'range' && !validRange && (
          <p className="err lis-hint">
            اختر أبياتًا بين {ar(all.from)} و{ar(all.to)}، والبداية قبل النهاية.
          </p>
        )}

        <h2 className="group-title">نوع السؤال</h2>
        <div className="group">
          {KINDS.map(([id, label, hint]) => (
            <button key={id} className="check-row" aria-pressed={kind === id} onClick={() => setKind(id)}>
              <span className="list-main">
                {label}
                <small className="muted">{hint}</small>
              </span>
              {kind === id && <Check size={20} className="check" />}
            </button>
          ))}
        </div>

        <h2 className="group-title">الترتيب</h2>
        <div className="chips quiz-order">
          <button className={`chip${!random ? ' on' : ''}`} onClick={() => setRandom(false)}>
            {source === 'range' ? 'بالترتيب' : 'الأَولى أولًا'}
          </button>
          <button className={`chip${random ? ' on' : ''}`} onClick={() => setRandom(true)}>
            عشوائي
          </button>
        </div>

        <button className="btn wide" disabled={list.length === 0} onClick={() => begin(list, kind)}>
          {list.length ? `ابدأ الاختبار · ${versesWord(list.length)}` : kind === 'twins' && base.length ? 'لا متشابهات في هذه الأبيات' : 'ابدأ الاختبار'}
        </button>
      </div>
    </div>
  )
}
