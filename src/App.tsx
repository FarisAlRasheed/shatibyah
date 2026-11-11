import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Eye, EyeOff, GraduationCap, List, LocateFixed, Search, Settings as SettingsIcon, Undo2, X } from 'lucide-react'
import { audioUrl, loadColors, loadEdition, loadManifest, loadPages, loadReciter, sectionOf, verseRange } from './data'
import { ColorCard, fadeShare, type OpenMark } from './colors'
import { DEFAULT_EDITION } from './config'
import { toArabicDigits } from './arabic'
import { cumulativeStages, idleState, RepeatPlayer, type PlayState } from './player'
import { useFits } from './kashida'
import { DEFAULT_SIZE } from './zoom'
import { useStored, type Bookmarks, type Mastered, type Notes, type RepeatSettings, type Settings, type Weak } from './store'
import type { Edition, EditionColors, Manifest, PrintedPage, Range, Reciter, Section, VerseTiming } from './types'
import Reader from './Reader'
import MiniPlayer from './MiniPlayer'
import Memorize from './Memorize'
import './flow.css'
import './chrome.css'
import { Drawer, FlagSheet, NoteSheet, RepeatSheet, VerseSheet } from './sheets'
import { IndexScreen, SettingsScreen } from './screens'
import PlanScreen, { usePlan, useToday } from './PlanScreen'
import { todayState } from './plan'
import { FindBar, FindList, useFind, type FindState } from './Find'
import LookPanel from './Look'
import Rail from './Rail'
import VerseBar from './VerseBar'
import { PickBanner, PickBar, pickSpan, pickTap, type PickState } from './RangePick'
import TwinsSheet from './TwinsSheet'
import { buildTwins } from './twins'
import WirdStrip from './WirdStrip'
import SidePanel, { useWide } from './SidePanel'
import ExplainPanel, { type ExplainTarget } from './Explain'
import './explain.css'
import './extras.css'

type Tab = 'read' | 'plan' | 'settings'
export type Panel =
  | null
  | { type: 'repeat'; n: number }
  | 'look' // the «أ» appearance panel
  | 'index' // الفهرس, over the reader
  | { type: 'verse'; n: number }
  | { type: 'note'; n: number }
  | { type: 'flag'; n: number }
  | { type: 'twins'; n: number }

// The tab bar. «أ» (المظهر) sits between the first two: it opens a panel over the reader, not a screen.
const TABS: [Tab, string, typeof BookOpen][] = [
  ['read', 'القراءة', BookOpen],
  ['plan', 'الحفظ', GraduationCap],
  ['settings', 'الإعدادات', SettingsIcon],
]

/** The verse at the middle of the screen, looking through anything shown over the reader. */
function verseAtCentre(): number | null {
  for (const dy of [0, -40, 40, -90, 90]) {
    for (const el of document.elementsFromPoint(innerWidth / 2, innerHeight / 2 + dy)) {
      const v = el.closest('main.reader .verse')
      if (v) return +v.id.slice(2)
    }
  }
  return null
}

const FONT_FAMILY: Record<Settings['font'], string> = {
  amiri: "'Amiri', serif",
  scheherazade: "'Scheherazade New', serif",
  naskh: "'Noto Naskh Arabic', serif",
}

const defaultSettings: Settings = {
  editionId: DEFAULT_EDITION,
  reciterId: '',
  fontSize: DEFAULT_SIZE,
  autoScroll: true,
  lastVerse: 0,
  theme: 'auto',
  font: 'amiri',
  hide: 'none',
  colors: true,
  memorizeColors: false,
  lineHeight: 1.95,
  layout: 'auto',
  kashida: true,
  numberStyle: 'circle',
  immersive: true,
  rail: true,
  backPill: true,
  curtain: false,
  twins: true,
  wirdStrip: true,
  pageMarks: false,
  sidePanel: true,
  commentary: '',
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
  cumulative: false,
  echo: false,
  fade: false,
  recent: [],
}

