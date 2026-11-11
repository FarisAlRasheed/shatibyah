// The «أ» panel: every choice about how the verses look, with real verses above the controls
// that change as you choose. The page behind stays undimmed for the same reason.
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { DEFAULT_HALF_EM, type Fits } from './kashida'
import { VerseSample } from './Reader'
import { ColorsField, FontField, ThemeField } from './screens'
import { Sheet, type SetState } from './sheets'
import type { Settings, VerseLayout } from './store'
import type { Edition, EditionColors } from './types'
import { clampSize, DEFAULT_SIZE, sizeLimits } from './zoom'

const LAYOUTS: [VerseLayout, string][] = [
  ['auto', 'تلقائي'],
  ['side', 'متقابلان'],
  ['stack', 'متتابعان'],
]
const NUMBERS: [Settings['numberStyle'], string][] = [
  ['circle', 'دائرة'],
  ['plain', 'رقم فقط'],
]
const SPACING = { min: 1.6, max: 2.6, step: 0.05 }

/** What «استعادة الافتراضي» puts back (the look only; edition, reciter and extras are kept). */
export const DEFAULT_LOOK: Pick<Settings, 'theme' | 'font' | 'fontSize' | 'lineHeight' | 'layout' | 'kashida' | 'colors' | 'memorizeColors' | 'numberStyle'> = {
  theme: 'auto',
  font: 'amiri',
  fontSize: DEFAULT_SIZE,
  lineHeight: 1.95,
  layout: 'auto',
  kashida: true,
  colors: true,
  memorizeColors: false,
  numberStyle: 'circle',
}

export default function LookPanel(p: {
  settings: Settings
  setSettings: SetState<Settings>
  edition: Edition
  colors: EditionColors | null
  fits: Fits | null
  /** The verse the reader is at: the sample shows it and the next one. */
  verse: number
  onClose: () => void
}) {
  const { settings: s, setSettings } = p
  const set = (patch: Partial<Settings>) => setSettings((x) => ({ ...x, ...patch }))
  // Same limits as the reader, from the reader's own width.
  const room = (document.querySelector('main.reader')?.clientWidth ?? innerWidth) - 20
  const limits = sizeLimits(room, p.fits?.width ?? DEFAULT_HALF_EM, s.layout)
  const size = clampSize(s.fontSize, limits)

  return (
    <Sheet
      title="المظهر"
      onClose={p.onClose}
      clear
      pinned={
        <div className="look-sample">
          <VerseSample
            edition={p.edition}
            from={p.verse}
            count={2}
            colors={s.colors ? p.colors : null}
            fits={p.fits}
            fontSize={s.fontSize}
            layout={s.layout}
          />
        </div>
      }
    >
      <div className="group">
        <ThemeField {...p} />
        <FontField {...p} />
        <div className="field-row">
          <span>حجم الخط</span>
          <div className="stepper">
            <button disabled={size <= limits.min} onClick={() => set({ fontSize: Math.max(limits.min, size - 1) })} aria-label="تصغير الخط">
              <Minus size={18} />
            </button>
            <output>{toArabicDigits(Math.round(size))}</output>
            <button disabled={size >= limits.max} onClick={() => set({ fontSize: Math.min(limits.max, size + 1) })} aria-label="تكبير الخط">
              <Plus size={18} />
            </button>
          </div>
        </div>
        <p className="field-note">يمكنك أيضًا تكبير الأبيات وتصغيرها بإصبعين على الصفحة.</p>
        <label className="field-row">
          <span>تباعد الأسطر</span>
          <span className="slider">
            <input
              type="range"
              min={SPACING.min}
              max={SPACING.max}
              step={SPACING.step}
              value={s.lineHeight}
              onChange={(e) => set({ lineHeight: +e.target.value })}
            />
          </span>
        </label>
      </div>

      <div className="group">
        <div className="field-col">
          <span>ترتيب الشطرين</span>
          <div className="seg">
            {LAYOUTS.map(([k, label]) => (
              <button key={k} className={s.layout === k ? 'on' : ''} onClick={() => set({ layout: k })}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="field-row">
          <span className="list-main">
            توحيد عرض الأشطر
            <small className="muted">تُمدّ الأشطر القصيرة بالكشيدة لتستوي الحواف كما في المطبوع</small>
          </span>
          <input type="checkbox" className="switch" checked={s.kashida} onChange={(e) => set({ kashida: e.target.checked })} />
        </label>
        <div className="field-col">
          <span>رقم البيت</span>
          <div className="seg">
            {NUMBERS.map(([k, label]) => (
              <button key={k} className={s.numberStyle === k ? 'on' : ''} onClick={() => set({ numberStyle: k })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {p.colors && (
        <div className="group">
          <ColorsField {...p} />
        </div>
      )}

      <button className="btn secondary wide" onClick={() => set(DEFAULT_LOOK)}>
        <RotateCcw size={18} /> استعادة الافتراضي
      </button>
    </Sheet>
  )
}
