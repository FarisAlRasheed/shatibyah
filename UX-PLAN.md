# UX and UI improvement plan (2026-11-11)

Status: ideas agreed with the owner in chat. **Nothing is built yet. Wait for the owner's "start" before writing code.**

How the list was made: I read all the app code and walked every screen in the browser at phone and desktop size (reader, verse sheet, repeat, display, memorize, test-yourself, index, plan, search, settings). The kashida idea was tested in the browser on verses 1146–1159 and gave straight edges on both sides.

## Rules that apply to every phase

- **Never change the poem text.** Kashida, highlights and hiding are drawn on screen only. Stored text, search, copy and the error report keep the edition's own text.
- Interface text is Arabic; numbers are shown in Arabic digits and accepted in both Arabic and English digits.
- Every change is checked at phone size (375 px) and desktop size, in light, sepia and dark, and with audio playing.
- Each phase ends with a local preview for the owner. Deploy only after the owner approves that phase.
- One commit per phase. Existing saved settings must keep working (new settings get defaults; `readStored` already merges them).
- Features marked **optional** get a switch in الإعدادات, under a new group «مزايا إضافية».

## The new layout

| Place | Today | After |
|---|---|---|
| Top bar, right end | التكرار | البحث |
| Top bar, centre | chapter title (opens الفهرس tab) | chapter title (opens the index panel) |
| Top bar, left end | T (display sheet) | الفهرس |
| Mini-player | ring · verse · play · next | ring · verse · repeat chip · play/pause · stop |
| Tab bar | القراءة · الفهرس · الحفظ · البحث · الإعدادات | القراءة · «أ» المظهر · الحفظ · الإعدادات |

Owner's decision (2026-11-11): الفهرس goes up to where the T button is, and «أ» goes down to where الفهرس was in the tab bar.

- الفهرس opens as a panel over the reader (a full-height sheet on a phone, a side drawer on a wide screen), with the same content as today's tab: chapters, bookmarks, notes, mastered.
- «أ» in the tab bar opens the appearance panel over the reader (section 2.3). It is not a separate screen, because the user must see the verses while changing them.
- The repeat button moves into the mini-player, next to play, where the thumb is.

## Phase 1: the verse text (owner ideas 1 and 3)

### 1.1 Equal half-lines with kashida

What the user sees: every half-line has the same width, so both edges of the page are straight, as in the printed book.

- **Cause today:** each verse sizes its own two columns (`.halves` in `src/styles.css`, `minmax(11em, auto)`) and the row is centred, so a long half pushes its row out on both sides. Natural half-line widths run from 6.2 em to 14.6 em (median 9.6 em).
- One shared width for all half-lines, about 12 em (a CSS variable, tuned on the real text).
- Short halves are stretched with kashida (tatweel, `ـ`) first, then a little word spacing for what is left.
- The longest halves (about 1%) are condensed slightly: tighter word spacing, then a small horizontal squeeze.
- **Layout mode is chosen by fit, not by screen width:** side by side when two halves, the gap and the number fit the row; otherwise stacked, with each half the same width so the stagger is even.
- New file `src/kashida.ts`: a pure function that returns the insert positions for one half-line.
  - Insert only between two joined letters; never after ا د ذ ر ز و ة ى ء and their hamza forms; never inside لا; never in the word الله; at most three per word; prefer the last join of a word.
  - Do not stretch inside green (Quranic) words in the first version, so the Quranic spelling is untouched. Ask the owner after the preview whether to allow it.
  - Positions are counted in the original text, so colour marks (`ColorMark.s`/`.e`) still line up.
  - All widths scale with the font size, so the result is computed once per font and reused at every zoom level. Compute after `document.fonts.ready`, visible verses first, the rest in idle time; cache in memory.
- One drawing function for a half-line that combines the text, colour marks, search highlights and kashida inserts. `ColoredHalf` in `src/colors.tsx` grows into this, so the three never fight over character offsets.
- A switch in the «أ» panel: «توحيد عرض الأشطر» (on by default).

Check: both edges straight on verses 1–94 and 1134–1159 in all three fonts; coloured words still open the right card; search for «وانجلى» still finds its verses.

### 1.2 Pinch to zoom the verses

What the user sees: pinching changes only the size of the verse text. The page itself never zooms.

