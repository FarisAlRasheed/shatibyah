# Prompt: Shatibiyyah timing agent, run 2 (فرش الحروف to the end of the book)

Read `EXTRACTION-PLAN.md` first, then `data/reciters/mahmud-haleem/timing-report.md` (the pilot's report, including "Problems met"). Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`.

You prepare the recitation audio and verse timings for a memorization app.
- Reciter: **د. محمود بن حليم**, id `mahmud-haleem`.
- Source page: https://a-alqasim.com/sounds-explain/081401asshaatibiyyah_mahmudhaleem/

The owner has confirmed permission to use this recording.

## Scope
باب فرش الحروف from **سورة البقرة** to the **end of the book**: every surah heading, plus بَابُ التَّكْبِيرِ, بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا and the closing verses. That is about verses 446–1173.
- **Replace** the pilot output. The pilot's `audio/farsh-1.mp3` and `audio/farsh-2.mp3` get deleted, and its `reciter.json` and `timing-report.md` get overwritten.
- `reciter.json` gets `"partial": {"from": <first فرش verse>, "to": 1173}`.

## Token budget (important: best result for the fewest tokens)
- All analysis runs in **local scripts** (ffmpeg, whisper.cpp, Python). Write results to files in the scratchpad and print only short summaries: counts, cut times, flagged verses. Never print transcripts, pause lists or JSON in full.
- Run whisper **once** on each source file, with timestamps. Save it as JSON and reuse it.
- **No Turath:** get verse numbers, verse text, headings and the table of contents from the **PDF text layer** with `pypdf` (`sources/qasim.pdf`, a local file). The verse numbers are printed at the start of each verse line. The word order on a line may be scrambled, but you only need each verse's words and letter count, which order doesn't affect.
- Inspect only what fails a check: the flagged verses and the cuts that didn't match. Don't listen to or re-check verses that pass.

## Facts already known
- File 30 (`0814AsShaatibiyyah_30_FarshAlHuruf_MahmudHaleem.mp3`, 44 MB, ~1 h 45 min, MP3 mono 56 kbps CBR 44.1 kHz) is already in `data/reciters/mahmud-haleem/_source/`. **Don't re-download it.**
- **Check on the source page whether التكبير and مخارج الحروف are at the end of file 30 or in separate files.** Download only what's needed, with curl, into `_source/`.
- **Don't re-encode.** Cut with `ffmpeg -ss <a> -to <b> -c copy`.
- The site's CORS allows only its own origin, so the app hosts its own copies.
- **Owner-given cut times in file 30:**
  - الأنعام 1610.5 → 2020.63 s
  - الأعراف 2020.63 → 2304.76 s
  These are already snapped to silence; keep them.
- The MP3 noise floor is about −37 dB. Use silence thresholds **relative to the measured floor** (floor + 9…12 dB), not a fixed −38 dB.
- Half-verse pauses (~0.45–0.65 s) and verse pauses (~0.6–0.8 s) are close in length.
- Each surah starts with a few seconds of the reciter saying its title. That isn't a verse.

## Tools
- `ffmpeg`/`ffprobe` and Python with numpy are installed.
- **Install whisper.cpp:** `brew install whisper-cpp`. Get the official ggml model `ggml-large-v3-turbo.bin` from the whisper.cpp Hugging Face repo (`ggerganov/whisper.cpp`), and put it in your scratchpad or `~/.cache/whisper/`, **not** in the project.
  - The owner approved these installs for this run.
  - If `large-v3-turbo` is too slow on this Mac, use `medium`, and say so.
- Run long jobs in the background, and save intermediate results (pauses, transcripts) to the scratchpad so a restart doesn't redo them.

## Verse numbering and text (don't wait for the text agent)
- The text agent is rebuilding `data/editions/*/edition.json` in parallel right now, so don't read those files as final.
- Get the verse numbers, section boundaries and each verse's words from the **PDF text layer** (`sources/qasim.pdf`, PDF pages 77–175). It is the Al-Qasim edition, the one the recitation follows.
- Use the words for expected lengths (letters without marks and kashida) and for matching against whisper output.

## Section ids (the text agent applies the same rule)
- Make the list of **every heading in the whole book** in printed order (المقدمة = 1, every باب, and every surah heading under فرش), from the **PDF's table of contents (PDF pages 177–180, text layer)**.
- A section's `id` is its 1-based position in that list.
- Combined headings (e.g. «سورة سبأ وفاطر») count as one heading.
- Put the full list with ids in your report.

## Step 1: Find the section cuts
1. Run whisper on the whole file 30 (and any extra files) with timestamps. Save the transcript.
2. Find each surah or باب title spoken by the reciter («سورة البقرة», «سورة آل عمران», … «باب التكبير», …), in order.
3. Each cut goes in the silence just before the title. Snap to the middle of the nearest silence within ±3 s.
4. Check each cut: the verse texts of the section that follows should match the transcript after the cut.
5. If a title isn't spoken, place the cut between the last verse of one section and the first verse of the next, using the transcript match.
6. Keep the owner-given الأنعام/الأعراف cuts exactly.
7. Cut one app file per section into `data/reciters/mahmud-haleem/audio/s<id>.mp3`. Record:
   - `sourceUrl`
   - `sourceStart`/`sourceEnd` in seconds within the source file
   - `bytes`
   - `sectionIds: [<id>]`
8. Delete `audio/farsh-1.mp3` and `audio/farsh-2.mp3`.
9. If a section is too short to stand alone, it may share a file with the next one; say so in the report.

## Step 2: Verse boundaries in each app file
1. Find pause candidates (relative threshold) and an energy curve.
2. Fit N−1 verse boundaries with dynamic programming. Score each candidate on:
   - pause depth and length
   - closeness to the expected position (verse length ∝ letter count)
   - the presence of a half-verse pause near the verse's middle
3. Skip the spoken title at the start of each file.
4. **Check with whisper:** for each verse, the transcript words just after its start should fuzzy-match the verse's first words, ignoring marks and normalizing أ/إ/آ/ٱ→ا, ى→ي, ة→ه.
   - On a mismatch, try the neighboring candidates.
   - Lower the confidence if it's still unresolved.
5. Score each verse `confidence` 0–1 from pause clarity, position fit and the whisper match.
6. Record unusual recitation in `notes` instead of guessing: a repeated verse, a skipped verse, or extra speech.

## Step 3: Output
1. `data/reciters/mahmud-haleem/reciter.json`
   - fields: `id`, `name: "د. محمود بن حليم"`, `editionId: "qasim"`, `source` (the page URL), `partial`, `files`, `verses`, `notes`
   - every verse in the range has exactly one entry `{n, file, start, end, confidence}`
   - times are seconds within that app file, with 2 decimals, and `start < end`
2. `data/reciters/mahmud-haleem/timing-report.md`:
   - a summary: files, total size, how many verses are below 0.6 and below 0.8
   - the section table: id, title, source file, cut times, how each cut was found, verse range
   - the 40 lowest-confidence verses
   - the notes
   - the heading list with ids
   - Problems met
3. Make sure `tools/timing-check.html` still works with the new files. Update it only if it needs it.

## Limits
- Write only `data/reciters/mahmud-haleem/*` and `tools/timing-check.html`, plus scratch files.
- Don't touch `data/editions/`. Another session is writing them right now.
- Don't touch app code.
- No git commits, no deploy.
- When finished, report:
  - the number of app files
  - the total audio size
  - the verses below 0.6
  - the section list with ids and verse ranges
  - the paths you wrote
