#!/usr/bin/env python3
"""Generate Phase 2 task specifications and workflow runner scripts under content-review/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHUNKS = json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']
REF_DIR = ROOT / 'content-review/_ref'
PACK_DIR = ROOT / 'content-review/pack'
OUT_ROOT = ROOT / 'content-review/out'

COMMON_PREAMBLE = """# MISSION & HARD RULES

You are a content reviewer for the Shatibiyyah reader app («حرز الأماني ووجه التهاني» of الإمام الشاطبي).
Students **memorise** from this app. A missed mistake is the worst outcome. Report anything you cannot rule out, with honest confidence. Never make an unsupported "correction" that pushes the text toward what you expect from memory.

## Hard Rules
1. **Write NOTHING outside your designated output directory** (`{out_dir}/`). Do not edit `data/`, `src/`, `tools/`, `sources/`, `prompts/`, `pack/`, or anything else. Do not run git commands or install packages.
2. **Authorities, in order:**
   - **Poem text & colours:** `sources/qasim.pdf` (rendered PNG pages in `content-review/_ref/pages/pNNN.png`). The PDF wins over any other edition, Turath text, Hafs Mushaf, or memory. The poem often writes a word the way another reader reads it; that is not an error.
   - **Qur'an places:** the Uthmani Mushaf (`content-review/_ref/quran-uthmani.txt` with `surah:ayah`).
   - **Explanation:** «الوافي في شرح الشاطبية» by عبد الفتاح القاضي (in `content-review/pack/D/`).
   - **Contested رموز or ayah choices:** الوافي first, then أبو شامة «إبراز المعاني» (Turath 5486), then السخاوي «فتح الوصيد» (Turath 880). Always name the source you used.
3. **Ignore pure style differences** that change neither reading nor meaning: sukun on «ال» lam, where alif-fatha sits, sukun on a long vowel, ى vs ا at the rhyme, punctuation, Uthmani marks (dagger alif, ٱ) in Qur'anic words.
4. **Every finding MUST cite concrete evidence** (a PDF page and half/word, a Mushaf surah:ayah with its text, or a quoted sentence with book and page). A suspicion without settling evidence is still reported with `confidence <= 0.4`, together with what would settle it.
5. **NEVER sample.** Review every single item in order. If you run low on turns/context, stop cleanly at a verse/block boundary, write everything reviewed so far to `findings.jsonl` and `coverage.md`, and record `reached <last_done> of <last_in_chunk>` on the final line of `coverage.md`.

## Output Format (write BOTH files inside `{out_dir}/`)
1. `{out_dir}/findings.jsonl` — one JSON object per line (create an empty file if 0 findings):
```json
{{"id":"{track}-<verse_or_block_or_item>-<half_or_dash>-<item_or_dash>","track":"{track}","chunk":"{chunk}","run":"{run}","verse":333,"half":"b","item":"G1","category":"<category>","severity":"high","confidence":0.85,"current":"...","proposed":"...","evidence":"...","reasoning":"..."}}
```
- `id`: `<track>-<verse or block id>-<half>-<item>`. Use `-` for fields that do not apply. Ensure IDs are unique within your file.
- `severity`: `high` (student would memorise or understand something wrong), `medium` (wrong but recoverable, e.g. extent off by a letter, non-meaning-changing typo), `low` (cosmetic).
- Quote Arabic **exactly** as in the source.
2. `{out_dir}/coverage.md` — one line per item in order (`<id> ✓` or `<id> ✗ <count>`), ending with:
`reached <last_reviewed_id> of <last_expected_id>`
"""


def make_prompt_a(ch):
    cid, v0, v1 = ch['id'], ch['start'], ch['end']
    out_dir = f"{OUT_ROOT}/A/{cid}/run1"
    pages = [f"{REF_DIR}/pages/p{p:03d}.png" for p in ch['pdfPages']]
    pages_str = '\n'.join(f"- `{p}`" for p in pages)
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='A', chunk=cid, run='run1')
    return f"""{pre}

