import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, GraduationCap, List, LocateFixed, Repeat, Search, Settings as SettingsIcon, Type } from 'lucide-react'
import { audioUrl, loadColors, loadEdition, loadManifest, loadReciter, sectionOf, verseRange } from './data'
import { ColorCard, type OpenMark } from './colors'
import { DEFAULT_EDITION } from './config'
import { toArabicDigits } from './arabic'
import { idleState, RepeatPlayer, type PlayState } from './player'
import { useStored, type Bookmarks, type Mastered, type Notes, type RepeatSettings, type Settings } from './store'
import type { Edition, EditionColors, Manifest, Reciter, Section, VerseTiming } from './types'
import Reader from './Reader'
import MiniPlayer from './MiniPlayer'
import Memorize from './Memorize'
import './flow.css'
import { DisplaySheet, FlagSheet, NoteSheet, RepeatSheet, VerseSheet } from './sheets'
import { IndexScreen, SearchScreen, SettingsScreen } from './screens'
import PlanScreen from './PlanScreen'

type Tab = 'read' | 'index' | 'plan' | 'search' | 'settings'
export type Panel =
  | null
  | { type: 'repeat'; n: number }
  | 'display'
  | { type: 'verse'; n: number }
  | { type: 'note'; n: number }
  | { type: 'flag'; n: number }

const TABS: [Tab, string, typeof BookOpen][] = [
  ['read', 'القراءة', BookOpen],
  ['index', 'الفهرس', List],
  ['plan', 'الحفظ', GraduationCap],
  ['search', 'البحث', Search],
  ['settings', 'الإعدادات', SettingsIcon],
]

const FONT_FAMILY: Record<Settings['font'], string> = {
  amiri: "'Amiri', serif",
  scheherazade: "'Scheherazade New', serif",
  naskh: "'Noto Naskh Arabic', serif",
}

const defaultSettings: Settings = {
  editionId: DEFAULT_EDITION,
  reciterId: '',
  fontSize: 22,
  autoScroll: true,
  lastVerse: 0,
  theme: 'auto',
  font: 'amiri',
  hide: 'none',
  colors: true,
  memorizeColors: false,
}
const defaultRepeat: RepeatSettings = {
  scope: 'verse',
  from: 0,
  to: 0,
  sectionId: 0,
  verseTimes: 3,
  rangeTimes: 1,
  pause: 0,
  speed: 1,
}

const SCOPE_LABEL: Record<RepeatSettings['scope'], string> = { verse: 'بيت', range: 'نطاق', section: 'باب', all: 'الكل' }

// A single player for the whole app (module scope, so React dev double-renders can't duplicate it).
const current: { reciter: Reciter | null; onState: (s: PlayState) => void } = { reciter: null, onState: () => {} }
const player = new RepeatPlayer(
  (fileId) => audioUrl(current.reciter!, current.reciter!.files.find((f) => f.id === fileId)!),
  (s) => current.onState(s),
)

function useTheme(theme: Settings['theme']) {
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'auto' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
}

