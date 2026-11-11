import { useEffect, useState } from 'react'
import { Check, ChevronDown, Eraser, Eye, EyeOff, Hourglass, Loader2, Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward, Square, X } from 'lucide-react'
import { toArabicDigits } from './arabic'
import { useSwipe } from './gestures'
import { sectionOf } from './data'
import type { PlayState } from './player'
import type { HideMode, Mastered, RepeatSettings } from './store'
import { fadeShare, HalfText, veilFor, type OpenMark } from './colors'
import type { Edition, EditionColors } from './types'

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
  colors: EditionColors | null // null hides the colours
  onMark: (m: OpenMark) => void
  canPlay: boolean
  onHide: (h: HideMode) => void
  onClose: () => void
  onPlay: () => void
  onStep: (d: 1 | -1) => void
  onStop: () => void
  onReplay: () => void
  onOpenRepeat: () => void
  onSpeed: (s: number) => void
  /** Toggle «إخفاء تدريجي». */
  onFade: () => void
  onMastered: (n: number, yes: boolean) => void
  /** Offer «البيت التالي»: a peek at the first word of the next verse (recitation curtain). */
  peek?: boolean
}

export default function Memorize(p: Props) {
  const s = p.state
  const active = s.status !== 'idle'
  const playing = s.status === 'playing' || s.status === 'gap' || s.status === 'loading'
  const v = p.edition.verses.find((x) => x.n === p.verse)
  const section = sectionOf(p.edition, p.verse)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => setRevealed(false), [p.verse, p.hide, s.verseRound, s.rangeRound])
  const [peeking, setPeeking] = useState(false)
  useEffect(() => setPeeking(false), [p.verse])
  const at = p.edition.verses.findIndex((x) => x.n === p.verse)
  const next = p.peek && at >= 0 ? p.edition.verses[at + 1] : undefined

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
  const marks = p.colors?.verses[p.verse] ?? []
  // «إخفاء تدريجي»: with each repetition more of the verse is veiled; a tap shows it again.
  const share = !testing && p.repeat.fade && active ? fadeShare(s) : 0
  const half = (h: 'a' | 'b') => (
    <HalfText text={v?.[h] ?? ''} marks={marks.filter((m) => m.h === h)} onMark={p.onMark} veil={revealed ? undefined : veilFor(v?.[h] ?? '', share)} />
  )
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
        onClick={() => (testing || share > 0) && setRevealed(true)}
      >
        {hideA ? <HiddenHalf label="اضغط لإظهار الصدر" /> : <p>{half('a')}</p>}
        {hideB ? <HiddenHalf label={hideA ? 'والعجز' : 'اضغط لإظهار العجز'} /> : <p>{half('b')}</p>}
      </div>

      {next && (
        <button className={`mem-peek${peeking ? ' on' : ''}`} onClick={() => setPeeking((x) => !x)} aria-expanded={peeking}>
          {peeking ? (
            <>
              البيت التالي يبدأ بـ <span className="verse-text">«{next.a.trim().split(/\s+/)[0]} …»</span>
            </>
          ) : (
            <>
              <Eye size={16} /> البيت التالي
            </>
          )}
        </button>
      )}

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
          {active && s.total > 1 && s.stages === 1 && (
            <div>
              <strong>
                {toArabicDigits(s.index + 1)}
                <small>/{toArabicDigits(s.total)}</small>
              </strong>
              <span>البيت</span>
            </div>
          )}
          {active && s.stages > 1 && (
            <div>
              <strong>
                {toArabicDigits(s.stage + 1)}
                <small>/{toArabicDigits(s.stages)}</small>
              </strong>
              <span>المرحلة</span>
            </div>
          )}
        </div>
      )}

      {active && s.total > 1 && (
        <div className="mem-progress">
          <div style={{ width: `${(s.stages > 1 ? (s.stage + 1) / s.stages : (s.index + 1) / s.total) * 100}%` }} />
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
          <span>{p.repeat.echo ? 'مهلة البيت' : `مهلة ${toArabicDigits(p.repeat.pause)}ث`}</span>
        </button>
        <button onClick={p.onFade} className={p.repeat.fade ? 'on' : ''} aria-pressed={p.repeat.fade}>
          <Eraser size={18} />
          <span>تدريجي</span>
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
