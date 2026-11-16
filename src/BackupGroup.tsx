import { useMemo, useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { hasUserData, makeBackup, parseBackup, restoreBackup, saveBackupFile, summarize, type Backup } from './backup'
import { useStored } from './store'

/** Days without a backup after which the group reminds the user. */
const REMIND_DAYS = 30
const DAY = 86_400_000

const dateFmt = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' })
const formatDate = (at: number) => toArabicDigits(dateFmt.format(new Date(at)))

/** «٣ ملاحظات»-style count lines for what a backup holds. */
function contents(b: Backup): string[] {
  const s = summarize(b)
  const n = (v: number, label: string) => (v > 0 ? `${label}: ${toArabicDigits(v)}` : null)
  return [
    n(s.notes, 'الملاحظات'),
    n(s.bookmarks, 'العلامات'),
    n(s.mastered, 'الأبيات المتقَنة'),
    n(s.weak, 'الأبيات الضعيفة'),
    n(s.sessions, 'جلسات التسميع'),
    n(s.sketches, 'الرسوم'),
    n(s.highlights, 'تظليلات الشرح'),
    s.plan ? 'خطة الحفظ وسجلّها' : null,
    s.settings ? 'الإعدادات' : null,
  ].filter((x): x is string => x != null)
}

/** الإعدادات ← النسخ الاحتياطي: save everything to a file, and bring a file back (replace or merge). */
export default function BackupGroup() {
  const [info, setInfo] = useStored<{ at: number }>('backupInfo', { at: 0 })
  const [picked, setPicked] = useState<Backup | null>(null)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const hasData = useMemo(hasUserData, [])
  const overdue = hasData && Date.now() - info.at > REMIND_DAYS * DAY

  const save = async () => {
    setErr('')
    try {
      const b = makeBackup()
      if (await saveBackupFile(b)) setInfo({ at: b.at })
    } catch (e) {
      setErr(`تعذّر حفظ النسخة: ${e instanceof Error ? e.message : e}`)
    }
  }

  const pick = async (file: File | undefined) => {
    setErr('')
    setPicked(null)
    if (!file) return
    try {
      setPicked(parseBackup(await file.text()))
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    }
  }

  const restore = (mode: 'replace' | 'merge') => {
    if (!picked) return
    try {
      restoreBackup(picked, mode)
      location.reload()
    } catch (e) {
      setErr(`تعذّرت الاستعادة: ${e instanceof Error ? e.message : e}`)
    }
  }

  const lines = picked ? contents(picked) : []

  return (
    <>
      <h2 className="group-title">النسخ الاحتياطي</h2>
      <div className="group backup">
        <div className="backup-info">
          <p>ملاحظاتك وعلاماتك وتقدّمك في الحفظ وخطتك محفوظة على هذا الجهاز فقط. احفظ نسخة منها في ملف لتستعيدها إن حُذفت أو لتنقلها إلى جهاز آخر.</p>
          <p className={overdue ? 'backup-due' : 'muted'}>
            {info.at ? `آخر نسخة: ${formatDate(info.at)}` : 'لم تُحفظ نسخة بعد.'}
            {overdue && info.at > 0 && ` · مضى أكثر من ${toArabicDigits(REMIND_DAYS)} يومًا`}
          </p>
          <div className="row">
            <button className="btn" onClick={save}>
              <Download size={18} /> حفظ نسخة
            </button>
            <button className="btn secondary" onClick={() => input.current?.click()}>
              <Upload size={18} /> استعادة
            </button>
          </div>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              void pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {err && <p className="err">{err}</p>}
        </div>

        {picked && (
          <div className="backup-info" role="group" aria-label="استعادة النسخة">
            <p>
              <strong>{picked.at ? `نسخة ${formatDate(picked.at)}` : 'نسخة احتياطية'}</strong>
            </p>
            {lines.length > 0 ? (
              <ul className="backup-list">
                {lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">هذه النسخة فارغة.</p>
            )}
            <p className="muted">
              «دمج» يضيف ما في النسخة إلى ما على هذا الجهاز ولا يحذف شيئًا، وتبقى خطتك وإعداداتك الحالية. «استبدال» يحذف ما على هذا الجهاز ويضع
              النسخة مكانه.
            </p>
            <div className="row">
              <button className="btn" onClick={() => restore('merge')} disabled={lines.length === 0}>
                دمج
              </button>
              <button className="btn danger" onClick={() => restore('replace')} disabled={lines.length === 0}>
                استبدال
              </button>
              <button className="btn secondary" onClick={() => setPicked(null)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