export default function App() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [edition, setEdition] = useState<Edition | null>(null)
  const [colors, setColors] = useState<EditionColors | null>(null)
  const [openMark, setOpenMark] = useState<OpenMark | null>(null)
  const [reciter, setReciter] = useState<Reciter | null>(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useStored<Settings>('settings', defaultSettings)
  const [repeat, setRepeat] = useStored<RepeatSettings>('repeat', defaultRepeat)
  const [notes, setNotes] = useStored<Notes>('notes', {})
  const [bookmarks, setBookmarks] = useStored<Bookmarks>('bookmarks', {})
  const [mastered, setMastered] = useStored<Mastered>('mastered', {})
  const [tab, setTab] = useState<Tab>('read')
  const [panel, setPanel] = useState<Panel>(null)
  const [memorize, setMemorize] = useState(false)
  const [topSection, setTopSection] = useState<Section | null>(null)
  const [selected, setSelected] = useState<number | null>(settings.lastVerse || null)
  const [play, setPlay] = useState<PlayState>(idleState)
  const [scrollTarget, setScrollTarget] = useState<{ n: number; key: number } | null>(
    settings.lastVerse ? { n: settings.lastVerse, key: 0 } : null,
  )
  const readScroll = useRef(0)
  // Follow the recited verse until the user scrolls or jumps away; a pill brings them back.
  const [following, setFollowing] = useState(true)

  useTheme(settings.theme)

  useEffect(() => {
    loadManifest().then(setManifest, (e) => setError(String(e)))
  }, [])

  const editionId = manifest?.editions.some((e) => e.id === settings.editionId)
    ? settings.editionId
    : manifest?.editions[0]?.id
  const reciters = useMemo(
    () => manifest?.reciters.filter((r) => r.editionId === editionId) ?? [],
    [manifest, editionId],
  )
  const reciterId = reciters.some((r) => r.id === settings.reciterId) ? settings.reciterId : reciters[0]?.id

  useEffect(() => {
    if (!editionId) return
    setEdition(null)
    setColors(null)
    loadEdition(editionId).then(setEdition, (e) => setError(String(e)))
    loadColors(editionId).then(setColors)
  }, [editionId])

  useEffect(() => {
    setReciter(null)
    if (!reciterId) return
    loadReciter(reciterId).then(setReciter, (e) => setError(String(e)))
  }, [reciterId])

  useEffect(() => {
    current.reciter = reciter
    current.onState = setPlay
    player.stop()
  }, [reciter])

  // Lock-screen details: reciter and chapter of the verse playing.
  useEffect(() => {
    if (reciter && edition) player.setMeta((n) => ({ artist: reciter.name, album: sectionOf(edition, n)?.title ?? '' }))
  }, [reciter, edition])

  const timings = useMemo(() => new Map<number, VerseTiming>(reciter?.verses.map((v) => [v.n, v]) ?? []), [reciter])
  useEffect(() => player.setTimings(reciter?.verses ?? []), [reciter])

  const startQueue = useCallback(
    (from: number, to: number, startAt: number, opts: Pick<RepeatSettings, 'verseTimes' | 'rangeTimes'>) => {
      const queue: VerseTiming[] = []
      for (let n = from; n <= to; n++) {
        const t = timings.get(n)
        if (t) queue.push(t)
      }
      const startIndex = Math.max(0, queue.findIndex((t) => t.n >= startAt))
      setFollowing(true)
      player.start(queue, { ...opts, pause: repeat.pause, speed: repeat.speed }, startIndex)
    },
    [timings, repeat.pause, repeat.speed],
  )

  /** Start the configured repeat. */
  /** Start the configured repeat; `at` is the verse a single-verse repeat uses. */
  const startRepeat = useCallback(
    (r: RepeatSettings = repeat, at?: number) => {
      if (!edition) return
      const all = verseRange(edition)
      const anchor = at ?? selected ?? all.from
      let from = all.from
      let to = all.to
      if (r.scope === 'verse') from = to = anchor
      if (r.scope === 'range') [from, to] = [Math.min(r.from, r.to), Math.max(r.from, r.to)]
      if (r.scope === 'section') {
        const s = edition.sections.find((x) => x.id === r.sectionId) ?? sectionOf(edition, anchor)
        if (s) [from, to] = [s.start, s.end]
      }
      // A single verse has no range to repeat; its rounds count is hidden in the repeat sheet.
      startQueue(from, to, from, r.scope === 'verse' ? { ...r, rangeTimes: 1 } : r)
    },
    [edition, repeat, selected, startQueue],
  )

  /** Play continuously from verse n to the end. */
  const playFrom = useCallback(
    (n: number) => {
      if (!edition) return
      setSelected(n)
      startQueue(n, verseRange(edition).to, n, { verseTimes: 1, rangeTimes: 1 })
    },
    [edition, startQueue],
  )

  useEffect(() => player.update({ pause: repeat.pause, speed: repeat.speed }), [repeat.pause, repeat.speed])

  useEffect(() => {
    if (selected) setSettings((s) => ({ ...s, lastVerse: selected }))
  }, [selected, setSettings])

  const goTab = useCallback(
    (t: Tab) => {
      if (tab === 'read' && t !== 'read') readScroll.current = window.scrollY
      setTab(t)
    },
    [tab],
  )

  // Coming back to the reader: restore where it was, unless a jump set a new target.
  const pendingRestore = useRef(false)
  useLayoutEffect(() => {
    if (tab === 'read' && pendingRestore.current) window.scrollTo(0, readScroll.current)
    else if (tab !== 'read') window.scrollTo(0, 0)
    pendingRestore.current = tab !== 'read'
  }, [tab])

  const jumpTo = useCallback((n: number) => {
    pendingRestore.current = false
    setFollowing(false)
    setSelected(n)
    setTab('read')
    setScrollTarget({ n, key: Date.now() })
    setPanel(null)
  }, [])

  // Follow the verse being recited.
  useEffect(() => {
    if (play.verse && settings.autoScroll && following && tab === 'read') setScrollTarget({ n: play.verse, key: Date.now() })
  }, [play.verse, settings.autoScroll, following]) // eslint-disable-line react-hooks/exhaustive-deps

  // A new playback follows again; stopping clears the pill.
  const playing = play.status !== 'idle'
  useEffect(() => setFollowing(true), [playing])

  // Manual scrolling (touch, wheel, keys) pauses following. Programmatic scrolls don't fire these.
  useEffect(() => {
    if (!playing || !following || tab !== 'read') return
    const stop = () => setFollowing(false)
    const onKey = (e: KeyboardEvent) => ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key) && stop()
    window.addEventListener('touchmove', stop, { passive: true })
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('keydown', onKey)
    }
  }, [playing, following, tab])

  const onTap = useCallback((n: number) => {
    setSelected(n)
    setPanel({ type: 'verse', n })
  }, [])

  if (error) return <div className="center-msg">تعذّر تحميل البيانات: {error}</div>
  if (!manifest || !edition) return <div className="center-msg">جارٍ التحميل…</div>

  const all = verseRange(edition)
  const focusVerse = play.verse ?? selected ?? all.from
  const active = play.status !== 'idle'
  const hasAudio = !!reciter

  const togglePlay = () => (active ? player.toggle() : startRepeat())
  const step = (d: 1 | -1) => {
    if (active && play.total > 1) return player.step(d)
    if (active) player.stop()
    const n = Math.min(all.to, Math.max(all.from, focusVerse + d))
    setSelected(n)
    setScrollTarget({ n, key: Date.now() })
  }
  const repeatVerse = (n: number, times: number) => {
    const r = { ...repeat, scope: 'verse' as const, verseTimes: times }
    setRepeat(r)
    setSelected(n)
    startQueue(n, n, n, { ...r, rangeTimes: 1 })
  }
  /** Memorization session on a range (e.g. today's wird): repeat that range and open memorization mode. */
  const startSession = (from: number, to: number) => {
    const r = { ...repeat, scope: 'range' as const, from, to }
    setRepeat(r)
    setSelected(from)
    setMemorize(true)
    if (hasAudio) startRepeat(r)
  }
  const times = (n: number) => (n === 0 ? '∞' : toArabicDigits(n))
  // What the mini-player says: the running playback if any, else what ▶ would start.
  const summary = !active
    ? `${SCOPE_LABEL[repeat.scope]} ×${times(repeat.verseTimes)}`
    : play.total === 1
      ? play.verseTimes === 1 && play.rangeTimes === 1
        ? 'قراءة البيت'
        : `تكرار البيت ×${times(play.verseTimes)}`
      : play.verseTimes === 1 && play.rangeTimes === 1
        ? 'قراءة متصلة'
        : `${toArabicDigits(play.total)} أبيات · كل بيت ×${times(play.verseTimes)}${play.rangeTimes !== 1 ? ` · الدورة ×${times(play.rangeTimes)}` : ''}`

  const panelEl = (() => {
    const close = () => setPanel(null)
    if (panel === 'display') return <DisplaySheet settings={settings} setSettings={setSettings} hasColors={!!colors} onClose={close} />
    if (panel?.type === 'repeat')
      return (
        <RepeatSheet
          edition={edition}
          repeat={repeat}
          setRepeat={setRepeat}
          selected={panel.n}
          timings={timings}
          onStart={(r) => {
            setSelected(panel.n)
            startRepeat(r, panel.n)
            close()
          }}
          onClose={close}
        />
      )
    if (panel?.type === 'verse')
      return (
        <VerseSheet
          n={panel.n}
          edition={edition}
          canPlay={hasAudio && timings.has(panel.n)}
          bookmarked={!!bookmarks[panel.n]}
          onPlayFrom={() => {
            playFrom(panel.n)
            close()
          }}
          onRepeatTimes={(t) => {
            repeatVerse(panel.n, t)
            close()
          }}
          onRepeatSettings={() => {
            setRepeat((r) => ({ ...r, scope: 'verse' }))
            setPanel({ type: 'repeat', n: panel.n })
          }}
          onToggleBookmark={() =>
            setBookmarks((b) => {
              const next = { ...b }
              if (next[panel.n]) delete next[panel.n]
              else next[panel.n] = { label: '', at: Date.now() }
              return next
            })
          }
          onNote={() => setPanel({ type: 'note', n: panel.n })}
          onMemorize={() => {
            close()
            setMemorize(true)
          }}
          onFlag={() => setPanel({ type: 'flag', n: panel.n })}
          onClose={close}
        />
      )
    if (panel?.type === 'note') return <NoteSheet n={panel.n} edition={edition} notes={notes} setNotes={setNotes} onClose={close} />
    if (panel?.type === 'flag') return <FlagSheet n={panel.n} edition={edition} reciter={reciter} playState={play} onClose={close} />
    return null
  })()

  const sectionTitle = topSection?.title ?? sectionOf(edition, focusVerse)?.title ?? ''
  const titleSection = topSection ?? sectionOf(edition, focusVerse)

  return (
    <div
      className={`app${reciters.length ? ' has-player' : ''}`}
      style={{ ['--verse-size' as string]: `${settings.fontSize}px`, ['--verse-font' as string]: FONT_FAMILY[settings.font] }}
    >
      {tab === 'read' && (
        <header className="topbar">
          <button className="icon-btn" onClick={() => setPanel({ type: 'repeat', n: focusVerse })} aria-label="التكرار" disabled={!hasAudio}>
            <Repeat size={21} />
          </button>
          <button className="topbar-title" onClick={() => goTab('index')}>
            <strong>{sectionTitle}</strong>
            {titleSection && (
              <small>
                {toArabicDigits(titleSection.start)}–{toArabicDigits(titleSection.end)}
              </small>
            )}
          </button>
          <button className="icon-btn" onClick={() => setPanel('display')} aria-label="العرض">
            <Type size={21} />
          </button>
        </header>
      )}

      <div hidden={tab !== 'read'}>
        <Reader
          edition={edition}
          selected={selected}
          playing={active ? play.verse : null}
          notes={notes}
          bookmarks={bookmarks}
          mastered={mastered}
          scrollTarget={scrollTarget}
          colors={settings.colors ? colors : null}
          onTap={onTap}
          onMark={setOpenMark}
          onSectionChange={setTopSection}
        />
      </div>
      {tab === 'index' && (
        <IndexScreen
          edition={edition}
          current={focusVerse}
          notes={notes}
          bookmarks={bookmarks}
          mastered={mastered}
          setBookmarks={setBookmarks}
          onJump={jumpTo}
        />
      )}
      {tab === 'plan' && (
        <PlanScreen
          edition={edition}
          mastered={mastered}
          onStartSession={startSession}
          onFreeSession={() => setMemorize(true)}
          onJump={jumpTo}
        />
      )}
      {tab === 'search' && <SearchScreen edition={edition} onJump={jumpTo} />}
      {tab === 'settings' && (
        <SettingsScreen
          hasColors={!!colors}
          settings={settings}
          setSettings={setSettings}
          manifest={manifest}
          editionId={editionId}
          reciterId={reciterId}
          reciters={reciters}
          edition={edition}
          reciter={reciter}
        />
      )}

      {tab === 'read' && active && !following && settings.autoScroll && play.verse != null && (
        <button
          className="follow-pill"
          onClick={() => {
            setFollowing(true)
            setScrollTarget({ n: play.verse!, key: Date.now() })
          }}
        >
          <LocateFixed size={16} /> العودة إلى البيت المقروء
        </button>
      )}

      <div className="bottom-dock">
        {reciters.length > 0 ? (
          <MiniPlayer
            state={play}
            verse={active ? play.verse : selected}
            reciterName={reciters.find((r) => r.id === reciterId)?.name ?? ''}
            ready={hasAudio}
            summary={summary}
            onOpen={() => setMemorize(true)}
            onPlay={togglePlay}
            onNext={() => player.step(1)}
          />
        ) : (
          <div className="no-audio">لا توجد قراءة مسجّلة لهذه النسخة بعد.</div>
        )}
        <nav className="tabbar">
          {TABS.map(([id, label, Icon]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => goTab(id)} aria-current={tab === id ? 'page' : undefined}>
              <Icon size={23} strokeWidth={tab === id ? 2.2 : 1.7} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {memorize && (
        <Memorize
          edition={edition}
          state={play}
          verse={focusVerse}
          repeat={repeat}
          hide={settings.hide}
          mastered={mastered}
          colors={settings.memorizeColors ? colors : null}
          onMark={setOpenMark}
          canPlay={hasAudio}
          onHide={(hide) => setSettings((s) => ({ ...s, hide }))}
          onClose={() => setMemorize(false)}
          onPlay={togglePlay}
          onStep={step}
          onStop={() => (active ? player.stop() : setMemorize(false))}
          onReplay={() => (active ? player.replay() : hasAudio && startQueue(focusVerse, focusVerse, focusVerse, { verseTimes: 1, rangeTimes: 1 }))}
          onOpenRepeat={() => setPanel({ type: 'repeat', n: focusVerse })}
          onSpeed={(speed) => setRepeat((r) => ({ ...r, speed }))}
          onMastered={(n, yes) => {
            setMastered((m) => {
              const next = { ...m }
              if (yes) next[n] = Date.now()
              else delete next[n]
              return next
            })
            if (yes) step(1)
          }}
        />
      )}

      {panelEl}
      {openMark && colors && <ColorCard open={openMark} colors={colors} onClose={() => setOpenMark(null)} />}
    </div>
  )
}
