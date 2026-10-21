# Prompt: Shatibiyyah text agent, run 2 (فرش الحروف to the end of the book)

Read `EXTRACTION-PLAN.md` first. It explains why this method differs from the pilot. Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`.

You are building the exact text of **متن الشاطبية** in two editions, for a memorization app:
- **`qasim`**: الشيخ عبد المحسن القاسم's edition, the one being memorized. The reference is `sources/qasim.pdf`, and **the PDF always wins**.
- **`zubi`**: محمد تميم الزعبي's edition, exactly as Turath book **7754** has it.

Every letter and every mark matters.

## Scope
باب فرش الحروف from **سورة البقرة** to the **end of the book**. That includes بَابُ التَّكْبِيرِ, بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا and the closing verses. It is about verses 446–1173, on PDF pages **77–175**. Verse 446 is a guess: find the real first verse of فرش on PDF page 77.

- Both `edition.json` files hold only this range, with `"partial": {"from": <first>, "to": 1173}` and `verseCount: 1173`.
- **Overwrite** the pilot files. Verses 632–713 are redone under the new rules.
- Keep the old pilot `qasim/edition.json` as `data/editions/qasim/_pilot-edition.json`, for comparison only.

## Token budget (important: best result for the fewest tokens)
- **Scripts do the bulk work.** Write one Python script that does all of the following and writes results to files:
  - parse Zu'bi
  - extract the text-layer tokens for every page
  - match words to tokens
  - build `qasim`
  - flag doubtful verses

  Print only short summaries (counts, flagged verse numbers), never whole pages or JSON dumps.
- **Look at images only where needed:**
  - flagged verses: no clean token match, a real (non-style) difference from Zu'bi, an unclear order or split, or a heading
  - plus a random **10% sample** of the unflagged verses as a quality check
  - crop **single verse lines** (about 2000×130 px, 300 DPI); never view whole pages except to find a heading's position
  - if the sample shows any error the script missed, widen the check to that page and say so in the report
- **Turath:** fetch only the pages in this range, once. Parse each result inside the script run, and don't repeat it back.
- **Never re-read** a file or image you've already processed. Keep notes in `_progress.json`.

## Fixed conventions (don't change them; report anything that doesn't fit)
1. **Exactly as printed, with the PDF's own character codes.** Keep the Uthmani forms (U+06E1 sukun, U+065E, U+0657, ٱ, ٰ, ۥ, ٓ, etc.) as they appear. Don't merge them into the plain marks.
2. **Keep punctuation as printed:** «،» «:» «« »» ( ) and the rest.
3. **Kashida U+0640:** remove the justification stretching (`فَــتْــحُ` → `فَتْحُ`). Keep it only where a word is split across the two halves: `الـ` at the end of half a, `ـخَفِيفُ` at the start of half b.
4. **Never "correct" the poem.** Word splits across halves and unusual spellings are intentional.
5. Store the text as NFC.

## Tools (no installs needed)
- **Render a page:** `swift tools/render-pdf.swift sources/qasim.pdf <outDir> <first> <last> 300`, with outDir in your scratchpad. 300 DPI is sharp enough for every mark.
- **Zoom in:** crop with `sips -c <h> <w> --cropOffset <y> <x> in.png --out crop.png`, then look at the crop with the Read tool.
- **Exact character codes:** the PDF text layer, via Python `pypdf` (installed): `PdfReader('sources/qasim.pdf').pages[i].extract_text()`. Its **line order is scrambled** (halves swapped, words broken by justification), but each **word token keeps its exact code points**. Use the tokens for the codes and the image for the order.
- **Turath:** the MCP tools `get_book` (with `include_indexes: true`) and `get_page`. Turath `page_id` is not the printed page number, so use the index to find the pages.

## Step 1: Zu'bi from Turath
- Parse every verse in the range from Turath book 7754 into `{n, a, b}`, with halves separated by ` ... `. Convert Arabic-Indic digits to integers.
- Keep the Zu'bi text exactly as Turath has it.
- If a verse lacks the separator, split it where the PDF splits, but only if the words are the same. List these verses in the report.
- Write the chapter list using the **section id rule** below.
- Save to `data/editions/zubi/edition.json`. Write the file directly from your script's parsed output, never by retyping. If a tool's output can't be saved directly, parse it from the tool result inside the same script run.

## Step 2: Al-Qasim, page by page (hybrid method)
For each PDF page:
1. Render it at 300 DPI, and extract its text-layer tokens.
2. For each verse on the page, build the Al-Qasim halves:
   1. Start from the Zu'bi words for that verse as the skeleton (order and word boundaries).
   2. For each word, find the matching text-layer token (compare after removing marks and kashida). Take the **token's exact code points**, then drop the justification kashida.
   3. Where no token matches cleanly (merged or broken tokens), rebuild the word from the token fragments and the image.
   4. Read the order of the halves and the split point from the image, never from the text layer.
3. **Visual check of flagged verses (plus the 10% sample):** crop the verse's line(s), compare letter by letter and mark by mark, and zoom further on any word that differs from Zu'bi. If image and text layer disagree, the image is right; record it. The text layer carries the exact typeset glyph codes, so an unflagged verse whose tokens all match cleanly is trusted.
4. **Unclear marks:** don't guess. Use the most likely reading and list the verse under «Uncertain».
5. **Headings:** take them from the page as printed (e.g. «سُورَةُ سَبَأَ وَفَاطِرٍ» stays one section).
6. **Save progress** to `data/editions/qasim/_progress.json` after every page: the last page done, plus the verses so far. If interrupted, resume from there.

Save to `data/editions/qasim/edition.json`, with `"id": "qasim"` and the same `name` and `source` style as the pilot file. Put the PDF page range in `source`.

## Section id rule (the timing agent applies the same rule)
- Make the list of **every heading in the whole book**, in printed order: المقدمة = 1, then every باب, and under فرش الحروف every surah heading. Take it from the **PDF's table of contents (PDF pages 177–180, via the text layer)**. If something there is unclear, check it against the headings in the pages themselves.
- A section's `id` is its 1-based position in that list.
- `kind` is `"surah"` for headings under فرش, `"bab"` otherwise.
- `parent` is the فرش id for its surahs, and `null` otherwise.
- Each section's `start`/`end` is its verse range. فرش itself spans البقرة's first verse up to the verse before بَابُ التَّكْبِيرِ.
- Write the full heading list with ids into the report, including the أصول headings outside this run, so later runs reuse the same ids.

## Step 3: Report (`data/editions/qasim/diff-report.md`)
1. **Summary:** pages, verses, the number of real differences, the number of style-only differences, and the number of uncertain verses.
2. **Real differences table** (Zu'bi → Al-Qasim): letters, vowels, shadda, tanween, hamza forms. **Don't** list style-only differences one by one (mark order, `لاَ`/`لَا` alef-fatha placement, ى/ا at the end of a rhyme word). Give their count by kind instead.
3. **Uncertain:** verse, PDF page, what is unclear, and your reading.
4. **Image vs text layer:** where the two disagreed, and what you chose.
5. **The heading list with ids.**
6. **Validation, for both files:**
   - verse numbers are continuous from partial.from to 1173
   - `a` and `b` are non-empty
   - sections cover every verse, with nesting only فرش → surah
   - the text is NFC
   - no U+0640 remains except at word splits
   - no characters outside Arabic letters, marks, and the allowed punctuation `، : « » ( ) . ؟ !`
7. **Problems met:** anything to fix in this prompt for the أصول run.

## Limits
- Write only `data/editions/qasim/*` and `data/editions/zubi/*`, plus scratch files in your scratchpad. Don't touch app code, `data/reciters/`, or other files. Another session is doing the audio at the same time.
- No git commits, no deploy.
- When finished, report:
  - the verse range
  - the number of real differences
  - the number of uncertain verses
  - the section list with ids and ranges
  - the paths of the files you wrote
