# Prompt: Shatibiyyah text agent (Al-Qasim + Zu'bi editions)

Recommended model: **Sonnet**. Copy everything below the line into the other agent, and attach the Al-Qasim PDF.

---

You are preparing the exact text of **متن الشاطبية (حرز الأماني ووجه التهاني)** for a memorization app, which ships two text editions:
- **`qasim`**: the edition of **الشيخ عبد المحسن القاسم**. This is the main edition, the one that is memorized. The attached PDF is its reference: wherever any other source differs from the PDF, **the PDF wins**.
- **`zubi`**: the edition edited by **محمد تميم الزعبي** (دار الهدى / دار الغوثاني, ط4 1426هـ), exactly as Turath has it.

Every letter and every diacritic matters.

## Scope for this run: PILOT (two chapters only)
This is a test run. Do the full Step 1 library search, but in Steps 2–4 work **only** on these two chapters under باب فرش الحروف:
- **سورة الأنعام**
- **سورة الأعراف**

They are on Turath book 7754 pages 56–61; stop at the heading سورة الأنفال (page 62). Find the same two chapters in the PDF.
- Both `edition.json` files contain only these verses and their two sections. Add `"partial": { "from": <first verse>, "to": <last verse> }` to each file. Keep `verseCount` as the full count of the whole poem (1173 unless the PDF says otherwise).
- Validation checks continuity only within `partial.from`..`partial.to`.
- At the end of the report, add **"Problems met"**: anything confusing, slow or error-prone in this prompt or in the sources, so the prompt can be improved before the full run.

(For the full run, this section will be removed.)

Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`. Read `PLAN.md` there first, especially section 2 and section 9, "Data format".

## Step 1: Look for a ready digital Al-Qasim text
Search the official online libraries:
- **المكتبة الشاملة** (shamela.ws), through web search or by fetching its pages.
- **Turath** (turath.io), with the Turath tools (search_turath / get_book / get_page).

Try queries such as:
- `الشاطبية عبد المحسن القاسم`
- `متن الشاطبية القاسم`
- `حرز الأماني القاسم`

A text only counts as a match if its title page or description names Al-Qasim's edition. (A Turath search on 2026-10-21 found none, so it's likely you won't find one.)

- **If you find it:** use it as the starting text for `qasim`, then do Step 3 against the PDF anyway.
- **If not:** the starting text for `qasim` is the Zu'bi text from Step 2.

Write down in the report which libraries and queries you tried, and what you found.

## Step 2: Get the Zu'bi text from Turath (needed in every case)
Turath **book 7754** (متن الشاطبية, ت. محمد تميم الزعبي) has the verses on Turath pages 7–100.
- Verses look like `١ - صدر ... عجز`. Chapter titles are inside `<span data-type="title">` tags.
- Call `get_book` with `include_indexes: true` to get the chapter list and page numbers.

Parse every verse into its number `n`, first half `a` and second half `b`. The halves are separated by ` ... `.
- Convert Arabic-Indic digits to normal numbers for `n`.
- Keep the chapter structure. Under باب فرش الحروف, the surah headings are sub-sections.
- Keep the Zu'bi text **exactly** as Turath has it. Don't change any letter or mark.
- A few Zu'bi verses lack the ` ... ` separator (for example verse 107). For those, split where the Al-Qasim PDF splits, but **only if the words are the same**. List every such verse under "Zu'bi split points supplied" in the report.

Save this as `data/editions/zubi/edition.json`, with `"id": "zubi"`.

## Step 3: Build the Al-Qasim text by checking every verse against the PDF
Start from the starting text chosen in Step 1. Go through the PDF page by page and compare each verse, letter by letter and mark by mark. Check:
- every letter
- every vowel mark: fatha, damma, kasra, sukun, shadda, tanween, superscript alef, hamza forms, madda, wasla
- where the line splits into its two halves
- the verse number
- chapter titles, and the verse each chapter starts on

Rules:
- **Never "correct" the poem.** A word split across the two halves (e.g. ending `الـ` and the next half starting `ـخفيف`) is intentional. Copy exactly what the PDF prints.
- **Avoid false differences.** Before comparing, normalize both sides to Unicode NFC and treat a different order of stacked marks (e.g. shadda+fatha vs fatha+shadda) as equal. The output must still follow the PDF.
- Where the PDF differs from the starting text, write the PDF's version into `qasim` and record the difference.
- If a mark in the PDF is unclear (blurry, cut off), do **not** guess. Use the most likely reading, but list the verse under "Uncertain" in the report.
- Work in batches of pages. After each batch, save your progress to `data/editions/qasim/_progress.json` (the last verse checked plus the work so far), so the job can resume if interrupted.

Save the result as `data/editions/qasim/edition.json`, with `"id": "qasim"`. In `source`, put the PDF file name and the printing details from its title page.

## Step 4: Write the differences report
Write `data/editions/qasim/diff-report.md`. It must contain:
1. **Summary:**
   - libraries searched and what was found
   - the starting source used
   - total verses
   - number of verses where Zu'bi and Al-Qasim differ
   - number of uncertain verses
2. **Differences table**, with columns verse · half (a/b) · Zu'bi text · Al-Qasim text · what changed (e.g. "فتحة ← ضمة on ..."). This compares the final `zubi` and `qasim` files, whatever the starting source was.
3. **Uncertain:** verse, PDF page, and what is unclear.
4. **Zu'bi split points supplied:** the verses from Step 2 that were missing a separator.
5. **Chapter differences:** any differences in chapter titles or boundaries between the two editions.
6. **Validation result** for **both** files:
   - verse numbers are continuous with no gaps or duplicates
   - every verse has a non-empty `a` and `b`
   - sections cover every verse with no overlaps
   - the text is NFC

## Limits
- Do not create or change any other files in the project, and do not start building the app.
- When finished, report: the libraries checked, the starting source, the number of differing verses, the number uncertain, and the paths of the three files.
