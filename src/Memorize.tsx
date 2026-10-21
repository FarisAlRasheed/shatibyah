import { useEffect, useState } from 'react'
import { Check, ChevronDown, Eye, EyeOff, Hourglass, Loader2, Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward, Square, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { useSwipe } from './gestures'
import { sectionOf } from './data'
import type { PlayState } from './player'
import type { HideMode, Mastered, RepeatSettings } from './store'
import type { Edition } from './types'

const SPEEDS = [0.75, 0.9, 1, 1.1, 1.25, 1.5]
const HIDE: [HideMode, string][] = [
  ['none', 'إظهار الكل'],
  ['b', 'إخفاء العجز'],
  ['all', 'إخفاء البيت'],
]
const times = (n: number) => (n === 0 ? '∞' : toArabicDigits(n))

interface Props {
  edition: Edition
  state: PlayState
  verse: number
  repeat: RepeatSettings
  hide: HideMode
  mastered: Mastered
  canPlay: boolean
  onHide: (h: HideMode) => void
  onClose: () => void
  onPlay: () => void
  onStep: (d: 1 | -1) => void
  onStop: () => void
  onReplay: () => void
  onOpenRepeat: () => void
  onSpeed: (s: number) => void
  onMastered: (n: number, yes: boolean) => void
}

export default function Memorize(p: Props) {
  const s = p.state
  const active = s.status !== 'idle'
  const playing = s.status === 'playing' || s.status === 'gap' || s.status === 'loading'
  const v = p.edition.verses.find((x) => x.n === p.verse)
  const section = sectionOf(p.edition, p.verse)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => setRevealed(false), [p.verse, p.hide])

  // Pull down to close; swipe sideways to change verse (RTL: finger moving right = next, like turning a page).
  const [slide, setSlide] = useState<'' | 'slide-next' | 'slide-prev'>('')
  const swipeRef = useSwipe<HTMLDivElement>({
    onDismiss: p.onClose,
    onSwipe: (dir) => {
      const d = dir === 'right' ? 1 : -1
      setSlide(d === 1 ? 'slide-next' : 'slide-prev')
      p.onStep(d)
    },
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && p.onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p])

  const hideA = p.hide === 'all' && !revealed
  const hideB = p.hide !== 'none' && !revealed
  const testing = p.hide !== 'none'
  const nextSpeed = SPEEDS[(SPEEDS.indexOf(p.repeat.speed) + 1) % SPEEDS.length] ?? 1

  return (
    <div className="memorize" role="dialog" aria-label="وضع الحفظ" ref={swipeRef}>
      <header className="mem-top">
        <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
          <ChevronDown size={26} />
        </button>
        <span>{testing ? 'اختبر نفسك' : 'وضع الحفظ'}</span>
        <button
          className={`icon-btn${testing ? ' on' : ''}`}
          onClick={() => p.onHide(testing ? 'none' : 'b')}
          aria-label={testing ? 'إظهار النص' : 'اختبر نفسك'}
        >
          {testing ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </header>

      {testing && (
        <div className="chips">
          {HIDE.map(([k, label]) => (
            <button key={k} className={`chip${p.hide === k ? ' on' : ''}`} onClick={() => p.onHide(k)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="mem-kicker">
        {section?.title} · البيت {toArabicDigits(p.verse)}
      </p>

      <div
        key={p.verse}
        className={`mem-verse verse-text ${slide}`}
        onAnimationEnd={() => setSlide('')}
        onClick={() => testing && setRevealed(true)}
      >
        {hideA ? <HiddenHalf label="اضغط لإظهار الصدر" /> : <p>{v?.a}</p>}
        {hideB ? <HiddenHalf label={hideA ? 'والعجز' : 'اضغط لإظهار العجز'} /> : <p>{v?.b}</p>}
      </div>

      {testing ? (
        <div className="grade">
          <button
            onClick={() => {
              p.onMastered(p.verse, false)
              setRevealed(true)
              p.onReplay()
            }}
          >
            <RotateCcw size={18} /> لم أتقنه
          </button>
          <button className="yes" onClick={() => p.onMastered(p.verse, true)}>
            <Check size={18} /> أتقنته
          </button>
        </div>
      ) : (
        <div className="counters" aria-live="polite">
          <div>
            <strong>
              {toArabicDigits(s.verseRound)}
              <small>/{times(active ? s.verseTimes : p.repeat.verseTimes)}</small>
            </strong>
            <span>المرة</span>
          </div>
          {(active ? s.rangeTimes !== 1 : p.repeat.scope !== 'verse' && p.repeat.rangeTimes !== 1) && (
            <div>
              <strong>
                {toArabicDigits(s.rangeRound)}
                <small>/{times(active ? s.rangeTimes : p.repeat.rangeTimes)}</small>
              </strong>
              <span>الدورة</span>
            </div>
          )}
          {active && s.total > 1 && (
            <div>
              <strong>
                {toArabicDigits(s.index + 1)}
                <small>/{toArabicDigits(s.total)}</small>
              </strong>
              <span>البيت</span>
            </div>
          )}
        </div>
      )}

      {active && s.total > 1 && (
        <div className="mem-progress">
          <div style={{ width: `${((s.index + 1) / s.total) * 100}%` }} />
        </div>
      )}
      {s.error && <p className="err center">{s.error}</p>}

      <div className="mem-controls">
        <button className="icon-btn" onClick={() => p.onStep(-1)} aria-label="البيت السابق">
          <SkipForward size={28} />
        </button>
        <button className="play-big" onClick={p.onPlay} disabled={!p.canPlay} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
          {s.status === 'loading' ? <Loader2 size={32} className="spin" /> : playing ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button className="icon-btn" onClick={() => p.onStep(1)} aria-label="البيت التالي">
          <SkipBack size={28} />
        </button>
      </div>

      <div className="mem-tools">
        <button onClick={p.onOpenRepeat}>
          <Repeat size={18} />
          <span>التكرار</span>
        </button>
        <button onClick={() => p.onSpeed(nextSpeed)}>
          <strong>{p.repeat.speed}×</strong>
          <span>السرعة</span>
        </button>
        <button onClick={p.onOpenRepeat}>
          <Hourglass size={18} />
          <span>مهلة {toArabicDigits(p.repeat.pause)}ث</span>
        </button>
        <button onClick={p.onStop} disabled={!active}>
          {active ? <Square size={18} /> : <X size={18} />}
          <span>إيقاف</span>
        </button>
      </div>
    </div>
  )
}

function HiddenHalf({ label }: { label: string }) {
  return <p className="hidden-half">{label}</p>
}
