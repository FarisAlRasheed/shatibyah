# Prompt: Shatibiyyah text agent, run 3 (مقدمة الناظم and the أصول, verses 1–444)

Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`. Read first:
1. `EXTRACTION-METHOD.md` (the method; §2 is yours)
2. `prompts/01-text-agent.md` (run 2's prompt: conventions, report format, tools)
3. `data/editions/qasim/diff-report.md` §1, §5 and §7 only (summary, heading ids, problems met). Don't read the long tables.

Run 2's prompt still applies, with the changes below. Where they differ, this file wins.

## Scope
- Verses **1 to 444**: مقدمة الناظم (section 5) through بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ (section 33). Verse 445 is the first فرش verse, on PDF page 77.
- Find the first page of مقدمة الناظم yourself (somewhere after the editor's front matter, about PDF page 9).
- Both editions: `qasim` (the PDF always wins) and `zubi` (Turath book 7754 as it is).

## Merge, don't overwrite
- `data/editions/qasim/edition.json` and `data/editions/zubi/edition.json` already hold 445–1173 and sections 34–83. **Add** verses 1–444 and sections 5–33. Leave every existing verse and section byte-identical: check this in your validation by comparing against a copy you take before you start.
- Remove `partial` when the file covers 1–1173; keep `verseCount: 1173`. Update `source` to name the whole PDF page range.
- Section ids: reuse the list in `diff-report.md` §5 exactly (مقدمة الناظم = 5 … الزوائد = 33). Sections 1–4 are the editor's front matter, with no verses: don't add them.
- Sections 19–22 (ذكر ذال إذ … ذكر لام هل وبل) sit inside باب الإظهار والإدغام (18). Keep them flat (`parent: null`), as printed in the table of contents, unless the page clearly nests them; say which in the report.

## Changes from run 2
1. **Kashida:** also keep U+0640 where it is the seat of a mark (ـٔ ـٰ ـۧ ـۨ).
2. **Two extractors, always:** pypdf with positions to assign pieces to verse and half; PDFKit `page.string` for reading order; locate each half in the PDFKit stream by letter counts; cross-check letter by letter. Always flag lam-alif, the Allah ligature, «اً», hamza seats and ornaments.
3. **Image checks:** every flagged half-line plus a **10%** random sample of the rest. Stack about 10 half-line crops (≈1100×116 px) per image with a label column. Zoom into single words only for one mark.
4. **Save your scripts** in `tools/extract/` (with a short usage comment at the top of each), not only in the scratchpad, so the run can be repeated cheaply.
5. **Report:** write the run-3 report to `data/editions/qasim/diff-report-usul.md` with the same sections as run 2. Keep `diff-report.md` as it is.
6. Progress file: `data/editions/qasim/_progress-usul.json`.

## Limits
- Write only `data/editions/qasim/edition.json`, `data/editions/qasim/diff-report-usul.md`, `data/editions/qasim/_progress-usul.json`, `data/editions/zubi/edition.json`, `tools/extract/*`, and scratch files.
- **Don't touch `data/editions/qasim/colors.json` or `tools/colors/`**: the colour agent is working there now.
- Don't touch `data/reciters/`: the audio agent is working there now.
- **Write `edition.json` atomically** (write a temp file in the same folder, then rename it), because the colour agent reads it.
- No app code, no git commits, no deploy.

## When finished, report
The verse range, the number of real differences, the uncertain verses, the section list with ids and verse ranges, the result of the byte-identical check on 445–1173, and the paths you wrote.
