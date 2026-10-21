# Shatibiyyah Reader — Plan (v4)

Status: planning. Nothing is built until the plan is approved. Starts with a pilot on سورة الأنعام and سورة الأعراف (see section 12).

## 1. Scope

**In:** everything tied to reading the poem:
- reader
- recitation playback
- detailed repeat
- notes
- bookmarks
- search
- flagging wrong timings

**Out:** explanations (شروح) and unrelated features.

**Phase 1:** two text editions and one reciter.
- **Al-Qasim (عبد المحسن القاسم):** the default edition, **with audio**.
- **Al-Zu'bi (محمد تميم الزعبي):** text only, no audio yet.

The edition switcher shows only the reciters belonging to the selected edition. When an edition has no reciter (Zu'bi for now), the player is hidden and a short note says no recitation is available for this edition yet. Reading, search, notes and bookmarks still work. Notes and bookmarks are tied to the verse number, so they appear in both editions.

## 2. Text editions

Editions differ only in tiny details (one fatha, one damma), but those details matter. The text agent works in this order:

1. **Receive the Al-Qasim PDF** from the owner. It is the reference: the copy that is memorized.
2. **Look for a ready digital Al-Qasim text** in official online libraries: **المكتبة الشاملة** (shamela.ws) and **Turath** (turath.io). If one is found, check it against the PDF verse by verse, fix any differences to match the PDF, and use it.
3. **If no ready text exists**, start from the **Zu'bi** text on Turath (book 7754, دار الهدى / دار الغوثاني, ط4 1426هـ, verses 1–1173 with diacritics). Compare **every verse** with the Al-Qasim PDF, letter by letter and mark by mark, and take the **Al-Qasim** reading wherever they differ. A search on 2026-10-21 found no Al-Qasim text on Turath, so this is the likely path.
4. **Produce both editions for the app:**
   - `qasim`: the verified Al-Qasim text.
   - `zubi`: the Zu'bi text exactly as Turath has it.
5. **Produce a differences report** listing every verse where Zu'bi and Al-Qasim differ, so it can be reviewed.

Rules:
- Text is shown exactly as the source has it. Never "correct" anything.
- Word splits across the two halves (e.g. `الـ` / `ـخفيف`) are intentional.

This work is done by a separate agent; its prompt is in `prompts/01-text-agent.md`.

## 3. Reciter audio and verse timings

- **Reciter:** د. محمود بن حليم. **Source:** the official site of الشيخ عبد المحسن القاسم (https://a-alqasim.com/sounds-explain/081401asshaatibiyyah_mahmudhaleem/). It has 30 MP3 files, one per باب, already mono 56 kbps. باب فرش الحروف is a single file of about 1 h 45 min that holds every surah. (This replaces the YouTube video.)
- The site only allows its own domain to stream the files, so the app hosts its own copies.
- A separate agent (prompt: `prompts/02-timing-agent.md`) will:
  1. download the files (no re-encoding),
  2. keep one file per باب, and split فرش الحروف into one file per surah,
  3. automatically detect where each verse starts, using silences and the known verse count per file.
- Each verse timing gets a confidence score, so weak spots can be checked first.
- The timings are matched to the **Al-Qasim** edition (`editionId: "qasim"`).
- **Permission:** confirmed by the owner. The app is free and non-commercial, and the owner knows the creator.

## 4. Repeat (the main fix)

- **Scope:** one verse / range from X to Y / a whole chapter / the whole poem.
- **Repeat each verse:** N times or endless.
- **Repeat the whole range:** N times or endless.
- **Pause between repeats:** 0–N seconds, so the listener can recite back.
- **Playback speed.**
- **Live counter**, e.g. "verse 3 of 5 · round 2 of 3".

## 5. Reader screen

- Right to left. The two halves are side by side on wide screens and stacked on phones.
- Adjustable font size.
- The verse being recited is highlighted, and the page auto-scrolls to follow it.
- Chapter list, jump to a verse number, tap a verse to play.

## 6. Notes, bookmarks, search

- **Notes:** per verse, saved on the device only. No server, no accounts.
- **Bookmarks:** per verse, with an optional label, saved on the device.
- **Search:**
  - by words, ignoring diacritics (results still show full diacritics)
  - by verse number
  - by chapter name

## 7. Flagging a wrong timing or text

Each verse has a "report a problem" button. The user picks the problem type (wrong timing / text differs) and adds an optional comment, then chooses how to send it:
- **WhatsApp:** opens `wa.me/<owner number>` with a ready message.
- **Email:** opens `mailto:<owner email>` with a ready subject and body.

The ready message includes the app version, edition, reciter, verse number, the verse text, the chapter and the problem type.

The owner's WhatsApp number and email live in one config file. There is no server.

## 8. Technology

- **Vite + React + TypeScript:** a static site with no backend.
- **vite-plugin-pwa (Workbox):** offline support, "Add to Home Screen" and automatic updates.
- **Hosting:** Vercel or any free static host.

**Offline audio:**
- The audio is not included in the first install, which would be too large.
- A "Download for offline" screen downloads audio **chapter by chapter** (falling back to the whole poem if chapter downloads prove hard), with progress and the size of each chapter.
- Audio is the site's own MP3 (mono, 56 kbps, about 25 MB per hour; about 72 MB for the whole poem), cut without re-encoding. It is served from the app's own host.
- The service worker must answer HTTP Range requests from the cache, because iPhone Safari needs them to play and seek audio. This will be tested on a real iPhone through iPhone Mirroring.

**Device data:** notes, bookmarks, repeat settings and last position are saved in browser storage on the device.

## 9. Data format (shared contract for all agents)

### Edition: `data/editions/<editionId>/edition.json`
```json
{
  "id": "qasim",
  "name": "متن الشاطبية — نسخة الشيخ عبد المحسن القاسم",
  "source": "PDF: <file name / printing details>",
  "verseCount": 1173,
  "sections": [
    { "id": 1, "title": "مقدمة", "kind": "bab", "parent": null, "start": 1, "end": 94 },
    { "id": 31, "title": "باب فرش الحروف", "kind": "bab", "parent": null, "start": 452, "end": 1072 },
    { "id": 32, "title": "سورة البقرة", "kind": "surah", "parent": 31, "start": 452, "end": 557 }
  ],
  "verses": [
    { "n": 1, "a": "first half exactly as printed", "b": "second half exactly as printed" }
  ]
}
```
(The section numbers in this example are illustrative only.)

- `a` is the first half (صدر) and `b` the second half (عجز), copied exactly as printed.
- Text is Unicode NFC. Only Arabic letters and marks are used: no tatweel added unless it is printed, no HTML, no verse numbers inside the text.
- Every verse 1..verseCount appears exactly once, and each sits in exactly one innermost section.

The Zu'bi edition uses the same format at `data/editions/zubi/edition.json`, with `"id": "zubi"`.

### Differences report: `data/editions/qasim/diff-report.md`
A table with columns: verse number · half (a/b) · Zu'bi text · Al-Qasim text · what changed.

### Reciter: `data/reciters/<reciterId>/reciter.json`
```json
{
  "id": "reciter-slug",
  "name": "اسم القارئ",
  "editionId": "qasim",
  "source": "https://a-alqasim.com/sounds-explain/081401asshaatibiyyah_mahmudhaleem/",
  "files": [
    { "id": "b01", "path": "audio/b01.mp3", "sectionIds": [1], "sourceUrl": "https://files.a-alqasim.com/.../0814AsShaatibiyyah_01_Intro_MahmudHaleem.mp3", "sourceStart": null, "sourceEnd": null, "bytes": 0 },
    { "id": "farsh-33", "path": "audio/farsh-33.mp3", "sectionIds": [33], "sourceUrl": "https://files.a-alqasim.com/.../0814AsShaatibiyyah_30_FarshAlHuruf_MahmudHaleem.mp3", "sourceStart": 1520.4, "sourceEnd": 2311.9, "bytes": 0 }
  ],
  "verses": [
    { "n": 1, "file": "b01", "start": 3.42, "end": 14.90, "confidence": 0.93 }
  ]
}
```
- Times are in seconds, measured from the start of that app file.
- `sourceStart`/`sourceEnd` say where a cut file sits inside the site's original file (`null` = the whole file).
- Every verse 1..verseCount has exactly one entry.
- If the reciter repeats or skips a verse, the agent records that in a `notes` array instead of guessing.

## 10. Agents and models

| Task | Prompt | Model | Why |
|---|---|---|---|
| Text (both editions) | `prompts/01-text-agent.md` | **Sonnet** | Must read tiny Arabic diacritics from PDF pages and compare 1,173 verses mark by mark. Haiku is more likely to miss or invent a fatha or damma, which defeats the purpose. |
| Audio and timings | `prompts/02-timing-agent.md` | **Sonnet** | Scripting work (curl, ffmpeg, Python), but the boundary-picking logic, with half-verse pauses and chapter intros, needs solid reasoning. |
| Small follow-ups (re-run validation, apply a list of fixes the owner already approved) | — | Haiku | Mechanical, clearly specified. |

Opus is not needed for either main task. If the text report has many "Uncertain" verses, those few can be re-checked with a stronger model, or by the owner.

## 11. Future (not built now)

- **More editions and reciters**, including a reciter for the Zu'bi edition.
- Syncing notes and bookmarks across devices.
- App Store / Google Play versions.

## 12. Build order (after approval)

**Pilot first.** Run the pipeline on just two chapters, **سورة الأنعام** and **سورة الأعراف** (both under باب فرش الحروف; Turath book 7754 pages 56–61, stopping before سورة الأنفال on page 62). Fix any problems, then run the remaining chapters the same way.

**Pilot round:**
1. **Text agent:** search the libraries; produce `qasim` and `zubi` for the two chapters only, plus the differences report. The owner reviews the report.
2. **Timing agent:** download only the فرش الحروف file, cut out the two surahs at the times the owner gave (الأنعام 0:26:50–0:33:40, الأعراف 0:33:40–0:38:25), and time them. Spot-check the verses with the lowest confidence.
3. **App:** build it on the pilot data:
   - reader and player
   - repeat
   - search, notes and bookmarks
   - flag via WhatsApp or email
   - offline download and PWA install
4. Test on iPhone (through iPhone Mirroring).
5. Review what went wrong in the text, the timings or the app, and fix the prompts or the code.

**Full round:**
1. Re-run both agents for all chapters, without the pilot limit, using the fixed prompts. Each prompt's "Scope for this run" section is removed for this.
2. Load the full data into the app, test again on iPhone, then deploy.

In the pilot, edition files contain only the pilot verses and mark this with a `"partial": { "from": <first verse>, "to": <last verse> }` field; the full files omit it.

## 13. Open items

- Owner's WhatsApp number and email for flags (needed at build time).
- ~~Reciter name and audio source~~: settled (د. محمود بن حليم, official site).
- `ffmpeg` must be installed on the Mac before the timing agent runs (`brew install ffmpeg`).
