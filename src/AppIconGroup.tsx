import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { APP_ICONS, AUTO_ICON, appIconPlugin } from './appIcon'

/**
 * الإعدادات ← أيقونة التطبيق: pick the home-screen icon. Shown only in the iOS app.
 * The current icon is read from iOS, not stored by the app, so it is always what the phone shows.
 */
export default function AppIconGroup() {
  const [current, setCurrent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    appIconPlugin().then((p) =>
      p?.get().then((r) => r.supported && setCurrent(r.name)).catch(() => {}),
    )
  }, [])
  if (current === null) return null

  const pick = async (name: string) => {
    if (name === current) return
    const p = await appIconPlugin()
    if (!p) return
    try {
      await p.set({ name })
      setCurrent(name)
      setError(false)
    } catch {
      setError(true)
    }
  }

  return (
    <>
      <h2 className="group-title">أيقونة التطبيق</h2>
      <div className="group icon-picker" role="radiogroup" aria-label="أيقونة التطبيق">
        <button className="icon-choice" role="radio" aria-checked={current === ''} onClick={() => pick('')}>
          <span className="icon-thumb auto">
            <img src={AUTO_ICON.light} alt="" />
            <img src={AUTO_ICON.dark} alt="" />
          </span>
          <span>تلقائي</span>
          {current === '' && <Check size={16} className="check" />}
        </button>
        {APP_ICONS.map((i) => (
          <button key={i.name} className="icon-choice" role="radio" aria-checked={current === i.name} onClick={() => pick(i.name)}>
            <span className="icon-thumb">
              <img src={i.preview} alt="" />
            </span>
            <span>{i.label}</span>
            {current === i.name && <Check size={16} className="check" />}
          </button>
        ))}
      </div>
      <p className="muted group-note">
        {error ? 'تعذّر تغيير الأيقونة، حاول مرة أخرى.' : '«تلقائي» أخضر على عاجي في الوضع الفاتح، وذهبي على أخضر في الوضع الداكن.'}
      </p>
    </>
  )
}
