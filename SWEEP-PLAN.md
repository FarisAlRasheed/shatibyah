# App sweep plan (2026-10-21)

Done already: owner WhatsApp `966560209077` and email `farsalrasheed27@gmail.com` are set in `src/config.ts` (goes live with the next deploy).

How the list was made: I read all the app code and ran the main flows in the browser at phone size: reader, verse sheet, repeat, memorization, test-yourself, index, search, saved, settings, both editions, and themes.

## Bugs found

| # | Bug | Seen how | Severity |
|---|---|---|---|
| B1 | Tapping a verse while another plays, then "تكرار مفصّل", sets up the repeat for the **playing** verse, not the tapped one | Reproduced: tapped 640 while 634 played, and the sheet said "البيت ٦٣٤" | High |
| B2 | Jumping somewhere (index, search, saved) while audio plays gets pulled straight back to the playing verse by follow mode | Reproduced: jumped to الأعراف and landed back on 635 | High |
| B3 | **Possible:** a pause between repeats (مهلة) may never end while the phone is locked, because iOS can suspend the page while no audio plays | From the code; needs a device test | High if real |
| B4 | The mini-player caption shows the saved repeat setting ("بيت ×٣") during "play from here", where each verse plays once | Reproduced | Low |
| B5 | If an audio file is re-cut later (the full run will do this), downloaded copies stay old and the timings won't match them | From the code | High for the full run |
| B6 | The splash screen and install colors are still the old green (`#1f4d3a`, `#faf7f0`). The icons are placeholders | From the code | Medium |
| B7 | If any screen crashes, the whole app goes blank, with no message and no way to recover | From the code | Medium |
| B8 | The dev server mishandles `Range: bytes=-N` requests (development only) | From the code | Low |

## UX improvements

| # | Improvement |
|---|---|
| U1 | **Smart follow:** if you scroll or jump yourself, follow mode pauses and a pill appears: «العودة إلى البيت المقروء» (fixes B2) |
| U2 | **Lock screen:** show the app icon, the chapter name and the verse; add a stop button |
| U3 | **Swipe gestures:** swipe down to close a sheet or memorization mode; swipe sideways in memorization mode to change verse |
| U4 | **Repeat summary:** the repeat sheet says what will play, e.g. "٥ أبيات × ٣ = ١٥ مرة · نحو ٤ دقائق" |
| U5 | **Index:** progress per chapter (verses mastered out of total), plus a "continue where you left off" card at the top |
| U6 | **Search:** highlight the matched words; treat a final ى and ا as the same letter (Zu'bi وانجلا = Al-Qasim وانجلى) |
| U7 | Clearer edition names in settings: "نسخة القاسم · مع التلاوة" / "نسخة الزعبي · نص فقط" |
| U8 | A proper app icon, a launch screen in the new colors, a status bar that matches the theme, and a nicer loading screen |

## How the work is split

The project folder isn't a git repository yet. **Step 0 (me):** `git init` and a first commit, so every change can be reviewed and undone.

Then three tracks run at the same time in this folder. Each one owns only its own files, so they can't overwrite each other.

### Track A: audio and offline (agent session)
Files: `src/player.ts`, `src/offline.ts`, `src/data.ts` (`audioUrl` only), `vite-data-plugin.ts`, the audio part of `vite.config.ts`.
- B3: keep the audio session alive during pauses between repeats (a silent clip), so repeats keep going while the phone is locked.
- U2: lock-screen artwork, chapter and verse in the metadata, stop handler.
- B5: versioned audio URLs (from file size or hash in `reciter.json`). The download screen can then spot a stale copy and offer to update it.
- B8: fix Range suffix requests in the dev server.

### Track B: reading and playback flow (me, in this session)
Files: `src/App.tsx`, `src/Reader.tsx`, `src/MiniPlayer.tsx`, `src/Memorize.tsx`, new `src/flow.css`.
- B1, B2 + U1 (smart follow and the return pill), B4, B7 (error screen), U3 (swipe gestures).

### Track C: screens, polish and branding (agent session)
Files: `src/screens.tsx`, `src/sheets.tsx`, `src/styles.css`, `index.html`, `public/` icons, the manifest part of `vite.config.ts`.
- U4, U5, U6, U7, U8, B6.

### Rules for every track
- Edit only your own files. If you need a change in another track's file, say so in your report instead of making it.
- No deploy, no git commits (I commit each track after checking it).
- Check with `npx tsc --noEmit`. Errors in files outside your track may come from another track's unfinished work; report them, don't fix them.
- Test in the browser at phone size (375px) and at desktop width.

### At the end (me)
1. Review each track's diff, then commit each as its own commit.
2. Run all flows together in the browser and run the production build.
3. Deploy to Vercel. You then test on the iPhone: locked-screen repeat with a pause, offline audio, swipe gestures.

Not in this sweep: the full-poem run (text decisions, prompt fixes, all 30 audio files). That comes next, as its own plan.
