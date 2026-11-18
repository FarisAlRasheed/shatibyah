import type { CSSProperties } from 'react'
import { Ellipsis, Loader2, Pause, Play, Repeat, SkipBack, SkipForward, Square } from 'lucide-react'
import { toArabicDigits } from './arabic'
import type { PlayState } from './player'

interface Props {
  state: PlayState
  verse: number | null
  reciterName: string
  /** What is playing, in plain words. */
  summary: string
  /** Each verse's repeat count shown on the chip (0 = endless). */
  repeatTimes: number
  onOpen: () => void
  onPlay: () => void
  onStep: (d: 1 | -1) => void
  onCycleRepeat: () => void
  onRepeatMore: () => void
  onStop: () => void
}

/** Repeat count as a ring: filled share = verseRound / verseTimes. */
export function CountRing({ state, size = 40 }: { state: PlayState; size?: number }) {
  const r = size / 2 - 3
  const c = 2 * Math.PI * r
  const endless = state.verseTimes === 0
  const share = endless ? 1 : state.verseRound / state.verseTimes
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - share)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">
        {toArabicDigits(state.verseRound)}/{endless ? '∞' : toArabicDigits(state.verseTimes)}
      </span>
    </span>
  )
}

const times = (n: number) => (n === 0 ? '∞' : toArabicDigits(n))

/**
 * The player, shown only while something plays or is paused. Right to left: the repeat chip and its
 * «⋯» (full repeat settings) · previous, play/pause (ringed by the verse's count), next · stop.
 * The verse and reciter sit centred above the controls; tapping them opens memorization mode.
 */
export default function MiniPlayer(p: Props) {
  const s = p.state
  const playing = s.status === 'playing' || s.status === 'gap' || s.status === 'loading'
  const share = s.verseTimes === 0 ? 1 : Math.min(1, s.verseRound / s.verseTimes)
  const round = s.verseTimes === 1 ? '' : ` · المرة ${toArabicDigits(s.verseRound)} من ${times(s.verseTimes)}`
  return (
    <div className="mini-player">
      <button className="mp-info" onClick={p.onOpen} aria-label="فتح وضع الحفظ">
        <strong>{p.verse != null ? `البيت ${toArabicDigits(p.verse)}` : ''}</strong>
        <small>
          {s.error ? <span className="err">{s.error}</span> : s.status === 'gap' ? 'مهلة…' : `${p.reciterName}${round}`}
        </small>
      </button>
      <div className="mp-controls">
        <div className="mp-side">
          <button className="repeat-chip" onClick={p.onCycleRepeat} aria-label={`تكرار كل بيت ×${times(p.repeatTimes)}، المس للتغيير`}>
            <Repeat size={15} />×{times(p.repeatTimes)}
          </button>
          <button className="icon-btn mp-more" onClick={p.onRepeatMore} aria-label={`إعدادات التكرار: ${p.summary}`}>
            <Ellipsis size={20} />
          </button>
        </div>
        <div className="mp-mid">
          <button className="icon-btn" onClick={() => p.onStep(-1)} aria-label="البيت السابق">
            <SkipForward size={22} />
          </button>
          <button
            className="mp-play"
            style={{ '--share': share } as CSSProperties}
            onClick={p.onPlay}
            aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            <span>{s.status === 'loading' ? <Loader2 size={22} className="spin" /> : playing ? <Pause size={22} /> : <Play size={22} />}</span>
          </button>
          <button className="icon-btn" onClick={() => p.onStep(1)} aria-label="البيت التالي">
            <SkipBack size={22} />
          </button>
        </div>
        <div className="mp-side end">
          <button className="icon-btn" onClick={p.onStop} aria-label="إيقاف">
            <Square size={19} />
          </button>
        </div>
      </div>
    </div>
  )
}