# YOUR TASK: Track A (Verse Text & Numbering) — Chunk `{cid}` (Verses {v0}–{v1})

## Files to Read
1. Pack file: `{PACK_DIR}/A/{cid}.md`
2. Weak spots to double-check: `{PACK_DIR}/weak-spots/{cid}.md`
3. **ALL PDF page images for this chunk** (call `read_file` on EVERY image below in batches of 4–5 pages):
{pages_str}

## Track A Checklist (per verse {v0}..{v1}, both halves `a` and `b`)
Compare the app text in `pack/A/{cid}.md` letter by letter and mark by mark against the PDF page image:
- Missing, extra, or wrong letter; hamza form and seat (`أ إ ؤ ئ ء`); `ة/ه`; `ى/ي`.
- Vowels that change the reading or grammar: harakat, tanwin, shadda, sukun that matters.
- Word order; the split between halves `a` and `b`.
- Verse number vs the printed number in the PDF; any verse missing, doubled, or merged.
- Strayed/garbage characters (such as mid-word dots like `تَحَصَّلَ.ا`, missing spaces like `وَبَعْدَلَا`, or dubious long tatweels/diacritics from `_text-review.json`).
- Allowed categories: `letter`, `vowel`, `shadda`, `tanwin`, `word-missing`, `word-extra`, `word-order`, `half-split`, `numbering`.

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md` (lines `{v0} ✓` or `{v0} ✗ <count>` ... through `{v1}`, final line `reached <last> of {v1}`).
- Then call `finish` with a concise summary string of what you reviewed and how many findings you wrote.
"""


def make_prompt_b(ch, run):
    cid, v0, v1 = ch['id'], ch['start'], ch['end']
    out_dir = f"{OUT_ROOT}/B/{cid}/{run}"
    pages = [f"{REF_DIR}/pages/p{p:03d}.png" for p in ch['pdfPages']]
    pages_str = '\n'.join(f"- `{p}`" for p in pages)
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='B', chunk=cid, run=run)
    return f"""{pre}

# YOUR TASK: Track B (Red رموز: Presence, Extent, Decoding, Context) — Chunk `{cid}` (Verses {v0}–{v1}), `{run}`

**INDEPENDENCE RULE:** Do NOT read anything inside `content-review/out/`. Your review must be 100% independent.

## Files to Read
1. Legend & poem rules (verses 45–66): `{PACK_DIR}/legend.md`
2. Pack file: `{PACK_DIR}/B/{cid}.md`
3. الوافي explanation for these verses: `{PACK_DIR}/D/{cid}.md`
4. Weak spots to double-check: `{PACK_DIR}/weak-spots/{cid}.md`
5. **ALL PDF page images for this chunk** (call `read_file` on EVERY image below in batches of 4–5 pages):
{pages_str}

## Track B Checklist (per verse {v0}..{v1}, per red span `R<i>`)
The system: single letters `أبج دهز حطي كلم نصع فضق رست` stand for the 7 readers and their 14 transmitters in order. `ث خ ذ ظ غ ش` are group letters. Code words are `صحبة، صحاب، عم، سما، حق، نفر، حرمي، حصن`. A رمز is the first letter of its word and normally comes after the word being read (v. 46); v. 56 and v. 64 allow a code word before or after. Explicit names are also red.
1. `missing-span` / `extra-span`: red ink on the PDF page with no `R<i>` span, or an `R<i>` span where the PDF page shows black/green ink (ignore section headings).
2. `span-extent`: `R<i>` covers the EXACT red characters in the PDF (flag if a single-letter code covers `لَا` or `دَلَا`, starts/ends mid-word like `جَادَ`→`دَ` or `عَ` in `وَعَلَا`, omits part of a red name, or includes black letters).
3. `wrong-label`: `codes[c].label` (and `note`) is the right reader or group for the red text.
4. `not-a-code`: verify this really is a رمز here using الوافي (`pack/D/{cid}.md`). If الوافي says the letter points to someone else or is not a code, report it and quote الوافي.
5. `legend`: if any entry in `codes` (`pack/legend.md`) has a wrong label, note, or group membership, report it once with id `B-legend-<key>`.
- Allowed categories: `missing-span`, `extra-span`, `span-extent`, `wrong-label`, `not-a-code`, `legend`.
- Notice in `findings.jsonl`: set `"item": "R<i>"` for span `R<i>` (the exact 0-based index printed in `pack/B/{cid}.md`), or `"-"` for `missing-span`, or `"<key>"` for `legend`.

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md` (lines `{v0} ✓` or `{v0} ✗ <count>` ... through `{v1}`, final line `reached <last> of {v1}`).
- Then call `finish` with a concise summary string.
"""


def make_prompt_c(ch, run):
    cid, v0, v1 = ch['id'], ch['start'], ch['end']
    out_dir = f"{OUT_ROOT}/C/{cid}/{run}"
    pages = [f"{REF_DIR}/pages/p{p:03d}.png" for p in ch['pdfPages']]
    pages_str = '\n'.join(f"- `{p}`" for p in pages)
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='C', chunk=cid, run=run)
    return f"""{pre}

