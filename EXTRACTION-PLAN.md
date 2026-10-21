# Text and audio extraction plan (from the pilot's lessons)

Written 2026-10-21 after the pilot (الأنعام + الأعراف, verses 632–713) and the reports of both pilot agents.

## Scope of this run
**باب فرش الحروف from سورة البقرة to the end of the book**, including:
- every surah heading under فرش الحروف
- بَابُ التَّكْبِيرِ
- بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا
- the closing verses

That is about verses 446–1173, on PDF pages 77–175 (printed pages 75–173). The pilot range 632–713 is redone too, so the whole range follows one set of rules.

## What went wrong in the pilot, and the fix

| Pilot problem | Fix for this run |
|---|---|
| No PDF renderer, so the marks were read at low resolution | `tools/render-pdf.swift` renders any page at 300 DPI with macOS PDFKit; nothing to install. `sips` crops a line or a word to zoom in. |
| The PDF text layer looked "scrambled" | Its line order is scrambled, but each **word** keeps its exact character codes. **Hybrid method:** use the text-layer words for their exact codes, order them using the page image and the Zu'bi skeleton, then check every word against a zoomed crop. |
| Turath `page_id` ≠ printed page; the pilot's range was wrong | Use `get_book` indexes for page ids; never assume a page number. |
| Decisions made without a rule (marks, punctuation, kashida) | Fixed conventions, below. |
| The diff report was too noisy (every «لاَ»/«لَا» style difference) | Report two tables: **real** differences (letters, vowels, shadda, tanween) and a count of **style-only** ones (mark order, alef-fatha placement), without listing those one by one. |
| Silence threshold set as a fixed −38 dB missed pauses (noise floor ≈ −37 dB) | Thresholds relative to the measured noise floor (floor + 9…12 dB). |
| Half-verse and verse pauses are nearly the same length | Keep the dynamic-programming fit on verse length plus the mid-verse pause, and add speech recognition. |
| No speech recognition, so confidence came from pauses only | Install **whisper.cpp** (Homebrew) with the official ggml `large-v3-turbo` model. Use it to find each surah's spoken title, and to check that each verse starts with its own words. |
| Surah cut times inside file 30 came from the owner | The owner gave only الأنعام and الأعراف. The rest are found automatically: the reciter says each surah title, which whisper detects, then the cut snaps to silence. |

## Text conventions (apply to every verse)
1. **Exactly as printed.** Keep every letter and mark the PDF has, with the PDF's own character codes. This includes Uthmani forms like ۡ (U+06E1), U+065E and U+0657; do not merge them into the plain marks. (The pilot did merge them; that is undone.)
2. **Punctuation as printed:** «،» «:» «« »» ( ) and others are kept. The app's search ignores them.
3. **Kashida (ـ):** remove the justification stretching. Keep a kashida only where a word is split across the two halves (`الـ` / `ـخَفِيفُ`).
4. Never "correct" the poem. Unclear marks: keep the most likely reading and list the verse under «Uncertain».
5. Unicode NFC. Mark order within a letter follows NFC.

## Section ids (stable for when the أصول are added later)
- A section's `id` is its position in the whole book's list of headings (every باب and every surah, in printed order, المقدمة = 1). Take the list from the PDF's table of contents (PDF pages 177–180).
- `kind`: `bab` or `surah`.
- Surahs under فرش الحروف have `parent` = the فرش id. Combined headings («سُورَةُ سَبَأَ وَفَاطِرٍ») stay one section, as printed.
- The text agent and the timing agent compute the same ids independently; the main session checks that they match.

## Audio
- Source: د. محمود بن حليم, official site. File 30 (فرش الحروف) is already in `data/reciters/mahmud-haleem/_source/`. The timing agent checks on the site whether التكبير and مخارج الحروف are inside file 30 or in other files, and downloads only what's needed.
- One app file per section (`audio/s<id>.mp3`), cut with `ffmpeg -c copy`. The pilot's `farsh-1`/`farsh-2` files are replaced.
- Timing: pauses relative to the noise floor, dynamic programming on verse length and the mid-verse pause, whisper word timestamps to confirm each verse start, and a confidence score.
- Verse numbering, words and headings come from the PDF text layer (local and free), so timing doesn't wait for the text agent and doesn't use Turath.

## Saving tokens
- Scripts do the bulk work: matching, pause finding, whisper, and the dynamic-programming fit. Agents read only short summaries.
- The text layer gives the exact typeset character codes, so images are checked only for flagged verses plus a 10% random sample, as single-line crops (about 350 image tokens each instead of about 1,600 for a whole page).
- Turath is used once, by the text agent only, for the Zu'bi text. Section ids come from the PDF's table of contents for both agents.
- The timing agent runs on **Sonnet**: its work is scripting, not reading images. The text agent keeps the stronger model because it judges marks visually.

## Order of work
1. Text agent and timing agent run **in parallel**: `prompts/01-text-agent.md` and `prompts/02-timing-agent.md`.
2. Main session:
   - checks that section ids and verse ranges match between `edition.json` and `reciter.json`
   - spot-listens to the lowest-confidence verses with `tools/timing-check.html`
   - runs the app on the new data (reader, search, index, repeat, plan, offline download)
   - builds, commits, and deploys to Vercel
3. The owner reviews the «Uncertain» list and the low-confidence verses on the phone, and uses «إبلاغ» for anything wrong.
