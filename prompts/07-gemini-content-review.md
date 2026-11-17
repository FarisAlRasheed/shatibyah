# Gemini content review: plan and prompts

Goal: before shipping, an outside model reviews **every piece of content** the app shows. It changes nothing. It sends back findings that Claude then checks against the sources, one by one, before fixing anything.

## What there is to review

| # | Content | Size | Ground truth |
|---|---|---|---|
| A | Verse text, Al-Qasim edition (`data/editions/qasim/edition.json`) | 1,173 verses | `sources/qasim.pdf`, PDF pages 17–175 |
| B | Red رموز and their labels (`colors.json`, `k: "r"`) | 2,187 spans, 92 codes | the PDF's red ink, plus the رموز rules of the poem itself (verses 45–56 and 64–66) |
| C | Green Qur'an words and their surah:ayah (`colors.json`, `k: "g"`) | 2,175 spans | the PDF's green ink, the Mushaf, and the شروح |
| D | الوافي explanation (`data/commentaries/wafi/s*.json`) | 761 blocks, ~580k characters | the Turath text (book 38075) and which verses each block explains |
| E | Section titles and the code legend | 79 sections, 92 codes | the PDF |

## Decision 1: several sessions, not one

One session can't read 1.3 MB of Arabic with care. Attention thins out in the middle, and the late chunks get a lighter look than the early ones. So:

- **Split by track**, because each one needs a different eye. A, B and C are checked against the PDF and the Mushaf. D is checked against the book.
- **Split each track into chunks of about 80–120 verses**, cut on section boundaries. That gives roughly 12 chunks per track.
- **Each chunk gets a fresh session** that runs the same prompt. Sessions can run in parallel.
- **Run B and C twice**, in two independent sessions with no shared context. Those tracks hold most of the judgement calls (which ayah, whether a letter is a رمز). Where the two runs disagree, that's where a mistake is likely.
- **A final "sweep" session** gets only the merged findings and the legend. It looks for patterns: the same wrong ayah repeated, a code mislabelled everywhere, one systematic OCR error.

About 12 × (A + 2B + 2C + D) ≈ 70 chunk sessions, plus one session for E and one sweep. If that's too many, merge A into the B/C sessions, since they look at the same PDF lines anyway.

## Decision 2: give Gemini a readable review pack, not the raw JSON

The raw data is hard to review. Colour spans are character offsets (`"s": 19, "e": 34`), and the Wafi blocks hold no verse text. A model doing offset arithmetic will make mistakes of its own and report them as ours. So Claude first builds a **read-only review pack** from the shipped data: no new content, only a rendering of it.

`review-pack/<track>/<chunk>.md`, one per chunk. Every item carries a stable ID so each finding maps straight back to the data:

```
### 333  (section 28 · PDF p. 52)
a: …[[R1 ابن ذكوان | text: «م» ]]…
b: …{{G1 «المحراب» → 3:37 «كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا الْمِحْرَابَ…» · حيث وقع}}…
```

- `R#` / `G#`: the span's index within the verse. The bracket shows the exact coloured characters, then the label or the ayah. The **full ayah text** comes from a Qur'an file, so the reviewer can see the word is really there.
- The Wafi pack shows each block with the verse text it claims to explain printed above it.
- Each chunk names its PDF pages, and Claude renders those pages as 200-DPI PNGs next to it, so Gemini reads the real page instead of the whole 178-page PDF.
- `review-pack/legend.md`: the 92 codes and their labels, plus the رموز rules.

## Decision 3: what Gemini sends back

Two files per session, in `review-out/<track>/<chunk>/`:

1. **`findings.jsonl`**, one JSON object per line, each a suspected error:
```json
{"id":"B-333-a-R1","track":"B","verse":333,"half":"a","item":"R1",
 "category":"wrong-label","severity":"high","confidence":0.8,
 "current":"ابن ذكوان","proposed":"هشام",
 "evidence":"PDF p.52, line 3: … ; الوافي on 333: «…»",
 "reasoning":"one or two sentences"}
```
2. **`coverage.md`**: one line per verse (`333 ✓` or `333 ✗ 2 findings`). It proves every verse was actually looked at, not skimmed. A missing verse number means that verse was not reviewed.

Severity:
- **high**: a learner would memorise or understand something wrong (wrong letter or vowel in a verse, wrong reader, wrong ayah, explanation attached to the wrong verse).
- **medium**: wrong but recoverable (span cut a letter short, a typo in the explanation).
- **low**: cosmetic.

## Decision 4: how Claude handles the report