# YOUR TASK: Track C (Green Qur'an Words: Presence, Extent, Ayah, Note) — Chunk `{cid}` (Verses {v0}–{v1}), `{run}`

**INDEPENDENCE RULE:** Do NOT read anything inside `content-review/out/`. Your review must be 100% independent.

## Files to Read
1. Pack file (includes inline spans, `x`, `note`, `w`, and full Uthmani text of every `q` ayah): `{PACK_DIR}/C/{cid}.md`
2. الوافي explanation for these verses: `{PACK_DIR}/D/{cid}.md`
3. Weak spots to double-check: `{PACK_DIR}/weak-spots/{cid}.md`
4. Full Qur'an reference files for checking alternate/missing places (`grep`/`python3` read-only): `{REF_DIR}/quran-uthmani.txt` and `{REF_DIR}/quran-simple-clean.txt`
5. **ALL PDF page images for this chunk** (call `read_file` on EVERY image below in batches of 4–5 pages):
{pages_str}

## Track C Checklist (per verse {v0}..{v1}, per green span `G<i>`)
1. `missing-span` / `extra-span` / `span-extent`: check green ink on the PDF page image (`pNNN.png`). Flag green ink with no span, a span with no green ink (e.g. a red/black code word accidentally green), or wrong extent (e.g. truncated before trailing `ۦ`/`ۥ`/`ا`/`ى`/`هِ`, missing leading `أ`, or pointing to the wrong word in the half).
2. `wrong-ayah` / `wrong-surah`: check that the Mushaf text of `q[0]` actually contains the word (matching on the word/root/reading, not Hafs spelling).
3. `ambiguous-ayah` / `wrong-surah`: inside فرش الحروف each section is about specific surah(s), so `q[0]` must normally be in that surah. If the word occurs multiple times in the surah or Qur'an, check الوافي (`pack/D/{cid}.md`) to verify `q[0]` is the exact place the poem and الوافي mean! Quote الوافي when you disagree.
4. `wrong-note` / `missing-places`:
   - `حيث وقع` must be present ONLY when the ruling covers every occurrence in the Qur'an, and then `q[0]` must be the FIRST occurrence in the Mushaf! Search `quran-simple-clean.txt` when checking if a ruling is general or restricted, and report missing or wrong `حيث وقع` notes.
   - For «معا», «الموضعان», «الثلاثة», «كلاهما», «الأربعة», etc., verify ALL intended places are listed in `q` (report `missing-places` if `q` only lists 1 of 2+ places!).
   - Also check if `G<i>` is a letter/bab mark (`q: []`, `note: حرف من حروف الباب، لا كلمة قرآنية`) vs a real Qur'an word.
