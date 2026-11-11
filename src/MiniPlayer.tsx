import { Loader2, Pause, Play, Repeat, Square } from 'lucide-react'
import { toArabicDigits } from './arabic'
import type { PlayState } from './player'

interface Props {
  state: PlayState
  verse: number | null
  reciterName: string
  ready: boolean
  /** What is playing, or what ▶ would start, in plain words. */
  summary: string
  /** Short label for the repeat chip, e.g. «×٣». */
  repeatLabel: string
  onOpen: () => void
  onPlay: () => void
  onRepeat: () => void
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

export default function MiniPlayer(p: Props) {
  const s = p.state
  const active = s.status !== 'idle'
  const playing = s.status === 'playing' || s.status === 'gap' || s.status === 'loading'
  return (
    <div className="mini-player">
      <button className="mini-main" onClick={p.onOpen} aria-label="فتح وضع الحفظ">
        {active ? <CountRing state={s} /> : <span className="ring idle" />}
        <span className="mini-text">
          <strong>{p.verse != null ? `البيت ${toArabicDigits(p.verse)}` : 'اختر بيتًا للاستماع'}</strong>
          <small>
            {s.error ? <span className="err">{s.error}</span> : s.status === 'gap' ? 'مهلة…' : `${p.reciterName} · ${p.summary}`}
          </small>
        </span>
      </button>
      <button className="repeat-chip" onClick={p.onRepeat} disabled={!p.ready} aria-label={`التكرار: ${p.summary}`}>
        <Repeat size={15} />
        {p.repeatLabel}
      </button>
      <button className="icon-btn big" onClick={p.onPlay} disabled={!p.ready} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
        {s.status === 'loading' ? <Loader2 size={24} className="spin" /> : playing ? <Pause size={24} /> : <Play size={24} />}
      </button>
      {active && (
        <button className="icon-btn big" onClick={p.onStop} aria-label="إيقاف">
          <Square size={19} />
        </button>
      )}
    </div>
  )
}