- Lock page zoom (`touch-action: pan-x pan-y` on the page) and handle the pinch ourselves: Safari gesture events, two-finger distance elsewhere, trackpad pinch and Ctrl/⌘+scroll on a Mac, ⌘+ / ⌘− / ⌘0.
- The verse under the fingers stays where it is while the size changes.
- **Limits come from the screen:** the largest size is where one half-line still fits the row (about 26 px on a 375 px phone); the smallest is where both halves fit side by side, with a floor near 13–14 px. Recomputed when the window changes.
- The size is saved as today (`settings.fontSize`). A saved size outside the new limits is pulled inside them.
- The slider (`FontSizeField`) is removed. A− / A+ buttons stay in the «أ» panel for mouse users.
- The verse number circle scales with the text (four-digit numbers are cramped today).

Check: on an iPhone in the installed app and in Safari; on a Mac with trackpad and with mouse.

## Phase 2: top bar, search, appearance panel, moving around

### 2.1 Top bar and tab bar
The layout in the table above. Files: `src/App.tsx`, `src/styles.css`.

### 2.2 Search in the top bar (owner idea 2)

- Tapping البحث turns the title into a search field; the reader stays on screen behind it.
- Results drop down under the bar: chapters first, then verses, with the matched words marked (the logic in `src/search.ts` and `SearchScreen` is reused).
- Choosing a result jumps to the verse and marks the word in the reader. The bar then shows «٢ من ٤» with next and previous arrows, like find-in-page.
- A number jumps straight to that verse. Escape or ✕ closes the search.
- The البحث tab is removed.

### 2.3 The «أ» appearance panel (owner request)

