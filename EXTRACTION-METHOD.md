# Extraction and audio-cutting method (what worked, and what to change)

Written 2026-11-03 from the two runs so far: the pilot (الأنعام + الأعراف) and run 2 (فرش الحروف → end, verses 445–1173), plus the main session's hand fixes afterwards. Sources: `EXTRACTION-PLAN.md`, `prompts/01-text-agent.md`, `prompts/02-timing-agent.md`, `data/editions/qasim/diff-report.md` §7, `data/reciters/mahmud-haleem/timing-report.md`, commits `f515afb` and `37e79a4`.

**What is left:** verses **1–444** (مقدمة الناظم and all the أصول, section ids 5–33), on PDF pages about 9–76, and audio files **01–29** of د. محمود بن حليم (not downloaded yet).

---

## 1. Results of run 2 (the baseline to beat)

| | Text | Audio |
|---|---|---|
| Size | 729 verses, 99 PDF pages, 50 sections | 1 source file (1 h 45 min) → 48 app files, 44 MB |
| Automatic quality | 829 half-lines checked on images; 120 verses corrected from the image; the 10% random sample found **no** missed error | 30 verses below 0.8 confidence, 2 below 0.6 |
| Left for a human | 7 uncertain verses + 1 heading | 11 verses re-cut by hand afterwards (672–675, 797, 1015–1017, 1031–1032, 1173) |
| Real problem not caught by the agent | none known | boundaries in the middle of a verse, inside a spoken title, and after the closing words «تم بحمد الله» |

So the text method is sound and needs only small rule fixes. The audio method is mostly right, but its last-mile errors were caught only by the owner listening.

---

## 2. Text: the best method

### 2.1 The pipeline (keep it)
1. **Zu'bi skeleton from Turath book 7754.** Fetch only the pages in range, once, and parse them inside the script. It gives verse numbers, the half split and word boundaries.
2. **Two PDF extractors, cross-checked.** Neither is right alone:
   - `pypdf` with positions: each text piece is assigned to its verse and half by the line it sits on. Its word order is scrambled, even inside a word.
   - macOS **PDFKit** `page.string`: the right reading order, but its `characterBounds` don't match the string, and selections merge the two staggered halves.
   - Find each half in the PDFKit stream as the run whose letter counts equal pypdf's half, then cut it into words on the Zu'bi boundaries.
   - Cross-check letter by letter. A mark that PDFKit drops but pypdf keeps (mainly the tanwīn of «اً») is taken from pypdf.
3. **Flag, then look.** A half is flagged if: no clean match, a real (non-style) difference from Zu'bi, an unclear order or split, a heading, or a known bad glyph (lam-alif, the Allah ligature, «اً», hamza seats, ornaments).
4. **Image check only for flags + a 10% random sample.** Render at 300 DPI with `tools/render-pdf.swift`. **Stack about 10 half-line crops (1100×116 px) into one image with a label column**: this was the cheapest way to check. Zoom into a single word only for one mark. The image always wins over the text layer.
5. **Report two tables**: real differences, and only a *count* of style-only differences.

### 2.2 Rule fixes learned in run 2 (put them in the next prompt)
- **Kashida:** remove U+0640 used for stretching, keep it where a word is split across halves, **and keep it where it is the seat of a mark** (ـٔ ـٰ ـۧ ـۨ).
- **Section ids:** the literal order of the table of contents (PDF pp. 177–180), counting the editor's front matter: المقدمة = 1, النسخ = 2, رموز القراء = 3, الأضداد = 4, **مقدمة الناظم = 5** … فرش = 34 … الخاتمة = 83. The list is already in `diff-report.md` §5; reuse it, don't rebuild it.
- **Merge, don't overwrite.** `edition.json` already holds 445–1173. The new run adds 1–444 and its sections, then drops `partial`. Verses 445–1173 must stay byte-identical.
- The text layer is **not letter-exact** for ligatures and some marks. «Trust the text layer when tokens match» holds only for the letter counts; the glyph list in step 3 is always flagged.

### 2.3 Token cost
- Images are almost all of the cost. 829 half-lines as stacks of 10 is about 83 images. Whole pages (≈1,600 tokens each) were viewed only to find a heading.
- Scripts printed only counts and flagged verse numbers. Keep that.
- **Lost in run 2:** the scripts lived in the agent's scratchpad and are gone. This time they go in `tools/extract/` so a re-run, or a later edition, costs almost nothing.

---

## 3. Audio: the best method

