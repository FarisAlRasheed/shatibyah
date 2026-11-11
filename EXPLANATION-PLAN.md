# Explanation (الشرح) feature plan (2026-11-11)

Status: agreed in outline, mockups approved, nothing built yet.

## Goal

Read a commentary next to the poem without leaving or covering the reading screen.
First book: «الوافي في شرح الشاطبية» (القاضي), Turath book 38075. More books later, switched in one tap.

## Who does what

| Work | Who | Why |
| --- | --- | --- |
| Fetch the book and split it into verse groups | A script (no model) | The book lists numbered verses, then their explanation. Only two pages were checked so far; the script's report will show where this breaks. |
| Tag which sentences belong to which verse inside a group | Gemini | Simple reading task, large volume (hundreds of groups). Prompt: `prompts/06-explanation-parts-gemini.md` |
| Check Gemini's answers are well formed | A script (no model) | Gemini returns sentence numbers only, so it cannot change the text. |
| Write the scripts and the app code | Claude (Opus is enough) | Needs the codebase. |
| Review the pilot باب and the reports | Owner | |

Gemini never fetches, splits or rewrites text. If its output is missing or wrong for a group, the app shows the whole group's explanation, which is the fallback anyway.

## Reader behaviour (as in the approved mockups)

### A. Panel from a verse
- Tap a verse, then «الشرح» in the small verse bar.
- Phone: bottom sheet at about a third of the screen; drag to half or full. The poem stays scrollable above it.
- Mac: the explanation opens in the side panel.
- The explained group is tinted with a line on the number side; the tapped verse is darker.
- The sentences tagged for the tapped verse are highlighted and scrolled into view. No tags: show the block from the top.
- Bottom row: previous group, printed page, next group. The reader scrolls with it.
- «تابِع القراءة»: the panel follows the verse being read or played.

### B. Explanation mode
- Book button in the top bar turns the mode on and off; holding it picks the book.
- Each group's explanation sits in a card joined to the group: three lines, «أكمل» opens the rest in place.

### C. Switching books
- Row of book names at the top of the panel. One tap swaps the book and keeps the verse.
- Groups differ between books, so the highlight changes with the book.
- The last book used is remembered.

### Core and optional
- Core: the «الشرح» button, the panel, explanation mode, book switching.
- Optional, under «مزايا إضافية»: «تابِع القراءة» (off by default), linked words (on by default).

## Data

```
data/commentaries/<bookId>/book.json          name, author, source, turathId, editionId
data/commentaries/<bookId>/s<sectionId>.json  one file per باب, loaded on demand, cached offline
```

A block:

```json
{
  "id": "b144",
  "from": 144, "to": 145,
  "page": 62,
  "text": ["sentence 0", "sentence 1", "sentence 2"],
  "breaks": [2],
  "parts": { "144": [0, 1], "145": [2] }
}
```

- `from`/`to` are verse numbers of the app's edition (Qasim), not the book's own numbers.
- `text` is the explanation split into sentences, verbatim from the source. `breaks` marks where a new paragraph starts.
- `parts` comes from Gemini and is optional.
- Text before the first verse of a باب is stored as a block with `"intro": true` and attached to the باب heading.

## Steps

1. **Fetch and split** (script). Fetch the 400 pages with `tools/extract/fetch_turath.py`, join text across page breaks, split at numbered verse lines, match each verse line to the Qasim text. Output the block files and a report of verses that did not match or have no explanation.
2. **Pilot review** (owner). One باب (suggested: باب الإدغام الكبير) viewed in a small check page before going further.
3. **Per-verse tags** (Gemini). The script writes `data/commentaries/wafi/_parts/in/s<sectionId>.json`, containing only groups with two or more verses. Gemini's answers go to `_parts/out/` with the same file names. A check script validates and merges them into `parts`.
4. **Panel** (code): «الشرح» button, group highlight, sheet with three heights, Mac side panel, previous/next.
5. **Explanation mode** (code): top-bar button, inline cards.
6. **Second book and switcher** (repeat steps 1 to 3 for the new book).
7. **Extras**: linked words, Quran words in green, separate text size, search inside explanations.

Each step ends with a check by the owner before the next one starts.

## Open points for the owner

- **Publishing rights.** Decided 2026-11-11: the owner is fine with publishing «الوافي» on the public site.
- **Second book.** Suggested «سراج القارئ» (Turath 95577). Others on Turath: «إبراز المعاني» (5486), «فتح الوصيد» (880).
- **Core/optional split** above is a suggestion to confirm.
