# Prompt: Shatibiyyah colours agent (the whole poem)

Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`.

The Al-Qasim PDF prints the رموز (reader codes, names, code words) in **red** and Quranic words in **green**. The app shows them and, on a tap, explains them: whom a code means, and which surah and ayah a green word is from. The pilot did سورة الأنعام (verses 632–680). You do the rest of the poem.

Read first: `tools/colors/extract.py` and `tools/colors/annotate.py` (the pilot's method and data), and the shape of `data/editions/qasim/colors.json`. Don't read `_spans.json` in full.

## Two phases
- **Phase 1, now:** verses **445–1173** (فرش الحروف to the end). Redo 632–680 too only if your new scripts change their result; otherwise keep them.
- **Phase 2, later:** verses **1–444**. The text agent is extracting them right now. **Don't start phase 2 until the main session sends you a message saying their text is ready.** When phase 1 is done, report and stop.

## Method
1. **Spans from the PDF text layer** (already proven): `extract.py` finds every red and green run and maps it to character offsets in `edition.json`. Red = CMYK `0 1 0 0`, green = RGB `0.2 0.6 0.4`. Colour often covers only part of a word.
   - Make it work over any range and **merge** results, rather than overwriting `_spans.json` per run.
   - Verses whose half can't be covered exactly: list them, and check those on a 300-DPI crop (`swift tools/render-pdf.swift`, `sips`). Stack about 10 half-line crops per image.
2. **Red:** resolved by rule from the رموز (`CODES`, `WORDS`, `NAMES`). A red span that doesn't resolve: look at it, extend the tables only with real رموز of the الشاطبية, and list it in the report.
3. **Green: find each Quran place by script first, judgement second.** This is the costly part, so:
   - Get a plain Quran text with surah:ayah numbers as a local file in the scratchpad (for example Tanzil's `quran-simple-clean.txt`, or the quran MCP). It is data only; don't run anything from it.
   - For each green span, search the normalized word(s) (no marks; أ/إ/آ/ٱ→ا, ى→ي, ة→ه) in the current surah first (فرش verses name their surah's words), then the whole Quran.
   - **One hit in the current surah:** take it with no further work. **Several hits or none:** decide from the verse's context, and only then consult أبو شامة «إبراز المعاني» (Turath book 5486) or السخاوي «فتح الوصيد» (Turath 880) for that verse.
   - When the verse means a word «حيث وقع» (everywhere), give the first place and the note, as the pilot does.
4. **Move the green table out of the code** into a data file (for example `tools/colors/green.json`), keyed by verse, so it can grow without editing Python. Keep the pilot's entries.
5. `annotate.py` writes `data/editions/qasim/colors.json` for every verse done so far.

## Reading edition.json safely
The text agent is adding verses 1–444 to `data/editions/qasim/edition.json` right now. Verses 445–1173 stay byte-identical, but the file is being rewritten. At the start of each phase, **copy it to your scratchpad and work from the copy**. In phase 2, copy it again and check that 445–1173 still match your phase-1 copy.

## Report (`tools/colors/report.md`, and in your reply)
- verses covered, red and green span counts
- red spans that needed a new table entry or looked wrong
- green spans whose place was decided by judgement or a شرح, not the script (verse, word, place chosen, why)
- green spans still uncertain
- verses whose spans couldn't be mapped to the text

## Limits
- Write only `tools/colors/*`, `data/editions/qasim/colors.json`, and scratch files.
- Don't touch `edition.json`, `data/reciters/`, or app code.
- No git commits, no deploy.