### 3.1 Pipeline used in run 2
1. **whisper.cpp `large-v3-turbo`, once per source file, word timestamps**, cached as JSON. The model is already at `~/.cache/whisper/ggml-large-v3-turbo.bin`; `whisper-cli` is installed.
2. **Section cuts from spoken titles.** The reciter says «باب …» / «سورة …» first. Whisper's word start lags (a word's `from` is the end of the previous word), so the cut goes in the **longest silence that starts within −1…+3.5 s** of the transcript time. The owner-given cuts landed in the same silences, which confirmed the rule. If a title isn't spoken (العنكبوت), cut at the pause between the last and first verse.
3. **Silence:** threshold = measured noise floor + 10 dB (floor ≈ −36.5 dB → −26 dB). A fixed −38 dB failed in the pilot.
4. **Dynamic programming** over pause candidates: verse length ∝ letter count (≈0.2 s per letter), a bonus for a half-verse pause near the middle, position drift, and the whisper match.
5. **Confidence** = 0.5·whisper match + 0.2·length fit + 0.2·pause clarity + 0.1·mid-verse pause. Match = trigram Dice between the transcript inside the verse and its PDF words, order ignored (right verse ≈ 0.7, neighbour ≈ 0.08).
6. **Cut with `ffmpeg -c copy`**, no re-encode. One app file per section, `audio/s<id>.mp3`.
7. **Times are speech edges:** `start` = speech onset, `end` = speech offset (gaps in run 2: 0.05–0.76 s, median 0.4). The player relies on this: it pads each verse into the gap, up to 0.3 s, 60% before and 40% after (`src/player.ts`). Don't put boundaries in the middle of the silence.

### 3.2 What went wrong and the fix
| Failure | Seen in | Fix for the next run |
|---|---|---|
| DP put a boundary in the middle of a verse | 672–675, 1015–1017, 1031–1032 | **Anchor on words, not pauses.** Each verse start must be the pause just before the whisper word that matches the verse's first word(s). DP only fills the gaps where no anchor is found. |
| A verse started inside a spoken title | 797 | Mark the title's words as "not verse" first, then fit verses only after the title ends. |
| The last verse ran into «تم بحمد الله» | 1173 | Mark known non-verse speech (titles, closing formula, du'a) and exclude it. |
| Whisper looped (hallucination) for 70 s | الشعراء | Detect repeated n-grams; re-transcribe that window alone with `--max-context 0`. Do it in the script, not by hand. |
| No automatic check caught the 11 bad verses | — | **Neighbour test:** flag every verse whose own words match its interval *less* than a neighbour's words do, or whose first and last words aren't inside its interval. These were exactly the failure cases. |
| Headings glued to verse text in the PDF layer | 8 surahs | Take headings and verse numbers from the finished `edition.json` when it exists, not from the raw text layer. |

### 3.3 The أصول audio is simpler
The site has one MP3 per باب. Files 01–29 match section ids 5–33 one-to-one (29 headings, 29 files), if the site's list agrees; check that first. Then most files need **no section cutting**: only trim the lead-in, or use them whole. Where a file holds two headings (for example ذكر ذال إذ … ذكر لام هل وبل, ids 19–22, may be one file), cut on the spoken titles as in 3.1 step 2.

### 3.4 Human review stays, but shorter
`tools/cut-editor.html` (the owner sets true cuts by ear and exports `cuts-feedback.json`) and `tools/timing-check.html` are the review step. The agent lists only the verses that fail the neighbour test or score below 0.8, so the owner listens to a few dozen, not 444.

### 3.5 Token cost
All audio work is scripts (ffmpeg, whisper, numpy), so it runs on **Sonnet** and never looks at images. Print only counts, cut times and flagged verse numbers. Save the scripts in `tools/timing/` for reuse.

---

## 4. Recommended setup for the remaining run (1–444)

| | Text agent | Audio agent |
|---|---|---|
| Model | Opus (judges marks on images) | Sonnet (scripts only) |
| Input | PDF pp. ~9–76, Turath 7754 for the same verses | site files 01–29, PDF text layer for words |
| Waits for the other? | no | no; it reads verse words from the PDF, and the main session checks that the ids and ranges match |
| Writes | `data/editions/qasim/*`, `data/editions/zubi/*`, `tools/extract/` | `data/reciters/mahmud-haleem/*`, `tools/timing/` |
| Merges into existing data | yes, 445–1173 untouched | yes, `s34`–`s82` untouched |
| Ends with | diff report §1–§7, uncertain list | timing report, neighbour-test list, low-confidence list |

Main session afterwards: check ids and ranges match, spot-listen to flagged verses, run the app, build, commit, deploy.

## 5. Decisions (2026-11-03)
1. Third agent = **colours** for the whole poem: 445–1173 now, then 1–444 once the text agent finishes. Green Quran places are found by script in a local Quran text first; a شرح is read only for ambiguous ones.
2. أصول audio stays one file per باب.
3. The 10% random image sample stays.

Prompts: `prompts/03-text-agent-usul.md`, `prompts/04-timing-agent-usul.md`, `prompts/05-colors-agent.md`.
