# Commentary Sentence-to-Verse Tagging Report (`الوافي في شرح الشاطبية`)

## 1. Summary

- **Files done**: 71 / 71
- **Blocks tagged**: 251 / 251
- **Blocks answered `{}`**: 0
- **Last line printed by the merge script**:
  ```text
  merged 251 blocks, skipped 0
  ```

---

## 2. Files Not Done

None. All 71 input files in `data/commentaries/wafi/_parts/in/` were processed and have valid, merged answer files in `data/commentaries/wafi/_parts/out/`.

---

## 3. Blocks to Review

The table below lists every block where more than half of the sentences were left unassigned, where the commentary does not follow the verse order, or where judgment was non-trivial due to grouped vocabulary sections (`اللغة`), cross-verse summaries, or overlapping boundary verses.

| file | block id | verses | what you were unsure about |
| :--- | :--- | :--- | :--- |
| `s5.json` | `b49` | 49–55 | Sentences 0–1 (introductory remark on signs and conventions), 9–10 (transition introducing the three types of group symbols), and 25–27 (general summary of the 27 symbols in the chapter) cover the passage as a whole; vocabulary and morphological notes in sentences 21–24 at the end of the block jump back to words in verses 49 and 51 (`فلان طوي`, `شاع الشيء`). |
| `s11.json` | `b158` | 158–159 | More than half the sentences (11 of 18: sentences 0–9 and 17) were left unassigned because sentences 0–9 are a general chapter introduction defining `هاء الكناية` and enumerating its four general states before sentence 10 begins explaining the specific ruling of verses 158–159, and sentence 17 is a concluding summary remark. |
| `s11.json` | `b166` | 166–167 | Exactly half the sentences (5 of 10: sentences 5–9) were left unassigned because they present a general comparative summary of the two madhhabs across the entire chapter of `هاء الكناية` rather than explaining only verses 166–167. |
| `s12.json` | `b168` | 168–170 | Non-sequential order and large general introduction (24 of 53 sentences left unassigned): sentences 0–23 introduce the chapter of `المد والقصر` in general (except sentence 21, which explicitly cites verse 169's phrase `أو بعد همز ثابت أو مغير`); verse-by-verse explanation begins at sentence 24 (`وقد بين الناظم في البيت الأول...`), while sentences 40–42 return to gloss vocabulary from verse 168 (`قضى`, `فهو في طوله يمضي`). |
| `s12.json` | `b171` | 171–175 | Sentences 39–46 discuss a general theoretical objection and answer regarding `المد المتصل` and `المد المنفصل` across the chapter, and vocabulary glosses at the end of the block (sentences 62–67) jump back in verse order (`صباحا` in 172, `عذبا` in 173, `خضر` in 174, `غلب` in 175). |
| `s13.json` | `b183` | 183–184 | Sentences 0–5 (6 of 24) are a general introduction to `باب الهمزتين من كلمة` before sentence 6 starts explaining verse 183; vocabulary glosses in sentences 19–23 at the end return to words from verse 183 (`سما`, `حسنا`, `لا تهن`) and verse 184 (`أذل`). |
| `s14.json` | `b202` | 202–205 | Sentences 0–5 (6 of 23) form a general introduction to `باب الهمزتين من كلمتين` before sentence 6 begins explaining verse 202; vocabulary glosses at the end (sentences 21–22) return to words in verses 202 and 204. |
| `s17.json` | `b243` | 243–244 | Verse 244 straddles two topics: its first half (`وَفِي النَّجْمِ وَالشُّورَى وَعَنْدَ التَّغَابُنِ...`) completes the ruling of verse 243, while its end (`وَعَنْ عُثْمَانَ فَالْكُلُّ دَوْلَلَا`) starts the topic of `b244` (244–246). In `b243`, sentences 6–7 explain only the first part of verse 244. |
| `s18.json` | `b252` | 252–255 | Vocabulary section (`اللغة`) in sentences 0–4 precedes the `المعنى` section (sentences 5–31), requiring mapping each lexical gloss (`نقل`, `حرك`, `ورش`, `المجهول`) to its respective verse before the sequential explanation begins. |
| `s26.json` | `b291` | 291–294 | Non-sequential commentary order: sentences 0–4 introduce `باب الفتح والإمالة` generally; sentences 6–7, 25, and 29–30 pull in the `استثناء` and `تغليظ/تفخيم` conditions from verse 293 while explaining verses 291 and 292; sentences 43–45 at the end gloss vocabulary from verses 293, 291, and 292 (`أصحاب المراتب`, `أجد`, `علا`). |
| `s26.json` | `b337` | 337–338 | Sentences 13–17 and 19 (7 of 20 sentences total with sentence 0) give a retrospective summary of the entire chapter on `الفتح والإمالة` and were left unassigned. |
| `s27.json` | `b339` | 339–342 | Sentences 45–66 and 71 (23 of 72 sentences) provide a comprehensive chapter-level synthesis of the 15 unconditioned letters, the conditioned letters, and the two madhhabs across the whole `مذهب الكسائي في إمالة هاء التأنيث` section, and were left unassigned. |
| `s32.json` | `b393` | 393–399 | Non-sequential order at the start and end: sentence 1 cites `ما بعد راء` from verse 399 as part of framing the section, and sentences 22–23 at the end summarize the count of exceptions across the whole passage (including words from verse 392 in the previous block) while explaining the rule stated at the end of verse 399. |
| `s32.json` | `b400` | 400–405 | Verse 405 is split conceptually between `b400` (400–405) and `b405` (405–406): its first clause (`وَفِي النَّمْلِ آتَانِي وَيُفْتَحُ عَنْ أُولِي...`) belongs to `b400`, whereas its final word (`وَمَالِي فِي يس سَكِّنْ فَتَكْمُلَا`) initiates `b405`. |
| `s35.json` | `b495` | 495–498 | Verse 498 is shared with `b498` (498–499): its first clause (`وَمَعْ فُتِحَتْ خَفِّفْ...`) finishes the ruling of verse 497 in `b495`, while the remainder of verse 498 (`وَحَتَّى يَقُولَ الرَّفْعُ...`) is explained in `b498`. |
| `s35.json` | `b526` | 526–535 | Non-sequential three-pass structure: sentences 0–17 list the 14 Quranic occurrences of `إبراهيم` across verses 526–535; sentences 21–35 do a second pass explaining the poem's phrasing and readings verse by verse; sentences 36–39 and 42 do a third pass explaining the grammar (`إعراب`) of specific phrases in verses 529, 527, 530, 528, and 533. |
| `s46.json` | `b789` | 789–793 | Sentences 38–45 (along with transition sentence 31) give an overarching summary of the readings across all occurrences of `أفرأيت / أرأيتم / أرأيتك` in the Quran and were left unassigned. |
| `s59.json` | `b927` | 927–928 | Sentence 3 contains a copyist/printing slip in the commentary (`فتكون قراءة ابن كثير وأبي عمرو وابن عامر بفتح الخاء` even though sentence 2 already stated that Ibn Amir reads with dammah and verse 928 says `وَخَاطِبْ يَخْصِفَانِ شَذاً جَلَا`); assigned to both verses 927 and 928 as the complementary reading statement. |
| `s82.json` | `b1148` | 1148–1150 | Non-sequential commentary order: the commentator explains the rulings of verses 1149 and 1150 first (sentences 0–11), then explains the opening notice of verse 1148 (`وَفِي سُوَرٍ مِنْهَا البَيَانُ...`) in sentences 12–13, and finally gives grammatical/lexical notes (`إعراب`) for verses 1149 and 1150 in sentences 14–19. |
| `s83.json` | `b1166` | 1166–1169 | Non-sequential commentary order: the commentator explains the supplications in verses 1167–1169 first (sentences 0–8), then returns to verse 1166 (`تَبَارَكْتَ...`) in sentences 9–10 before glossing phrases from verses 1167–1169 in sentences 10–17. |

---

## 4. Rejected Blocks You Could Not Fix

None. All 251 blocks across all 71 files were accepted by `python3 tools/commentary/parts.py` (`merged 251 blocks, skipped 0`).

---

## 5. Problems in the Input

1. **Overlapping boundary verses between consecutive blocks**:
   - `s17.json`: `b243` (verses 243–244) and `b244` (verses 244–246) both include verse 244 because the first half of verse 244 completes the topic of `b243` while the last clause of verse 244 starts the topic of `b244`.
   - `s32.json`: `b400` (verses 400–405) and `b405` (verses 405–406) both include verse 405 for the same reason (`وَفِي النَّمْلِ آتَانِي...` is explained in `b400`, while `وَمَالِي فِي يس سَكِّنْ فَتَكْمُلَا` is explained in `b405`).
   - `s35.json`: `b495` (verses 495–498) and `b498` (verses 498–499) both include verse 498 (`وَمَعْ فُتِحَتْ خَفِّفْ...` is explained in `b495`, while `وَحَتَّى يَقُولَ الرَّفْعُ...` is explained in `b498`).
2. **Commentary referencing words from an adjacent verse outside the block**:
   - `s32.json` `b393` (verses 393–399): Sentence 23 (`وهي: ذروني، ادعوني، تردين...`) lists all 22 exceptions to the rule stated at the end of verse 399; the first two words (`ذروني، ادعوني`) actually appear at the end of verse 392 (the preceding block).
3. **Sentences cut mid-phrase or mid-clause**:
   - Because long sentences were split automatically on punctuation/commas, several entries consist of a tiny fragment or split a syntactic unit across entries:
     - `s10.json` `b146`: sentence 13 is just `"وقد بين أن"` while sentence 14 continues `"دال (قد) تدغم في الحروف الثمانية..."`.
     - `s12.json` `b168`: sentence 9 is just `"فإن"` while sentence 10 continues `"المد في هذه الكلمات..."`.
     - `s12.json` `b177`: sentence 2 ends `"في فواتح"` and sentence 3 is the single word `"السور."`.
     - `s53.json` `b885`: sentence 4 ends `"في قوله تعالى:"` and sentence 5 is just `"فيها مآرب"`.
     - `s78.json` `b1093`: sentence 10 ends `"وهو مبتدأ محذوف"` and sentence 11 begins `"الخبر، والتقدير..."` before continuing into verse 1095's ruling.
4. **Source text / OCR typos in the input**:
   - `s59.json` `b927`: In sentence 3, `"فتكون قراءة ابن كثير وأبي عمرو وابن عامر بفتح الخاء"` mistakenly names `ابن عامر` (who was already listed in sentence 2 among those reading with dammah of the `خاء`) instead of `قنبل` / `الكسائي` as required by verse 928 (`وَخَاطِبْ يَخْصِفَانِ شَذاً جَلَا`).
   - `s64.json` `b975`: In sentence 2, `"فتكون قراءة حمزة والكسائي عالم مع خفض الميم"` has `"عالم"` instead of `"علام"` (whereas sentence 1 correctly states that the others read `عالم الغيب`).
   - `s80.json` `b1118`: Verse 1119's text ends with `"تَحَصَّلَ.ا"` (an extraneous period inside the final word `تَحَصَّلَا`).

---

## 6. Ten Samples

Below are ten sample blocks from ten different files showing the block ID, verse numbers, and the exact sentence assignment produced:

1. **`s5.json` — `b27` (verses 27–28)**
   ```json
   "b27": {
     "27": [0, 1, 2, 3, 4],
     "28": [4, 5, 6, 7, 8]
   }
   ```
2. **`s10.json` — `b144` (verses 144–145)**
   ```json
   "b144": {
     "144": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
     "145": [11, 12, 13, 14]
   }
   ```
3. **`s18.json` — `b256` (verses 256–257)**
   ```json
   "b256": {
     "256": [0, 1, 2, 3, 4, 5],
     "257": [6, 7, 8, 9, 10, 11, 12, 13, 14]
   }
   ```
4. **`s25.json` — `b286` (verses 286–290)**
   ```json
   "b286": {
     "286": [0],
     "287": [1, 2, 3],
     "288": [4, 5, 6, 7, 8, 9, 10, 11, 12],
     "289": [13, 14, 15, 16, 17, 18],
     "290": [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
   }
   ```
5. **`s33.json` — `b422` (verses 422–423)**
   ```json
   "b422": {
     "422": [0, 1, 2, 3],
     "423": [4, 5, 6]
   }
   ```
6. **`s42.json` — `b718` (verses 718–720)**
   ```json
   "b718": {
     "718": [0, 1, 2],
     "719": [3, 4, 5, 6, 7],
     "720": [7, 8, 9, 10, 11]
   }
   ```
7. **`s52.json` — `b867` (verses 867–868)**
   ```json
   "b867": {
     "867": [0, 1, 2, 3],
     "868": [4, 5, 6, 7, 8]
   }
   ```
8. **`s64.json` — `b977` (verses 977–978)**
   ```json
   "b977": {
     "977": [0, 1, 2, 3, 4, 5],
     "978": [6, 7, 8, 9, 10]
   }
   ```
9. **`s74.json` — `b1067` (verses 1067–1068)**
   ```json
   "b1067": {
     "1067": [0, 1, 2, 3, 4, 5, 6],
     "1068": [7, 8]
   }
   ```
10. **`s83.json` — `b1160` (verses 1160–1161)**
    ```json
    "b1160": {
      "1160": [0, 1, 4],
      "1161": [2, 3, 5]
    }
    ```
