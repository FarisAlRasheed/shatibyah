import { useEffect, useState, type ReactNode } from 'react'
import { BookOpen, Bookmark, Check, ChevronLeft, Download, FileText, GraduationCap, NotebookPen, Trash2 } from 'lucide-react'
import { toArabicDigits, toLatinDigits } from './arabic'
import { APP_VERSION } from './config'
import { audioUrl, sectionOf, verseRange } from './data'
import { download, formatMB, isDownloaded, offlineSupported, remove } from './offline'
import type { Bookmarks, Mastered, Notes, Settings, Theme, VerseFont } from './store'
import { matchRanges } from './search'
import type { Edition, Manifest, PrintedPage, Reciter, Verse } from './types'
import { VersePreview, type SetState } from './sheets'

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="screen">
      <h1 className="large-title">{title}</h1>
      {children}
    </section>
  )
}

function PilotNote({ edition }: { edition: Edition }) {
  if (!edition.partial) return null
  return (
    <p className="pilot-note">
      نسخة تجريبية: الأبيات {toArabicDigits(edition.partial.from)}–{toArabicDigits(edition.partial.to)} فقط
    </p>
  )
}

type IndexView = 'sections' | 'bookmarks' | 'notes' | 'mastered'

/** الفهرس: chapters plus the user's bookmarks, notes and mastered verses. */
export function IndexScreen(p: {
  edition: Edition
  current: number | null
  notes: Notes
  bookmarks: Bookmarks
  mastered: Mastered
  setBookmarks: SetState<Bookmarks>
  onJump: (n: number) => void
  /** Printed pages, for «الانتقال إلى صفحة»; null hides it. */
  pages?: PrintedPage[] | null
}) {
  const [view, setView] = useState<IndexView>('sections')
  const counts = {
    bookmarks: Object.keys(p.bookmarks).length,
    notes: Object.values(p.notes).filter((t) => t.trim()).length,
    mastered: Object.keys(p.mastered).length,
  }
  const views: [IndexView, string, number?][] = [
    ['sections', 'الأبواب'],
    ['bookmarks', 'العلامات', counts.bookmarks],
    ['notes', 'الملاحظات', counts.notes],
    ['mastered', 'المتقَن', counts.mastered],
  ]
  const here = p.current != null ? sectionOf(p.edition, p.current) : undefined
  const resume = p.current != null ? p.edition.verses.find((v) => v.n === p.current) : undefined
  return (
    <Screen title="الفهرس">
      {resume && (
        <button className="resume-card" onClick={() => p.onJump(resume.n)}>
          <span className="resume-icon">
            <BookOpen size={22} />
          </span>
          <span className="resume-text">
            <small>تابع من حيث توقفت</small>
            <strong>
              {here?.title}
              <span className="resume-n"> · البيت {toArabicDigits(resume.n)}</span>
            </strong>
            <span className="verse-text resume-verse">{resume.a}</span>
          </span>
          <ChevronLeft size={20} className="chev" />
        </button>
      )}
      <div className="seg">
        {views.map(([k, label, n]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
            {label}
            {!!n && <span className="seg-count">{toArabicDigits(n)}</span>}
          </button>
        ))}
      </div>
      {view === 'sections' ? (
        <>
          <PilotNote edition={p.edition} />
          {p.pages && p.pages.length > 0 && <PageJump pages={p.pages} onJump={p.onJump} />}
          <ul className="group list">
            {p.edition.sections.map((s) => {
              const isHere = here?.id === s.id
              const ns = p.edition.verses.filter((v) => v.n >= s.start && v.n <= s.end)
              const done = ns.filter((v) => p.mastered[v.n]).length
              return (
                <li key={s.id} className={s.parent != null ? 'child' : ''}>
                  <button onClick={() => p.onJump(s.start)}>
                    <span className="list-main">
                      <span className="list-title">
                        <span className="verse-text section-title">{s.title}</span>
                        {isHere && <span className="here">أنت هنا</span>}
                      </span>
                      <small>
                        الأبيات {toArabicDigits(s.start)}–{toArabicDigits(s.end)}
                        {done > 0 && ` · أتقنت ${toArabicDigits(done)} من ${toArabicDigits(ns.length)}`}
                      </small>
                    </span>
                    <ProgressRing value={ns.length ? done / ns.length : 0} />
                    <ChevronLeft size={18} className="chev" />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <SavedLists {...p} view={view} />
      )}
    </Screen>
  )
}

/** «الانتقال إلى صفحة»: a page number of the printed edition, in either kind of digits. */
function PageJump({ pages, onJump }: { pages: PrintedPage[]; onJump: (n: number) => void }) {
  const [q, setQ] = useState('')
  const [bad, setBad] = useState(false)
  const first = pages[0].page
  const last = pages[pages.length - 1].page
  const go = () => {
    const n = +toLatinDigits(q).replace(/[^0-9]/g, '')
    const pg = pages.find((x) => x.page === n)
    setBad(!pg)
    if (pg) onJump(pg.from)
  }
  return (
    <form
      className="group page-jump"
      onSubmit={(e) => {
        e.preventDefault()
        go()
      }}
    >
      <label className="field-row">
        <span className="list-main">
          <span>
            <FileText size={16} className="pj-icon" /> الانتقال إلى صفحة من المطبوع
          </span>
          <small className={bad ? 'err' : 'muted'}>
            {bad ? 'لا توجد صفحة بهذا الرقم' : `من ${toArabicDigits(first)} إلى ${toArabicDigits(last)}`}
          </small>
        </span>
        <input
          className="num-field"
          type="text"
          inputMode="numeric"
          enterKeyHint="go"
          autoComplete="off"
          aria-label="رقم الصفحة"
          value={toArabicDigits(q)}
          onChange={(e) => {
            setBad(false)
            setQ(toLatinDigits(e.target.value).replace(/[^0-9]/g, '').slice(0, 4))
          }}
        />
        <button type="submit" className="btn pj-go" disabled={!q}>
          انتقل
        </button>
      </label>
    </form>
  )
}

/** Small mastery ring for a chapter row; a check when the whole chapter is mastered. */
function ProgressRing({ value }: { value: number }) {
  const r = 9
  const c = 2 * Math.PI * r
  const full = value >= 1
  return (
    <span className={`mini-ring${full ? ' full' : ''}`} aria-label={`أتقنت ${toArabicDigits(Math.round(value * 100))}٪`}>
      {full ? (
        <Check size={14} strokeWidth={3} />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r={r} className="mini-ring-track" />
          <circle
            cx="12"
            cy="12"
            r={r}
            className="mini-ring-fill"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - value)}
            transform="rotate(-90 12 12)"
          />
        </svg>
      )}
    </span>
  )
}

export function Highlight({ text, ranges }: { text: string; ranges: [number, number][] }) {
  const parts: ReactNode[] = []
  let at = 0
  for (const [a, b] of ranges) {
    if (a > at) parts.push(text.slice(at, a))
    parts.push(<mark key={a}>{text.slice(a, b)}</mark>)
    at = b
  }
  parts.push(text.slice(at))
  return <>{parts}</>
}

/** A search result: the verse with the matched words marked. */
export function VerseHit({ v, re }: { v: Verse; re: RegExp }) {
  const half = (s: string) => <Highlight text={s} ranges={matchRanges(re, s)} />
  return (
    <div className="preview">
      <span className="vnum small">{toArabicDigits(v.n)}</span>
      <span className="verse-text">
        {half(v.a)} <span className="sep">...</span> {half(v.b)}
      </span>
    </div>
  )
}

/** A quiet centred message for empty lists. */
export function Empty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <p>{children}</p>
    </div>
  )
}

