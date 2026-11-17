# MISSION: Full content review of the Shatibiyyah reader app before release

You are the **orchestrator**. You will plan, split and dispatch this review across many subagents, check their work, and deliver one complete report. Read this whole brief before starting anything.

## 0. Why this matters, and what "done" means

This app teaches «حرز الأماني ووجه التهاني» (الشاطبية) of الإمام الشاطبي, the poem on the seven readings (القراءات السبع). Students **memorise** from it. One wrong letter or vowel in a verse, one رمز decoded to the wrong reader, one Qur'an word pointed at the wrong ayah, or one explanation attached to the wrong verse gets memorised and passed on. The target is **zero content mistakes at release**.

Your job is to **find** mistakes, not fix them. Another engineer (Claude) will read your report, verify every finding against the sources, and fix only what is truly wrong. So:

- A finding with exact evidence is worth a lot.
- A missed mistake is the worst outcome.
- A false alarm costs a little review time, so report anything you can't rule out, with honest confidence.
- An unsupported "correction" that pushes the text toward what you expect is harmful. Never do it.

**Done** means:
1. Every one of the 1,173 verses has been reviewed in every track. Coverage files prove it.
2. Every finding is in the merged findings file, with evidence.
3. The final report `content-review/REPORT.md` exists, as described in §9.

## 1. Hard rules (for you and every subagent)