const SCOPE_LABEL: Record<RepeatSettings['scope'], string> = { verse: 'تكرار البيت', range: 'تكرار النطاق', section: 'تكرار الباب', all: 'تكرار المتن' }

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
  // undefined while loading, null when the edition has no colours file
  const [colors, setColors] = useState<EditionColors | null | undefined>(undefined)
  // Where the printed pages begin; null when the edition has no page data.
  const [pages, setPages] = useState<PrintedPage[] | null>(null)
  const [openMark, setOpenMark] = useState<OpenMark | null>(null)
  const [reciter, setReciter] = useState<Reciter | null>(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useStored<Settings>('settings', defaultSettings)
  const [repeat, setRepeat] = useStored<RepeatSettings>('repeat', defaultRepeat)
  const [notes, setNotes] = useStored<Notes>('notes', {})
  const [bookmarks, setBookmarks] = useStored<Bookmarks>('bookmarks', {})
  const [mastered, setMastered] = useStored<Mastered>('mastered', {})
  const [weak, setWeak] = useStored<Weak>('weak', {})
  const [find, setFind] = useState<FindState | null>(null)
  // Where the reader was before a jump, for the «رجوع» pill.
  const [back, setBack] = useState<number | null>(null)
  const [immersed, setImmersed] = useState(false)
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
  // The verse whose small action bar is showing.
  const [bar, setBar] = useState<number | null>(null)
  // Choosing a range to repeat by tapping verses.
  const [pick, setPick] = useState<PickState | null>(null)
  // The range the running repeat walks, for its end markers.
  const [run, setRun] = useState<{ from: number; to: number } | null>(null)
  // Recitation curtain: on for this visit only, with the verses tapped open.
  const [curtainOn, setCurtainOn] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set())
  const [plan, setPlan] = usePlan()
  const today = useToday()
  const [wirdHidden, setWirdHidden] = useStored<{ day: string }>('wirdStrip', { day: '' })
  const wide = useWide()
  // The explanation panel: the verse it shows, and the group it found there (tinted in the reader).
  const [explain, setExplain] = useState<ExplainTarget | null>(null)
  const [explainGroup, setExplainGroup] = useState<Range | null>(null)
  const closeExplain = useCallback(() => {
    setExplain(null)
    setExplainGroup(null)
  }, [])

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
  const books = useMemo(() => manifest?.commentaries?.filter((c) => c.editionId === editionId) ?? [], [manifest, editionId])
  const bookId = books.some((b) => b.id === settings.commentary) ? settings.commentary : books[0]?.id

  useEffect(() => {
    if (!editionId) return
    closeExplain()
    setEdition(null)
    setColors(undefined)
    loadEdition(editionId).then(setEdition, (e) => setError(String(e)))
    loadColors(editionId).then(setColors)
    setPages(null)
    loadPages(editionId).then(setPages)
  }, [editionId, closeExplain])

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

  const fits = useFits(settings.kashida ? edition : null, colors, settings.font, FONT_FAMILY[settings.font], true, settings.lastVerse)

  const timings = useMemo(() => new Map<number, VerseTiming>(reciter?.verses.map((v) => [v.n, v]) ?? []), [reciter])
  const twins = useMemo(() => (edition ? buildTwins(edition) : new Map<number, number[]>()), [edition])
  const pageStarts = useMemo(() => (pages ? new Map(pages.map((x) => [x.from, x.page])) : null), [pages])
  useEffect(() => player.setTimings(reciter?.verses ?? []), [reciter])

  const startQueue = useCallback(
    (from: number, to: number, startAt: number, opts: Pick<RepeatSettings, 'verseTimes' | 'rangeTimes'>, cumulative = false, marked = false) => {
      const queue: VerseTiming[] = []
      for (let n = from; n <= to; n++) {
        const t = timings.get(n)
        if (t) queue.push(t)
      }
      const startIndex = Math.max(0, queue.findIndex((t) => t.n >= startAt))
      setFollowing(true)
      setRun(marked && from < to ? { from, to } : null)
      const stages =
        cumulative && queue.length > 1 ? cumulativeStages(queue.length, Math.max(1, opts.verseTimes), Math.max(1, opts.rangeTimes)) : undefined
      player.start(queue, { ...opts, pause: repeat.pause, speed: repeat.speed, echo: repeat.echo }, startIndex, stages)
    },
    [timings, repeat.pause, repeat.speed, repeat.echo],
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
      startQueue(from, to, from, r.scope === 'verse' ? { ...r, rangeTimes: 1 } : r, r.cumulative && r.scope !== 'verse', r.scope !== 'verse')
      // Remember the last few ranges, for the repeat sheet's shortcuts.
      if (r.scope === 'range')
        setRepeat((x) => ({ ...x, recent: [[from, to] as [number, number], ...(x.recent ?? []).filter(([a, b]) => a !== from || b !== to)].slice(0, 3) }))
    },
    [edition, repeat, selected, startQueue, setRepeat],
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

  useEffect(() => player.update({ pause: repeat.pause, speed: repeat.speed, echo: repeat.echo }), [repeat.pause, repeat.speed, repeat.echo])

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

  const place = useRef({ tab, selected })
  place.current = { tab, selected }
  /** Go to verse n. `keepBack` leaves an existing «رجوع» place alone (stepping through search matches). */
  const jumpTo = useCallback((n: number, keepBack = false) => {
    const here = place.current.tab === 'read' ? verseAtCentre() : place.current.selected
    if (here && Math.abs(here - n) > 6) setBack((b) => (keepBack && b != null ? b : here))
    pendingRestore.current = false
    setFollowing(false)
    setSelected(n)
    setBar(null)
    setTab('read')
    setScrollTarget({ n, key: Date.now() })
    setPanel(null)
  }, [])

  // The «رجوع» place is dropped once the reader has moved well away from where the jump landed.
  useEffect(() => {
    if (back == null) return
    let base: number | null = null
    const settle = window.setTimeout(() => (base = scrollY), 1500)
    const onScroll = () => base != null && Math.abs(scrollY - base) > 3 * innerHeight && setBack(null)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(settle)
      window.removeEventListener('scroll', onScroll)
    }
  }, [back])

  // Immersive reading: the bars slide away when the reader scrolls down by hand, and return on scrolling up.
  useEffect(() => {
    setImmersed(false)
    if (!settings.immersive || tab !== 'read') return
    let last = scrollY
    let byHand = 0
    const hand = () => (byHand = Date.now())
    const onScroll = () => {
      const dy = scrollY - last
      if (Math.abs(dy) < 6) return
      last = scrollY
      if (dy < 0 || scrollY < 80) setImmersed(false)
      else if (Date.now() - byHand < 900) setImmersed(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchmove', hand, { passive: true })
    window.addEventListener('wheel', hand, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchmove', hand)
      window.removeEventListener('wheel', hand)
    }
  }, [settings.immersive, tab])

  const results = useFind(edition, find?.q ?? '')

  // Keyboard shortcuts (a Mac or any keyboard). By key position, so they work on an Arabic layout.
  const keys = useRef({ play: () => {}, step: (_d: 1 | -1) => {}, find: () => {}, repeat: () => {}, closeFind: () => {}, busy: true })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current
      const el = e.target as HTMLElement
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyF') {
        e.preventDefault()
        return k.find()
      }
      if (e.metaKey || e.ctrlKey || e.altKey || k.busy || el.closest?.('input, textarea, select')) return
      if (e.code === 'Space' && !el.closest?.('button, a')) (e.preventDefault(), k.play())
      else if (e.key === 'ArrowDown') (e.preventDefault(), k.step(1))
      else if (e.key === 'ArrowUp') (e.preventDefault(), k.step(-1))
      else if (e.code === 'Slash') (e.preventDefault(), k.find())
      else if (e.code === 'KeyR') k.repeat()
      else if (e.key === 'Escape') k.closeFind()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  // Kept stable, so a tap handler that changes doesn't redraw every verse row.
  const tap = useRef((_n: number) => {})
  const onTap = useCallback((n: number) => tap.current(n), [])

  if (error) return <div className="center-msg">تعذّر تحميل البيانات: {error}</div>
  if (!manifest || !edition) return <div className="center-msg">جارٍ التحميل…</div>

  const all = verseRange(edition)
  const focusVerse = play.verse ?? selected ?? all.from
  const active = play.status !== 'idle'
  const hasAudio = !!reciter

  const togglePlay = () => (active ? player.toggle() : startRepeat())
  const toggleBookmark = (n: number) =>
    setBookmarks((b) => {
      const next = { ...b }
      if (next[n]) delete next[n]
      else next[n] = { label: '', at: Date.now() }
      return next
    })

  tap.current = (n) => {
    if (pick) return setPick(pickTap(pick, n))
    if (curtainOn) setRevealed((r) => (r.has(n) ? r : new Set(r).add(n)))
    setSelected(n)
    setBar((b) => (b === n ? null : n))
  }
  const span = pickSpan(pick)
  const pickRepeat = (): RepeatSettings => ({ ...repeat, scope: 'range', from: span!.from, to: span!.to })

  // Today's wird of the memorization plan: for the strip (when due) and the repeat sheet's shortcut.
  const wirdNow = plan ? todayState(plan, today) : null
  const wird = wirdNow && wirdNow.kind !== 'finished' ? wirdNow.wird : null
  const wirdDue = wirdNow?.kind === 'wird' && !wirdNow.offDay && !wirdNow.notStarted ? wirdNow.wird : null
  const showStrip = settings.wirdStrip && !!wirdDue && wirdHidden.day !== today && tab === 'read' && !find && !memorize
  const explaining = !!explain && !!bookId && tab === 'read' && !memorize
  // On a wide screen the explanation takes the side panel's place (shown even when that extra is off).
  const showSide = (settings.sidePanel || explaining) && wide && tab === 'read' && !memorize && panel !== 'look'
  const explainSheet = explaining && !wide

  const step = (d: 1 | -1) => {
    if (active && play.total > 1) return player.step(d)
    if (active) player.stop()
    const n = Math.min(all.to, Math.max(all.from, focusVerse + d))
    setSelected(n)
    setBar(null)
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
  const openFind = () => {
    goTab('read')
    setPanel(null)
    setFind((f) => (f ? { ...f, list: true } : { q: '', list: true, at: -1 }))
  }
  const findJump = (n: number, at: number) => {
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    setFind((f) => f && { ...f, list: false, at })
    jumpTo(n, true)
  }
  const findStep = (d: 1 | -1) => {
    const count = results.verses.length
    if (!find || !count) return
    const at = find.at < 0 ? (d > 0 ? 0 : count - 1) : (find.at + d + count) % count
    findJump(results.verses[at], at)
  }
  const openLook = () => {
    goTab('read')
    setPanel((x) => (x === 'look' ? null : 'look'))
  }
  keys.current = {
    play: () => hasAudio && togglePlay(),
    step,
    find: openFind,
    repeat: () => hasAudio && setPanel({ type: 'repeat', n: focusVerse }),
    closeFind: () => (pick ? setPick(null) : setFind(null)),
    busy: tab !== 'read' || !!panel || memorize,
  }
  const times = (n: number) => (n === 0 ? '∞' : toArabicDigits(n))
  // What the mini-player says: the running playback if any, else what ▶ would start.
  const summary = !active
    ? repeat.verseTimes === 1 && (repeat.scope === 'verse' || repeat.rangeTimes === 1)
      ? { verse: 'قراءة البيت', range: 'قراءة النطاق', section: 'قراءة الباب', all: 'قراءة المتن' }[repeat.scope]
      : `${SCOPE_LABEL[repeat.scope]} ×${times(repeat.verseTimes)}`
    : play.stages > 1
      ? `تكرار تراكمي · المرحلة ${toArabicDigits(play.stage + 1)} من ${toArabicDigits(play.stages)}`
      : play.total === 1
      ? play.verseTimes === 1 && play.rangeTimes === 1
        ? 'قراءة البيت'
        : `تكرار البيت ×${times(play.verseTimes)}`
      : play.verseTimes === 1 && play.rangeTimes === 1
        ? 'قراءة متصلة'
        : `${toArabicDigits(play.total)} أبيات · كل بيت ×${times(play.verseTimes)}${play.rangeTimes !== 1 ? ` · الدورة ×${times(play.rangeTimes)}` : ''}`

  const panelEl = (() => {
    const close = () => setPanel(null)
    if (panel === 'look')
      return <LookPanel settings={settings} setSettings={setSettings} edition={edition} colors={colors ?? null} fits={fits} verse={focusVerse} onClose={close} />
    if (panel === 'index')
      return (
        <Drawer label="الفهرس" onClose={close}>
          <IndexScreen
            edition={edition}
            current={focusVerse}
            notes={notes}
            bookmarks={bookmarks}
            mastered={mastered}
            setBookmarks={setBookmarks}
            onJump={jumpTo}
            pages={settings.pageMarks ? pages : null}
          />
        </Drawer>
      )
    if (panel?.type === 'repeat')
      return (
        <RepeatSheet
          edition={edition}
          repeat={repeat}
          setRepeat={setRepeat}
          selected={panel.n}
          timings={timings}
          wird={wird}
          onPickFromText={() => {
            close()
            setMemorize(false)
            setTab('read')
            setPick({ anchor: null, end: null })
          }}
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
          onToggleBookmark={() => toggleBookmark(panel.n)}
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
    if (panel?.type === 'twins') return <TwinsSheet n={panel.n} edition={edition} twins={twins.get(panel.n) ?? []} onJump={jumpTo} onClose={close} />
    return null
  })()

  const barEl =
    bar != null && tab === 'read' && !panel && !pick && !memorize ? (
      <VerseBar
        key={bar}
        n={bar}
        canPlay={hasAudio && timings.has(bar)}
        bookmarked={!!bookmarks[bar]}
        twins={settings.twins ? (twins.get(bar)?.length ?? 0) : 0}
        onPlayFrom={() => {
          setBar(null)
          playFrom(bar)
        }}
        onRepeatFrom={() => {
          setBar(null)
          setPick({ anchor: bar, end: null })
        }}
        onBookmark={() => toggleBookmark(bar)}
        onNote={() => {
          setBar(null)
          setPanel({ type: 'note', n: bar })
        }}
        onTwins={() => {
          setBar(null)
          setPanel({ type: 'twins', n: bar })
        }}
        onMore={() => {
          setBar(null)
          setPanel({ type: 'verse', n: bar })
        }}
        onExplain={
          bookId
            ? () => {
                setBar(null)
                setExplain({ n: bar, opened: bar, key: Date.now() })
              }
            : undefined
        }
        onClose={() => setBar(null)}
      />
    ) : null

  // The bars stay while the explanation sheet sits on them.
  const hideBars = immersed && tab === 'read' && !panel && !find && !memorize && !pick && !explainSheet
  const sectionTitle = topSection?.title ?? sectionOf(edition, focusVerse)?.title ?? ''
  const titleSection = topSection ?? sectionOf(edition, focusVerse)

  return (
    <div
      className={`app${reciters.length ? ' has-player' : ''}${settings.numberStyle === 'plain' ? ' plain-numbers' : ''}${hideBars ? ' immersed' : ''}${panel === 'look' ? ' look-open' : ''}${showStrip ? ' has-strip' : ''}${showSide ? ' side-open' : ''}${explainSheet ? ' explain-sheet' : ''}${explaining && showSide ? ' explain-side' : ''}`}
      style={{
        ['--verse-size' as string]: `${settings.fontSize}px`,
        ['--verse-font' as string]: FONT_FAMILY[settings.font],
        ['--verse-lh' as string]: settings.lineHeight,
      }}
    >
      {tab === 'read' && (
        <header className="topbar">
          {find ? (
            <FindBar
              find={find}
              results={results}
              onChange={(q) => setFind({ q, list: true, at: -1 })}
              onStep={findStep}
              onEnter={() => (results.verse != null ? findJump(results.verse, -1) : findStep(1))}
              onFocus={() => setFind((f) => f && { ...f, list: true })}
              onClose={() => setFind(null)}
            />
          ) : (
            <>
              <button className="icon-btn" onClick={openFind} aria-label="البحث">
                <Search size={21} />
              </button>
              <button className="topbar-title" onClick={() => setPanel('index')}>
                <strong>{sectionTitle}</strong>
                {titleSection && (
                  <small>
                    {toArabicDigits(titleSection.start)}–{toArabicDigits(titleSection.end)}
                  </small>
                )}
              </button>
              {settings.curtain && (
                <button
                  className={`icon-btn${curtainOn ? ' on' : ''}`}
                  onClick={() => {
                    setCurtainOn((x) => !x)
                    setRevealed(new Set())
                  }}
                  aria-pressed={curtainOn}
                  aria-label={curtainOn ? 'إظهار الأشطر' : 'ستارة التسميع'}
                >
                  {curtainOn ? <EyeOff size={21} /> : <Eye size={21} />}
                </button>
              )}
              <button className="icon-btn" onClick={() => setPanel('index')} aria-label="الفهرس">
                <List size={22} />
              </button>
            </>
          )}
          {showStrip && (
            <WirdStrip wird={wirdDue!} onStart={() => startSession(wirdDue!.from, wirdDue!.to)} onHide={() => setWirdHidden({ day: today })} />
          )}
        </header>
      )}
      {tab === 'read' && find?.list && (
        <FindList
          edition={edition}
          find={find}
          results={results}
          onJump={findJump}
          onDismiss={() => setFind((f) => (f?.q.trim() ? { ...f, list: false } : null))}
        />
      )}
      {tab === 'read' && settings.rail && !panel && !memorize && <Rail edition={edition} />}
      {tab === 'read' && pick && pick.end == null && <PickBanner pick={pick} onCancel={() => setPick(null)} />}
      {tab === 'read' && pick && pick.end != null && span && (
        <PickBar
          from={span.from}
          to={span.to}
          canPlay={hasAudio}
          onStart={() => {
            const r = pickRepeat()
            setRepeat(r)
            setSelected(r.from)
            startRepeat(r, r.from)
            setPick(null)
          }}
          onEdit={() => {
            setRepeat(pickRepeat())
            setPanel({ type: 'repeat', n: span.from })
            setPick(null)
          }}
          onCancel={() => setPick(null)}
        />
      )}
      {tab === 'read' && settings.backPill && back != null && !find?.list && !pick && (
        <span className="back-pill">
          <button
            className="back-go"
            onClick={() => {
              setFollowing(false)
              setScrollTarget({ n: back, key: Date.now() })
              setBack(null)
            }}
          >
            <Undo2 size={15} /> رجوع إلى البيت {toArabicDigits(back)}
          </button>
          <button className="x" onClick={() => setBack(null)} aria-label="إخفاء">
            <X size={15} />
          </button>
        </span>
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
          colors={settings.colors ? (colors ?? null) : null}
          fits={fits}
          fontSize={settings.fontSize}
          layout={settings.layout}
          look={`${settings.lineHeight}|${settings.font}|${settings.numberStyle}|${settings.colors}|${settings.pageMarks}`}
          hits={find ? results.hits : null}
          veil={repeat.fade && active && play.verse != null ? { n: play.verse, share: fadeShare(play) } : null}
          bar={barEl ? { n: bar!, el: barEl } : null}
          pick={span}
          run={active ? run : null}
          count={active && play.verse != null && play.verseTimes !== 1 ? { n: play.verse, round: play.verseRound, times: play.verseTimes } : null}
          curtain={settings.curtain && curtainOn ? { revealed } : null}
          pageStarts={settings.pageMarks ? pageStarts : null}
          explain={explain && explainGroup ? { ...explainGroup, n: explain.opened } : null}
          active={tab === 'read' && !panel && !memorize && !find?.list}
          onBackgroundTap={() => setImmersed(false)}
          onFontSize={(fontSize) => setSettings((x) => ({ ...x, fontSize }))}
          onTap={onTap}
          onMark={setOpenMark}
          onSectionChange={setTopSection}
        />
      </div>
      {tab === 'plan' && (
        <PlanScreen
          edition={edition}
          mastered={mastered}
          weak={weak}
          plan={plan}
          setPlan={setPlan}
          onStartSession={startSession}
          onFreeSession={() => setMemorize(true)}
          onJump={jumpTo}
        />
      )}
      {tab === 'settings' && (
        <SettingsScreen
          hasColors={!!colors}
          onLook={openLook}
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

      {explaining && (wide ? showSide : true) && (
        <ExplainPanel
          edition={edition}
          books={books}
          bookId={bookId!}
          onBook={(commentary) => setSettings((s) => ({ ...s, commentary }))}
          target={explain!}
          side={wide}
          onGroup={setExplainGroup}
          onGo={(n) => setExplain({ n, opened: null, key: Date.now() })}
          onClose={closeExplain}
        />
      )}
      {showSide && !explaining && (
        <SidePanel
          n={selected ?? focusVerse}
          edition={edition}
          colors={colors ?? null}
          note={notes[selected ?? focusVerse] ?? ''}
          twins={settings.twins ? (twins.get(selected ?? focusVerse) ?? []) : null}
          onNote={() => setPanel({ type: 'note', n: selected ?? focusVerse })}
          onJump={jumpTo}
        />
      )}

      {tab === 'read' && active && !following && settings.autoScroll && play.verse != null && !pick && (
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
            repeatLabel={`×${times(active ? play.verseTimes : repeat.verseTimes)}`}
            onOpen={() => setMemorize(true)}
            onPlay={togglePlay}
            onRepeat={() => setPanel({ type: 'repeat', n: focusVerse })}
            onStop={() => player.stop()}
          />
        ) : (
          <div className="no-audio">لا توجد قراءة مسجّلة لهذه النسخة بعد.</div>
        )}
        <nav className="tabbar">
          {TABS.map(([id, label, Icon], i) => (
            <Fragment key={id}>
              <button className={tab === id ? 'on' : ''} onClick={() => goTab(id)} aria-current={tab === id ? 'page' : undefined}>
                <Icon size={23} strokeWidth={tab === id ? 2.2 : 1.7} />
                <span>{label}</span>
              </button>
              {i === 0 && (
                <button className={panel === 'look' ? 'on' : ''} onClick={openLook} aria-label="المظهر والخط">
                  <span className="tab-glyph" aria-hidden="true">
                    أ
                  </span>
                  <span>المظهر</span>
                </button>
              )}
            </Fragment>
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
          colors={settings.memorizeColors ? (colors ?? null) : null}
          onMark={setOpenMark}
          canPlay={hasAudio}
          peek={settings.curtain}
          onHide={(hide) => setSettings((s) => ({ ...s, hide }))}
          onClose={() => setMemorize(false)}
          onPlay={togglePlay}
          onStep={step}
          onStop={() => (active ? player.stop() : setMemorize(false))}
          onReplay={() => (active ? player.replay() : hasAudio && startQueue(focusVerse, focusVerse, focusVerse, { verseTimes: 1, rangeTimes: 1 }))}
          onOpenRepeat={() => setPanel({ type: 'repeat', n: focusVerse })}
          onSpeed={(speed) => setRepeat((r) => ({ ...r, speed }))}
          onFade={() => setRepeat((r) => ({ ...r, fade: !r.fade }))}
          onMastered={(n, yes) => {
            setMastered((m) => {
              const next = { ...m }
              if (yes) next[n] = Date.now()
              else delete next[n]
              return next
            })
            // «لم أتقنه» marks the verse as weak, for the memorization map.
            if (!yes) setWeak((w) => ({ ...w, [n]: { count: (w[n]?.count ?? 0) + 1, at: Date.now() } }))
            if (yes) step(1)
          }}
        />
      )}

      {panelEl}
      {openMark && colors && <ColorCard open={openMark} colors={colors} onClose={() => setOpenMark(null)} />}
    </div>
  )
}