5. `wrong-join`: where `w` is set (or missing on a word split across halves or spans), verify the joined word `w` is accurate.
- Allowed categories: `missing-span`, `extra-span`, `span-extent`, `wrong-ayah`, `wrong-surah`, `ambiguous-ayah`, `wrong-note`, `missing-places`, `wrong-join`.
- Set `"item": "G<i>"` using the exact 0-based index printed in `pack/C/{cid}.md` (or `"-"` for `missing-span`).

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md` (lines `{v0} ✓` or `{v0} ✗ <count>` ... through `{v1}`, final line `reached <last> of {v1}`).
- Then call `finish` with a concise summary string.
"""


def make_prompt_d(ch):
    cid, v0, v1 = ch['id'], ch['start'], ch['end']
    out_dir = f"{OUT_ROOT}/D/{cid}/run1"
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='D', chunk=cid, run='run1')
    return f"""{pre}

# YOUR TASK: Track D (الوافي Explanation: Fidelity, Placement, `parts`) — Chunk `{cid}` (Verses {v0}–{v1})

## Files to Read
1. Pack file (contains every block's verses, pieces `P0..Pn`, `parts`, `breaks`, `notes`, AND the raw Turath source pages): `{PACK_DIR}/D/{cid}.md`
2. Weak spots to double-check: `{PACK_DIR}/weak-spots/{cid}.md`
3. Legend & code rules: `{PACK_DIR}/legend.md`

## Track D Checklist (per block in `{PACK_DIR}/D/{cid}.md`, in order)
You are checking that the explanation text is **faithful to Turath and correctly placed**, not re-explaining the poem:
1. `fidelity-ours` / `fidelity-source`: compare `P0, P1, ...` and `notes` with the raw Turath page text printed below each block. Look for missing or extra sentences, altered words, or OCR/typing errors (especially inside Qur'anic words and reader names). Explicitly specify whether the error is **ours** (`fidelity-ours`, Turath is clean) or in **Turath itself** (`fidelity-source`, both have it).
2. `wrong-block` / `wrong-intro`: the block's explanation is really about verses `from`–`to`; doesn't start or end mid-way through another verse's explanation; `intro` blocks sit before the right verse.
3. `wrong-parts`: in multi-verse blocks with `parts`, each verse's piece list covers that verse's explanation and nothing belonging solely to another verse; check unassigned pieces (`UNASSIGNED`) to ensure verse-specific pieces weren't left out and block-general intros weren't misassigned.
4. `garbage`: running headers, stray page numbers, `[تصوير]`, broken footnote markers, duplicated or truncated/mid-phrase pieces (e.g. tiny cut fragments), or stray punctuation/periods inside quoted verse text.
5. `contradiction-opinion`: the explanation names a reader or reading that plainly contradicts the poem's رموز in that verse (label clearly as opinion / copyist slip if present in Turath).
- Allowed categories: `fidelity-ours`, `fidelity-source`, `wrong-block`, `wrong-intro`, `wrong-parts`, `garbage`, `contradiction-opinion`.
- In `findings.jsonl`, set `"verse"` to the relevant verse number (or block's `from` / `before` if whole-block), `"half": "-"`, and `"item"` to `"P<i>"` or `"<block_id>"`.

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md`: list **one line per block ID** in `{PACK_DIR}/D/{cid}.md` in exact order (`<block_id> ✓` or `<block_id> ✗ <count>`), ending with `reached <last_block_id> of <last_block_id>`.
- Then call `finish` with a concise summary string.
"""


def make_prompt_e():
    out_dir = f"{OUT_ROOT}/E/all/run1"
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='E', chunk='all', run='run1')
    return f"""{pre}

# YOUR TASK: Track E (Section Titles, Ranges, 92-Code Legend, `SURAHS` Table, Arabic UI Text)

## Files to Read
1. Section titles & ranges: `{PACK_DIR}/E/titles.md`
2. `SURAHS` table (114 surahs): `{PACK_DIR}/E/surahs.md`
3. Arabic UI strings (`src/*.tsx` and `src/*.ts`): `{PACK_DIR}/E/ui-strings.md`
4. Legend & verses 45–66: `{PACK_DIR}/legend.md`
5. Rendered PDF TOC pages: `{REF_DIR}/pages/p177.png`, `{REF_DIR}/pages/p178.png`
6. PDF page images for EVERY section heading listed in `titles.md`: call `read_file` on EVERY unique `pNNN.png` referenced in `titles.md` (in batches of 4–6 pages) so you verify every single section title and start/end boundary directly on the PDF page images! (Also check `p017.png` for section 5 and `p174.png`–`p175.png` for section 83.)