function SavedLists(p: {
  view: Exclude<IndexView, 'sections'>
  edition: Edition
  notes: Notes
  bookmarks: Bookmarks
  mastered: Mastered
  setBookmarks: SetState<Bookmarks>
  onJump: (n: number) => void
}) {
  const tab = p.view
  const marks = Object.entries(p.bookmarks).sort((a, b) => +a[0] - +b[0])
  const notes = Object.entries(p.notes).filter(([, t]) => t.trim()).sort((a, b) => +a[0] - +b[0])
  const done = Object.keys(p.mastered).map(Number).sort((a, b) => a - b)
  const { from, to } = verseRange(p.edition)
  const total = to - from + 1
  const doneHere = done.filter((n) => n >= from && n <= to).length
  return (
    <>
  {tab === 'bookmarks' &&
        (marks.length ? (
          marks.map(([n, b]) => (
            <div key={n} className="saved-item">
              <button className="result" onClick={() => p.onJump(+n)}>
                <VersePreview edition={p.edition} n={+n} />
              </button>
              <input
                placeholder="عنوان (اختياري)"
                value={b.label}
                onChange={(e) => p.setBookmarks((all) => ({ ...all, [n]: { ...b, label: e.target.value } }))}
              />
            </div>
          ))
        ) : (
          <Empty icon={<Bookmark size={26} />}>لا توجد علامات بعد. اضغط على بيت في القراءة ثم «علامة».</Empty>
        ))}
      {tab === 'notes' &&
        (notes.length ? (
          notes.map(([n, t]) => (
            <button key={n} className="result" onClick={() => p.onJump(+n)}>
              <VersePreview edition={p.edition} n={+n} />
              <p className="note-text">{t}</p>
            </button>
          ))
        ) : (
          <Empty icon={<NotebookPen size={26} />}>لا توجد ملاحظات بعد. اضغط على بيت ثم «ملاحظة».</Empty>
        ))}
      {tab === 'mastered' && (
        <>
          <div className="progress-card">
            <strong>
              {toArabicDigits(doneHere)} <small>من {toArabicDigits(total)}</small>
            </strong>
            <div className="bar">
              <div style={{ width: `${(doneHere / total) * 100}%` }} />
            </div>
            <span className="muted">أبيات علّمتها «أتقنته» في وضع «اختبر نفسك»</span>
          </div>
          {!done.length && <Empty icon={<GraduationCap size={26} />}>لم تُتقن أبياتًا بعد. افتح «وضع الحفظ» ثم «اختبر نفسك».</Empty>}
          {done.map((n) => (
            <button key={n} className="result" onClick={() => p.onJump(n)}>
              <VersePreview edition={p.edition} n={n} />
            </button>
          ))}
        </>
      )}
    </>
  )
}

