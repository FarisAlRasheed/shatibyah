# Prompt: Shatibiyyah timing agent (reciter audio)

Recommended model: **Sonnet**. Run this only **after** the text agent has finished and `data/editions/qasim/edition.json` exists. Copy everything below the line into the other agent.

---

You are preparing the recitation audio and the verse timings for a Shatibiyyah memorization app.

- **Reciter:** د. محمود بن حليم (reciter id: `mahmud-haleem`)
- **Source page (official site of الشيخ عبد المحسن القاسم):** https://a-alqasim.com/sounds-explain/081401asshaatibiyyah_mahmudhaleem/

The site already splits the recitation into **30 MP3 files, one per باب**, all under:
`https://files.a-alqasim.com/audio/Mutoon/MahmudHaleem/0814AsShaatibiyyah/`

| # | File name | Section |
|---|---|---|
| 01 | `0814AsShaatibiyyah_01_Intro_MahmudHaleem.mp3` | مقدمة الناظم |
| 02 | `…_02_Istiadhah_…` | باب الاستعاذة |
| 03 | `…_03_Basmalah_…` | باب البسملة |
| 04 | `…_04_SurahUmmAlQuraan_…` | سورة أم القرآن |
| 05–29 | (the remaining أصول chapters, in the page's order) | |
| 30 | `0814AsShaatibiyyah_30_FarshAlHuruf_MahmudHaleem.mp3` | باب فرش الحروف (all surahs in **one** file, ~44 MB, ~1 h 45 min) |

Read the exact file names and section titles from the page itself. Its HTML lists each `<audio>` source next to its title. There is also one file with the whole poem (`…/0814AsShaatibiyyah_MahmudHaleem.mp3`); don't use it.

Facts already checked:
- The files are MP3, **mono, 56 kbps CBR, 44.1 kHz**. They are already small, so **don't re-encode**. Cut with `ffmpeg -c copy` only.
- The server supports Range requests, but its CORS header allows only `https://a-alqasim.com`. So the app can't stream from it, and must host its own copies of the files.

## Scope for this run: PILOT (two chapters only)
This is a test run. Work **only** on **سورة الأنعام** and **سورة الأعراف**. `data/editions/qasim/edition.json` contains only those verses (see its `partial` field).
- Download **only file 30** (فرش الحروف). Both surahs are inside it.
- `reciter.json` covers only the pilot verses, with the same `partial` field as the edition. "Every verse has exactly one entry" applies within that range.
- At the end of the report, add **"Problems met"**: anything that went wrong or needed guessing (cutting the surahs out of file 30, intros, pauses, tools), so the prompt can be improved before the full run.

(For the full run, this section will be removed.)

Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`. First read:
- `PLAN.md`, especially section 9, "Data format"
- `data/editions/qasim/edition.json`, the verified Al-Qasim text (verses and sections). The recitation follows **this** edition. Ignore `data/editions/zubi/`.

## Tools
You need `curl`, `ffmpeg` and Python. `ffmpeg` is **not** installed on this Mac yet. Ask the owner before installing anything (for example `brew install ffmpeg`, or pip packages such as a Whisper model). Run long jobs in the background.

## Step 1: Download and cut the audio
1. Download the needed source files with `curl` into `data/reciters/mahmud-haleem/_source/`, keeping the original file names. Don't re-download a file that is already there with the right size.
2. **Match source files to the edition's `sections`.**
   - Files 01–29 map one-to-one to the أصول sections, by order and by title. If a title or the order doesn't line up with `edition.json`, stop and show the owner the mismatch table.
   - **File 30 (فرش الحروف) holds every surah.** Split it into **one file per surah section**, so the offline download stays per chapter. The owner has given the surah times inside file 30 for the pilot:

     | Section | Starts | Ends |
     |---|---|---|
     | سورة الأنعام | 0:26:50 (1610 s) | 0:33:40 (2020 s) |
     | سورة الأعراف | 0:33:40 (2020 s) | 0:38:25 (2305 s) |

     1. Use these times. Snap each one to the middle of the nearest silence within ±3 s, so no cut lands mid-word. If there's no silence within ±3 s, stop and tell the owner.
     2. Cut with `ffmpeg -ss <start> -to <end> -c copy`.
     3. If the reciter says the surah's name at the start, it stays at the start of that file. It isn't a verse (see Step 2).
     4. Record the given times and the snapped times in the report.
3. Save the app's files to `data/reciters/mahmud-haleem/audio/`:
   - files 01–29: copied as they are, named `bNN.mp3` (NN = the source number)
   - file 30 cuts: `farsh-<sectionId>.mp3`
4. For each file, record `sourceUrl`, `sourceStart` and `sourceEnd` (seconds within the source file; `null` for a whole file) and `bytes`.

## Step 2: Find where each verse starts and ends
For each app file, you know exactly which verses it contains, from its sections in `edition.json`.

1. **Find pauses.** Detect pauses (silence or low energy) with their positions and lengths. ffmpeg `silencedetect` at a few thresholds, or an energy curve in Python.
2. **Watch out for two traps:**
   - The reciter also pauses **between the two halves** of each verse, so not every pause is a verse boundary.
   - There may be speech **before the first verse** of a file (the chapter title, استعاذة or بسملة). It must not be counted as a verse.
3. **Pick the boundaries.** You need exactly N−1 boundaries for N verses, plus the start of the first verse and the end of the last. Choose them by combining two signals:
   - pause length: verse pauses are usually longer than half-verse pauses
   - expected position: verse duration is roughly proportional to the verse's text length with diacritics removed
   Use dynamic programming to find the best assignment, rather than simply taking the N−1 longest pauses.
4. **Verify with speech recognition if possible.** If an Arabic speech-recognition model can run locally (e.g. Whisper), transcribe the start of each detected verse and fuzzy-match it against that verse's first words, ignoring diacritics. Use the match to fix boundaries and to set the confidence.
5. **Score each verse** with a `confidence` from 0 to 1, based on how clear the pause is, how close it is to the expected position, and the speech-recognition match if one was done.
6. **Don't guess about unusual recitation.** If the reciter repeats a verse, skips one, or adds speech in the middle, record it in a `notes` array in `reciter.json`.

## Step 3: Write the output (format from PLAN.md section 9)
1. `data/reciters/mahmud-haleem/reciter.json`
   - fields: `id`, `name`, `editionId: "qasim"`, `source` (the page URL above), `files`, `verses`, `notes`
   - every verse 1..verseCount has exactly one entry
   - times are in seconds from the start of that app file, with 2 decimal places, and `start < end`
2. `data/reciters/mahmud-haleem/timing-report.md`, with:
   - a summary
   - the file-to-section matching table, including the given and snapped cut times for each surah in file 30
   - the 40 verses with the lowest confidence, with file and time
   - all `notes`
3. `tools/timing-check.html`: a single standalone page for spot checks. It loads `reciter.json` and `edition.json`, and lists the verses with their text and a play button that plays exactly that verse's range. It sorts by lowest confidence first, and lets the owner nudge a start or end time by ±0.1 s and export the corrected `reciter.json`.

## Limits
- Do not change any `edition.json`, and do not build the app itself.
- Keep `_source/` out of the app: only `audio/` gets shipped.
- The owner has confirmed permission to use this recording in the app.
- When finished, report: the number of app audio files, total audio size, how many verses are below 0.6 confidence, and the paths of the files you created.
