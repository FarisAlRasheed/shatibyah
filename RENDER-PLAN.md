# Verse renderer: rebuild plan

Status (2026-11-17): approved and built, except step 5 (text fixes), which waits for the owner's
approval of the list. Highlight spike passed in the iOS app (WebKit paints `::highlight()` only on
selectable text: verse text is now selectable to the engine, a long press still selects nothing).
Checks: `npm test` (whole-poem text model), `tools/layout-check.js` (overflow matrix, 0 everywhere).

## What is wrong today (found by reading the code and measuring every half-line)

1. **Colours cut the words into pieces.** `HalfText` (colors.tsx) wraps every coloured letter, search hit,
   veiled word and slip in its own `<span>`, so one word becomes several text runs. Safari shapes each run
   on its own, so a red «ح» before «ُز» lost its joined form. Chrome joins across runs, but only by luck.
2. **The two patches from today make it worse elsewhere.** The zero-width joiner keeps Safari joined, but
   Amiri draws an extra connecting stroke for it: «كَ‍انَ» is 146 units wide instead of 135. Measured at
   628 px, 66 of 2,346 half-lines now spill out of their box, and every one of them has colour in it.
3. **The equal-width (kashida) step measures one string and the page draws another.** `kashida.ts` measures
   the plain half-line in a canvas. The page then draws it split into spans, with joiners, in whatever font
   finished loading. The two never get compared, so a half can end up wider than its box, and nothing
   catches it. `.app { overflow-x: clip }` then cuts the overflow off instead of showing it.
4. **Size and layout use copied numbers.** zoom.ts guesses the number circle (1.36 em), the gap (2.6 em)
   and the padding (22 px) instead of measuring the page. Any change to the CSS quietly breaks the fit.
5. **Text errors in the edition.** 17 half-lines have punctuation inside a word, for example
   «حُفَّلَ.ا» (1073), «تَجَمَّلَ.ا» (1087), «العَلَ،ا» (621) and «بِ:وَصَّيٰ» (486). They draw as broken words and
   stop the kashida from treating them as one word.

## The rebuild

### 1. Never cut inside a word: paint colours on top of it
- The only harmful cut is one **inside** a word. A span around a whole word does not affect joining.
  So the whole-word spans stay exactly as they are today:
  - the tap target on a coloured word (`.cw`): tapping opens the same card, with the same mark and text;
  - the listener slip mark on a word (`.slip-mark`, same look);
  - veiled words for «إخفاء تدريجي» and the recitation curtain (`.veil`).
- Inside a word, nothing is split any more. Red codes, green Quran words and search hits that cover
  part of a word are painted with the browser's **CSS Custom Highlight API** (`::highlight()`). That is
  colour without splitting the text, so the shaping is always the font's own. It works in Safari/iOS 17.2+
  and Chrome 105+, which covers the iOS app and the website.
- The listener screen's word picker (Listener.tsx, «تسميع») has its own renderer with one button per
  whole word. It is not touched.
- Fallback, only for browsers without the Highlight API: inner pieces cut only between whole
  letter-clusters (a letter and its harakat, and «لا» kept together), with the full Unicode joining table.
- First step of the build: a small test that `::highlight()` paints inside the iOS app (WKWebView) before
  anything else is changed. If it does not, we stop and talk again.

### 2. One text model for every feature
- New `src/verseText.ts`: splits a half into words → clusters (`Intl.Segmenter`), and turns the colour
  marks, hits, veil and slips into ranges on cluster edges. Colours, search, the recitation veil,
  listener slips and the kashida all use this one model, so positions can never drift apart.

### 3. Equal widths that are guaranteed to fit
- The kashida keeps its rules, but it measures the exact string that gets drawn, and it measures again
  once the font has really loaded.
- **A check after layout:** each visible half compares its drawn width with its box. If it is wider, it is
  squeezed to fit (the same squeeze the long halves already get). Nothing is ever cut off or spills out.
- Remove the dependence on `overflow-x: clip`: the pinch preview keeps its own clip, and the page never
  needs one.

### 4. Size and layout from the page itself
- Measure the number column, gaps and padding from the page once (and again when the look changes),
  instead of using copied constants. Side-by-side vs stacked and the size limits follow those numbers.

### 5. Fix the 17 text errors
- Correct the punctuation inside words, recorded through the existing text-review file
  (`_text-review.json`) so the change is on record. You approve the list first.

### 6. Checks so this does not come back
- A test over the whole poem: every coloured range, hit and veil lands on cluster edges; no mark splits
  a letter from its harakat or breaks «لا»; every half's text equals the edition's text.
- A layout check (dev only) that measures every half-line for overflow, for each verse font and at phone,
  tablet and desktop widths. It must report 0, and it gets run before each release.
- A visual pass in the iOS simulator and the browser on the verses reported so far: 1067, 1069, 1070,
  1073, 1078–1086.
- Feature checks by hand, before and after: tap a red code and a green word (same card opens); search
  highlights; «إخفاء تدريجي» in memorization; the recitation curtain; listener slips shown in the reader;
  the listener word picker; the appearance-panel preview; pinch zoom.

## Order of work
1. Text model and tests (`verseText.ts`), with no visual change yet.
2. Highlight-API drawing in `HalfText`, plus tap lookup and the fallback.
3. Kashida measuring the drawn string, and the after-layout fit check.
4. Measured geometry in zoom.ts and Reader.tsx; remove the overflow clip.
5. Text fixes (after you approve the list).
6. Full checks: browser at three widths × three fonts, iOS simulator, then a commit.

## Open questions
- Is dropping the old span fallback on iOS older than 17.2 acceptable? (The app targets current iOS.)
- Should the after-layout squeeze also apply on the website, or only flag the half in development?