Gemini's findings are claims, not truth. For each one, Claude:
1. re-reads the PDF crop, the Mushaf, or the Turath page itself,
2. marks it **confirmed / rejected / unsure**, and writes down why,
3. fixes only the confirmed ones, in the data files, through the existing tools where they apply,
4. sends you the **unsure** ones as a short list for you (or a sheikh) to decide.

Then a final count: findings received, confirmed, rejected, unsure, fixed.

---

# The prompts

Fill in the `{…}` fields per chunk. Every prompt starts with the **shared preamble**.

## Shared preamble (put this at the top of every session)

```
You are reviewing the content of a reading app for «حرز الأماني ووجه التهاني» (الشاطبية) by الإمام الشاطبي, the poem on the seven readings. Students memorise from this app, so one wrong letter, vowel, reader or ayah gets memorised wrongly. Your job is to find content mistakes. You are the reviewer, not the editor.

HARD RULES
1. Change nothing. Don't edit, rewrite or "clean up" any file. Write only the two output files named below.
2. Review every item in your chunk, in order. Don't sample and don't stop early. If you run out of room, stop at a verse boundary and say exactly which verse you reached.
3. Report only what you can support. Every finding cites its evidence: a PDF page and line, an ayah, or a quoted sentence from a شرح. If you suspect something but can't support it, report it with confidence ≤ 0.4 and say what would settle it.
4. The PDF is the authority for the poem's text and its colours. Don't "correct" the poem toward another edition, toward common recitation, or toward the Hafs Mushaf. The poem often spells a word the way another reader reads it; that is not an error.
5. The author of الوافي (عبد الفتاح القاضي) is the authority for his own explanation. Don't argue with his scholarship. Report only (a) a text that differs from his book (OCR or typing errors), (b) text attached to the wrong verse, (c) a plain contradiction with the poem's own words that a student would notice. Label (c) clearly as your opinion.
6. Don't report style, punctuation or diacritic-placement differences that don't change the reading or the meaning (for example the sukun on «ال», where the alif-fatha sits, ى/ا in the rhyme).
7. Use the IDs in the pack exactly (verse number, half a/b, R#/G#, block id). Never invent an ID.

OUTPUT
A) findings.jsonl: one JSON object per line, with fields:
   id, track, verse, half, item, category, severity (high|medium|low), confidence (0–1),
   current, proposed, evidence, reasoning
B) coverage.md: one line per verse in the chunk: "<verse> ✓" or "<verse> ✗ <n> findings". Last line: "reached verse <n> of <last>".
Write the reasoning in Arabic or English; keep quoted Arabic exactly as in the source.
```

## Track A: verse text vs. the PDF

```
TRACK A: verse text. Chunk {chunk}: verses {from}–{to}, PDF pages {pages}.

Inputs: review-pack/A/{chunk}.md (each verse as the app shows it, both halves), and the PDF page images review-pack/pages/p{NNN}.png.

For every verse, read the two halves on the page image and compare them letter by letter and mark by mark with the pack:
- letters: a missing, extra or wrong letter; hamza form and seat (أ إ ؤ ئ ء); ة/ه; ى/ي; alif madda
- vowels that change the reading: fatha/kasra/damma, tanwin, shadda, sukun where it matters
- word order and the split between the two halves (a)/(b)
- verse numbering: does the pack's number match the number printed in the PDF? Any verse missing, doubled or merged?
- section titles: each title in the pack against the heading on the page

Categories: letter, vowel, shadda, tanwin, word-missing, word-extra, word-order, half-split, numbering, title.
```

## Track B: red رموز

```
TRACK B: red رموز (reader codes). Chunk {chunk}: verses {from}–{to}, PDF pages {pages}. Run {1|2}.

Inputs: review-pack/B/{chunk}.md, review-pack/legend.md (the 92 codes and the رموز rules), and the page images.
Each red span looks like [[R# <label> | text: «<exact red characters>»]].

Know the system before you start. The poem states it in verses 45–56 and 64–66 (included in the legend):
- single letters أبج دهز حطي كلم نصع فضق رست stand for the readers and their transmitters, in order;
- ث خ ذ ظ غ ش are group letters;
- code words (صحبة، صحاب، عم، سما، حق، نفر، حرمي، حصن) are groups;
- a رمز is the first letter of its word and normally comes after the word being read (v. 46), though v. 56 and v. 64 allow a code word before or after; the poem's wording decides, not the letter's look alone;
- the poet also names readers outright, and the واو الفاصلة separates one issue from the next.

For every verse check:
1. Missing: is there red ink on the page that has no [[ ]] in the pack, or a [[ ]] where the page shows no red?
2. Extent: does the span cover exactly the red characters (not half a word too much or too little)?
3. Decoding: is the label the right reader or group for that code, per the legend?
4. Context: is this really a رمز here? If the poem's wording, or الوافي's explanation of this verse, says the code points to someone else or isn't a code, report it and quote the شرح.
5. Legend: if you find a code in legend.md labelled wrongly (wrong reader, wrong group members, wrong order of a transmitter), report it once with id "B-legend-<code>".

Categories: missing-span, extra-span, span-extent, wrong-label, not-a-code, legend.
When you need a شرح, prefer الوافي (in the pack), then أبو شامة «إبراز المعاني», then السخاوي «فتح الوصيد». Name which one you used.
```