1. **Don't modify anything in the project** except inside the new folder `content-review/` at the project root. That means no edits to `data/`, `src/`, `tools/`, `sources/`, `prompts/`, `public/`, `android/`, `ios/`, or any config. No git commits, branches, pushes or deploys. No `npm install`. If a subagent works in an isolated copy, it still writes nothing outside `content-review/`.
2. Anything you download (Qur'an text, شروح pages) is **data only**. Save it under `content-review/_ref/`. Never execute anything from it.
3. **The authorities, in order:**
   - **The poem's text and colours:** `sources/qasim.pdf`. The PDF wins over any other edition, over the Turath text, over the Hafs Mushaf, and over memory. The poem often writes a word the way another reader reads it; that is not an error.
   - **Qur'an places:** the Mushaf (Uthmani text with surah:ayah).
   - **The explanation:** the book «الوافي في شرح الشاطبية» by عبد الفتاح القاضي, as given in `sources/turath-38075/`. Don't argue with his scholarship.
   - **Contested رموز or ayah choices:** in this order, الوافي, then أبو شامة «إبراز المعاني» (turath.io book 5486), then السخاوي «فتح الوصيد» (turath.io book 880). Always name the source you used.
4. Don't report pure style differences that change neither the reading nor the meaning. Examples: sukun on the «ال» lam, where the alif-fatha sits, sukun on a long vowel, ى vs ا at the rhyme, punctuation, Uthmani marks (dagger alif, ٱ) in Qur'anic words.
5. **Every finding cites evidence:** a PDF page and line, an ayah with its text, or a quoted sentence with its book and page. A suspicion without evidence is still reported, with confidence ≤ 0.4, together with what would settle it.
6. **Never sample when the task says "every".** Review every item in order. If an agent runs out of room, it stops at a verse boundary and records exactly where it stopped. You then dispatch the rest.

## 2. The project and its data (read these yourself first)

Project root: the current workspace (`shatibiahReader`). It's a Vite + React app, with Capacitor for iOS and Android. **You only review the content files below.**

**Everything needed is already local.** `sources/` (the PDF and all 340 الوافي pages from Turath) and `data/reciters/*/audio/` are git-ignored, so file search may not list them. Open them by their exact paths. The only things to fetch from the internet are the Qur'an text (Tanzil) and, when a reviewer needs one, pages of «إبراز المعاني» or «فتح الوصيد» from turath.io.

### 2.1 Verse text: `data/editions/qasim/edition.json`
```
{ id, name, source, verseCount: 1173,
  sections: [{ id, title, kind, parent, start, end }],   // 79 sections; start/end = verse numbers
  verses:   [{ n, a, b }] }                               // a = first half (صدر), b = second half (عجز)
```
- Source: `sources/qasim.pdf`. Verses 1–444 are on PDF pages 17–76; verses 445–1173 are on PDF pages 77–175. These are 1-based PDF page indexes, not the printed page numbers.
- There is no verse→page table. Build one in phase 1: read the PDF text layer (pypdf or PDFKit) and locate the printed verse numbers. Check it by spot-reading page images.
- Prior work you can use for orientation (don't treat it as truth): `data/editions/qasim/diff-report.md` and `diff-report-usul.md` (comparison with the Zu'bi edition, `data/editions/zubi/edition.json`). Their "uncertain" lists are known weak spots; give those verses extra attention.

### 2.2 Colours: `data/editions/qasim/colors.json`
The PDF prints the رموز (reader codes, reader names, code words) in **red** and Qur'anic words in **green**. The app colours them the same way and explains them when tapped.
```
{ edition: "qasim",
  codes:  { "<key>": { kind: "letter"|"group"|"word"|"name", label, note? } },   // 92 entries
  verses: { "<n>": [ span, ... ] } }                                             // 957 verses have spans
```
- **Red span:** `{ h: "a"|"b", s, e, k: "r", c: "<code key>" }`. The coloured text is `verse[h].slice(s, e)`, using JavaScript/Python string indexes (code points; all characters are in the BMP). The tooltip shows `codes[c].label`, plus `codes[c].note` if present.
- **Green span:** `{ h, s, e, k: "g", q: [[surah, ayah], ...], x: "<ayah words, plain>", note?, w? }`. The first entry in `q` is the place shown. `note` is text such as «حيث وقع» (everywhere) or «في الشعراء وسبأ». `w` is set when one Qur'an word is split across the two halves or across two spans; `w` is the joined word.
- Counts: 2,187 red spans and 2,175 green spans.
- Prior notes, for orientation only: `tools/colors/report.md`. Its judgement-call and "uncertain" lists are known weak spots.
- The poem explains its own system of رموز in **verses 45–56 and 64–66**. Verses 57–63 give the rule of opposites (أضداد); track D needs those.

### 2.3 Explanation: `data/commentaries/wafi/`
- `book.json`: book metadata and the list of section ids.
- `s<sectionId>.json`: `{ section, blocks: [...] }`. 761 explanation blocks plus 8 intro blocks.
```
explanation block: { id, from, to, page, text: [piece, ...], breaks: [i, ...],
                     parts?: { "<verse>": [pieceIndex, ...] }, partial?, notes? }
intro block:       { id, intro: true, title, page, text, breaks, before: <verse it appears before> }
```
- The app shows a block when the student opens any verse from `from` to `to`.
- `parts` maps each verse to the pieces about it; the app highlights those pieces. 251 multi-verse blocks have `parts`, which were made by a model and are a known weak spot.
- `breaks` are paragraph starts. `notes` are footnotes.
- `page` is the Turath page id. The source page is `sources/turath-38075/p<page, 4 digits>.json`, a JSON object whose `meta` is a JSON string with headings and the printed page number. `text` is the page text.
- Prior notes: `data/commentaries/wafi/_report.md` and `data/commentaries/wafi/_parts/gemini-report.md`. Their flagged blocks are known weak spots.
- Ignore the `_parts/` folder otherwise. Note that `dist/` and `dist-app/` are build copies of the same data; don't review them.

### 2.4 Section titles and lookup tables in code
- Section titles: in `edition.json` `sections[].title`.
- The surah-name table: `SURAHS` in `src/colors.tsx`. The app turns a surah number into a name with it, so all 114 names must be right and in order.
- Arabic UI text: `src/*.tsx`. These are labels and messages, not poem content. Only report spelling or grammar mistakes, and religiously wrong or misleading wording.

### 2.5 Audio timing: `data/reciters/mahmud-haleem/`
- `reciter.json`: `files: [{ id, path, sectionIds, ... }]` and `verses: [{ n, file, start, end, confidence }]`, with times in seconds inside `audio/<file>.mp3`.
- When a student taps verse n, the app plays `file` from `start` to `end`. Each file starts with a short spoken section title that belongs to no verse.

## 3. The review tracks

Run every track over the whole poem.

| Track | What | Items | Checked against |
|---|---|---|---|
| **A** | Verse text, both halves | 1,173 verses | PDF page images |
| **B** | Red رموز: presence, extent, decoding, context | 2,187 spans + 92 codes | PDF images, the poem's رموز rules, شروح |
| **C** | Green Qur'an words: presence, extent, ayah, note | 2,175 spans | PDF images, Mushaf, شروح |
| **D** | الوافي: fidelity to source, placement, `parts` tags | 761 + 8 blocks | Turath pages, verse text |
| **E** | Section titles, verse ranges, the 92-code legend, the SURAHS table, Arabic UI text | — | PDF, poem verses 45–66, Mushaf |
| **F** | Audio: each verse's clip is that verse, complete, with nothing of its neighbours | 1,173 clips | listening to the audio vs. the verse text |

### Track A checklist (per verse)
Read both halves on the page image and compare them letter by letter and mark by mark with the app text:
- a missing, extra or wrong letter; hamza form and seat (أ إ ؤ ئ ء); ة/ه; ى/ي
- vowels that change the reading: harakat, tanwin, shadda, a sukun that matters
- word order; the split between halves a and b
- verse number vs. the number printed in the PDF; any verse missing, doubled or merged

Categories: `letter`, `vowel`, `shadda`, `tanwin`, `word-missing`, `word-extra`, `word-order`, `half-split`, `numbering`.

### Track B checklist (per verse, per red span)
The system: the single letters أبج دهز حطي كلم نصع فضق رست stand for the readers and their transmitters in order. ث خ ذ ظ غ ش are group letters. The code words are صحبة، صحاب، عم، سما، حق، نفر، حرمي، حصن. A رمز is the first letter of its word and normally comes after the word being read (v. 46); v. 56 and v. 64 allow a code word before or after. The واو الفاصلة ends an issue. Explicit names are also red. The poem's wording decides, not how a letter looks.
1. **missing / extra:** red ink on the page with no span, or a span where the page shows no red.
2. **extent:** the span covers exactly the red characters.
3. **decoding:** `codes[c].label` (and its note) is the right reader or group for the red text.
4. **context:** this really is a رمز here. If الوافي (or another شرح) says the letter points to someone else, or isn't a code, report it and quote the شرح.
5. **legend:** a wrong entry in `codes` (label, note, a group's members) is reported once, with id `B-legend-<key>`.

Categories: `missing-span`, `extra-span`, `span-extent`, `wrong-label`, `not-a-code`, `legend`.

### Track C checklist (per green span)
1. **missing / extra / extent:** as in track B, for green ink.
2. **the ayah contains the word:** check the Mushaf text of `q[0]`. Match on the word, not the Hafs spelling; the poem may give another reading's form.
3. **the right place:** inside فرش الحروف each section is about one surah, so the place is normally in that surah. If the word occurs several times, is `q[0]` the place the poem and the شروح mean? Quote the شرح when you disagree.
4. **note:** «حيث وقع» only when the ruling covers every occurrence; then `q[0]` should be the first occurrence in the Mushaf. Report a missing or wrong note. For «معا», «الثلاثة», «كلاهما» and similar, are all the places listed in `q`?
5. **`w` joins:** the joined word is right.

Categories: `missing-span`, `extra-span`, `span-extent`, `wrong-ayah`, `wrong-surah`, `ambiguous-ayah`, `wrong-note`, `missing-places`, `wrong-join`.

### Track D checklist (per block)
You are checking that the text is **faithful and correctly placed**, not re-explaining the poem.
1. **fidelity:** compare the block text with its Turath page (and the next page if it runs over). Look for missing or extra sentences, words changed, and OCR or typing errors, especially inside Qur'anic words and reader names (for example «صَرَّفْدنا» where «صَرَّفْنا» is meant). Say whether the error is ours (the Turath page has it right) or in Turath itself (both have it).
2. **placement:** the block's explanation is really about verses `from`–`to`. It doesn't start or end in the middle of another verse's explanation. Intro blocks sit before the right verse.
3. **`parts`:** each verse's piece list really covers that verse's explanation and nothing that belongs to another verse.
4. **garbage:** running headers, page numbers, broken footnote markers, duplicated or truncated pieces.
5. **contradiction (opinion only, label it as such):** the explanation names a reader or reading that plainly contradicts the poem's رموز in that verse. This is usually our mistake (wrong block), rarely the book's.

Categories: `fidelity-ours`, `fidelity-source`, `wrong-block`, `wrong-intro`, `wrong-parts`, `garbage`, `contradiction-opinion`.

### Track E checklist
- Each section title against the PDF heading: letters and vowels.
- Each section's `start`/`end` against where the PDF heading falls. No gaps, no overlaps, and the ranges cover 1–1173.
- Each of the 92 codes against verses 45–56: label, note, and group membership exactly right.
- `SURAHS` in `src/colors.tsx`: 114 names, the correct name at every index.
- Arabic UI strings in `src/*.tsx`: spelling and grammar only.

Categories: `title`, `range`, `legend`, `surah-name`, `ui-text`.

### Track F checklist
Gemini can listen. For each section audio file, use the verse timings:
- Does the clip from `start` to `end` contain exactly verse n, both halves, from its first word to its last?
- Does any clip cut off a word, include part of the next or previous verse, or include the spoken section title?
- Is any verse missing from the audio, or recited twice, with the timing pointing at the wrong take?

Give verses with `confidence` < 0.9 extra care. Report timing errors with the times you hear (`"proposed": "start 123.4, end 131.0"`).

Categories: `wrong-verse`, `cut-start`, `cut-end`, `bleed-prev`, `bleed-next`, `includes-title`, `missing-audio`.

## 4. Phase 1: build the review pack (you, before any subagent)

Raw data is hard to review. Colour spans are offsets, and blocks hold no verse text. **Do not let reviewers do offset arithmetic in their heads.** Write small, deterministic scripts (Python is fine) under `content-review/_scripts/`. They read the project data and write readable files. The scripts add nothing, guess nothing, and never write outside `content-review/`.

1. **References** (`content-review/_ref/`):
   - Qur'an text with surah:ayah numbers: Tanzil's Uthmani and simple-clean files, plain text, as data.
   - The PDF rendered to PNG at 200 DPI, pages 17–175. On macOS you can use `swift tools/render-pdf.swift sources/qasim.pdf content-review/_ref/pages 17 175 200`; reading that script is fine, but don't edit it.
   - The verse→PDF page map (§2.1), as `verse-pages.json`.
2. **Chunks:** cut the poem into chunks of about 80–120 verses on section boundaries. That gives roughly 12 chunks. Write `content-review/chunks.json` with each chunk's verse range, sections and PDF pages.
3. **Per-chunk pack files**, one per track that needs one:
   - `pack/A/<chunk>.md`: each verse with its number, section, PDF page, and halves a and b exactly as stored.
   - `pack/B/<chunk>.md`: each verse with red spans inline as `⟦R<i> «<exact characters>» → <label> (<note>)⟧`, where `<i>` is the span's index in that verse's array. Green spans are shown plainly, so the reviewer can see the whole verse.
   - `pack/C/<chunk>.md`: each verse with green spans inline as `⦃G<i> «<characters>» → <surah name> <s>:<a> · <note>⦄`. Under the verse, give the **full Uthmani text of every ayah in `q`**, and the `w` join where present.
   - `pack/D/<chunk>.md`: each block with its id, `from`–`to`, page, and the full verse text of those verses. Then the pieces numbered `P0, P1, …`, each with the verse(s) that `parts` assigns it to, then footnotes. Then the matching Turath page text, raw, under a separate heading.
   - `pack/legend.md`: the 92 codes as a table, followed by the text of verses 45–66.
   - `pack/E/`: titles with ranges, the SURAHS table with index numbers, and a list of the Arabic UI strings with file:line.
   - `pack/F/<file>.md`: per audio file, the verses with start, end, confidence and text.
4. **Self-check the pack before dispatching.** Each pack must contain every verse in its range and every span and block exactly once. Write `content-review/pack-check.md` with the counts (they must match: 1,173 verses, 2,187 red, 2,175 green, 769 blocks).

## 5. Phase 2: dispatch the reviewers

Give each reviewer subagent **one track × one chunk**, a fresh context, the pack file(s), the page images for its pages, `pack/legend.md`, and a brief that contains:
- §0
- §1
- that track's checklist from §3
- the output format from §6
- any known weak spots in its range (from the prior reports named in §2)

Rules for dispatch:
- **Tracks B and C run twice per chunk, by two independent agents.** They must not see each other's output. Label them `run1` and `run2`. Those tracks hold the most judgement calls; disagreement points to likely errors.
- Track A runs once. Track D runs once. Track E runs once, unchunked. Track F runs once per audio file or group of files.
- Parallelise as your platform allows.
- A reviewer that has to look up a شرح on turath.io does so and cites the book and page.

## 6. Output format (every reviewer)

Write to `content-review/out/<track>/<chunk>/<run>/`:

**`findings.jsonl`**: one JSON object per line.
```json
{"id":"C-333-b-G1","track":"C","chunk":"c04","run":"run1",
 "verse":333,"half":"b","item":"G1",
 "category":"wrong-ayah","severity":"high","confidence":0.85,
 "current":"3:37","proposed":"3:39",
 "evidence":"Mushaf 3:39 «…الْمِحْرَابِ…»; إبراز المعاني ص… «…»",
 "reasoning":"one to three sentences"}
```
- `id` format: `<track>-<verse or block id>-<half>-<item>`. Use `-` for fields that don't apply.
- `item`: `R<i>` / `G<i>` (the span's index in `colors.json`), `P<i>` (piece), block id, or `-`.
- `severity`:
  - `high`: a student would memorise or understand something wrong.
  - `medium`: wrong but recoverable (extent off by a letter, typo that doesn't change meaning).
  - `low`: cosmetic.
- Quote Arabic **exactly** as in the source. Write the reasoning in Arabic or English.

**`coverage.md`**: one line per verse (or block, or audio verse) in the chunk, `<n> ✓` or `<n> ✗ <count>`. The last line is `reached <last n reviewed> of <last n in chunk>`.

## 7. Phase 3: quality control (you)

1. **Coverage:** read every `coverage.md`. Any gap or early stop gets a new agent for the missing range.
2. **Validity:** every finding parses as JSON, uses a real ID (the verse exists, the span index exists, the block exists), and has non-empty evidence. Send invalid findings back to a fresh agent to repair, or drop them and record that you did.
3. **Audit of the "✓" verses:** for each track, choose about 5% of verses marked ✓, spread over all chunks, and give them to a fresh **auditor** agent with the same checklist. If the auditor finds a real miss in a chunk, re-run that whole chunk with a new agent. Record the audit results.
4. **B/C disagreements:** compare run1 and run2 item by item. For each item that only one run flagged, or where the two proposals differ, dispatch a **tie-break** agent with both findings, the evidence, and the page image. It answers `real` / `not-real` / `can't-tell`, with reasons. Keep both original findings and add the verdict.

## 8. Phase 4: sweep (one fresh agent)

Give it all merged findings, without the packs. It:
- groups findings that are one mistake repeated (the same code mislabelled everywhere, the same wrong surah in a section, one OCR pattern), with group id, count and member ids;
- lists suspected systematic causes, such as "spans in half b are shifted by one character after a tatweel".

It adds no new findings of its own.

## 9. Final deliverable

In `content-review/`:
- `findings.jsonl`: every finding from every track and run, merged, with tie-break verdicts and sweep group ids added as fields (`tiebreak`, `group`).
- `coverage.json`: per track, the verses or blocks reviewed and the number of runs, plus audit results.
- `REPORT.md`: written for the engineer who will fix things. It contains:
  1. **Summary:** counts per track × severity; coverage per track (must be 100%); audit miss-rate per track; number of B/C disagreements and how they resolved.
  2. **High-severity findings**, all of them, grouped by track. Each one shows the ID, verse, current → proposed, and evidence on one line.
  3. **Systematic groups** from the sweep.
  4. **Medium and low**, as compact tables per track.
  5. **Unsure:** findings with confidence < 0.5 or tie-break "can't-tell". For each, what would settle it, and whether it needs a human scholar.
  6. **Known weak spots re-checked:** every item from the prior reports in §2, with what you found.
  7. **Method notes:** chunk list, agents used, anything that went wrong (agents that stopped early, pages that couldn't be read), and anything you could not review.
- `content-review/_scripts/` and `content-review/pack/` stay in place, so the engineer can re-run and re-read them.

When you finish, reply with the path to `REPORT.md` and the summary counts. If something forced you to stop before the end, say exactly what is left. Never claim coverage you don't have.
