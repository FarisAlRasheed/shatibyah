import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronLeft, Download, Search, Trash2 } from 'lucide-react'
import { normalize, toArabicDigits, toLatinDigits } from './arabic'
import { APP_VERSION } from './config'
import { audioUrl, verseRange } from './data'
import { download, formatMB, isDownloaded, offlineSupported, remove } from './offline'
import type { Bookmarks, Mastered, Notes, Settings, Theme, VerseFont } from './store'
import type { Edition, Manifest, Reciter } from './types'
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
}) {
  const [view, setView] = useState<IndexView>('sections')
  const counts = {
    bookmarks: Object.keys(p.bookmarks).length,
    notes: Object.values(p.notes).filter((t) => t.trim()).length,
    mastered: Object.keys(p.mastered).length,
  }
  const views: [IndexView, string][] = [
    ['sections', 'الأبواب'],
    ['bookmarks', `العلامات ${toArabicDigits(counts.bookmarks)}`],
    ['notes', `الملاحظات ${toArabicDigits(counts.notes)}`],
    ['mastered', `المتقَن ${toArabicDigits(counts.mastered)}`],
  ]
  return (
    <Screen title="الفهرس">
      <div className="seg">
        {views.map(([k, label]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>
            {label}
          </button>
        ))}
      </div>
      {view === 'sections' ? (
        <>
          <PilotNote edition={p.edition} />
          <ul className="group list">
            {p.edition.sections.map((s) => {
              const here = p.current != null && s.start <= p.current && p.current <= s.end
              return (
                <li key={s.id} className={s.parent != null ? 'child' : ''}>
                  <button onClick={() => p.onJump(s.start)}>
                    <span className="list-title">
                      {s.title}
                      {here && <span className="here">أنت هنا</span>}
                    </span>
                    <small>
                      {toArabicDigits(s.start)}–{toArabicDigits(s.end)}
                    </small>
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

export function SearchScreen({ edition, onJump }: { edition: Edition; onJump: (n: number) => void }) {
  const [q, setQ] = useState('')
  const index = useMemo(() => edition.verses.map((v) => ({ v, text: normalize(`${v.a} ${v.b}`) })), [edition])
  const query = normalize(toLatinDigits(q))
  const num = /^\d+$/.test(query) ? +query : null
  const all = verseRange(edition)

  const sections = query && num == null ? edition.sections.filter((s) => normalize(s.title).includes(query)) : []
  const verses = query && num == null ? index.filter((x) => x.text.includes(query)).slice(0, 100) : []

  return (
    <Screen title="البحث">
      <label className="search-box">
        <Search size={18} />
        <input
          type="search"
          placeholder="كلمة، أو رقم بيت، أو اسم باب"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && num != null && num >= all.from && num <= all.to && onJump(num)}
        />
      </label>
      {num != null &&
        (num >= all.from && num <= all.to ? (
          <button className="result" onClick={() => onJump(num)}>
            <VersePreview edition={edition} n={num} />
          </button>
        ) : (
          <p className="muted">البيت {toArabicDigits(num)} غير موجود في هذه النسخة{edition.partial ? ' التجريبية' : ''}.</p>
        ))}
      {sections.map((s) => (
        <button key={s.id} className="result" onClick={() => onJump(s.start)}>
          <strong>{s.title}</strong>
        </button>
      ))}
      {verses.length > 0 && <p className="muted">{toArabicDigits(verses.length)} نتيجة</p>}
      {verses.map(({ v }) => (
        <button key={v.n} className="result" onClick={() => onJump(v.n)}>
          <VersePreview edition={edition} n={v.n} />
        </button>
      ))}
      {query && num == null && !sections.length && !verses.length && <p className="muted">لا نتائج.</p>}
      {!query && <p className="muted center">ابحث دون تشكيل، مثل: وانجلى، أو اكتب رقم البيت.</p>}
    </Screen>
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
          <p className="muted center">لا توجد علامات. اضغط على بيت ثم «علامة».</p>
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
          <p className="muted center">لا توجد ملاحظات.</p>
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

export function FontSizeField({ settings, setSettings }: FieldProps) {
  return (
    <label className="field-row">
      <span>حجم الخط</span>
      <span className="slider">
        <small>ا</small>
        <input type="range" min={18} max={44} value={settings.fontSize} onChange={(e) => setSettings((s) => ({ ...s, fontSize: +e.target.value }))} />
        <span style={{ fontSize: 22 }}>ا</span>
      </span>
    </label>
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

export function SettingsScreen(p: FieldProps & {
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
        <label className="field-row">
          <span>النسخة</span>
          <select value={p.editionId} onChange={(e) => setSettings((x) => ({ ...x, editionId: e.target.value }))}>
            {p.manifest.editions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name.replace(/^متن الشاطبية — (نسخة )?/, '')}
              </option>
            ))}
          </select>
        </label>
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
        <ThemeField {...p} />
        <FontField {...p} />
        <FontSizeField {...p} />
        <label className="field-row">
          <span>متابعة البيت المقروء</span>
          <input type="checkbox" className="switch" checked={s.autoScroll} onChange={(e) => setSettings((x) => ({ ...x, autoScroll: e.target.checked }))} />
        </label>
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
            التلاوة: {p.reciter.name} —{' '}
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
