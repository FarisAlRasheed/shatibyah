# Improvements plan (2026-11-16)

Agreed with the owner in chat on 2026-11-16. Each step ends with a local preview for the owner before the next one starts. The rules of `UX-PLAN.md` still apply (never change the poem text, Arabic interface, Arabic digits shown and both kinds accepted, optional extras get a switch in الإعدادات).

## Steps

| # | Step | Core or optional | Status |
|---|---|---|---|
| 1 | Backup and restore | Core | Built, not committed |
| 2 | Listener mode (التسميع على مستمع) | Core, in الحفظ | Built, not committed |
| 3 | Test-yourself on a chosen range, and due review | Core | Built, not committed |
| 4 | Notes: text and sketch; coloured named marks; interface font | Core | Built, not committed |
| 5 | Explanation: finish it, own appearance, highlights | Core | Part built (appearance, highlights), not committed |
| 6 | Full ayah for green words | Optional, on by default | Not started |
| 7 | Small extras | Optional | Not started |

Dropped: word-by-word highlighting during playback (cost too high for its value).
Later: a second reciter, tied to its edition.

## 1. Backup and restore (built)

الإعدادات ← «النسخ الاحتياطي». «حفظ نسخة» writes one JSON file with everything the user creates. «استعادة» shows the file's date and contents, then «دمج» (nothing on the device is lost) or «استبدال». The last-backup line turns red with no backup or after 30 days. Code: `src/backup.ts`, `src/BackupGroup.tsx`.

Every later step that stores user data adds its storage key to `BACKUP_KEYS` and a merge rule.

## 2. Listener mode (built)

الحفظ ← «التسميع على مستمع». Choose a range; the listener picks a slip type and taps each slipped word. Report at the end (count per type, slipped verses, repeat only those verses). Marks stay on the words in the reader (switch and clear button in الإعدادات), sessions are kept in a history, slipped verses go to the weak list. Slip types are the user's own: name and colour, defaults «خطأ حرفي» red, «خطأ تشكيل» yellow, «توقّف» blue. Code: `src/slips.ts`, `src/Listener.tsx`.

## 3. Test-yourself and review (built)

الحفظ ← «اختبر نفسك». Code: `src/Quiz.tsx`, `src/review.ts`. Memorization mode keeps its own quick test switch.

- Before a test the user chooses the verses: from/to, a باب, today's wird, the weak verses, or «مراجعة اليوم».
- Question kinds: hide the second half, hide the whole verse, «ما البيت التالي؟», and a drill on same-ending verses.
- Order: in sequence or random.
- Each answer is «أتقنته» or «لم أتقنه», feeding the mastered and weak lists as today. A result at the end.
- «مراجعة اليوم»: the app's own list. Weak verses first, then mastered verses not tested for the longest time.

## 4. Notes and marks (added by the owner on 2026-11-16)

- **Two kinds of note on a verse:** a text note (as today) and a sketch note, where the user draws by hand on the verse itself. A verse can have both.
- **Marks in five colours:** the single bookmark becomes a mark in one of five colours, and the user names each colour (as with slip types).
- Decided by the owner (2026-11-16): the sketch is drawn over the verse and always visible in the reader, with a switch to hide all sketches («إظهار الرسوم على الأبيات» under مزايا إضافية). Tools: pen in four colours and two widths, eraser, undo, clear all. One mark per verse, tinting the whole verse. Default names: «مراجعة», «مهم», «سؤال», «متشابه», «علامة», renamed in الإعدادات ← «أسماء العلامات».
- Built: `src/Sketch.tsx`, `src/marks.ts`, `src/marks.css`; «رسم» and the colour picker are in the verse action bar. Not built: a list of sketched verses in الفهرس.
- Interface font (owner request, same day): IBM Plex Sans Arabic, bundled for offline use. The verse fonts are unchanged.
- Sketches and marks go into the backup.

## 5. Explanation

- The remaining parts of `EXPLANATION-PLAN.md`: explanation mode with inline cards, the second book with the switcher, search inside the explanations.
- Second book: «سراج القارئ» (Turath 95577), chosen by the owner.
- Its own appearance: font, size and line spacing, separate from the poem's.
- Highlights: select text, pick a colour, optionally add a note. A list of highlights in الفهرس. Included in the backup.

Status (2026-11-16):
- Built: the «T» button in the panel's header opens the explanation's own font, size and line spacing. Selecting text shows four highlight colours; tapping a highlight changes its colour, adds a note or deletes it. الفهرس gets a «التظليل» list once a highlight exists. Code: `src/highlights.ts`, `src/Explain.tsx`.
- Still to do, in this order: the second book (fetch Turath 95577, adapt `tools/commentary/build.py` to its layout, pilot one باب for the owner, then the Gemini tags), explanation mode with inline cards, search inside the explanations.

## 6. Full ayah for green words

Tapping a green word shows the ayah in Hafs, labelled as Hafs, and under it the readers named by the verse's codes. A source for the Quran text must be chosen and checked first.

## 7. Small extras

Code flashcards (رموز), record yourself during the echo pause, edition differences (Qasim and Zubi), sleep timer, share or copy a verse, a calendar reminder for the wird, automated tests for the repeat engine.

## Not yet checked on a real iPhone

Pinch zoom, the sepia theme, the wird strip with a real plan (from `UX-PLAN.md`); the backup share sheet; listener mode.