A panel where the user sees real verses and changes how they look, live. It opens from the «أ» button in the tab bar (an Arabic letter in place of today's Latin T).

- Top: a preview of three verses around the current verse, drawn by the same code as the reader.
- Controls: theme (four swatches), font, size (A− / A+), line spacing, layout (تلقائي / متقابل / متتابع), equal widths with kashida, colours of codes and Quranic words, colours in memorize mode, verse number style (circle / plain).
- A «استعادة الافتراضي» button.
- On a phone it is a sheet that leaves the reader visible above it; on a wide screen it is a side panel.
- It replaces `DisplaySheet`. The العرض group in الإعدادات links to it instead of repeating the controls.
- New settings: `lineHeight`, `layout`, `kashida`, `numberStyle`.

### 2.4 Immersive reading (A, optional, on by default)
The top bar, mini-player and tab bar slide away when scrolling down and return on scrolling up or tapping an empty spot. They stay visible while a sheet or the search is open.

### 2.5 Fast-scroll rail (B, optional, on by default)
A thin rail on the edge of the reader. Dragging it moves through the whole poem, with a bubble showing the chapter and verse number. It appears while scrolling and fades after.

### 2.6 Back pill (F, optional, on by default)
After a jump from search, the index or a same-ending list, a pill «رجوع إلى البيت …» returns to the earlier place. It goes away after use or after a few screens of reading.

### 2.7 Mac keyboard shortcuts (G)
Space: play or pause. ↑ ↓: previous and next verse. `/` or ⌘F: search. R: repeat sheet. Escape: close. Ignored while typing in a field.

### 2.8 Polish (I)
Rows whose label wraps badly on a phone (the colours row), and anything similar found on the way.

## Phase 3: verse actions and choosing what to repeat

### 3.1 Small action bar (D)
Tapping a verse selects it and shows a small bar beside it: تشغيل من هنا · تكرار · علامة · ملاحظة · المزيد. «المزيد» opens today's full sheet (memorize mode, ×3 ×5 ×10 ∞, report an error). The tall sheet no longer opens on every tap.

### 3.2 Range picking (owner idea 4)

- **Digits:** the «من البيت / إلى البيت» fields are `type="number"` today, which rejects Arabic digits. They become text fields with a number keypad that accept both kinds (`toLatinDigits` exists) and show Arabic.
- **Picking in the text:** «تكرار من هنا» in the action bar marks the start; a banner says «اختر بيت النهاية»; tapping the end verse highlights the range; a bar shows «الأبيات ٢–٦ · ٥ أبيات» with ابدأ and تعديل. Tapping a verse before the start swaps the two ends.
- The repeat sheet shows the first words of each end beside its number, and a «تحديد من النص» button.
- Shortcuts in the sheet: هذا الباب · من هنا إلى آخر الباب · ورد اليوم (when a plan exists) · the last three ranges.
- While a range repeats, its first and last verses carry a small marker in the reader.
- No dropdown of all 1173 verses.

### 3.3 Counter on the verse (C)
While a verse repeats, its number circle shows the count (٢/٣) as a ring.

### 3.4 Mini-player (H)
A repeat chip («تكرار ×٣») that opens the repeat sheet, and a stop button. The label says what is playing in plain words.

## Phase 4: the repeat engine (J, K, L)

These change `src/player.ts`, which is the heart of the app. The existing behaviour (verse count, range rounds, pause, speed, lock-screen controls, keep-alive during pauses) must keep working exactly.

### 4.1 Cumulative repeat (J)
A fifth choice in the repeat sheet: «تراكمي». For a range and two counts it plays: verse 1 ×N, verse 2 ×N, verses 1–2 ×M, verse 3 ×N, verses 1–3 ×M, and so on.

- The player learns to play a list of steps (each step: from, to, times per verse, rounds) instead of one queue. Today's modes become a list with one step.
- The summary line («… = ١٥ مرة · نحو ٤ دقائق») and the counters in memorize mode understand steps.

### 4.2 Echo pause (K)
In the pause setting, a choice «بطول البيت»: after each play the player waits as long as that verse lasted, so the user can repeat it aloud. The fixed seconds stay as the other choice.

### 4.3 Fading text (L)
A switch in the repeat sheet and memorize mode: «إخفاء تدريجي». Across the repetitions of a verse the words disappear: all shown first, about half next, none at the end (spread evenly over the count). Display only; tapping shows the verse again.

Check: every existing repeat mode still behaves as before, including with the phone locked.

## Phase 5: memorization aids (E, M, N, P)

### 5.1 Recitation curtain (E, optional, off by default)
When switched on in الإعدادات, an eye button appears in the top bar. It hides every second half-line in the reader; tapping a verse shows it. In memorize mode, a peek shows the first word of the next verse.

### 5.2 Memorization map (M)
A view in الحفظ: one small square per verse (1173), grouped by chapter. Colours: متقَن, قيد الحفظ, ضعيف, not started. Tapping a square jumps to the verse.

- «ضعيف» needs new data: record each «لم أتقنه» press (verse → count and last time). Today that press only clears the mastered mark.
- «قيد الحفظ» comes from the plan's log.

### 5.3 Same-ending verses (N, optional, on by default)
When a verse shares its last word with other verses, the action bar shows «متشابهات (٣)». It lists those verses; tapping one jumps there (with the back pill). 962 of the 1173 verses share their rhyme word with at least one other. The list is built from the text at load time, using the search normalisation.

### 5.4 Today's wird strip (P, optional, on by default)
With an active plan, a thin strip at the top of the reader: «ورد اليوم: الأبيات ٤٠–٤٤ · ابدأ». It can be dismissed for the day.

## Phase 6: larger extras (O, Q)

### 6.1 Printed page markers (O, optional, off by default)
A faint line where each page of the printed Qasim edition begins, and jump-to-page in the index. **Needs data first:** a page number for each verse, taken from the PDF with the tools in `tools/extract/`. Not started until that data exists and is checked.

### 6.2 Mac side panel (Q, optional, on by default on wide screens)
On a wide screen, the empty margin shows details for the selected verse: its reader codes decoded, its Quranic words with surah and ayah, the user's note, and same-ending verses.

## Optional features in الإعدادات

| Switch | Default |
|---|---|
| إخفاء الأشرطة أثناء القراءة (A) | on |
| شريط التنقل السريع (B) | on |
| زر الرجوع بعد الانتقال (F) | on |
| ستارة التسميع (E) | off |
| الأبيات المتشابهة الخواتيم (N) | on |
| شريط ورد اليوم (P) | on |
| أرقام صفحات المطبوع (O) | off |
| اللوحة الجانبية على الشاشات الواسعة (Q) | on |

Everything else is part of the core app or is a choice inside the repeat sheet or the «أ» panel.

## Open points for the owner

1. May kashida stretch Quranic (green) words, or only the poem's own words?
2. Verse number styles to offer in the «أ» panel.
3. Phase 6.1 needs the page numbers from the PDF: do it, or leave it out?
4. The split between core and optional features (table above) is my proposal; the owner confirms it.
