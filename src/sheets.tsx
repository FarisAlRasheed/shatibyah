import { useEffect, useState, type ReactNode } from 'react'
import { Bookmark, BookmarkCheck, Flag, GraduationCap, Pencil, Play, Repeat, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { APP_VERSION, OWNER_EMAIL, OWNER_WHATSAPP } from './config'
import { sectionOf, verseRange } from './data'
import type { PlayState } from './player'
import type { Notes, RepeatSettings, Settings } from './store'
import type { Edition, Reciter } from './types'
import { FontSizeField, FontField, ThemeField } from './screens'

export type SetState<T> = (next: T | ((prev: T) => T)) => void

export function Sheet({ title, onClose, children }: { title?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" onClick={onClose}>
      <section className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        {title && (
          <header>
            <h3>{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
              <X size={20} />
            </button>
          </header>
        )}
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  )
}

export function VersePreview({ edition, n }: { edition: Edition; n: number }) {
  const v = edition.verses.find((x) => x.n === n)
  if (!v) return null
  return (
    <div className="preview">
      <span className="vnum small">{toArabicDigits(n)}</span>
      <span className="verse-text">
        {v.a} <span className="sep">...</span> {v.b}
      </span>
    </div>
  )
}

const PRESETS = [3, 5, 10, 0]

/** Actions for a tapped verse. */
export function VerseSheet(p: {
  n: number
  edition: Edition
  canPlay: boolean
  bookmarked: boolean
  onPlayFrom: () => void
  onRepeatTimes: (times: number) => void
  onRepeatSettings: () => void
  onToggleBookmark: () => void
  onNote: () => void
  onMemorize: () => void
  onFlag: () => void
  onClose: () => void
}) {
  const v = p.edition.verses.find((x) => x.n === p.n)
  const section = sectionOf(p.edition, p.n)
  return (
    <Sheet onClose={p.onClose}>
      <p className="sheet-kicker">
        البيت {toArabicDigits(p.n)} · {section?.title}
      </p>
      <p className="sheet-verse verse-text">
        {v?.a}
        <br />
        {v?.b}
      </p>
      <div className="action-grid">
        {p.canPlay && (
          <>
            <button className="action primary" onClick={p.onPlayFrom}>
              <span><Play size={22} /></span>تشغيل من هنا
            </button>
            <button className="action" onClick={p.onRepeatSettings}>
              <span><Repeat size={22} /></span>تكرار مفصّل
            </button>
          </>
        )}
        <button className="action" onClick={p.onToggleBookmark}>
          <span>{p.bookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}</span>
          {p.bookmarked ? 'إزالة العلامة' : 'علامة'}
        </button>
        <button className="action" onClick={p.onNote}>
          <span><Pencil size={22} /></span>ملاحظة
        </button>
        <button className="action" onClick={p.onMemorize}>
          <span><GraduationCap size={22} /></span>وضع الحفظ
        </button>
      </div>
      {p.canPlay && (
        <div className="presets" role="group" aria-label="تكرار البيت">
          <span>كرّر البيت</span>
          {PRESETS.map((t) => (
            <button key={t} onClick={() => p.onRepeatTimes(t)}>
              {t === 0 ? '∞' : `×${toArabicDigits(t)}`}
            </button>
          ))}
        </div>
      )}
      <button className="flag-link" onClick={p.onFlag}>
        <Flag size={15} /> إبلاغ عن خطأ في النص أو التوقيت
      </button>
    </Sheet>
  )
}

export function NoteSheet(p: { n: number; edition: Edition; notes: Notes; setNotes: SetState<Notes>; onClose: () => void }) {
  return (
    <Sheet title={`ملاحظة على البيت ${toArabicDigits(p.n)}`} onClose={p.onClose}>
      <VersePreview edition={p.edition} n={p.n} />
      <textarea
        autoFocus
        rows={6}
        placeholder="اكتب ملاحظتك… تُحفظ على هذا الجهاز فقط."
        value={p.notes[p.n] ?? ''}
        onChange={(e) =>
          p.setNotes((all) => {
            const next = { ...all, [p.n]: e.target.value }
            if (!e.target.value) delete next[p.n]
            return next
          })
        }
      />
      <p className="muted">تُحفظ تلقائيًا، وتظهر في كل النسخ لأنها مرتبطة برقم البيت.</p>
    </Sheet>
  )
}

const FLAG_TYPES = { timing: 'توقيت التلاوة غير صحيح', text: 'النص يختلف عن المطبوع', other: 'مشكلة أخرى' }

export function FlagSheet(p: { n: number; edition: Edition; reciter: Reciter | null; playState: PlayState; onClose: () => void }) {
  const [type, setType] = useState<keyof typeof FLAG_TYPES>(p.reciter ? 'timing' : 'text')
  const [comment, setComment] = useState('')
  const [copied, setCopied] = useState(false)
  const v = p.edition.verses.find((x) => x.n === p.n)
  const section = sectionOf(p.edition, p.n)
  const timing = p.reciter?.verses.find((x) => x.n === p.n)

  const message = [
    'بلاغ من تطبيق متن الشاطبية',
    `النوع: ${FLAG_TYPES[type]}`,
    `النسخة: ${p.edition.name}`,
    `القارئ: ${p.reciter?.name ?? '—'}`,
    `الباب: ${section?.title ?? '—'}`,
    `البيت: ${p.n}`,
    `النص: ${v?.a} ... ${v?.b}`,
    timing ? `التوقيت: ${timing.file} ${timing.start.toFixed(2)}–${timing.end.toFixed(2)}` : '',
    comment.trim() ? `الملاحظة: ${comment.trim()}` : '',
    `الإصدار: ${APP_VERSION}`,
  ]
    .filter(Boolean)
    .join('\n')
  const subject = `بلاغ: البيت ${p.n} — ${FLAG_TYPES[type]}`

  return (
    <Sheet title={`الإبلاغ عن مشكلة في البيت ${toArabicDigits(p.n)}`} onClose={p.onClose}>
      <VersePreview edition={p.edition} n={p.n} />
      <div className="seg vertical">
        {(Object.keys(FLAG_TYPES) as (keyof typeof FLAG_TYPES)[])
          .filter((k) => k !== 'timing' || p.reciter)
          .map((k) => (
            <button key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>
              {FLAG_TYPES[k]}
            </button>
          ))}
      </div>
      <textarea rows={3} placeholder="وصف المشكلة (اختياري)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <div className="row">
        {OWNER_WHATSAPP && (
          <a className="btn" href={`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
            إرسال عبر واتساب
          </a>
        )}
        {OWNER_EMAIL && (
          <a className="btn" href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}>
            إرسال بالبريد
          </a>
        )}
        <button
          className="btn secondary"
          onClick={() =>
            navigator.clipboard?.writeText(message).then(
              () => setCopied(true),
              () => setCopied(false),
            )
          }
        >
          {copied ? 'نُسخ ✓' : 'نسخ نص البلاغ'}
        </button>
      </div>
      {!OWNER_WHATSAPP && !OWNER_EMAIL && <p className="muted">لم يُضبط رقم واتساب أو بريد المسؤول بعد؛ يمكنك نسخ البلاغ وإرساله يدويًا.</p>}
    </Sheet>
  )
}

function Count({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const endless = value === 0
  return (
    <div className="field-row">
      <span>{label}</span>
      <div className="stepper">
        <button disabled={endless || value <= 1} onClick={() => onChange(value - 1)} aria-label="أقل">−</button>
        <output>{endless ? '∞' : toArabicDigits(value)}</output>
        <button disabled={endless} onClick={() => onChange(value + 1)} aria-label="أكثر">+</button>
        <button className={`chip${endless ? ' on' : ''}`} onClick={() => onChange(endless ? 1 : 0)}>
          ∞
        </button>
      </div>
    </div>
  )
}

export function RepeatSheet(p: {
  edition: Edition
  repeat: RepeatSettings
  setRepeat: SetState<RepeatSettings>
  selected: number | null
  onStart: (r: RepeatSettings) => void
  onClose: () => void
}) {
  const all = verseRange(p.edition)
  const anchor = p.selected ?? all.from
  const [r, setR] = useState<RepeatSettings>(() => ({
    ...p.repeat,
    from: p.repeat.from >= all.from && p.repeat.from <= all.to ? p.repeat.from : anchor,
    to: p.repeat.to >= all.from && p.repeat.to <= all.to ? p.repeat.to : Math.min(anchor + 4, all.to),
    sectionId: p.edition.sections.some((s) => s.id === p.repeat.sectionId)
      ? p.repeat.sectionId
      : (sectionOf(p.edition, anchor)?.id ?? 0),
  }))
  const set = (patch: Partial<RepeatSettings>) => setR((x) => ({ ...x, ...patch }))
  const clamp = (n: number) => Math.min(all.to, Math.max(all.from, n || all.from))

  return (
    <Sheet title="التكرار" onClose={p.onClose}>
      <div className="seg">
        {(
          [
            ['verse', `البيت ${toArabicDigits(anchor)}`],
            ['range', 'نطاق'],
            ['section', 'باب'],
            ['all', 'الكل'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} className={r.scope === k ? 'on' : ''} onClick={() => set({ scope: k })}>
            {label}
          </button>
        ))}
      </div>
      {r.scope === 'range' && (
        <div className="group">
          <label className="field-row">
            <span>من البيت</span>
            <input type="number" inputMode="numeric" min={all.from} max={all.to} value={r.from} onChange={(e) => set({ from: +e.target.value })} onBlur={() => set({ from: clamp(r.from) })} />
          </label>
          <label className="field-row">
            <span>إلى البيت</span>
            <input type="number" inputMode="numeric" min={all.from} max={all.to} value={r.to} onChange={(e) => set({ to: +e.target.value })} onBlur={() => set({ to: clamp(r.to) })} />
          </label>
        </div>
      )}
      {r.scope === 'section' && (
        <select value={r.sectionId} onChange={(e) => set({ sectionId: +e.target.value })}>
          {p.edition.sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({toArabicDigits(s.start)}–{toArabicDigits(s.end)})
            </option>
          ))}
        </select>
      )}
      <div className="group">
        <Count label="تكرار كل بيت" value={r.verseTimes} onChange={(v) => set({ verseTimes: v })} />
        {r.scope !== 'verse' && <Count label="تكرار النطاق كله" value={r.rangeTimes} onChange={(v) => set({ rangeTimes: v })} />}
        <label className="field-row">
          <span>مهلة بين التكرارات</span>
          <span className="slider">
            <input type="range" min={0} max={15} step={1} value={r.pause} onChange={(e) => set({ pause: +e.target.value })} />
            <output>{toArabicDigits(r.pause)} ث</output>
          </span>
        </label>
      </div>
      <button
        className="btn wide"
        onClick={() => {
          const final = { ...r, from: clamp(r.from), to: clamp(r.to) }
          p.setRepeat(final)
          p.onStart(final)
        }}
      >
        <Play size={18} /> ابدأ
      </button>
    </Sheet>
  )
}

/** Quick display options from the reader's Aa button. */
export function DisplaySheet(p: { settings: Settings; setSettings: SetState<Settings>; onClose: () => void }) {
  return (
    <Sheet title="العرض" onClose={p.onClose}>
      <div className="group">
        <ThemeField {...p} />
        <FontField {...p} />
        <FontSizeField {...p} />
      </div>
    </Sheet>
  )
}