const THEMES: [Theme, string][] = [
  ['auto', 'تلقائي'],
  ['light', 'فاتح'],
  ['sepia', 'ورقي'],
  ['dark', 'داكن'],
]
const FONTS: [VerseFont, string][] = [
  ['amiri', 'أميري'],
  ['scheherazade', 'شهرزاد'],
  ['naskh', 'نسخ'],
]

type FieldProps = { settings: Settings; setSettings: SetState<Settings> }

export function ThemeField({ settings, setSettings }: FieldProps) {
  return (
    <div className="field-col">
      <span>المظهر</span>
      <div className="seg">
        {THEMES.map(([k, label]) => (
          <button key={k} className={`swatch-${k}${settings.theme === k ? ' on' : ''}`} onClick={() => setSettings((s) => ({ ...s, theme: k }))}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FontField({ settings, setSettings }: FieldProps) {
  return (
    <div className="field-col">
      <span>خط الأبيات</span>
      <div className="seg">
        {FONTS.map(([k, label]) => (
          <button key={k} className={`font-${k}${settings.font === k ? ' on' : ''}`} onClick={() => setSettings((s) => ({ ...s, font: k }))}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Downloads({ edition, reciter }: { edition: Edition; reciter: Reciter }) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [err, setErr] = useState('')
  const files = reciter.files

  useEffect(() => {
    Promise.all(files.map(async (f) => [f.id, await isDownloaded(audioUrl(reciter, f))] as const)).then((r) =>
      setDone(Object.fromEntries(r)),
    )
  }, [reciter]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!offlineSupported()) return <p className="muted">هذا المتصفح لا يدعم التخزين دون اتصال.</p>

  const get = async (id: string) => {
    const f = files.find((x) => x.id === id)!
    setErr('')
    setProgress((p) => ({ ...p, [id]: 0 }))
    try {
      await download(audioUrl(reciter, f), (l, t) => setProgress((p) => ({ ...p, [id]: t ? l / t : 0 })))
      setDone((d) => ({ ...d, [id]: true }))
    } catch (e) {
      setErr(`تعذّر التنزيل: ${e instanceof Error ? e.message : e}`)
    } finally {
      setProgress((p) => {
        const n = { ...p }
        delete n[id]
        return n
      })
    }
  }
  const missing = files.filter((f) => !done[f.id])

  return (
    <>
      <ul className="group list">
        {files.map((f) => {
          const titles = f.sectionIds.map((id) => edition.sections.find((s) => s.id === id)?.title ?? id).join('، ')
          const pr = progress[f.id]
          return (
            <li key={f.id} className="dl-row">
              <span className="list-title">{titles}</span>
              <small>{formatMB(f.bytes)}</small>
              {pr != null ? (
                <progress value={pr} max={1} />
              ) : done[f.id] ? (
                <button
                  className="icon-btn ok"
                  aria-label="حذف التنزيل"
                  onClick={async () => {
                    await remove(audioUrl(reciter, f))
                    setDone((d) => ({ ...d, [f.id]: false }))
                  }}
                >
                  <Check size={18} />
                  <Trash2 size={16} />
                </button>
              ) : (
                <button className="icon-btn" aria-label="تنزيل" onClick={() => get(f.id)}>
                  <Download size={18} />
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {missing.length > 0 && (
        <button className="btn wide secondary" onClick={async () => { for (const f of missing) await get(f.id) }}>
          <Download size={18} /> تنزيل الكل ({formatMB(missing.reduce((s, f) => s + f.bytes, 0))})
        </button>
      )}
      {err && <p className="err">{err}</p>}
    </>
  )
}

/** [«نسخة القاسم», «مع القراءة»]: the editor's family name, and whether a recitation exists. */
function editionLabel(e: { id: string; name: string }, m: Manifest) {
  const who = e.name.replace(/^متن الشاطبية\s*—\s*/, '').trim().split(/\s+/).pop()
  const audio = m.reciters.some((r) => r.editionId === e.id)
  return [`نسخة ${who}`, audio ? 'مع القراءة' : 'نص فقط'] as const
}

/** The printed colours: red reader codes and green Quranic words, tap to explain. */
export function ColorsField({ settings, setSettings }: FieldProps) {
  return (
    <>
      <label className="field-row">
        <span className="list-main">
          ألوان الرموز والكلمات القرآنية
          <small className="muted">اضغط على الكلمة الملوّنة لمعرفة القارئ أو موضعها من القرآن</small>
        </span>
        <input type="checkbox" className="switch" checked={settings.colors} onChange={(e) => setSettings((x) => ({ ...x, colors: e.target.checked }))} />
      </label>
      <label className="field-row">
        <span>الألوان في وضع الحفظ</span>
        <input type="checkbox" className="switch" checked={settings.memorizeColors} onChange={(e) => setSettings((x) => ({ ...x, memorizeColors: e.target.checked }))} />
      </label>
    </>
  )
}

/**
 * Optional extras the user can switch off (الإعدادات ← مزايا إضافية).
 * Add a line here when a new optional feature is built; `settings[key]` is its switch.
 */
export const EXTRAS: [keyof Settings & ('immersive' | 'rail' | 'backPill' | 'curtain' | 'twins' | 'wirdStrip' | 'pageMarks' | 'sidePanel'), string, string][] = [
  ['immersive', 'إخفاء الأشرطة أثناء القراءة', 'تختفي عند النزول في الصفحة وتعود عند الصعود أو اللمس'],
  ['rail', 'شريط التنقل السريع', 'اسحبه على حافة الصفحة للانتقال في المتن كله'],
  ['backPill', 'زر الرجوع بعد الانتقال', 'يعيدك إلى موضعك بعد الانتقال من البحث أو الفهرس'],
  ['curtain', 'ستارة التسميع', 'زر عين في الأعلى يخفي الشطر الثاني من كل بيت لتسمّعه من حفظك'],
  ['twins', 'الأبيات المتشابهة الخواتيم', 'زر «متشابهات» للأبيات التي تنتهي بالكلمة نفسها'],
  ['wirdStrip', 'شريط ورد اليوم', 'سطر أعلى القراءة بورد اليوم من خطة الحفظ، يبدؤه بلمسة'],
  ['pageMarks', 'أرقام صفحات المطبوع', 'خط خفيف حيث تبدأ كل صفحة من الطبعة الورقية، والانتقال إلى صفحة من الفهرس'],
  ['sidePanel', 'اللوحة الجانبية على الشاشات الواسعة', 'تفاصيل البيت المختار بجانب النص: الرموز والكلمات القرآنية والملاحظة'],
]

export function SettingsScreen(p: FieldProps & {
  hasColors: boolean
  /** Open the appearance panel over the reader. */
  onLook: () => void
  manifest: Manifest
  editionId?: string
  reciterId?: string
  reciters: { id: string; name: string }[]
  edition: Edition
  reciter: Reciter | null
}) {
  const { settings: s, setSettings } = p
  return (
    <Screen title="الإعدادات">
      <h2 className="group-title">النص</h2>
      <div className="group">
        {p.manifest.editions.map((e) => {
          const [name, kind] = editionLabel(e, p.manifest)
          const on = e.id === p.editionId
          return (
            <button key={e.id} className="check-row" aria-pressed={on} onClick={() => setSettings((x) => ({ ...x, editionId: e.id }))}>
              <span className="list-title">
                {name}
                <small>{kind}</small>
              </span>
              {on && <Check size={20} className="check" />}
            </button>
          )
        })}
        {p.reciters.length > 0 && (
          <label className="field-row">
            <span>القارئ</span>
            <select value={p.reciterId} onChange={(e) => setSettings((x) => ({ ...x, reciterId: e.target.value }))}>
              {p.reciters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <h2 className="group-title">العرض</h2>
      <div className="group">
        <button className="check-row" onClick={p.onLook}>
          <span className="list-main">
            المظهر والخط
            <small className="muted">الألوان، الخط وحجمه، تباعد الأسطر وترتيب الشطرين، مع معاينة مباشرة</small>
          </span>
          <ChevronLeft size={18} className="chev" />
        </button>
        <label className="field-row">
          <span>متابعة البيت المقروء</span>
          <input type="checkbox" className="switch" checked={s.autoScroll} onChange={(e) => setSettings((x) => ({ ...x, autoScroll: e.target.checked }))} />
        </label>
      </div>

      <h2 className="group-title">مزايا إضافية</h2>
      <div className="group">
        {EXTRAS.map(([key, label, hint]) => (
          <label key={key} className="field-row">
            <span className="list-main">
              {label}
              <small className="muted">{hint}</small>
            </span>
            <input type="checkbox" className="switch" checked={s[key]} onChange={(e) => setSettings((x) => ({ ...x, [key]: e.target.checked }))} />
          </label>
        ))}
      </div>

      {p.reciter && (
        <>
          <h2 className="group-title">الاستماع دون اتصال</h2>
          <Downloads edition={p.edition} reciter={p.reciter} />
        </>
      )}

      <h2 className="group-title">عن التطبيق</h2>
      <div className="group about">
        <p>{p.edition.source}</p>
        {p.reciter && (
          <p>
            القارئ: {p.reciter.name} —{' '}
            <a href={p.reciter.source} target="_blank" rel="noreferrer">
              المصدر
            </a>
          </p>
        )}
        <PilotNote edition={p.edition} />
        <p className="muted">الإصدار {APP_VERSION}. الملاحظات والعلامات تُحفظ على هذا الجهاز فقط.</p>
      </div>
    </Screen>
  )
}