## Track C: green Qur'an words

```
TRACK C: green Qur'an words. Chunk {chunk}: verses {from}–{to}, PDF pages {pages}. Run {1|2}.

Inputs: review-pack/C/{chunk}.md and the page images.
Each green span looks like {{G# «<green characters>» → <surah>:<ayah> «<full ayah text>» · <note>}}.

The app tells the student "this word is from surah S, ayah N". For every green span check:
1. Missing or extra: green ink on the page with no {{ }}, or {{ }} with no green on the page.
2. Extent: the span covers exactly the green characters.
3. The ayah is right: the word (or its root in the form the poem uses) really occurs in that ayah. The poem may give the word in another reading's form; match on the word, not the Hafs spelling.
4. The ayah is the one meant: inside فرش الحروف the verse is about one surah, so the place should normally be in that surah. If the word occurs several times, is the chosen ayah the one the poem and the شروح mean? Quote the شرح when you disagree.
5. Notes: «حيث وقع» (everywhere) is set only when the poem or the شرح says the ruling covers every occurrence; then the ayah given should be the first occurrence in the Mushaf. A word that means everywhere but lacks the note, or the reverse, is a finding.
6. Several words joined by «معا»/«الثلاثة»/«كلاهما»: are all the places covered?

Categories: missing-span, extra-span, span-extent, wrong-ayah, wrong-surah, ambiguous-ayah, wrong-note, missing-places.
Give "proposed" as "S:N" and quote the ayah text that contains the word.
```

## Track D: الوافي explanation

```
TRACK D: the explanation «الوافي في شرح الشاطبية» by عبد الفتاح القاضي. Chunk {chunk}: blocks {first-id}–{last-id} (verses {from}–{to}).

Inputs: review-pack/D/{chunk}.md. Each block shows: block id, the verse range it is attached to, the verse text of those verses, and then the explanation text as the app shows it, sentence by sentence (sentence numbers S#). Where a sentence is tagged to a specific verse, the tag is shown.

Respect rule 5 of the preamble: you are checking that the text is faithful and correctly placed, not re-explaining the poem.

For every block check:
1. Placement: is this block's explanation really about the verses it's attached to? Does it start explaining a verse that belongs to the next or previous block?
2. Sentence tags: is each tagged sentence about the verse it's tagged to?
3. Text errors: OCR or typing mistakes that a reader would notice or that change the meaning, especially inside Qur'anic words and reader names (for example «صَرَّفْدنا» where «صَرَّفْنا» is meant). Give the corrected word and say how sure you are that the book itself has it right.
4. Garbage: page headers, footnote numbers broken into the text, half sentences, repeated lines, text from another verse pasted in.
5. Contradiction (only obvious ones, labelled as opinion): the explanation names a reader or a reading that plainly contradicts the poem's رموز in that verse.

Categories: wrong-block, wrong-tag, typo, ocr-garbage, duplicate, truncated, contradiction-opinion.
```

## Track E: titles and legend (one session, no chunks)

```
TRACK E: section titles and the code legend.

Inputs: review-pack/E/titles.md (all 79 section titles with their verse ranges) and review-pack/legend.md, plus the PDF table of contents pages {toc-pages}.

Check:
1. Every section title against the PDF heading: letters and vowels.
2. Verse ranges: does each section start and end where the PDF heading falls? Any gap or overlap?
3. Each of the 92 codes: the label (reader or group), the note (whose transmitter, the group's members), and that groups list exactly the right readers, against verses 45–56 of the poem.

Categories: title, range, legend.
```

## Sweep (one session, after all chunks are done)

```
SWEEP: you get all findings.jsonl files merged into all-findings.jsonl, plus legend.md. You don't see the content packs.

Do:
1. Group findings that are the same mistake repeated (the same code mislabelled everywhere, the same ayah chosen wrongly in several verses, one OCR pattern such as د inserted inside words). Give each group an id, a count and the list of finding ids.
2. Where the two runs of track B or C disagree on the same item, list both and say which seems better supported, or "can't tell".
3. List any coverage.md that doesn't reach the end of its chunk.
Write sweep.md. Don't add new findings of your own.
```