## Track E Checklist
1. `title`: Check each of the 79 section titles in `titles.md` against the printed PDF heading on its page image (`pNNN.png`): every letter, hamza, shadda, and vowel! Also inspect TOC `p177.png`–`p178.png`.
2. `range`: Check each section's `start`/`end` against where the PDF heading falls on the page images. Verify there are no gaps, no overlaps across leaf sections, and they cover 1–1173.
3. `legend`: Check EVERY ONE of the 92 codes in `legend.md` against verses 45–66 (and Wafi): label, note, and group membership.
4. `surah-name`: Check all 114 entries in `SURAHS` (`src/colors.tsx`) in `surahs.md`: spelling and exact index order 1..114.
5. `ui-text`: Check all Arabic UI strings in `ui-strings.md` (`src/*.tsx` and `src/*.ts`) for spelling, grammar, or religiously wrong/misleading wording only.
- Allowed categories: `title`, `range`, `legend`, `surah-name`, `ui-text`.
- In `findings.jsonl`, use `"verse": "-"` (or the relevant start verse for `range`), `"half": "-"`, and `"item"` like `"sec36"`, `"code-خ"`, `"surah-17"`, or `"src/App.tsx:123"`.

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md`: list `sec5`..`sec83` (all 79 sections), `legend-1`..`legend-92` (or `legend`), `surah-1`..`surah-114` (or per-group), and each UI file reviewed, ending with `reached E-all of E-all`.
- Then call `finish` with a concise summary string.
"""


def make_prompt_f(ch):
    cid, v0, v1 = ch['id'], ch['start'], ch['end']
    out_dir = f"{OUT_ROOT}/F/{cid}/run1"
    pre = COMMON_PREAMBLE.format(out_dir=out_dir, track='F', chunk=cid, run='run1')
    return f"""{pre}

# YOUR TASK: Track F (Audio Timing Review) — Chunk `{cid}` (Verses {v0}–{v1}, Files: {', '.join(ch['audioFiles'])})

## Files to Read & Listen To
1. Pack file (timings, durations, confidence, pause flags, nearby pauses, clip paths, verse texts): `{PACK_DIR}/F/{cid}.md`
2. Weak spots for this chunk: `{PACK_DIR}/weak-spots/{cid}.md`
3. Per-verse MP3 clips: `{REF_DIR}/clips/vNNNN.mp3` (for every verse `{v0:04d}`..`{v1:04d}` in this chunk!).
4. Full section audio files (if you need context around a boundary): `/Users/faris/Documents/WebProjects/shatibiahReader/data/reciters/mahmud-haleem/audio/<file>.mp3`.

## How to Review Audio Thoroughly Without Running Out of Context
- You CAN listen to audio files directly using `read_file` on `.mp3` paths!
- In `pack/F/{cid}.md`, inspect every verse row's `dur`, `conf`, `Pause Flags`, and `Nearby Pauses`.
- Call `read_file` on the per-verse clips `content-review/_ref/clips/vNNNN.mp3` in batches of 6–8 clips per turn to listen directly and verify:
  1. Does the clip contain **exact verse `n`**, both halves (`a` and `b`), from its first word to its last word?
  2. Does it cut off any syllable/word at the start (`cut-start`) or end (`cut-end`)?
  3. Does it bleed into the previous verse (`bleed-prev`), next verse (`bleed-next`), or include the spoken section title (`includes-title`)?
  4. Is any verse missing (`missing-audio`) or pointing to a wrong take (`wrong-verse`)?
- Give extra care to every verse with `confidence < 0.9` or `Pause Flags != ok`, AND listen to ALL clips in your chunk (`{v0}`..`{v1}`) in batches! If you approach your context/turn budget before finishing `{v1}`, stop cleanly at a verse boundary, save all findings so far to `findings.jsonl`, and write `reached <last_checked> of {v1}` in `coverage.md` so the orchestrator can dispatch the rest.
- Whenever you report a timing error, use the `Nearby Pauses (±3s)` in `pack/F/{cid}.md` (and/or listening to adjacent clips or the section `.mp3`) to propose exact timestamps: e.g. `"proposed": "start 123.4, end 131.0"`.
- Allowed categories: `wrong-verse`, `cut-start`, `cut-end`, `bleed-prev`, `bleed-next`, `includes-title`, `missing-audio`.

## Coverage & Return
- Write `{out_dir}/findings.jsonl` and `{out_dir}/coverage.md` (lines `{v0} ✓` or `{v0} ✗ <count>` ... up to the last verse you actually listened to and checked, ending with `reached <last_checked> of {v1}`).
- Never mark a verse `✓` unless you actually listened to its clip!
- Call `finish` with a concise summary string.
"""


def main():
    tasks = []
    for ch in CHUNKS:
        tasks.append({'key': f"A-{ch['id']}-run1", 'track': 'A', 'chunk': ch['id'], 'run': 'run1',
                      'start': ch['start'], 'end': ch['end'],
                      'role': f"Track A {ch['id']} ({ch['start']}-{ch['end']})",
                      'out_dir': f"{OUT_ROOT}/A/{ch['id']}/run1",
                      'prompt': make_prompt_a(ch)})
    for ch in CHUNKS:
        tasks.append({'key': f"D-{ch['id']}-run1", 'track': 'D', 'chunk': ch['id'], 'run': 'run1',
                      'start': ch['start'], 'end': ch['end'],
                      'role': f"Track D {ch['id']} ({ch['start']}-{ch['end']})",
                      'out_dir': f"{OUT_ROOT}/D/{ch['id']}/run1",
                      'prompt': make_prompt_d(ch)})
    tasks.append({'key': "E-all-run1", 'track': 'E', 'chunk': 'all', 'run': 'run1',
                  'start': 1, 'end': 1173,
                  'role': "Track E all metadata & UI",
                  'out_dir': f"{OUT_ROOT}/E/all/run1",
                  'prompt': make_prompt_e()})
    for run in ('run1', 'run2'):
        for ch in CHUNKS:
            tasks.append({'key': f"B-{ch['id']}-{run}", 'track': 'B', 'chunk': ch['id'], 'run': run,
                          'start': ch['start'], 'end': ch['end'],
                          'role': f"Track B {ch['id']} {run}",
                          'out_dir': f"{OUT_ROOT}/B/{ch['id']}/{run}",
                          'prompt': make_prompt_b(ch, run)})
    for run in ('run1', 'run2'):
        for ch in CHUNKS:
            tasks.append({'key': f"C-{ch['id']}-{run}", 'track': 'C', 'chunk': ch['id'], 'run': run,
                          'start': ch['start'], 'end': ch['end'],
                          'role': f"Track C {ch['id']} {run}",
                          'out_dir': f"{OUT_ROOT}/C/{ch['id']}/{run}",
                          'prompt': make_prompt_c(ch, run)})
    for ch in CHUNKS:
        tasks.append({'key': f"F-{ch['id']}-run1", 'track': 'F', 'chunk': ch['id'], 'run': 'run1',
                      'start': ch['start'], 'end': ch['end'],
                      'role': f"Track F {ch['id']} ({ch['start']}-{ch['end']})",
                      'out_dir': f"{OUT_ROOT}/F/{ch['id']}/run1",
                      'prompt': make_prompt_f(ch)})

    for t in tasks:
        Path(t['out_dir']).mkdir(parents=True, exist_ok=True)

    tasks_path = REF_DIR / 'phase2_tasks.json'
    tasks_path.write_text(json.dumps(tasks, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wrote {tasks_path}: {len(tasks)} Phase 2 tasks.')


if __name__ == '__main__':
    main()
