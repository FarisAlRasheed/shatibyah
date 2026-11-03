# Diff report — متن الشاطبية, Al-Qasim vs Zu'bi, run 3 (مقدمة الناظم and the أصول)

Generated 2026-11-03 by the text agent. Al-Qasim = `sources/qasim.pdf` (the PDF always wins). Zu'bi = Turath book 7754 (pages 7–42, fetched once with `tools/extract/fetch_turath.py`).

## 1. Summary

- PDF pages **17–76** (printed 15–74). Verses **1–444** (444 verses). مقدمة الناظم starts on PDF page 17 (verse 1, under the basmala ornament; the page prints no heading of its own). Verse 445 (the first فرش verse) is on PDF page 77, unchanged.
- Sections added: 29 (ids 5–33). `edition.json` of both editions now holds verses 1–1173 and sections 5–83; `partial` removed, `verseCount` 1173.
- **Real differences (Zu'bi → Al-Qasim): 836** words (815 word-level + 21 half-verses where the word split differs).
  - by kind (a word can have several): vowel only in qasim: 394, letter: 205, vowel conflict: 130, vowel only in zubi: 76, shadda: 54, tanween: 45, hamza form: 37, word split: 21. «vowel only in qasim/zubi» = a vowel printed in one edition and absent in the other.
- Quranic (Uthmani) spelling differences: 156 words (dagger alif for alif, ٱ, ءا for آ, ى for final ي, small wāw/yā). Listed in §2b; not counted as real.
- Style-only differences: 807 words — sukun on al- lam: 257, alef-fatha placement: 179, uthmani marks: 173, tanween placement: 121, rhyme ى/ا: 37, sukun on long vowel: 37, punctuation: 3. Also: the name Allah (Zu'bi «اللهُ» without shadda) is treated as style.
- Uncertain: **6 items** (§3).
- Image checks: **761 half-lines** checked on 300-DPI crops, stacked 10 per image (77 images): 442 with a hard flag or a real difference, 305 flagged only for a glyph class (lam-alif, the Allah ligature, «اً», hamza seats, ornaments, split words), and a 10% random sample of the clean ones (14 of 140). Corrections from the image: **122 half-lines** (§4). The random sample found **no** error the script had missed, so no page needed a wider check. 140−14 = 126 clean half-lines were not looked at.

### How the text was built (scripts in `tools/extract/`)
1. `fetch_turath.py` — Turath pages as raw JSON (curl; Python's urllib gets HTTP 403).
2. `stage1_pieces.py` — pypdf pieces with positions (and font names). Verse numbers (x ≥ 390 pt) anchor each verse; half a is on the number's line, half b about 28.5 pt below; every piece goes to the nearest of these lines. Pieces whose position pypdf lost (254 on 47 pages, mostly «وَ» and «،») are kept per page as `lost`.
3. `pdfkit-strings.swift` — PDFKit `page.string` (reading order).
4. `stage2_build.py` — finds each half in the PDFKit stream (alignment on a loose skeleton without ا/ل), orders the pypdf pieces by their place in it, merges the two letter by letter (pypdf's codes win; marks only PDFKit has are added; lam-alif rebuilt from pypdf's ل and PDFKit's ا; lost pieces matched back), cuts words on Zu'bi's boundaries, and flags. `compare.py` classifies differences from Zu'bi.
5. `make_stacks.py` + `stack-crops.swift` — 10 half-line crops (≈1100×133 px) per image with a label column; `list_stack.py` prints the text of one image to compare.
6. `stage3_merge.py` — applies the corrections typed from the images, merges into both `edition.json` files (atomic write), validates, and checks that 445–1173 are byte-identical. `report_tables.py` prints the §2 tables.

Re-run: `fetch_turath.py <cache> 1 45`; `stage1_pieces.py sources/qasim.pdf 17 76 pieces.json`; `swift pdfkit-strings.swift sources/qasim.pdf 17 76 pdfkit.json`; `stage2_build.py <cache> 7 42 1 444 pdfkit.json pieces.json build.json`; then `stage3_merge.py build.json corrections.json heads.json <cache> 7 42 1 444 . validation.json --write`. The corrections typed from the images are saved in `data/editions/qasim/_progress-usul.json` (key `corrections`) and listed in §4; the heading file is rebuilt from §5.

## 2. Real differences (Zu'bi → Al-Qasim)

Word-level. Kinds: letter, hamza form, shadda, tanwīn, vowel conflict, vowel only in one edition, word split (whole half shown). Al-Qasim writes a one-letter prefix before a quoted Quranic word apart («كَ: يَعۡلَمُ»); for the comparison it is joined back, so it does not count as a split difference.

| Verse | Half | Kind | Zu'bi | Al-Qasim |
|---|---|---|---|---|
| 1 | a | vowel conflict, vowel only in qasim, vowel only in zubi | اْللهُ | اللَّهِ |
| 1 | a | vowel only in qasim, vowel only in zubi | فيِ | فِي |
| 1 | a | vowel only in qasim | أوَّلاَ | أَوَّلاَ |
| 2 | a | vowel only in qasim | اللهُ | اللَّهُ |
| 2 | a | vowel conflict, vowel only in zubi | الِرَّضَا | الرِّضَا |
| 2 | b | vowel only in qasim | الْمُهْدى | المُهْدَى |
| 2 | b | vowel only in qasim | إلَى | إِلَى |
| 3 | a | shadda | ثُمَ | ثُمَّ |
| 3 | a | vowel only in qasim | ثُمّ | ثُمَّ |
| 3 | b | vowel only in zubi | اْلإِحْسَانِ | الإِحْسَانِ |
| 4 | a | vowel only in qasim | أنَّ | أَنَّ |
| 4 | a | vowel only in zubi | اْلَحَمْدَ | الحَمْدَ |
| 4 | a | vowel only in qasim | لِلهِ | لِلَّهِ |
| 4 | a | vowel only in qasim | دائِمًا | دَائِماً |
| 4 | b | hamza form | مَبْدُوءًا | مَبْدُوءاً |
| 4 | b | vowel only in qasim | أجْذَمُ | أَجْذَمُ |
| 5 | a | vowel only in qasim | اللهِ | اللَّهِ |
| 6 | a | vowel only in qasim | بهِ | بِهِ |
| 6 | a | vowel only in qasim | إذْ | إِذْ |
| 6 | a | vowel conflict | يَخْلُقُ | يُخْلِقُ |
| 6 | b | vowel only in qasim | مُوَاليهِ | مُوَالِيهِۦ |
| 7 | b | vowel only in qasim | كاَلاتْرُجِّ | كَالاُتْرُجِّ |
| 7 | b | hamza form | وَمُوكِلَا | وَمُؤْكِلَا |
| 8 | a | letter | أُمَّهً | أُمَّةً |
| 9 | a | vowel only in qasim | كانَ | كَانَ |
| 9 | b | vowel only in qasim | إلَى | إِلَى |
| 10 | a | vowel only in qasim | اللهِ | اللَّهِ |
| 11 | b | tanween | تَجَمُّلًا | تَجَمُّلَا |
| 12 | a | vowel only in qasim | الْفَتى | الفَتَى |
| 12 | b | vowel only in qasim, vowel only in zubi | اْلقَبرِ | القَبْرِ |
| 12 | b | tanween | مُتَهَلِّلًا | مُتَهَلِّلَا |
| 13 | b | vowel conflict | يُجْتُلَى | يُجْتَلَى |
| 14 | a | vowel only in qasim | في | فِي |
| 14 | a | vowel only in qasim | إرْضَائِهِ | إِرْضَائِهِ |
| 14 | a | vowel only in qasim, vowel only in zubi | لحبِيِبِهِ | لِحَبِيبِهِ |
| 14 | b | vowel only in qasim | إلَيْهِ | إِلَيْهِ |
| 15 | b | shadda | مُجِلًاّ | مُجِلًّا |
| 15 | b | vowel only in qasim | مُبَجِّلا | مُبَجِّلَا |
| 16 | a | vowel only in qasim | عَلَيْهِما | عَلَيْهِمَا |
| 16 | b | vowel only in qasim | وَالحُلاْ | وَالحُلَى |
| 17 | a | vowel only in qasim | فَما | فَمَا |
| 17 | a | vowel only in qasim | بالنَّجْلِ | بِالنَّجْلِ |
| 17 | b | vowel only in qasim | اللهِ | اللَّهِ |
| 17 | b | vowel conflict, vowel only in qasim | والصَّفَوَةُ | وَالصَّفْوَةُ |
| 18 | b | vowel conflict | حُلاَهُمُ | حُلَاهُمْ |
| 20 | a | vowel only in qasim | اللهُ | اللَّهُ |
| 20 | a | hamza form | أَئِمَّةً | أَيِمَّةً |
| 20 | b | vowel conflict | القُرَآنَ | القُرْآنَ |
| 22 | a | vowel only in zubi | اُسْتَنَارَتْ | اسْتَنَارَتْ |
| 22 | b | vowel only in qasim | تَفَرَّق | تَفَرَّقَ |
| 25 | a | vowel only in qasim | في | فِي |
| 25 | a | shadda, vowel only in qasim, vowel only in zubi | الطيِّبِ | الطِّيبِ |
| 25 | b | vowel only in qasim | الْمَدينَةَ | المَدِينَةَ |
| 26 | a | vowel only in qasim | عُثْمانُ | عُثْمَانُ |
| 27 | a | vowel only in qasim | اللهِ | اللَّهِ |
| 27 | b | vowel only in zubi | اُبْنُ | ابْنُ |
| 27 | b | vowel only in qasim | كاثِرُ | كَاثِرُ |
| 28 | a | vowel only in qasim | رَوى | رَوَى |
| 29 | a | vowel conflict | الإْمَامُ | الإِمَامُ |
| 29 | b | vowel conflict | الْبَصْرِيْ | البِصْرِي |
| 32 | b | vowel conflict | فَتْلِكَ | فَتِلْكَ |
| 32 | b | vowel only in qasim | اللهِ | اللَّهِ |
| 33 | a | vowel only in qasim | اللهِ | اللَّهِ |
| 34 | a | letter | ثَلاَتَةٌ | ثَلَاثَةٌ |
| 36 | b | vowel only in qasim | وَبِاْلإتْقَانِ | وَبِالإِتْقَانِ |
| 36 | b | vowel only in qasim | كانَ | كَانَ |
| 36 | b | vowel only in qasim | مُفضَّلَا | مُفَضَّلَا |
| 37 | a | vowel only in qasim | أَزْكاهُ | أَزْكَاهُ |
| 37 | b | vowel only in qasim | لِلقُرانِ | لِلْقُرَانِ |
| 38 | a | shadda | وَخَلاَّدٌ | وَخَلَّادٌ |
| 38 | b | vowel conflict | مُتْقِنًا | مُتْقَناً |
| 39 | b | vowel only in qasim | كانَ | كَانَ |
| 39 | b | vowel only in qasim | في | فِي |
| 40 | b | vowel only in qasim, vowel only in zubi | وَفيِ | وَفِي |
| 41 | a | vowel only in qasim | والْيحْصَبِيُّ | وَاليَحْصَبِيُّ |
| 42 | a | letter, vowel conflict | يُهْدَى | يَهْدِي |
| 42 | b | tanween | مُتَمَحِّلًا | مُتَمَحِّلَا |
| 43 | a | shadda, vowel only in qasim, vowel only in zubi | الَّلوَاتِي | اللَّوَاتِي |
| 44 | b | vowel conflict | مُسَهِّلَا | مُسَهَّلَا |
| 47 | b | shadda, vowel only in qasim, vowel only in zubi | وَبالَّلفْظِ | وَبِاللَّفْظِ |
| 49 | a | letter | مُثَلَّتٌ | مُثَلَّثٌ |
| 53 | a | vowel conflict | هَمَا | هُمَا |
| 54 | b | vowel conflict | وَالْيَحْصُبِي | وَاليَحْصَبِي |
| 55 | a | tanween | وَنَافِعٍ | وَنَافِعٌ |
| 57 | a | vowel only in qasim | كانَ | كَانَ |
| 57 | a | vowel conflict | بَضِدِّهِ | بِضِدِّهِ |
| 57 | b | shadda, vowel only in qasim | غَنّيٌّ | غَنِيٌّ |
| 57 | b | vowel only in qasim | بِالذَّكاءِ | بِالذَّكَاءِ |
| 59 | b | vowel conflict | اْعَمِلَا | اُعْمِلَا |
| 60 | b | vowel only in qasim | وَالإِسْكانُ | وَالإِسْكَانُ |
| 62 | a | tanween | سَاكِتا | سَاكِتاً |
| 63 | a | vowel only in qasim | وَفي | وَفِي |
| 64 | a | vowel only in qasim | وَقبْلَ | وَقَبْلَ |
| 64 | a | vowel only in qasim | وبَعْدَ | وَبَعْدَ |
| 66 | a | vowel only in qasim | كانَ | كَانَ |
| 68 | a | vowel only in qasim | وَفي | وَفِي |
| 68 | a | vowel conflict | اخْتَصَارَهُ | اخْتِصَارَهُ |
| 68 | b | vowel only in qasim | اللهِ | اللَّهِ |
| 70 | a | tanween | تَيَمُّنا | تَيَمُّناً |
| 70 | b | vowel only in qasim | التَّهانِي | التَّهَانِي |
| 70 | b | vowel only in qasim | مُتَقبِّلَا | مُتَقَبِّلَا |
| 71 | a | vowel only in qasim | أللَّهُمَّ | أَللَّهُمَّ |
| 71 | b | vowel conflict | وَمِفْعَلَا | وَمَفْعَلَا |
| 72 | a | vowel only in qasim | إِلَيكَ | إِلَيْكَ |
| 72 | b | letter | قَأَخْطَلَا | فَأَخْطَلَا |
| 73 | a | vowel only in qasim | لِلأَمِينِ | لِلْأَمِينِ |
| 73 | b | vowel only in qasim | وَإنْ | وَإِنْ |
| 74 | a | shadda | لِحُرٍ | لِحُرٍّ |
| 74 | a | vowel only in qasim | وَالْمُرُوءةُ | وَالمُرُوءَةُ |
| 74 | b | vowel only in qasim | لإخْوَتِهِ | لِإِخْوَتِهِ |
| 75 | a | vowel only in qasim | أَخي | أَخِي |
| 76 | b | vowel only in qasim | كانَ | كَانَ |
| 77 | a | vowel only in qasim | لإِحْدَى | لِإِحْدَى |
| 77 | b | vowel only in qasim | اجْتِهادٌ | اجْتِهَادٌ |
| 78 | a | vowel only in qasim | كانَ | كَانَ |
| 78 | a | tanween | خَرْقُ | خَرْقٌ |
| 78 | b | vowel only in qasim | ولْيُصْلِحْهُ | وَلْيُصْلِحْهُ |
| 81 | a | vowel only in qasim | وَهذَا | وَهَذَا |
| 81 | b | vowel only in qasim | الْبلَا | البَلَا |
| 82 | a | vowel only in qasim | سَاعَدتْ | سَاعَدَتْ |
| 82 | a | vowel only in qasim | لتَوَكَّفَتْ | لَتَوَكَّفَتْ |
| 83 | a | vowel only in qasim | وَلكِنَّها | وَلَكِنَّهَا |
| 83 | b | letter | تَمْشِى | تَمْشِي |
| 84 | a | vowel only in qasim | بِنَفسِي | بِنَفْسِي |
| 84 | a | vowel only in zubi | اسْتَهْدَىَ | اسْتَهْدَى |
| 84 | a | vowel only in qasim | إلَى | إِلَى |
| 84 | a | vowel only in qasim | اللهِ | اللَّهِ |
| 84 | b | vowel only in qasim | وَكانَ | وَكَانَ |
| 84 | b | vowel conflict | وَمَغْسَلَا | وَمَغْسِلَا |
| 85 | a | vowel only in qasim | فَتفَتَّقَتْ | فَتَفَتَّقَتْ |
| 86 | a | vowel conflict | هَمُّهُ | هَمَّهُ |
| 88 | a | vowel only in qasim | لأَنَّهُمْ | لِأَنَّهُمْ |
| 88 | b | vowel only in qasim | اللهُ | اللَّهُ |
| 88 | b | vowel conflict | يُجْرُونَ | يَجْرُونَ |
| 89 | a | vowel only in qasim | لأَنَّهَا | لِأَنَّهَا |
| 89 | b | vowel only in qasim | تَلْعقْ | تَلْعَقْ |
| 90 | a | word split | وَقَدْ قِيلَ كُنْ كَالْكَلْبِ يُقْصِيهِ | وَقَدْ قِيلَ كُنْ كَالكَلْبِ يُقْصِيهِ أَهْلُهُ |
| 90 | b | word split | أَهْلُهُ وَمَا يَأْتَلِي فِي نُصْحِهِمْ مُتَبَذِّلَا | وَمَا يَأْتَلِي فِي نُصْحِهِمْ مُتَبَذِّلاَ |
| 91 | a | vowel only in qasim | إِلهَ | إِلَهَ |
| 92 | b | vowel only in qasim | فَيمْحَلَا | فَيَمْحَلَا |
| 93 | a | shadda, vowel only in qasim | وَبِاللهِ | وَبِاللَّهِ |
| 93 | a | letter | حَوْلِى | حَوْلِي |
| 93 | a | letter | وَقُوَّتِى | وَقُوَّتِي |
| 93 | b | word split | وَمَالِيَ إِلاَّ سِتْرُهُ مُتَجَلِّلَا | وَمَا لِيَ إِلاَّ سِتْرُهُ مُتَجَلِّلَا |
| 94 | a | vowel only in qasim | اللهُ | اللَّهُ |
| 95 | b | vowel only in qasim | بِاللهِ | بِاللَّهِ |
| 96 | a | word split | عَلَى مَا أَتَى فِي النَّحْلِ يُسْرًا | عَلَى مَا أَتَى فِي النَّحْلِ يُسْراً وَإِنْ تَزِدْ |
| 96 | b | word split | وَإِنْ تَزِدْ لِرَبِّكَ تَنْزِيهًا فَلَسْتَ مُجَهَّلَا | لِرَبِّكَ تَنْزِيهاً فَلَسْتَ مُجَهَّلَا |
| 97 | b | vowel only in qasim | هذَا | هَذَا |
| 99 | a | vowel conflict, vowel only in zubi | وَعُاَتُنَا | وُعَاتُنَا |
| 99 | b | vowel only in qasim | كالْمَهْدَوِي | كَالمَهْدَوِي |
| 102 | a | shadda | كَلاَّ | كَلَّا |
| 102 | a | vowel only in qasim | وجْهٌ | وَجْهٌ |
| 103 | a | vowel only in qasim | وسَكْتُهُمُ | وَسَكْتُهُمُ |
| 103 | b | vowel conflict | الأَرْبِعِ | الأَرْبَعِ |
| 105 | b | vowel only in qasim | بالسَّيْفِ | بِالسَّيْفِ |
| 106 | b | vowel only in qasim | وَفي | وَفِي |
| 108 | a | vowel only in zubi | نَاَصِرٌ | نَاصِرٌ |
| 108 | b | vowel conflict | وَعَنْدَ | وَعِنْدَ |
| 108 | b | letter | سِرَاطٍ | صِۜرَٰطٖ |
| 108 | b | letter, vowel conflict | وَالسِّرَاطَ | وَٱلصِّۜرَٰطِ |
| 109 | a | vowel conflict | وَالصَّادُ | وَالصَّادَ |
| 109 | a | hamza form | اشِمَّهَا | أَشِمَّهَا |
| 109 | b | shadda | لِخَلاَّدِ | لِخَلَّادِ |
| 110 | a | vowel conflict | عَلَيْهِمْ | عَلَيۡهُمۡ |
| 110 | a | vowel conflict | إِلَيْهِمْ | إِلَيۡهُمۡ |
| 110 | a | letter, vowel conflict, vowel only in qasim | وَلَدَيْهِموُ | وَلَدَيۡهُمُۥ |
| 110 | b | vowel only in qasim | الْهاءِ | الهَاءِ |
| 113 | a | vowel conflict | ضَمُّهَا | ضُمَّهَا |
| 113 | b | shadda | لِكُلٍ | لِكُلٍّ |
| 114 | b | vowel only in qasim | وَفي | وَفِي |
| 114 | b | vowel only in qasim | بالضَّمِّ | بِالضَّمِّ |
| 116 | a | vowel conflict | الاُِدْغَامَ | الاِدْغَامَ |
| 116 | b | vowel conflict | الْبَصْرِيُّ | البِصْرِيُّ |
| 117 | a | vowel conflict | مَنَاسِككُّمْ | مَنَٰسِككُّمُۥ |
| 118 | b | vowel only in qasim | إدْغَامِ | إِدْغَامِ |
| 118 | b | vowel only in qasim | كانَ | كَانَ |
| 119 | a | vowel only in zubi | وَطُبِعْ | وَطُبِع |
| 119 | a | shadda | عَلَى | عَّلَىٰ |
| 120 | b | vowel only in qasim | أوِ | أَوِ |
| 120 | b | vowel only in qasim | تنْوِينَهُ | تَنْوِينَهُ |
| 121 | a | vowel only in zubi | كَكُنْتُ | كَكُنتُ |
| 121 | a | vowel only in zubi | أَنْتَ | أَنتَ |
| 122 | a | vowel only in zubi | يَحْزُنْكَ | يَحۡزُنكَ |
| 123 | a | vowel only in qasim | في | فِي |
| 124 | a | vowel only in zubi | وَإِنْ | وَإِن |
| 124 | a | tanween, vowel only in qasim | كاذِبا | كَـٰذِبٗا |
| 125 | a | word split | وَيَا قَوْمِ مَالِي ثُمَّ يَا قَوْمِ مَنْ بِلاَ | وَيَٰقَوۡمِ مَالِي ثُمَّ يَٰقَوۡمِ مَنۡ بِلَا |
| 126 | b | vowel only in qasim | رَدَّه | رَدَّهُ |
| 126 | b | vowel conflict | مَنُْ | مَنْ |
| 127 | a | vowel only in zubi | لَكَ | لَك |
| 127 | a | shadda | كَيْدًا | كَّيۡدًا |
| 128 | b | vowel only in qasim | ابْدِلَا | اُبْدِلاَ |
| 129 | a | vowel conflict | وَوَاوَ | وَوَاوُ |
| 129 | a | vowel conflict, vowel only in qasim | الْمَضْمومُ | المَضْمُومِ |
| 129 | a | shadda | وَمَنْ | وَّمَنۡ |
| 130 | a | letter | وَيَأْتِيَ | وَيَأۡتِىَ |
| 131 | a | vowel only in qasim | في | فِي |
| 131 | a | letter | الَّلاءِ | ٱلَّـٰٓيِٕ |
| 131 | b | vowel conflict | فَهُوَ | فَهْوَ |
| 132 | b | vowel only in qasim | فإِدْغَامُهُ | فَإِدْغَامُهُ |
| 132 | b | vowel only in qasim | في | فِي |
| 132 | b | vowel only in qasim | الْكافِ | الكَافِ |
| 133 | a | vowel only in qasim | وَهذَا | وَهَذَا |
| 133 | b | vowel only in qasim | الْكافِ | الكَافِ |
| 134 | a | shadda, vowel conflict, vowel only in zubi | كَيَرْزُقُكُمْ | كَيَرۡزُقكُّمُۥ |
| 134 | a | letter, vowel only in qasim, vowel only in zubi | وَاثقَكُّمُوا | وَاثَقكُّمُۥ |
| 134 | a | letter | وَخَلَقكُّمُو | وَخَلَقكُّمُۥ |
| 135 | a | hamza form | وَاِدْغَامُ | وَإِدْغَامُ |
| 137 | a | vowel only in qasim | ضنٍ | ضَنٍ |
| 137 | b | vowel only in qasim | كانَ | كَانَ |
| 139 | a | vowel only in zubi | فَزُحْزِحْ | فَزُحۡزِح |
| 139 | a | shadda | عَنِ | عَّنِ |
| 139 | b | vowel only in qasim | وَفي | وَفِي |
| 139 | b | vowel only in qasim | في | فِي |
| 140 | a | vowel only in zubi | خَلَقْ | خَلَق |
| 140 | a | shadda | كُلَّ | كُّلَّ |
| 140 | a | vowel only in zubi | لَكْ | لَك |
| 140 | a | shadda | قُصُورًا | قُّصُورًا |
| 140 | a | vowel only in qasim | وأُظْهِرَا | وَأُظْهِرَا |
| 141 | a | vowel only in qasim | وَفي | وَفِي |
| 141 | a | letter | ذِي | ذِى |
| 141 | a | vowel only in zubi | المَعَارِجِ | ٱلۡمَعَارِج |
| 141 | a | shadda | تَعْرُجُ | تَّعۡرُجُ |
| 141 | b | letter, vowel conflict | شَّطْأَهُ | شَّطۡـَٔهُۥ |
| 142 | a | letter | ذِي | ذِى |
| 143 | a | vowel only in qasim | وَفي | وَفِي |
| 143 | b | hamza form | الرَّاْسُ | ٱلرَّأۡسُ |
| 144 | b | vowel only in qasim | جلَا | جَلَا |
| 146 | b | vowel only in qasim | وَفي | وَفِي |
| 147 | a | letter | التَّوْرَاةَ | ٱلتَّوۡرَىٰةَ |
| 147 | a | letter | الزَّكَاةَ | ٱلزَّكَوٰةَ |
| 147 | b | hamza form | طَائِفَةٌ | طَآئِفَةٌ |
| 148 | a | vowel only in qasim | وَفي | وَفِي |
| 148 | a | letter, vowel only in qasim | شَيْئًا | شَيۡـٔٗا |
| 149 | a | vowel only in qasim | وَفي | وَفِي |
| 149 | a | vowel only in qasim | الأَوائِلُ | الأَوَائِلُ |
| 149 | b | vowel only in qasim | وَفي | وَفِي |
| 150 | a | vowel only in qasim | وَفي | وَفِي |
| 150 | a | shadda, vowel only in qasim, vowel only in zubi | الَّلامِ | اللَّامِ |
| 150 | a | vowel only in qasim | في | فِي |
| 150 | b | vowel only in qasim | إِذا | إِذَا |
| 150 | b | vowel only in qasim | بَعدَ | بَعْدَ |
| 150 | b | letter | مُنْرَلَا | مُنْزَلاَ |
| 151 | a | vowel only in qasim | قالَ | قَالَ |
| 152 | a | vowel conflict | وَتُسْكُنُ | وَتُسْكَنُ |
| 153 | a | vowel only in qasim | وَفي | وَفِي |
| 153 | a | vowel only in zubi | مَنْ | مَن |
| 153 | a | hamza form | يَشَاءُ | يَشَآءُ |
| 153 | a | vowel only in qasim | با | بَا |
| 154 | a | vowel only in qasim | الإِدْغامُ | الإِدْغَامُ |
| 154 | b | vowel conflict | أَثْقِلَا | أَثْقَلَا |
| 157 | a | tanween, vowel only in zubi | مِنْ | مِنۢ |
| 157 | b | letter, vowel only in qasim | وَفي | وَفِى |
| 157 | b | vowel conflict | فَاشْمُلَا | فَاشْمَلَا |
| 159 | a | vowel only in qasim, vowel only in zubi | لاِبْنِ | لِابْنِ |
| 160 | b | vowel conflict | فَاعَتَبِرْ | فَاعْتَبِرْ |
| 162 | a | vowel only in qasim | بسُكُونِ | بِسُكُونِ |
| 162 | b | hamza form | وَيَاْتِهْ | وَيَأۡتِهۡ |
| 162 | b | letter, vowel only in qasim | طه | طَاهَا |
| 162 | b | vowel only in qasim, vowel only in zubi | بِالاِسْكَانِ | بِالِاسْكَانِ |
| 163 | a | vowel only in qasim | وَفي | وَفِي |
| 163 | b | vowel only in qasim | بخُلْفٍ | بِخُلْفٍ |
| 163 | b | letter | طَهَ | طَاهَا |
| 164 | a | vowel conflict | يَرْضَهُ | يَرۡضَهۡ |
| 164 | b | vowel conflict, vowel only in zubi | بِخُلْفِهِمِاَ | بِخُلْفِهِمَا |
| 164 | b | vowel conflict | وَالْقَصُرَ | وَالقَصْرَ |
| 165 | a | vowel conflict | الرَّحْبُ | الرُّحْبُ |
| 166 | a | vowel only in qasim | وَعى | وَعَى |
| 166 | a | letter, vowel conflict | أَرْجِئْهُ | أَرۡجِـٔۡهُ |
| 166 | a | tanween | سَاكِنا | سَاكِناً |
| 166 | b | vowel only in qasim | وَفي | وَفِي |
| 167 | b | vowel only in qasim | جوَادًا | جَوَاداً |
| 169 | b | vowel conflict | وَمُخْضَلَا | وَمُخْضِلَا |
| 170 | a | letter | كَجِئَ | كَجِاْيٓءَ |
| 170 | a | vowel only in zubi | وَعَنْ | وَعَن |
| 170 | a | hamza form | وَشَاءَ | وَشَآءَ |
| 170 | b | letter, vowel only in qasim | في | فِى |
| 171 | b | tanween | لِوَرْش | لِوَرْشٍ |
| 172 | a | letter | هَؤُلاَ | هَٰؤُلَآ |
| 172 | b | word split | ءِآلِهَةً آتى لِلاِيْمَانِ مُثِّلَا | ءِ ءَالِهَةً ءَاتَىٰ لِلِايمَٰنِ مُثِّلَا |
| 173 | a | vowel only in qasim | سِوى | سِوَى |
| 173 | a | vowel only in qasim, vowel only in zubi | إِسْرَاءيِلَ | إِسۡرَٰٓءِيلَ |
| 173 | b | tanween | كَقُرْآنِ | كَقُرۡءَانٖ |
| 173 | b | letter, vowel conflict | وَمَسْئُولًا | وَمَسۡـُٔولٗا |
| 174 | a | word split | وَمَا بَعْدَ هَمْزِ الْوَصْلِ إيتِ | وَمَا بَعْدَ هَمْزِ الوَصْلِ إِيتِ وَبَعْضُهُمْ |
| 174 | b | word split | وَبَعْضُهُمْ يُؤَاخِذُكُمْ آلانَ مُسْتَفْهِمًا تَلَا | يُؤَاخِذُكُمۡ ءَآلَـٰنَ مُسْتَفْهِماً تَلَا |
| 175 | a | letter | وَعَادً | وَعَادًا |
| 175 | a | vowel only in qasim, vowel only in zubi | الاُولَى | ٱلُاولَىٰ |
| 175 | b | vowel only in qasim | الْبَاب | البَابِ |
| 176 | b | vowel only in qasim | وعِنْدَ | وَعِنْدَ |
| 176 | b | vowel only in qasim | أُصِّلا | أُصِّلَا |
| 177 | a | tanween | مُشْبِعا | مُشْبِعاً |
| 177 | b | vowel only in qasim | وَفي | وَفِي |
| 178 | a | vowel only in qasim | وَفي | وَفِي |
| 178 | a | letter, vowel only in qasim | طهَ | طَاهَا |
| 178 | b | shadda | مَدٍ | مَدٍّ |
| 179 | b | hamza form | أَوْ | اَوْ |
| 181 | b | vowel only in qasim | لا | لاَ |
| 182 | a | hamza form | سَوْآتٍ | سَوۡءَٰتٍ |
| 182 | b | shadda | كُلٍ | كُلٍّ |
| 182 | b | letter | الْمَوْءُودَةُ | ٱلۡمَوۡءُۥدَةُ |
| 183 | a | vowel only in qasim | بِكِلْمةٍ | بِكِلْمَةٍ |
| 183 | b | vowel only in qasim | الْفتْحِ | الفَتْحِ |
| 184 | a | shadda | تَبَدَّلَّتْ | تَبَدَّلَتْ |
| 184 | b | vowel only in qasim | وَفي | وَفِي |
| 184 | b | letter | بَغْدَادَ | بَغْدَاذَ |
| 185 | a | vowel only in qasim | ءأَعْـ | ءَأَعۡ |
| 185 | b | letter, tanween | جَمِيٌّ | جَمِىّٞ |
| 185 | b | letter, vowel only in qasim | وَالاْولَى | وَالُولَى |
| 186 | a | vowel only in qasim | وَهَمْزَة | وَهَمْزَةُ |
| 187 | a | vowel only in zubi | أَنْ | أَن |
| 188 | b | vowel only in zubi | أَنْ | أَن |
| 189 | a | letter, vowel only in qasim | وَطه | وَطَاهَا |
| 189 | a | vowel only in qasim | وفِي | وَفِي |
| 189 | b | letter, vowel only in zubi | ءَآمَنْتُمُ | ءَأَٰمَنتُمُۥ |
| 189 | b | vowel only in qasim | لِلكُلِّ | لِلْكُلِّ |
| 189 | b | vowel only in qasim | ابْدِلَا | اُبْدِلاَ |
| 190 | b | letter | بِطَهَ | بِطَاهَا |
| 191 | a | vowel only in qasim | وَفي | وَفِي |
| 191 | b | vowel only in zubi | اْلاَعْرَافِ | الاَعْرَافِ |
| 193 | a | vowel only in qasim | أَوْلى | أَوْلَى |
| 193 | b | tanween | كُلِّ | كُلٍّ |
| 193 | b | hamza form, vowel only in qasim | كَآلانَ | كَءَآلَـٰنَ |
| 195 | b | vowel only in qasim, vowel only in zubi | ءأَنْذَرْتَهُمْ | ءَأَنذَرۡتَهُمۡ |
| 195 | b | letter | أَئِنَّا | أَءِنَّا |
| 195 | b | vowel only in zubi | أَءُنْزِلَا | أَءُنزِلَا |
| 196 | b | shadda, vowel conflict | لُذُّ | لُذْ |
| 197 | a | vowel only in qasim | وَفي | وَفِي |
| 197 | b | vowel only in qasim | وَفي | وَفِي |
| 198 | a | letter | أَئِنَّكَ | أَءِنَّكَ |
| 198 | a | letter | آئِفْكًا | أَٰئِفۡكًا |
| 198 | b | vowel only in qasim | وَفي | وَفِي |
| 199 | a | letter | وَآئِمَّةً | وَأَٰئِمَّةً |
| 199 | b | vowel only in qasim | وَفي | وَفِي |
| 200 | b | vowel only in qasim | بِخُلْفهِمَا | بِخُلْفِهِمَا |
| 200 | b | tanween | بَرَّا | بَرّاً |
| 201 | a | vowel only in qasim | وَفي | وَفِي |
| 201 | a | tanween | عِمْرَانَ | عِمْرَانٍ |
| 201 | a | vowel only in qasim | رَووْا | رَوَوْا |
| 201 | b | vowel only in qasim | وَفي | وَفِي |
| 202 | a | hamza form | الأُولَى | الاُولَى |
| 202 | a | vowel only in qasim | في | فِي |
| 202 | b | vowel conflict | الْعُلَا | العَلَا |
| 203 | b | letter | أُولَئِكَ | أُوْلَٰٓئِكَ |
| 204 | a | vowel only in qasim | في | فِي |
| 204 | b | vowel only in qasim | وَفي | وَفِي |
| 205 | a | hamza form, shadda, vowel only in qasim | وَبِالسُّوءِ | وَبِٱلسُّوِّ |
| 205 | a | shadda | إِلاَّ | إِلَّا |
| 207 | a | word split | وَفي هؤُلاَ إِنْ وَالْبِغَا إِنْ لِوَرْشِهِمْ | وَفِي هَـٰؤُلَا إِنۡ وَٱلۡبِغَآءِ لِوَرْشِهِمْ |
| 207 | b | vowel conflict | بَعْضُهُمْ | بَعْضُهُمُۥ |
| 209 | a | vowel only in qasim | في | فِي |
| 209 | b | hamza form | جَاءَ | جَآءَ |
| 210 | a | hamza form | نَشَاءُ | نَشَآءُ |
| 210 | a | hamza form, vowel only in qasim | والسَّماءِ | وَٱلسَّمَآءِ |
| 210 | b | vowel only in qasim | كالْيَا | كَاليَا |
| 211 | b | hamza form | يَشَاءُ | يَشَآءُ |
| 211 | b | vowel only in qasim | إِلى | إِلَىٰ |
| 211 | b | vowel only in qasim | كالْيَاءِ | كَاليَاءِ |
| 212 | a | vowel conflict | وَاوُهَا | وَاوَهَا |
| 213 | b | vowel conflict | وَالحَرْفُ | وَالحَرْفِ |
| 213 | b | vowel only in qasim | مِنهُ | مِنْهُ |
| 215 | b | hamza form | مُؤَجَّلَا | مُوَجَّلَا |
| 216 | b | vowel conflict | اْهْمِلاَ | اُهْمِلَا |
| 217 | a | tanween | وَعَشْرٌ | وَعَشْرُ |
| 217 | a | vowel only in qasim | يَشَأ | يَشَأۡ |
| 217 | b | letter, vowel conflict, vowel only in zubi | وَنَنْسَأْهَا | وَنَنسَـٔۡهَا |
| 218 | a | tanween, vowel only in zubi | وَأَنْبِئْهُمْ | وَأَنۢبِئۡهُمۡ |
| 218 | b | letter, vowel conflict | وَأَرْجِئْ | وَأَرۡجِـٔۡ |
| 219 | a | letter, vowel conflict, vowel only in qasim | وتُؤْوِي | وَتُـٔۡوِى |
| 219 | a | letter, vowel conflict | وَتُؤْوِيهِ | وَتُـٔۡوِيهِۦ |
| 219 | b | letter | وَرِئْيًا | وَرِءۡيٗا |
| 219 | b | vowel only in qasim | الامْتِلَا | الاِمْتِلَا |
| 220 | a | shadda, vowel only in qasim | أَوْصَدتُّ | أَوْصَدْتُ |
| 220 | b | vowel conflict | مُعَلِّلَا | مُعَلَّلَا |
| 221 | a | vowel conflict | وَبَارِئِكُمُ | وَبَارِئۡكُمُۥ |
| 221 | b | vowel conflict | ابْنَ | ابْنُ |
| 222 | a | vowel only in qasim | في | فِي |
| 222 | a | vowel only in qasim | وَفي | وَفِي |
| 222 | b | vowel only in qasim | وَفي | وَفِي |
| 223 | a | vowel only in qasim | وَفي | وَفِي |
| 223 | a | vowel only in qasim | في | فِي |
| 223 | b | letter | وَيَأْلِتْكُمُ | وَيَـٔۡلِتۡكُمُ |
| 224 | a | shadda | لِئَلاَّ | لِئَلَّا |
| 224 | a | vowel only in qasim | والنَّسِيءُ | وَٱلنَّسِيٓءُ |
| 224 | b | vowel only in qasim | في | فِي |
| 224 | b | letter | النَّسِىءِ | ٱلنَّسِيِّ |
| 226 | a | hamza form | آخِرٍ | اۨخِرٍ |
| 226 | b | vowel only in qasim | واحْذِفْهُ | وَاحْذِفْهُ |
| 227 | a | vowel only in qasim | في | فِي |
| 227 | b | vowel only in qasim | في | فِي |
| 228 | a | vowel only in qasim | في | فِي |
| 228 | a | letter, vowel only in qasim | وَشَيْئًا | وَشَيۡـًٔا |
| 228 | b | shadda, vowel only in qasim, vowel only in zubi | الَّلامِ | اللَّامِ |
| 229 | a | letter, vowel only in qasim | وَشَيْئًا | وَشَيۡـًٔا |
| 229 | b | hamza form, vowel only in qasim | آلانَ | ءَآلَـٰنَ |
| 230 | a | vowel only in qasim | لامِهِ | لاَمِهِ |
| 232 | a | vowel conflict | وَالْبَصْرِي | وَالبِصْرِي |
| 232 | b | hamza form | بَدْءًا | بَدْءاً |
| 233 | a | vowel only in qasim | في | فِي |
| 234 | a | vowel only in qasim | وَنقْلُ | وَنَقْلُ |
| 234 | b | vowel only in qasim | بِالاِسْكانِ | بِالاِسْكَانِ |
| 234 | b | vowel conflict | تَقَبَّلَا | تَقَبُّلَا |
| 236 | a | tanween | مَدِّ | مَدٍّ |
| 237 | a | vowel conflict | مَتَسَكِّنًا | مُتَسَكِّناً |
| 238 | a | vowel only in qasim | جَرى | جَرَى |
| 240 | a | tanween | مُبْدِلا | مُبْدِلاً |
| 240 | b | vowel conflict | يُفَصَّلَا | يُفَصِّلَا |
| 241 | b | vowel only in qasim | لَدى | لَدَى |
| 241 | b | letter | يَاءًا | يَاءً |
| 242 | a | vowel only in qasim | وَفي | وَفِي |
| 242 | a | vowel only in qasim | هذَا | هَذَا |
| 243 | a | tanween | وَرِءْيَا | وَرِءۡيٗا |
| 243 | a | hamza form, shadda, vowel conflict | وَإِدْغَامِهِ | وَادِّغَامِهِ |
| 244 | a | tanween, vowel only in zubi | أَنْبِئْهُمْ | أَنۢبِئۡهُمۡ |
| 244 | b | vowel only in qasim | كانَ | كَانَ |
| 245 | a | vowel only in qasim | والْوَاوِ | وَالوَاوِ |
| 245 | b | word split | وَالاَخْفَشُ بَعْدَ الْكَسْرِ والضَّمِّ أَبْدَلَا | وَالاَخْفَشُ بَعْدَ الكَسْرِ ذَا الضَّمِّ أَبْدَلاَ |
| 246 | a | vowel only in qasim | في | فِي |
| 247 | a | vowel conflict | وَمْسْتَهْزِءُونَ | وَمُسۡتَهۡزِءُونَ |
| 247 | a | vowel conflict | وَنَحْوُهُ | وَنَحْوِهِ |
| 247 | b | tanween | وَأُخْمِلًا | وَأُخْمِلَا |
| 249 | a | shadda, vowel only in qasim, vowel only in zubi | وَالَّلامِ | وَاللَّامِ |
| 250 | a | vowel conflict | وَرُمُ | وَرُمْ |
| 250 | a | vowel only in qasim | سِوى | سِوَى |
| 250 | b | tanween | مَحْفِلًا | مَحْفِلَا |
| 251 | b | vowel only in qasim | أوِ | أَوِ |
| 252 | a | shadda | التَحْرِيكُ | التَّحْرِيكُ |
| 252 | b | vowel only in qasim | بالرَّوْمِ | بِالرَّوْمِ |
| 253 | a | vowel conflict, vowel only in qasim | وَاعَتدَّ | وَاعْتَدَّ |
| 253 | b | vowel only in qasim | وَألْحَقَ | وَأَلْحَقَ |
| 255 | a | vowel only in qasim | سأَذْكُرُ | سَأَذْكُرُ |
| 255 | b | vowel only in qasim | بالاِظْهَارِ | بِالاِظْهَارِ |
| 255 | b | vowel only in qasim | وَالإدْغَامِ | وَالإِدْغَامِ |
| 255 | b | vowel only in qasim, vowel only in zubi | تُرْوىَ | تُرْوَى |
| 256 | a | vowel only in qasim | بَيْتهَا | بَيْتِهَا |
| 256 | b | shadda, vowel only in qasim | بالتَقْييدِ | بِالتَّقْيِيدِ |
| 259 | b | vowel only in qasim | تَوَصَّلا | تَوَصَّلَا |
| 260 | a | vowel only in qasim | فإِظْهَارُهَا | فَإِظْهَارُهَا |
| 260 | a | vowel only in qasim | أجْرى | أَجْرَى |
| 260 | a | vowel only in qasim | دوَامَ | دَوَامَ |
| 260 | b | vowel only in qasim | قوْلِهِ | قَوْلِهِ |
| 261 | a | vowel only in qasim | دُرِّه | دُرِّهِ |
| 261 | b | vowel conflict | وَأَدْغَمْ | وَأَدْغَمَ |
| 261 | b | tanween, vowel conflict, vowel only in qasim | مُوْلَى | مَوْلىً |
| 261 | b | vowel only in qasim | دائمٌ | دَائِمٌ |
| 261 | b | vowel conflict | وَلَا | وِلاَ |
| 262 | a | vowel only in qasim | ذيْلًا | ذَيْلًا |
| 262 | b | vowel only in qasim | جلَتْهُ | جَلَتْهُ |
| 262 | b | vowel only in qasim | صبَاهُ | صَبَاهُۥ |
| 262 | b | vowel conflict | وَمُعَلَّلَا | وَمُعَلِّلَا |
| 263 | a | hamza form | فَاظْهَرَهَا | فَأَظْهَرَهَا |
| 263 | a | vowel only in qasim | نَجمٌ | نَجْمٌ |
| 263 | a | vowel only in qasim | بدَا | بَدَا |
| 263 | b | vowel conflict | ضَرَّ | ضُرَّ |
| 263 | b | vowel only in qasim | ظمْآنَ | ظَمْآنَ |
| 264 | b | vowel only in qasim | كَلْكلَا | كَلْكَلَا |
| 265 | a | shadda | زَيَّنَا | زَيَّنَّا |
| 265 | b | vowel only in qasim | مُتَحمِّلَا | مُتَحَمِّلَا |
| 266 | b | vowel only in qasim | جمَعْنَ | جَمَعْنَ |
| 267 | a | letter, vowel conflict, vowel only in qasim | فإِظْهَارُهُ | فَإِظْهَارُهَا |
| 268 | a | vowel only in qasim | كهْفٌ | كَهْفٌ |
| 268 | b | vowel only in qasim | زَكيٌّ | زَكِيٌّ |
| 268 | b | vowel only in qasim | وَفيٌّ | وَفِيٌّ |
| 269 | a | hamza form | وَاظْهَرَ | وَأَظْهَرَ |
| 269 | b | vowel only in qasim | ذَكْوانَ | ذَكْوَانَ |
| 270 | a | vowel conflict | ظَعْنِ | ظَعْنُ |
| 270 | b | shadda | ضُرٍ | ضُرٍّ |
| 271 | b | vowel only in qasim | ثنَاهُ | ثَنَاهُۥ |
| 272 | a | shadda | خَلاَّدُهُمْ | خَلَّادُهُمْ |
| 272 | b | vowel only in qasim | الإدْغَامُ | الإِدْغَامُ |
| 273 | b | vowel only in qasim, vowel only in zubi | هَلاُ | هَلَا |
| 274 | a | vowel only in qasim | خُلفَ | خُلْفَ |
| 274 | b | vowel only in qasim | تيَّمَتْ | تَيَّمَتْ |
| 276 | a | shadda, vowel conflict | أَوْلُ | أَوَّلُ |
| 276 | a | vowel only in qasim | الْمِثْلَينِ | المِثْلَيْنِ |
| 277 | a | tanween | الْفَاءٍ | الفَاءِ |
| 278 | a | letter | بِذَلِكَ | بِذَٰلِكَ |
| 278 | b | tanween | تَثَقُّلًا | تَثَقُّلَا |
| 279 | b | letter, vowel conflict | وَأَورِثْتُمُوا | وَأُورِثۡتُمُۥ |
| 280 | b | vowel conflict, vowel only in qasim | كَوَاصِبرْ | كَوَٱصۡبِرۡ |
| 280 | b | tanween | لِحُكْمِ | لِحُكۡمٍ |
| 280 | b | vowel only in qasim | طالَ | طَالَ |
| 280 | b | vowel conflict | بُالْخُلْفُ | بِالخُلْفِ |
| 281 | a | vowel only in qasim | عنْ | عَنْ |
| 281 | a | shadda | حَقُهُ | حَقُّهُ |
| 281 | b | vowel only in qasim | وَفيهِ | وَفِيهِ |
| 282 | a | vowel only in zubi | مَنْ | مَن |
| 282 | b | vowel conflict | لَبِثْتَ | لَبِثۡتُ |
| 282 | b | vowel conflict | الْفَرْدَ | الفَرْدُ |
| 283 | a | vowel only in qasim | وَطاسِيْنَ | وَطَاسِينَ |
| 283 | a | shadda, vowel conflict | اتَخَذْتُمْ | ٱتَّخَذۡتُمُ |
| 283 | b | vowel only in qasim | عاشَرَ | عَاشَرَ |
| 286 | a | vowel only in qasim | التَّنْوينَ | التَّنْوِينَ |
| 286 | b | shadda | اللاَّمِ | اللَّامِ |
| 288 | a | vowel only in qasim | لِلكُلِّ | لِلْكُلِّ |
| 289 | a | shadda, vowel only in qasim | لِلكُلِ | لِلْكُلِّ |
| 290 | a | vowel conflict | وَأَخْفِيَا | وَأُخْفِيَا |
| 291 | b | vowel only in qasim | تأَصَّلَا | تَأَصَّلَا |
| 292 | a | vowel only in qasim | الأَسْماءِ | الأَسْمَاءِ |
| 292 | b | vowel only in qasim | مَنْهلَا | مَنْهَلَا |
| 293 | a | letter | وَاشْتَرَاهُ | وَٱشۡتَرَىٰهُۥ |
| 293 | a | letter | وَهُدَاهُمُ | وَهُدَىٰهُمُ |
| 294 | b | vowel conflict | فَعَالَى | فُعَالَى |
| 295 | a | vowel only in qasim, vowel only in zubi | الاِستِفْهَامِ | الِاسْتِفْهَامِ |
| 296 | a | vowel only in qasim | بالْيَاءِ | بِاليَاءِ |
| 297 | b | letter | كَزَكَّاهَا | كَزَكَّىٰهَا |
| 297 | b | vowel only in zubi | وَأَنْجَى | وَأَنجَىٰ |
| 298 | b | vowel conflict | سَوَاهُ | سِوَاهُۥ |
| 298 | b | vowel only in qasim | لِلكِسَائِيِّ | لِلْكِسَائِيِّ |
| 298 | b | tanween | مُيِّلًا | مُيِّلَا |
| 299 | a | letter | وَرُءْيَايَ | وَرُءۡيَٰىَ |
| 299 | a | shadda, vowel conflict, vowel only in qasim | وَالرءُيَا | وَٱلرُّءۡيَا |
| 299 | b | tanween | مُتَقَبَّلًا | مُتَقَبَّلَا |
| 300 | a | letter | وَمَحْيَاهُمُو | وَمَحۡيَاهُمُۥ |
| 300 | b | letter | هَدَانِي | هَدَىـٰنِۦ |
| 300 | b | vowel only in qasim | أمْرُكَ | أَمْرُكَ |
| 301 | a | letter, vowel only in zubi | أَنْسَانِيْ | أَنسَىٰنِيـ |
| 301 | b | letter | عَصَانِيْ | عَصَانِى |
| 301 | b | letter | وَأَوْصَانِيْ | وَأَوۡصَٰنِى |
| 302 | a | letter, vowel conflict | آتَانِيَ | ءَاتَىٰنِۦَ |
| 303 | a | vowel conflict | وَحَرَفُ | وَحَرْفُ |
| 303 | a | letter | تَلاَهَا | تَلَىٰهَا |
| 303 | a | letter | طَحَاهَا | طَحَىٰهَا |
| 303 | b | letter | دَحَاهَا | دَحَىٰهَا |
| 304 | a | letter | ضُحَاهَا | ضُحَىٰهَا |
| 304 | a | letter, vowel only in qasim | وَالرِّبا | وَٱلرِّبَوٰاْ |
| 305 | a | letter | وَرُؤيَاكَ | وَرُءۡيَاكَ |
| 305 | a | letter | مَثْوَايَ | مَثۡوَاىَ |
| 305 | b | letter | وَمَحْيَايَ | وَمَحۡيَاىَ |
| 305 | b | letter | مِشْكَاةٍ | مِشۡكَوٰةٖ |
| 305 | b | letter | هُدَايَ | هُدَاىَ |
| 305 | b | vowel only in qasim | انجَلَا | انْجَلَى |
| 306 | a | vowel only in qasim | وَممَّا | وَمِمَّا |
| 306 | b | letter, vowel conflict, vowel only in qasim | بطِه | بِطَاهَا |
| 307 | b | vowel conflict | اقْرَأَ | اقْرَأْ |
| 308 | a | word split | وَمِنْ تَحْتِهَا ثُمَّ الْقِيَامَةِ فِي الْـ | وَمِنْ تَحْتِهَا ثُمَّ القِيَامَةِ ثُمَّ فِي الـ |
| 308 | b | vowel only in qasim | يا | يَا |
| 309 | a | vowel only in qasim | الاِسْراءِ | الاِسْرَاءِ |
| 309 | b | vowel conflict | سُوًى | سِوٗى |
| 309 | b | vowel only in qasim, vowel only in zubi | تَسَبَّلاِ | تَسَبَّلَا |
| 310 | a | hamza form, vowel only in qasim | تَراءَى | تَرَٰءَا |
| 310 | a | vowel only in qasim | فازَ | فَازَ |
| 310 | b | vowel only in qasim | وَأَعْمى | وَأَعۡمَىٰ |
| 310 | b | vowel only in qasim | الاِسْرا | الاِسْرَا |
| 311 | b | letter, vowel conflict | بِمَجْرَاهَا | بِمُجۡرَىٰهَا |
| 311 | b | vowel only in qasim | وَفي | وَفِي |
| 312 | a | letter | نَأَى | نَـَٔا |
| 312 | b | vowel only in qasim | في | فِي |
| 313 | a | letter | إِنَاهُ | إِنَىٰهُۥ |
| 314 | a | vowel only in qasim | وَفي | وَفِي |
| 315 | a | vowel only in qasim | وَلكِنْ | وَلَكِنْ |
| 316 | b | vowel conflict, vowel only in qasim | لِلبَصْرِيْ | لِلْبِصْرِي |
| 317 | a | word split | وَيَا وَيْلَتَى أَنَّى وَيَا حَسْرَتَى طَوَوْا | وَيَـٰوَيۡلَتَىٰ أَنَّىٰ وَيَـٰحَسۡرَتَىٰ طَوَوْا |
| 317 | b | word split | وعَنْ غَيْرِهِ قِسْهَا وَيَا أَسَفَى الْعُلَا | وَعَنْ غَيْرِهِ قِسْهَا وَيَٰأَسَفَىٰ العُلَى |
| 319 | a | hamza form | جَاءَ | جَآءَ |
| 319 | a | hamza form | شَاءَ | شَآءَ |
| 319 | b | hamza form | وَجَاءَ | وَجَآءَ |
| 319 | b | hamza form | شَاءَ | شَآءَ |
| 320 | b | vowel only in zubi | بَلْ | بَل |
| 320 | b | shadda | رَانَ | رَّانَ |
| 323 | a | vowel only in qasim | الْكافِرِينَ | ٱلۡكَٰفِرِينَ |
| 325 | a | vowel only in qasim | وَهذَانِ | وَهَذَانِ |
| 325 | a | vowel conflict | وَمَعَهُ | وَمَعْهُ |
| 325 | a | vowel only in qasim | في | فِي |
| 325 | b | vowel only in qasim | وَفي | وَفِي |
| 326 | b | hamza form, vowel only in qasim | كَالأَبْرَارِ | كَٱلَابۡرَارِ |
| 326 | b | vowel only in qasim | جادَلَ | جَادَلَ |
| 327 | a | letter, vowel only in zubi | أَنْصَارِي | أَنصَارِى |
| 327 | b | letter | وَالْبَارِي | وَٱلۡبَارِى |
| 327 | b | vowel conflict | وَبَارِئِكُمْ | وَبَارِئۡكُمُۥ |
| 328 | a | letter | وَيُسَارِعُـ | وَيُسَٰرِعُو |
| 328 | b | letter | ونَ | نَ |
| 328 | b | letter | الْجَوَارِي | ٱلۡجَوَارِۦ |
| 329 | a | letter | يُوَارِي | يُوَٰرِى |
| 329 | a | letter | أُوَارِي | أُوَٰرِى |
| 329 | b | vowel conflict | قُوَّلَا | قُوِّلاَ |
| 330 | b | letter | أَتَاكَ | أَتَىٰكَ |
| 331 | a | letter, vowel conflict | الْكَافِرُونَ | الكَافِرِينَ |
| 331 | b | vowel only in qasim | في | فِي |
| 331 | b | vowel only in qasim | في | فِي |
| 332 | b | vowel only in qasim | وَفي | وَفِي |
| 333 | a | vowel only in qasim, vowel only in zubi | لاِبْنِ | لِابْنِ |
| 334 | b | vowel only in qasim | لِلكَسْرِ | لِلْكَسْرِ |
| 335 | b | vowel only in qasim | في | فِي |
| 335 | b | vowel conflict | يُجُتَلَا | يُجْتَلَى |
| 336 | a | vowel conflict | ابْنَ | ٱبۡنِ |
| 336 | a | vowel only in qasim | والْقُرَى | وَٱلۡقُرَى |
| 336 | b | letter | لَتِي | ـلَتِى |
| 337 | b | vowel only in qasim | في | فِي |
| 338 | a | tanween | مُسَمَّى | مُسَمًّى |
| 338 | a | vowel conflict | مَعْ | مَعَ |
| 338 | b | tanween | غُزَّى | غُزّٗى |
| 340 | a | shadda | حَقٌ | حَقٌّ |
| 342 | b | vowel only in qasim | سِوى | سِوَى |
| 344 | b | vowel only in qasim | سِوى | سِوَى |
| 345 | a | vowel only in qasim | في | فِي |
| 345 | b | vowel only in qasim | يُرى | يُرَى |
| 346 | b | vowel only in qasim | لَدى | لَدَى |
| 347 | a | vowel only in qasim | وَفي | وَفِي |
| 348 | a | vowel only in qasim | وَفي | وَفِي |
| 349 | a | vowel only in zubi | تَرْقِيِقِهاَ | تَرْقِيقِهَا |
| 349 | b | vowel only in qasim | المَلا | المَلَا |
| 350 | a | vowel conflict | الاِسْتِعْلاَءُ | الاِسْتِعْلَاءِ |
| 351 | b | vowel only in qasim | جَرى | جَرَى |
| 352 | b | vowel only in qasim | فَهذاَ | فَهَذَا |
| 354 | a | vowel only in qasim | الْقِرَاءة | القِرَاءَةِ |
| 355 | b | vowel only in qasim | في | فِي |
| 356 | a | vowel only in qasim | وَلكِنَّهَا | وَلَكِنَّهَا |
| 356 | a | vowel only in qasim | في | فِي |
| 357 | a | vowel only in qasim | الْيَاء | اليَاءِ |
| 358 | a | vowel only in qasim | هذَا | هَذَا |
| 359 | b | vowel conflict | تَنَزُّلَا | تَنَزَّلاَ |
| 360 | a | vowel only in qasim | كَصَلاتِهِمْ | كَصَلَاتِهِمۡ |
| 360 | b | vowel only in qasim | ثمَّ | ثُمَّ |
| 361 | a | vowel only in qasim | وَفي | وَفِي |
| 362 | a | vowel only in qasim | كَهذِهِ | كَهَذِهِ |
| 363 | a | vowel only in qasim | اللهِ | ٱللَّهِ |
| 367 | a | vowel only in qasim | يَرَاهُما | يَرَاهُمَا |
| 370 | a | vowel only in qasim | في | فِي |
| 371 | a | vowel only in qasim | في | فِي |
| 371 | b | vowel only in qasim | في | فِي |
| 372 | b | letter, tanween | وَإِعْرَابًا | وَإِعْرَابٍ |
| 373 | a | vowel only in qasim | وَفي | وَفِي |
| 374 | a | vowel only in qasim | وَفي | وَفِي |
| 374 | a | vowel only in qasim | لِلإِضْمَارِ | لِلْإِضْمَارِ |
| 376 | b | vowel conflict | بِاتَّبَاعِ | بِاتِّبَاعِ |
| 377 | a | vowel only in qasim, vowel only in zubi | وَلاِبْنِ | وَلِابْنِ |
| 377 | a | tanween | كَثِيٍر | كَثِيرٍ |
| 378 | b | tanween | حَقَّا | حَقّاً |
| 378 | b | vowel conflict | وَمُعَوِّلَا | وَمُعَوَّلَا |
| 379 | a | vowel only in qasim | وَفي | وَفِي |
| 379 | a | shadda | اللاَّتَ | ٱللَّٰتَ |
| 379 | b | vowel only in qasim, vowel only in zubi | هَادِيِه | هَادِيهِ |
| 380 | a | word split | وَقِفْ يَا أَبَهْ كُفْؤًا دَنَا وَكَأَيِّنِ الْـ | وَقِفْ يَـٰأَبَهۡ كُفْئاً دَنَا وَكَأَيِّنِ الـ |
| 381 | b | word split | وَسَالَ عَلَى مَا حَجَّ وَالْخُلْفُ رُتِّلَا | وَ سَالَ عَلَى مَا حَجَّ وَالخُلْفُ رُتِّلَا |
| 382 | a | word split | وَيَا أَيُّهَا فَوْقَ الدُّخَانِ وَأَيُّهَا | وَيَٰأَيُّهَ فَوْقَ الدُّخَانِ وَأَيُّهَ |
| 382 | b | letter, vowel conflict, vowel only in qasim | وَالرِّحْمنِ | وَالرَّحْمَـٰنِ |
| 383 | a | vowel only in qasim | وَفي | وَفِي |
| 383 | b | vowel conflict | وَالْمَرْسُومِ | وَالمَرْسُومُ |
| 385 | a | vowel only in qasim | بأَيًّا | بِأَيّٗا |
| 385 | a | shadda | مَا | مَّا |
| 385 | b | word split | بِمَا وَبِوَادِي النَمْلِ بِالْيَا سَنًا تَلَا | بِمَا وَبِ وَادِۦ ٱلنَّمۡلِ بِاليَا سَناً تَلَا |
| 386 | a | word split | وَفِي مَهْ وَمِمَّهْ قِفْ وَعَمَّهْ لِمَهْ بِمَهْ | وَفِيمَهۡ وَمِمَّهۡ قِفْ وَعَمَّهۡ لِمَهۡ بِمَهۡ |
| 387 | b | vowel only in zubi | اْلأُصُولِ | الأُصُولِ |
| 388 | a | vowel only in qasim | وَلكِنَّهَا | وَلَكِنَّهَا |
| 388 | a | vowel only in qasim | كالْهَاءِ | كَالهَاءِ |
| 388 | b | vowel only in qasim | يُرى | يُرَى |
| 389 | a | vowel only in qasim | وَفي | وَفِي |
| 389 | a | letter | مِائَتَيْ | مِئَتَيْ |
| 390 | a | vowel conflict | وَتِسَعُهَا | وَتِسْعُهَا |
| 390 | b | vowel only in qasim | سَما | سَمَا |
| 390 | b | vowel conflict | إَلاَّ | إِلاَّ |
| 391 | a | letter | فَأَرْنِي | فَأَرۡنِى |
| 391 | a | letter | وَتَفْتِنِّي | وَتَفۡتِنِّى |
| 391 | a | letter | اتَّبِعْنِي | ٱتَّبِعۡنِى |
| 391 | b | shadda | لِكُلٍ | لِكُلٍّ |
| 391 | b | letter | وَتَرْحَمْنِي | وَتَرۡحَمۡنِى |
| 392 | a | letter | ذَرُونِيَ | ذَرُونِىَ |
| 392 | a | letter | وَادْعُونِيْ | وَٱدۡعُونِى |
| 392 | a | letter | اذْكُرُونِيَ | ٱذۡكُرُونِىَ |
| 392 | b | letter | وَأَوْزِعْنِي | وَأَوۡزِعۡنِى |
| 393 | a | letter | لِيَبْلُوَنِي | لِيَبۡلُوَنِى |
| 393 | a | letter | سَبِيلِي | سَبِيلِى |
| 393 | b | vowel only in qasim | وَلِلْبصْرِي | وَلِلْبِصْرِي |
| 394 | a | letter, shadda, vowel only in qasim | إِنيِّ | إِنِّى |
| 394 | a | letter | وَلِيْ | وَلِى |
| 394 | a | vowel only in qasim | بِها | بِهَا |
| 394 | b | letter, vowel conflict | وَضَيْفِْي | وَضَيۡفِى |
| 394 | b | letter | لِيْ | لِى |
| 394 | b | letter | وَدُونِيْ | وَدُونِى |
| 395 | a | vowel only in qasim | في | فِي |
| 395 | a | vowel only in zubi | اجْعَلْ | ٱجۡعَل |
| 395 | a | letter, shadda | لِي | لِّى |
| 395 | a | hamza form | إِذْ | اِذْ |
| 395 | b | letter, vowel only in qasim | وَلكِنِّي | وَلَٰكِنِّى |
| 396 | a | letter | وَتَحْتِي | وَتَحۡتِى |
| 396 | a | vowel only in qasim | في | فِي |
| 396 | a | letter | إِنِّي | إِنِّى |
| 396 | a | letter | أَرَاكُمُو | أَرَىٰكُمُۥ |
| 396 | b | vowel only in qasim | في | فِي |
| 396 | b | vowel only in zubi | هَادِيِهِ | هَادِيهِ |
| 397 | a | letter | وَيَحْزُنُنِيْ | وَيَحۡزُنُنِى |
| 397 | a | letter | تَعِدَانِنِي | تَعِدَانِنِى |
| 397 | b | letter | حَشَرْتَنِيَ | حَشَرۡتَنِىَ |
| 397 | b | hamza form, vowel only in qasim | أَعْمى | اعۡمَىٰ |
| 397 | b | letter | تَأْمُرُونِيَ | تَأۡمُرُونِىَ |
| 398 | a | letter | أَرَهْطِي | أَرَهۡطِى |
| 398 | a | letter | وَمَالِي | وَمَالِى |
| 398 | b | letter | لَعَلِّي | لَعَلِّى |
| 398 | b | letter | كُفْؤًا | كُفْئاً |
| 398 | b | letter | مَعِي | مَعِى |
| 398 | b | vowel conflict | نَفْرُ | نَفَرُ |
| 399 | a | letter, vowel only in zubi | عِنْدِيَ | عِندِىَ |
| 400 | a | vowel only in qasim | وثِنْتَانِ | وَثِنْتَانِ |
| 400 | b | tanween, vowel only in qasim | بِفتْحٍ | بِفَتْحِ |
| 401 | a | letter | بَنَاتِيْ | بَنَاتِى |
| 401 | a | letter, vowel only in zubi | وَأَنْصَارِيْ | وَأَنصَارِى |
| 401 | a | letter | عِبَادِيْ | عِبَادِى |
| 401 | a | letter | وَلَعْنَتِيْ | وَلَعۡنَتِى |
| 401 | b | vowel only in zubi | إِنْ | إِن |
| 401 | b | hamza form | شَاءَ | شَآءَ |
| 402 | a | letter | إِخْوَتِيْ | إِخۡوَتِى |
| 402 | a | letter | يَدِيْ | يَدِى |
| 402 | a | tanween | حِمَى | حِمىً |
| 402 | b | letter | رُسُلِي | رُسُلِى |
| 403 | a | letter | وَأُمِّيْ | وَأُمِّى |
| 403 | a | letter | وَأَجْرِيْ | وَأَجۡرِى |
| 403 | a | vowel conflict | دِينُ | دِينَ |
| 403 | b | letter | دُعَاءِيْ | دُعَآءِى |
| 403 | b | letter, vowel only in qasim | وَآباءِيْ | وَءَابَآءِى |
| 404 | a | letter | وَحُزْنِيْ | وَحُزۡنِى |
| 404 | a | letter | وَتَوْفِيقِيْ | وَتَوۡفِيقِى |
| 404 | b | letter | يُصَدِّقْنِيَ | يُصَدِّقۡنِىَ |
| 404 | b | letter, vowel only in zubi | أَنْظِرْنِيْ | انظِرۡنِى |
| 404 | b | letter | وَأَخَّرْتَنِي | وَأَخَّرۡتَنِى |
| 405 | a | letter | وَذُرِّيَّتِي | وَذُرِّيَّتِى |
| 405 | a | letter | يَدْعُونَنِيْ | يَدۡعُونَنِى |
| 406 | b | letter | بِعَهْدِي | بِعَهۡدِى |
| 406 | b | letter | وَآتُونِي | وَءَاتُونِى |
| 406 | b | vowel only in qasim | لتَفْتَحَ | لِتَفْتَحَ |
| 407 | a | shadda | اللاَّمِ | اللَّامِ |
| 407 | a | vowel conflict | أَرْبَعُ | أَرْبَعَ |
| 407 | a | tanween | عَشْرَةٍ | عَشْرَةً |
| 407 | b | letter | وَعَهْدِيَ | وَعَهۡدِىَ |
| 408 | a | vowel only in zubi | وَقُلْ | وَقُل |
| 408 | a | letter, shadda | لِعِبَادِيْ | لِّعِبَادِى |
| 408 | b | letter | آيَاتِيْ | ءَايَـٰتِى |
| 409 | a | letter | عِبَادِي | عِبَادِى |
| 409 | a | letter | وَعَهْدِيْ | وَعَهۡدِى |
| 409 | a | letter | أَرَادَنِيْ | أَرَادَنِى |
| 409 | b | letter | وَرَبِّي | وَرَبِّى |
| 409 | b | letter | الَّذِي | ٱلَّذِى |
| 409 | b | letter | آتَانِ | ءَاتَىٰنِ |
| 409 | b | letter, vowel only in qasim | آياتِيَ | ءَايَٰتِىَ |
| 410 | a | letter | وَأَهْلَكَنِيْ | وَأَهۡلَكَنِى |
| 410 | a | letter | مَسَّنِي | مَسَّنِى |
| 410 | b | vowel conflict | الأَنَبِيَا | الأَنْبِيَا |
| 410 | b | letter | رَبِّيْ | رَبِّى |
| 411 | b | letter | أَخِيْ | أَخِى |
| 411 | b | letter | إِنِّيْ | إِنِّى |
| 411 | b | vowel conflict | حَقَّهُ | حَقُّهُ |
| 411 | b | letter | لَيْتَنِيْ | لَيۡتَنِى |
| 412 | a | letter | وَنَفْسِيْ | وَنَفۡسِى |
| 412 | a | letter | ذِكْرِيْ | ذِكۡرِى |
| 412 | a | letter | قَوْمِيَ | قَوۡمِىَ |
| 412 | b | letter | بَعْدِيْ | بَعۡدِى |
| 413 | a | vowel only in qasim, vowel only in zubi | ثَلاَثيِنَ | ثَلَاثِينَ |
| 413 | b | letter, vowel only in qasim | وَمَحْيايَ | وَمَحۡيَاىَ |
| 413 | b | hamza form | جِيْ | جِئْ |
| 413 | b | vowel only in qasim | بالْخُلْفِ | بِالخُلْفِ |
| 414 | a | letter | وَجْهِيْ | وَجۡهِى |
| 414 | a | letter | وَبَيْتِيْ | وَبَيۡتِى |
| 414 | a | vowel conflict | بِنُوحِ | بِنُوحَ |
| 415 | a | letter | شُرَكَاءِيْ | شُرَكَآءِى |
| 415 | a | vowel only in zubi | مِنْ | مِن |
| 415 | a | letter, vowel only in qasim | وَرَاءِيْ | وَرَآءِىَ |
| 415 | b | letter | وَلِيْ | وَلِى |
| 416 | a | letter | مَمَاتِيْ | مَمَاتِى |
| 416 | a | letter | أَرْضِيْ | أَرۡضِى |
| 416 | a | letter | صِرَاطِيْ | صِرَٰطِى |
| 416 | b | letter | مَالِي | مَالِى |
| 417 | a | letter | وَلِيْ | وَلِى |
| 417 | a | letter | لِيْ | لِى |
| 417 | a | letter | مَعِيْ | مَعِى |
| 418 | a | word split | وَمَعْ تُوْمِنُوا لِي يُؤْمِنُوا بِيْ جَاوَيَا | وَمَعْ تُؤۡمِنُواْ لِى يُؤۡمِنُواْ بِىَ جَا وَيَٰـ |
| 418 | b | letter | عِبَادِيَ | ـعِبَادِىَ |
| 419 | a | letter | وَلِيْ | وَلِى |
| 419 | b | letter | وَمَالِيَ | وَمَالِىَ |
| 419 | b | vowel conflict | فَتَكْمُلَا | فَتُكْمِلَا |
| 420 | a | tanween | زَوَائِدَا | زَوَائِداً |
| 420 | b | vowel only in qasim | لأَنْ | لِأَنْ |
| 421 | a | vowel conflict | وَتَثْبُتُ | وَتُثْبَتُ |
| 421 | a | vowel only in qasim | في | فِي |
| 421 | a | vowel conflict | الْحَالَيْنَ | الحَالَيْنِ |
| 421 | a | tanween | دُرَّا | دُرّاً |
| 421 | a | tanween | لَوَامِعاَ | لَوَامِعاً |
| 422 | b | shadda | سِتُونَ | سِتُّونَ |
| 423 | a | letter | فَيَسْرِي | فَيَسۡرِۦ |
| 423 | a | vowel only in qasim | إِلى | إِلَى |
| 423 | b | vowel only in zubi | أَنْ | أَن |
| 423 | b | letter | تُعَلِّمَنِي | تُعَلِّمَنِۦ |
| 424 | a | letter | وَأَخَّرْتَنِي | وَأَخَّرۡتَنِ |
| 424 | a | vowel only in qasim | سَما | سَمَا |
| 424 | b | vowel only in qasim | وَفي | وَفِي |
| 424 | b | letter | نَبْغِيْ | نَبۡغِۦ |
| 425 | a | letter | وَدُعَاءِيْ | وَدُعَآءِۦ |
| 425 | b | vowel only in qasim | وَفي | وَفِي |
| 425 | b | letter | اتَّبِعُونِيْ | ٱتَّبِعُونِۦ |
| 426 | a | vowel only in zubi | وَإِنْ | وَإِن |
| 426 | a | letter | تَرَنِيْ | تَرَنِۦ |
| 426 | a | letter | تُمِدُّونَنِيْ | تُمِدُّونَنِۦ |
| 427 | a | vowel only in qasim | وَفي | وَفِي |
| 427 | a | letter | بِالْوَادِيْ | بِٱلۡوَادِۦ |
| 427 | b | vowel only in qasim | وَفي | وَفِي |
| 428 | a | letter | وَأَكْرَمَنِيْ | وَأَكۡرَمَنِۦ |
| 429 | a | vowel only in qasim | وَفي | وَفِي |
| 429 | a | letter, vowel only in qasim | آتانِيْ | ءَاتَىٰنِۦ |
| 429 | a | vowel only in zubi | أُوِلِيْ | أُولِي |
| 429 | b | vowel only in qasim | وَخِلافُ | وَخِلَافُ |
| 430 | b | vowel only in qasim | وَفي | وَفِي |
| 431 | a | vowel only in qasim | وَفي | وَفِي |
| 431 | b | vowel conflict | الأَعْرَافَ | الأَعْرَافِ |
| 432 | a | letter | وَتُؤْتُونِيْ | وَتُؤۡتُونِۦ |
| 432 | b | vowel only in qasim | وَفي | وَفِي |
| 432 | b | letter, vowel conflict | تَسْأَلْنِيْ | تَسۡـَٔلۡنِۦ |
| 433 | b | word split | هَدَانِ اتَّقُونِ يَا أُولِي اخْشَوْنِ مَعْ وَلَا | هَدَىٰنِ ٱتَّقُونِۦ يَٰأُوْلِى ٱخۡشَوۡنِ مَعْ وَلَا |
| 434 | a | vowel only in zubi | وَمَنْ | وَمَن |
| 434 | a | letter | يَتَّقِيْ | يَتَّقِۦ |
| 434 | b | vowel conflict | كَالصَّحِيحَ | كَالصَّحِيحِ |
| 435 | a | letter | المُتَعَالِي | ٱلۡمُتَعَالِۦ |
| 435 | a | tanween | وَالتَّلًاقِ | وَٱلتَّلَاقِ |
| 435 | b | vowel conflict | جُهِّلَا | جُهَّلَا |
| 436 | a | letter | دَعَانِي | دَعَانِۦ |
| 436 | a | tanween | جَنا | جَنىً |
| 437 | a | letter | نَذِيرِيْ | نَذِيرِۦ |
| 437 | b | letter | نُذُرِي | نُذُرِۦ |
| 438 | a | letter | وَعِيدِيْ | وَعِيدِۦ |
| 438 | a | vowel only in zubi | يُنْقِذُونِ | يُنقِذُونِ |
| 438 | b | letter | نَكِيرِيْ | نَكِيرِۦ |
| 439 | a | letter | عِبَادِي | عِبَادِ |
| 439 | a | tanween | يَدا | يَداً |
| 439 | b | letter | وَوَاتَّبِعُونِي | وَوَٱتَّبِعُونِۦ |
| 439 | b | vowel only in qasim | في | فِي |
| 439 | b | vowel conflict | الْعَلَا | العُلَى |
| 440 | a | vowel only in qasim | وَفي | وَفِي |
| 440 | a | letter, vowel conflict | تَسْأَلْنِيْ | تَسۡـَٔلۡنِى |
| 441 | a | vowel only in qasim | وَفي | وَفِي |
| 441 | a | letter | نَرْتَعِيْ | نَرۡتَعِۦ |
| 441 | b | hamza form | بِالإِثْبَاتِ | بِالاِثْبَاتِ |
| 441 | b | letter | يَهْدِيَنِي | يَهۡدِيَنِى |
| 442 | a | vowel only in qasim | فَهذِي | فَهَذِي |
| 442 | b | vowel only in qasim | اللهِ | اللَّهِ |
| 443 | a | vowel only in qasim | لأَرْجُوهُ | لَأَرْجُوهُۥ |
| 444 | a | vowel conflict, vowel only in qasim | سَأَمِضي | سَأَمْضِي |
| 444 | a | shadda, vowel only in qasim | وَبِاللهِ | وَبِاللَّهِ |

### 2b. Quranic (Uthmani) spelling, not counted as real

| Verse | Half | Zu'bi | Al-Qasim |
|---|---|---|---|
| 7 | b | حَالَيْهِ | حَالَيْهِۦ |
| 9 | b | بِتَحَرِّيهِ | بِتَحَرِّيهِۦ |
| 12 | b | يَلْقَاهُ | يَلْقَاهُۥ |
| 13 | a | يَهْنِيهِ | يَهْنِيهِۦ |
| 38 | a | عَنْهُ | عَنْهُۥ |
| 40 | a | عَنْهُ | عَنْهُۥ |
| 62 | b | فَغَيْرُهُمُ | فَغَيْرُهُمُۥ |
| 75 | b | عَلَيْهِ | عَلَيْهِۦ |
| 85 | a | عَلَيْهِ | عَلَيْهِۦ |
| 103 | b | وَبَعْضُهُمُ | وَبَعْضُهُمُۥ |
| 104 | b | فَافْهَمْهُ | فَافْهَمْهُۥ |
| 108 | a | وَمَالِكِ | وَمَٰلِكِ |
| 108 | a | الدِّينِ | ٱلدِّينِ |
| 115 | a | الأَسْبَابُ | ٱلۡأَسۡبَابُ |
| 115 | a | الْـ | ٱلۡـ |
| 117 | a | عَنْهُ | عَنْهُۥ |
| 119 | a | فِيهِ | فِيهِۦ |
| 119 | a | هُدًى | هُدٗى |
| 119 | b | قُلُوبِهِمُ | قُلُوبِهِمُۥ |
| 119 | b | وَالْعَفْوَ | وَٱلۡعَفۡوَ |
| 121 | a | تُرَابًا | تُرَٰبًا |
| 121 | a | وَاسِعٌ | وَٰسِعٌ |
| 121 | b | عَلِيمٌ | عَلِيمٞ |
| 121 | b | مِيقاَتُ | مِيقَٰتُ |
| 126 | a | آلَ | ءَالَ |
| 127 | b | ثَانِيهِ | ثَانِيهِۦ |
| 130 | a | يَوْمٌ | يَوۡمٞ |
| 134 | b | وَمِيثَاقَكُمْ | وَمِيثَٰقَكُمۡ |
| 139 | a | النَّارِ | ٱلنَّارِ |
| 140 | a | شَيْءٍ | شَيۡءٖ |
| 142 | a | سَبِيلًا | سَبِيلٗا |
| 142 | a | الْعَرْشِ | ٱلۡعَرۡشِ |
| 143 | a | النُّفُوسِ | ٱلنُّفُوسِ |
| 143 | b | شَيْبًا | شَيۡبٗا |
| 147 | b | آتِ | ءَاتِ |
| 147 | b | الْ | ٱلۡ |
| 154 | b | كَالأَبْرَارِ | كَٱلۡأَبۡرَارِ |
| 154 | b | وَالنَّارِ | وَٱلنَّارِ |
| 157 | a | الْعَفْوَ | ٱلۡعَفۡوَ |
| 157 | b | المَهْدِ | ٱلۡمَهۡدِ |
| 157 | b | الخُلْدِ | ٱلۡخُلۡدِ |
| 157 | b | وَالْعِلْمِ | وَٱلۡعِلۡمِ |
| 159 | b | وَفِيهِ | وَفِيهِۦ |
| 160 | a | وَنُصْلِهِ | وَنُصۡلِهِۦ |
| 165 | a | خَيْرًا | خَيۡرٗا |
| 165 | b | وَشَرًّا | وَشَرّٗا |
| 170 | a | سُوءٍ | سُوٓءٖ |
| 170 | b | أَمْرُهُ | أَمۡرُهُۥ |
| 170 | b | إِلَى | إِلَىٰ |
| 172 | a | كَآمَنَ | كَءَامَنَ |
| 188 | b | يُؤْتَى | يُؤۡتَىٰ |
| 203 | a | السَّماَ | ٱلسَّمَا |
| 209 | b | تَفِيءَ | تَفِيٓءَ |
| 209 | b | إِلَى | إِلَىٰ |
| 209 | b | أُمَّةً | أُمَّةٗ |
| 210 | a | ائْتِنَا | ٱئۡتِنَا |
| 218 | b | وَاقْرَأْ | وَٱقۡرَأۡ |
| 220 | a | وَمُؤْصَدَةٌ | وَمُؤۡصَدَةٞ |
| 222 | a | بِئْرٍ | بِئۡرٖ |
| 222 | b | الذِّئْبِ | ٱلذِّئۡبِ |
| 225 | b | كَآدَمَ | كَءَادَمَ |
| 228 | a | شَيْءٍ | شَيۡءٖ |
| 229 | a | وَشَيْءٍ | وَشَيۡءٖ |
| 230 | a | الأُوْلَى | ٱلۡأُولَىٰ |
| 231 | b | وَبَدْؤُهُمُ | وَبَدْؤُهُمُۥ |
| 234 | a | وَكِتَابِيَهْ | وَكِتَٰبِيَهۡ |
| 236 | a | عَنْهُ | عَنْهُۥ |
| 244 | a | وَنَبِّئْهُمُ | وَنَبِّئۡهُمُۥ |
| 248 | b | عَلَيْهِ | عَلَيْهِۦ |
| 249 | a | هَا | هَـٰ |
| 249 | a | وَيَا | وَيَـٰ |
| 254 | b | سَنَاهُ | سَنَاهُۥ |
| 269 | a | رَاوِيهِ | رَاوِيهِۦ |
| 272 | b | تَرَى | تَرَىٰ |
| 275 | a | تُرِيْهِ | تُرِيهِۦ |
| 284 | a | ارْكَبْ | ٱرۡكَبۡ |
| 293 | a | هَدَى | هَدَىٰ |
| 293 | a | وَالْهَوَى | وَٱلۡهَوَىٰ |
| 295 | a | أَنَّى | أَنَّىٰ |
| 295 | a | مَتَى | مَتَىٰ |
| 295 | b | وَعَسَى | وَعَسَىٰ |
| 295 | b | بَلَى | بَلَىٰ |
| 296 | a | لَدَى | لَدَىٰ |
| 296 | b | زَكَى | زَكَىٰ |
| 296 | b | وَإِلَى | وَإِلَىٰ |
| 296 | b | حَتَّى | حَتَّىٰ |
| 296 | b | عَلَى | عَلَىٰ |
| 297 | b | ابْتَلَى | ٱبۡتَلَىٰ |
| 299 | b | وَخَطَايَا | وَخَطَٰيَٰ |
| 303 | a | سَجَى | سَجَىٰ |
| 304 | a | وَالضُّحَى | وَٱلضُّحَىٰ |
| 304 | a | الْـ | ٱلۡـ |
| 304 | b | قُوَى | ـقُوَىٰ |
| 306 | a | أَمَالاَهُ | أَمَالاَهُۥ |
| 309 | a | رَمَى | رَمَىٰ |
| 309 | a | أَعْمَى | أَعۡمَىٰ |
| 314 | a | أَرَا | أَرَىٰـ |
| 322 | a | كَأَبْصَارِهِمْ | كَأَبۡصَٰرِهِمۡ |
| 322 | a | وَالدَّارِ | وَٱلدَّارِ |
| 322 | a | الْحِمَارِ | ٱلۡحِمَارِ |
| 322 | b | وَالْكُفَّارِ | وَٱلۡكُفَّارِ |
| 323 | a | كَافِرِينَ | كَـٰفِرِينَ |
| 323 | b | وَهَارٍ | وَهَارٖ |
| 324 | a | وَالْجَارِ | وَٱلۡجَارِ |
| 325 | a | عَنْهُ | عَنْهُۥ |
| 325 | a | الْـ | ٱلۡـ |
| 325 | b | الْقَهَّارِ | ٱلۡقَهَّارِ |
| 328 | a | وَآذَانِهِمْ | وَءَاذَانِهِمۡ |
| 328 | a | طُغْيَانِهِمْ | طُغۡيَٰنِهِمۡ |
| 328 | b | آذَانِنَا | ءَاذَانِنَا |
| 329 | b | ضِعَافًا | ضِعَٰفًا |
| 329 | b | آتِيكَ | ءَاتِيكَ |
| 330 | a | ضَمَمْنَاهُ | ضَمَمْنَاهُۥ |
| 330 | b | وَآنِيَةٍ | وَءَانِيَةٖ |
| 331 | a | عَابِدُونَ | عَٰبِدُونَ |
| 331 | a | وَعَابِدٌ | وَعَابِدٞ |
| 331 | b | وَخُلْفُهُمُ | وَخُلْفُهُمُۥ |
| 331 | b | النَّاسِ | ٱلنَّاسِ |
| 332 | a | وَالمِحْرَابِ | وَٱلۡمِحۡرَابِ |
| 332 | a | إِكْرَاهِهِنَّ | إِكۡرَٰهِهِنَّ |
| 332 | a | وَالْـ | وَٱلۡـ |
| 332 | b | الإِكْرَامِ | ٱلۡإِكۡرَامِ |
| 332 | b | عِمْرَانَ | عِمۡرَٰنَ |
| 333 | b | الْمِحْرَابِ | ٱلۡمِحۡرَابِ |
| 336 | a | الْهُدَى | ٱلۡهُدَىٰ |
| 336 | a | الْ | ٱلۡـ |
| 336 | b | الدَّارِ | ٱلدَّارِ |
| 338 | a | وَمَوْلًى | وَمَوۡلٗى |
| 338 | b | وَتَتْرًا | وَتَتۡرٗا |
| 346 | a | ذِكْرًا | ذِكۡرٗا |
| 346 | a | وَسِتْرًا | وَسِتۡرٗا |
| 347 | a | شَرَرٍ | شَرَرٖ |
| 347 | a | عَنْهُ | عَنْهُۥ |
| 351 | b | بِفِرْقٍ | بِفِرۡقٖ |
| 364 | a | فَخَّمُوهُ | فَخَّمُوهُۥ |
| 377 | b | فِيهِ | فِيهِۦ |
| 385 | a | وَأَيًّا | وَأَيّٗا |
| 393 | a | مَعْهُ | مَعْهُۥ |
| 404 | b | إِلَى | إِلَىٰ |
| 414 | b | وَسِوَاهُ | وَسِوَاهُۥ |
| 417 | a | نَعْجَةٌ | نَعۡجَةٞ |
| 423 | a | الدَّاعِ | ٱلدَّاعِ |
| 423 | a | الْجَوَارِ | ٱلۡجَوَارِ |
| 423 | a | المُنَادِ | ٱلۡمُنَادِ |
| 426 | b | الدَّاعِ | ٱلدَّاعِ |
| 428 | a | مَعْهُ | مَعْهُۥ |
| 428 | a | أَهَانَنِ | أَهَٰنَنِ |
| 430 | a | كَالْجَوَابِ | كَٱلۡجَوَابِ |
| 430 | a | الْبَادِ | ٱلۡبَادِ |
| 430 | b | الْمُهْتَدِ | ٱلۡمُهۡتَدِ |
| 431 | a | اتَّبَعَنْ | ٱتَّبَعَنۡ |
| 434 | a | وَخَافُونِ | وَخَافُونِۦ |
| 435 | a | وَالتْـ | وَٱلتۡـ |
| 435 | b | تَنَادِ | ـتَنَادِۦ |
| 436 | a | الدَّاعِ | ٱلدَّاعِۦ |
| 437 | b | فَاعْتَزِلُونِ | فَٱعۡتَزِلُونِۦ |


## 3. Uncertain

| Verse | Half | PDF page | What is unclear | Reading used |
|---|---|---|---|---|
| 226 | a | 45 | «اخِرٍ»: the image shows a small nūn (with a fatḥa) over the alif; the text layer has nothing there. | اۨخِرٍ (U+06E8 added after the alif; the fatḥa on it is not encoded) |
| 435 | a | 75 | «وَٱلتۡـ»: the mark on the تـ at the split is tiny; the text layer says Quranic sukūn. | وَٱلتۡـ / ـتَنَادِۦ (text layer kept) |
| 301 | a | 58 | «أَنسَىٰنِيـ»: the Quranic word is cut after نِيـ with a kashida inside the half (both extractors and the image). | kept as printed, kashida at the end of the word |
| 409 | b | 72 | rhyme word: text layer «الحُلَى», image undotted. | الحُلَى |
| — | — | — | Quranic words in the KFGQPC Uthmanic font: the final yā is printed undotted while pypdf often says ي (PDFKit says ى). Every final ي in a Quranic-font piece was written ى (64 halves); checked on the image for 130a, 392a, 397b, 404b, 299a, 393a. | ى |
| — | — | — | lam-alif rebuilt where one extractor lost a letter: the fatḥa is placed on the lām («لَا»), as pypdf gives it. «لَا» and «لاَ» look the same in print, so the image cannot decide; this is a code-point convention, not a reading. | لَا (or as pypdf had it when it kept both letters) |

## 4. Image vs text layer

Systematic text-layer faults, fixed by script (and checked on the image for every half where they occurred):
- **lam-alif ligatures**: pypdf keeps ل and drops ا, PDFKit mostly keeps ا and drops ل; in 136 b-halves both dropped the alif of the rhyme «لا», which was restored.
- **«اً»**: PDFKit drops the tanwīn; taken from pypdf.
- **lost positions**: 254 pypdf pieces had position (0,0); they were matched back by their letters to the PDFKit order.
- **ornaments**: the three-glyph section-end ornament (U+001A) and the verse-number dashes were removed.
- **Quranic final yā**: see §3.
- **lam + hamza-alif («لِأَنَّ», «لِلْأَمِينِ»), the Allah ligature (363a, ٱلَّذِى in 409b)**: garbled in both extractors; rebuilt from the image.

Half-lines where the image overrode the script's text (122):

| Verse | Half | Script / text layer | Stored (from the image) | Note |
|---|---|---|---|---|
| 68 | a | وَفِي يُسْرِهَا «التَّيْسِيرُ «»رُمْتُ اخْتِصَارَهُ | وَفِي يُسْرِهَا «التَّيْسِيرُ» رُمْتُ اخْتِصَارَهُ | quotes misplaced in the text layer |
| 70 | a | وَسَمَّيْتُهَا «اً حِرْزَ الأَمَانِي» «تَيَمُّناً» | وَسَمَّيْتُهَا «حِرْزَ الأَمَانِي» تَيَمُّناً | quotes and tanwin of اً misplaced |
| 70 | b | «وَوَجْهَ التَّهَانِي»فَاهْنِهِ» «مُتَقَبِّلَا | «وَوَجْهَ التَّهَانِي» فَاهْنِهِ مُتَقَبِّلَا | quotes misplaced |
| 73 | a | أَمِينَ وَأَمْناً لِأَْمِينِ بِسِرِّهَا | أَمِينَ وَأَمْناً لِلْأَمِينِ بِسِرِّهَا | lam + hamza-alif ligature garbled (lām lost, marks doubled) |
| 74 | a | أَقُولُ لِحُرٍّ -وَالمُرُوءَةُ مَرْؤُهَا | أَقُولُ لِحُرٍّ - وَالمُرُوءَةُ مَرْؤُهَا | dash spacing as printed |
| 74 | b | لإِِخْوَتِهِ المِرْآةُ ذُو النُّورِ مِكْحَلَ-: | لِإِخْوَتِهِ المِرْآةُ ذُو النُّورِ مِكْحَلَا -: | lam + hamza ligature garbled; alif of the rhyme lost; dash |
| 75 | b | يُنَادَى عَلَيْهِۦ كَاسِدَ السُّوقِ -أَجْمِلَا | يُنَادَى عَلَيْهِۦ كَاسِدَ السُّوقِ - أَجْمِلَا | dash spacing as printed |
| 77 | a | وَسَلِّمْ لِِإِِحْدَى الحُسْنَيَيْنِ: إِصَابَةٌ | وَسَلِّمْ لِإِحْدَى الحُسْنَيَيْنِ: إِصَابَةٌ | lam + hamza ligature garbled |
| 79 | a | وَقُلْ -صَادِقاً -: لَوْلاَ الوِئَامُ وَرُوحُهُ | وَقُلْ - صَادِقاً -: لَوْلاَ الوِئَامُ وَرُوحُهُ | dash spacing as printed |
| 88 | a | يَعُدُّ جَمِيعَ النَّاسِ مَوْلىً لَِأَِنَّهُمْ | يَعُدُّ جَمِيعَ النَّاسِ مَوْلىً لِأَنَّهُمْ | lam + hamza ligature garbled |
| 89 | a | يَرَى نَفْسَهُ بِالذَّمِّ أَوْلَى لَِأَِنَّهَا | يَرَى نَفْسَهُ بِالذَّمِّ أَوْلَى لِأَنَّهَا | lam + hamza ligature garbled |
| 93 | b | وَمَالِيَ إِلاَّ سِتْرُهُ مُتَجَلِّلَا | وَمَا لِيَ إِلاَّ سِتْرُهُ مُتَجَلِّلَا | image: «وَمَا لِيَ» printed as two words (Zu'bi وَمَالِيَ) |
| 101 | b | وَصِلْ وَاسْكُتَنْ كُلٌّ جَلَيَاهُ حَصَّلَا | وَصِلْ وَاسْكُتَنْ كُلٌّ جَلَايَاهُ حَصَّلَا | alif of lam-alif lost by both extractors |
| 107 | b | فَلَا تَقِفَنَّ الدَّهْرَ فِيهَا فَتَثْقُلَ | فَلَا تَقِفَنَّ الدَّهْرَ فِيهَا فَتَثْقُلَا | rhyme alif lost; Zu'bi has no separator in 107 |
| 108 | b | مِّالقُرْآنِِۜرَٰطٖ وَٱلصِّۜ رَٰطِ لِ صِۜرَٰطٖ وَقُنْبُاَ لَ وَعِنْدَ | وَعِنْدَ صِۜرَٰطٖ وَٱلصِّۜرَٰطِ لِ قُنْبُلَا | pieces scrambled; rebuilt from the image with the text-layer codes |
| 115 | a | كَمَا: بِهِمُ ٱلۡأَسۡبَابُ ثُمَّ عَلَيۡهِمُ ٱلۡ | كَمَا: بِهِمُ ٱلۡأَسۡبَابُ ثُمَّ عَلَيۡهِمُ ٱلۡـ | word split across the halves: kashida kept |
| 115 | b | قِتَالُ وَقِفْ لِلْكُلِّ بِالكَسْرِ مُكْمِلَا | ـقِتَالُ وَقِفْ لِلْكُلِّ بِالكَسْرِ مُكْمِلَا | word split across the halves: kashida kept |
| 123 | b | تَسَمَّى لَِأَِجْلِ الحَذْفِ فِيهِ: مُعَلَّلَا | تَسَمَّى لِأَجْلِ الحَذْفِ فِيهِ: مُعَلَّلَا | lam + hamza ligature garbled |
| 125 | a | وَيَٰقَوۡمِ مَالِى ثُمَّ يَٰقَوۡمِ مَنۡ بِلَ | وَيَٰقَوۡمِ مَالِي ثُمَّ يَٰقَوۡمِ مَنۡ بِلَا | alif of lam-alif lost by both extractors |
| 126 | b | قَلِيلَ حُرُوفٍ رَدَّهُ مَنْ تَنَبَّاَ لَ لَك كَّ | قَلِيلَ حُرُوفٍ رَدَّهُ مَنْ تَنَبَّلَا | window overshoot into 127a; rebuilt from the image |
| 130 | b | ٱلَّوَلاَ فَرْقَ يُنْجِي مَنْ عَلَى المَدِّ عَوَّلاَ | وَلاَ فَرْقَ يُنْجِي مَنْ عَلَى المَدِّ عَوَّلاَ | stray letters from 131a removed |
| 134 | a | كَ: يَرۡزُقكُّمُۥ، وَاثَقكُّمُۥ وَخَلَقكُّمُۥ وَ | كَ: يَرۡزُقكُّمُۥ، وَاثَقكُّمُۥ وَخَلَقكُّمُۥ | word spaces lost; stray letter removed |
| 134 | b | طَلَّ وَمِيثَٰقَكُمۡ أَظْهِرْ وَنَرۡزُقُكَ انْجَلَى | وَمِيثَٰقَكُمۡ أَظْهِرْ وَنَرۡزُقُكَ انْجَلَى | stray letters from 133b removed |
| 154 | a | -وَلاَ يَمْنَعُ الإِدْغَامُ -إِذْ هُوَ عَارِضٌ | وَلاَ يَمْنَعُ الإِدْغَامُ - إِذْ هُوَ عَارِضٌ - | dashes as printed (the first dash belongs to the verse number) |
| 158 | a | وَلَمْ يَصِلُوا «هَا» «مُضْمَرٍ قَبْلَ سَاكِنٍ» | وَلَمْ يَصِلُوا «هَا» مُضْمَرٍ قَبْلَ سَاكِنٍ | quotes misplaced |
| 162 | b | وَيَأۡتِهۡ لَدَى طَاهَ ابِالِسْكَانِ يُجْتَلَى | وَيَأۡتِهۡ لَدَى طَاهَا بِالِاسْكَانِ يُجْتَلَى | alif of طاها and of lam-alif misplaced by the extractors |
| 163 | b | بِخُلْفٍ وَفِي طَاهَا بِوَجْهَيْنِ بُجِّلَا | بِخُلْفٍ وَفِي طَاهَا بِوَجْهَيْنِ بُجِّلَا | alif of طاها misplaced |
| 164 | b | بِخُلْفَِهِمَا وَالقَصْرَ فَاذْكُرْهُ نَوْفَلَا | بِخُلْفِهِمَا وَالقَصْرَ فَاذْكُرْهُ نَوْفَلَا | double vowel on فِ removed |
| 166 | b | وَفِي الَهَاءِ ضَمٌّ لَفَّ دَعْوَاهُ حَرْمَلَا | وَفِي الهَاءِ ضَمٌّ لَفَّ دَعْوَاهُ حَرْمَلَا | stray fatha on the lām of al- removed |
| 168 | b | أَوِ الوَاوُ عَنْ ضَمٍّ لَقِي الهَمْزَ طُوِّلاَِ | أَوِ الوَاوُ عَنْ ضَمٍّ لَقِي الهَمْزَ طُوِّلَا | stray marks on the rhyme removed |
| 170 | a | كَ: جِاْيٓ ءَ وَعَن سُوٓءٖ وَشَآءَ اتِّصَالُهُ | كَ: جِاْيٓءَ وَعَن سُوٓءٖ وَشَآءَ اتِّصَالُهُ | word broken by a space |
| 172 | b | ءِءَالِهَةً، ءَاتَىٰ، لِلِايمَٰنِ مُثِّلَا | ءِ ءَالِهَةً، ءَاتَىٰ، لِلِايمَٰنِ مُثِّلَا | space after the split word ءِ (end of هَٰؤُلَآءِ) |
| 174 | a | وَمَا بَعْدَ هَمْزِ الوَصْلِ وَبَعْضُهُمْ إِيتِ | وَمَا بَعْدَ هَمْزِ الوَصْلِ إِيتِ وَبَعْضُهُمْ | word order from the image |
| 174 | b | وْبَعْدَسَاكِنٍيُؤَاخِذُكُمۡ، ءَآلَـٰنَ مُسْتَفْهِماً تَلَا | يُؤَاخِذُكُمۡ، ءَآلَـٰنَ مُسْتَفْهِماً تَلَا | stray words from 174a removed |
| 175 | a | وَعَادًا ٱلُاولَىٰ وَابْنُ غَلْبُونَ طَاهِرٌ | وَعَادًا ٱلُاولَىٰ وَابْنُ غَلْبُونَ طَاهِرٌ | alif of the tanwin misplaced |
| 182 | b | وَعَنْ كُلٍّ ٱلۡمَوۡءُۥ دَةُ اقْصُرْ وَمَوۡئِلَا | وَعَنْ كُلٍّ ٱلۡمَوۡءُۥدَةُ اقْصُرْ وَمَوۡئِلَا | small wāw inside the word (no word break) |
| 196 | b | بِهَا لُذْ وَقَبِْلَُ الكَسْرِ خُلْفٌ لَهُ وَلاَ | بِهَا لُذْ وَقَبْلَ الكَسْرِ خُلْفٌ لَهُ وَلاَ | marks doubled on قَبْلَ |
| 204 | b | إِلَّ وَفِي غَيْرِهِ كَاليَا وَكَالوَاوِ سَهَّلَا | وَفِي غَيْرِهِ كَاليَا وَكَالوَاوِ سَهَّلَا | stray word from 205a removed |
| 205 | a | وَبِٱلسُّوِّإِلَّا أَبْدَلاَ ثُمَّ أَدْغَمَا | وَبِٱلسُّوِّ إِلَّا أَبْدَلاَ ثُمَّ أَدْغَمَا | word space lost |
| 207 | a | وَفِي هَـٰؤُلَا إِنۡ وَٱلۡبِغَآ ءِ لِوَرْشِهِمْ | وَفِي هَـٰؤُلَا إِنۡ وَٱلۡبِغَآءِ لِوَرْشِهِمْ | word broken by a space |
| 207 | b | بِيَاءٍ خَفِيفِ اتَلَكَسْرِ بَعْضُهُمُۥ تَاَ | بِيَاءٍ خَفِيفِ الكَسْرِ بَعْضُهُمُۥ تَلَا | lam-alif and al- garbled |
| 209 | a | وَتَسْهِيلُ الاُخْرَى فِي اخْتِلَفِهِمَا سَمَا | وَتَسْهِيلُ الاُخْرَى فِي اخْتِلَافِهِمَا سَمَا | alif of lam-alif lost by both extractors |
| 214 | b | فَوَرْشٌ يُرِيهَا حَرْفَ مَدٍّ مُبَدِّلاَِ | فَوَرْشٌ يُرِيهَا حَرْفَ مَدٍّ مُبَدِّلَا | stray marks on the rhyme removed |
| 218 | b | وَأَرۡجِـٔۡمَعاً وَٱقۡرَأۡ ثَلَثاً فَحَصِّلَا | وَأَرۡجِـٔۡ مَعاً وَٱقۡرَأۡ ثَلَاثاً فَحَصِّلَا | word space lost; alif of lam-alif lost by both extractors |
| 219 | a | وَتُـٔۡوِى وَتُـٔۡوِيهِِۦ أَخَفُّ بِهَمْزِهِ | وَتُـٔۡوِى وَتُـٔۡوِيهِۦ أَخَفُّ بِهَمْزِهِ | doubled kasra removed |
| 223 | b | وَيَـٔۡلِتۡكُمُ الدُّورِي وَالاِبْدَالُ يُجْتَلَى لِئَلَّا | وَيَـٔۡلِتۡكُمُ الدُّورِي وَالاِبْدَالُ يُجْتَلَى | stray word from 224a removed |
| 224 | b | وَأَدْغَمَ فِي يَاءِ ٱلنَّسِيِّفَثَقَّلَا | وَأَدْغَمَ فِي يَاءِ ٱلنَّسِيِّ فَثَقَّلَا | word space lost |
| 226 | a | وَحَرِّكْ لِوَرْشٍ كُلَّ سَاكِنٍ اخِرٍ | وَحَرِّكْ لِوَرْشٍ كُلَّ سَاكِنٍ اۨخِرٍ | image: small nūn (with a fatḥa) over the alif of اخِر, not in the text layer; written U+06E8 (uncertain) |
| 241 | b | لَدَى فَتْحِهِ يَاءًوَوَاواً مُحَوَّلاَ | لَدَى فَتْحِهِ يَاءً وَوَاواً مُحَوَّلاَ | word space lost |
| 249 | a | كَمَا: هَـٰوَيَـٰوَاللَّمِ وَالبَا وَنَحْوِهَا | كَمَا: هَـٰ وَيَـٰ وَاللَّامِ وَالبَا وَنَحْوِهَا | word spaces lost; lam-alif rebuilt |
| 259 | a | نَعَمْ إِذۡ تَمَشَّتَْ زَيْنَبٌ صَالَ دَلُّهَا | نَعَمْ إِذۡ تَمَشَّتْ زَيْنَبٌ صَالَ دَلُّهَا | doubled vowel on تْ removed |
| 267 | a | فَإِظْهَارُهَ ادُرٌّ نَمَتْهُ بُدُورُهُ | فَإِظْهَارُهَا دُرٌّ نَمَتْهُ بُدُورُهُ | alif misplaced across the word space |
| 270 | a | وَهَلۡ تَرْوِي ثَنَا ظَعْنُ زَيْنَبٍ أَلاَ بَلۡ هَلۡتَ | أَلَا بَلۡ وَهَلۡ تَرْوِي ثَنَا ظَعْنُ زَيْنَبٍ | word order from the image (pieces scrambled) |
| 275 | b | وَقُلْ بَلْۡ وَهَلۡ رَاهَا لَبِيبٌ وَيَعْقِلَا | وَقُلْ بَلۡ وَهَلۡ رَاهَا لَبِيبٌ وَيَعْقِلَا | doubled sukun removed |
| 279 | b | شَوَاهِدُ حَمَّادٍ، وَأُورِثۡتُمُۥ حَلَوَ | شَوَاهِدُ حَمَّادٍ، وَأُورِثۡتُمُۥ حَلَا | rhyme word garbled |
| 282 | b | ٱتَّ ثَوَابَ، لَبِثۡتُ الفَرْدُ وَالجَمْعُ وَصَّلَا | ثَوَابَ، لَبِثۡتُ الفَرْدُ وَالجَمْعُ وَصَّلَا | stray letters from 283a removed |
| 295 | a | وَفِي اسْمٍ فِي الِسْتِفْهَامِ أَنَّىٰ وَفِي مَتَىٰ | وَفِي اسْمٍ فِي الِاسْتِفْهَامِ أَنَّىٰ وَفِي مَتَىٰ | alif of lam-alif lost by both extractors |
| 297 | a | وَكُلُّ ثُلَاثِيٍّ يَزِيدُ فَإِنَّهُ زَكَّ | وَكُلُّ ثُلَاثِيٍّ يَزِيدُ فَإِنَّهُ | stray word from 297b removed |
| 299 | b | أَتَى وَخَطَٰيَٰمِثْلُهُ مُتَقَبَّلَا | أَتَى وَخَطَٰيَٰ مِثْلُهُ مُتَقَبَّلَا | word space lost |
| 300 | a | وَمَحۡيَاهُمُۥ أَيْضاً وَحَقَّ تُقَاتِهِ | وَمَحۡيَاهُمُۥ أَيْضاً وَحَقَّ تُقَاتِهِ | word space lost |
| 300 | b | وَفِي قَدۡ هَدَى ـٰنِۦ لَيْسَ أَمْرُكَ مُشْكِلَا | وَفِي قَدۡ هَدَىـٰنِۦ لَيْسَ أَمْرُكَ مُشْكِلَا | word broken by a space; kashida kept as the seat of the dagger alif (text layer) |
| 301 | a | وَفِي الكَهْفِ أَنسَىٰنِى وَمِنْ قَبْلُ جَاءَ مَنۡ | وَفِي الكَهْفِ أَنسَىٰنِيـ وَمِنْ قَبْلُ جَاءَ مَنۡ | the Quranic word is cut after نِيـ, with a kashida, as printed (text layer and image) |
| 302 | a | وَفِيهَا وَفِي طَاسِينَ ءَاتَىٰ نِۦَ الَّذِي | وَفِيهَا وَفِي طَاسِينَ ءَاتَىٰنِۦَ الَّذِي | word broken by a space |
| 304 | a | وَأَمَّا ضُحَىٰهَا وَٱلضُّحَىٰ وَيٰ ٱلرِّبَوٰاْ مَعَ ٱلۡ | وَأَمَّا ضُحَىٰهَا وَٱلضُّحَىٰ وَٱلرِّبَوٰاْ مَعَ ٱلۡـ | stray letters removed; word split across the halves: kashida kept |
| 304 | b | قُوَىٰ فَأَمَالاَهَا وَبِالوَاوِ تُخْتَلَى | ـقُوَىٰ فَأَمَالاَهَا وَبِالوَاوِ تُخْتَلَى | word split across the halves: kashida kept |
| 305 | a | وَرُءۡيَاكَ مَعَْ مَثۡوَاىَ عَنْهُ لِحَفْصِهِمْ | وَرُءۡيَاكَ مَعْ مَثۡوَاىَ عَنْهُ لِحَفْصِهِمْ | doubled mark removed |
| 307 | b | وَفِي «اقْرَأْ «»وَفِي وَالنَّازِعَاتِ تَمَيَّلَا | وَفِي «اقْرَأْ» وَفِي وَالنَّازِعَاتِ تَمَيَّلَا | quotes misplaced |
| 308 | a | وَمِنْ تَحْتِهَا ثُمَّ القِيَامَةِ ثُمَّ فِي ال | وَمِنْ تَحْتِهَا ثُمَّ القِيَامَةِ ثُمَّ فِي الـ | word split across the halves: kashida kept |
| 308 | b | مَعَارِجِ يَا مِنْهَالُ أَفْلَحْتَ مُنْهِلَا | ـمَعَارِجِ يَا مِنْهَالُ أَفْلَحْتَ مُنْهِلَا | word split across the halves: kashida kept |
| 312 | a | نَـَٔاشَرْعُ يُمْنٍ بِاخْتِلَافٍ وَشُعْبَةٌ | نَـَٔا شَرْعُ يُمْنٍ بِاخْتِلَافٍ وَشُعْبَةٌ | word space lost |
| 314 | a | وَذُو الرَّاءِ وَرْشٌ بَيْنَ بَيْنَ وَفِي أَرَىٰ | وَذُو الرَّاءِ وَرْشٌ بَيْنَ بَيْنَ وَفِي أَرَىٰـ | word split across the halves (أَرَىٰـ/ـكَهُمۡ): kashida kept |
| 314 | b | كَهُمۡ وَذَوَاتِ اليَا لَهُ الخُلْفُ جُمِّلَا | ـكَهُمۡ وَذَوَاتِ اليَا لَهُ الخُلْفُ جُمِّلَا | word split across the halves: kashida kept |
| 317 | a | وَيَـٰوَيۡلَتَىٰ، ىٰ أَنَّىٰ وَيَـٰحَسۡرَتَىٰ طَوَوْا | وَيَـٰوَيۡلَتَىٰ، أَنَّىٰ وَيَـٰحَسۡرَتَىٰ طَوَوْا | stray letters removed |
| 317 | b | وَعَنْ غَيْرِهِ قِسْهَا وَيَٰأَ سَفَىٰ العُلَى | وَعَنْ غَيْرِهِ قِسْهَا وَيَٰأَسَفَىٰ العُلَى | word broken by a space |
| 318 | a | وَكَيْفَ الثُّلَثِي غَيْرَ زَاغَتۡ بِمَاضِيٍ | وَكَيْفَ الثُّلَاثِي غَيْرَ زَاغَتۡ بِمَاضِيٍ | alif of lam-alif lost by both extractors |
| 325 | a | وَهَذَانِ عَنْهُۥ بِاخْتِلَفٍ وَمَعْهُ فِي ٱلۡ | وَهَذَانِ عَنْهُۥ بِاخْتِلَافٍ وَمَعْهُ فِي ٱلۡـ | alif of lam-alif lost; word split across the halves: kashida kept |
| 325 | b | بَوَارِ وَفِي ٱلۡقَهَّارِ حَمْزَةُ قَلَّلَا | ـبَوَارِ وَفِي ٱلۡقَهَّارِ حَمْزَةُ قَلَّلَا | word split across the halves: kashida kept |
| 328 | a | ءَاذَانِهِمۡ، طُغۡيَٰنِهِمۡ وَيُسَٰرِعُ و | وَءَاذَانِهِمۡ، طُغۡيَٰنِهِمۡ وَيُسَٰرِعُو | first letter lost; word split across the halves (no kashida after و) |
| 328 | b | واْنَ، ءَاذَانِنَا عَنْهُ ٱلۡجَوَارِۦ تَمَثَّلَا | نَ، ءَاذَانِنَا عَنْهُ ٱلۡجَوَارِۦ تَمَثَّلَا | letters of 328a removed; word space lost |
| 330 | b | وَءَانِيَةٖ فِي «هَلۡ أَتَىٰكَ»لِاأعْدَلَا | وَءَانِيَةٖ فِي «هَلۡ أَتَىٰكَ» لِأَعْدَلَا | lam + hamza ligature garbled; quote spacing |
| 332 | a | حِمَارِكَ وَٱلۡمِحۡرَابِ، إِكۡرَٰهِهِنَّ وَٱلۡ | حِمَارِكَ وَٱلۡمِحۡرَابِ، إِكۡرَٰهِهِنَّ وَٱلۡـ | word split across the halves: kashida kept |
| 332 | b | حِمَارِ وَفِي ٱلۡإِكۡرَامِ، عِمۡرَٰنَ مُثِّلَا | ـحِمَارِ وَفِي ٱلۡإِكۡرَامِ، عِمۡرَٰنَ مُثِّلَا | word split across the halves: kashida kept |
| 336 | a | كَ: مُوسَى ٱلۡهُدَىٰ، عِيسَى ٱبۡنِ مَرۡيَمَ وَٱلۡقُرَى ٱلۡ | كَ: مُوسَى ٱلۡهُدَىٰ، عِيسَى ٱبۡنِ مَرۡيَمَ وَٱلۡقُرَى ٱلۡـ | word split across the halves: kashida kept |
| 336 | b | لَتِى مَعَ ذِكۡرَى ٱلدَّارِ فَافْهَمْ مُحَصِّلَا | ـلَتِى مَعَ ذِكۡرَى ٱلدَّارِ فَافْهَمْ مُحَصِّلَا | word split across the halves: kashida kept |
| 344 | b | سِوَى حَرْفِ الاِسْتِعْلَسِوَى الخَا فَكَمَّلَا | سِوَى حَرْفِ الاِسْتِعْلَا سِوَى الخَا فَكَمَّلَا | alif of lam-alif lost; word space lost |
| 360 | a | إِذَا فُتِحَتْ أَوْ سُكِّنَتْ كَ: صَلَاتِهِمۡ ظَلَّ | إِذَا فُتِحَتْ أَوْ سُكِّنَتْ كَ: صَلَاتِهِمۡ | stray word from 360b removed |
| 363 | a | وَكُلٌّ لَدَى اسْمِ ٱللَِّمِنْ بَعْدِ كَسْرَةٍ | وَكُلٌّ لَدَى اسْمِ ٱللَّهِ مِنْ بَعْدِ كَسْرَةٍ | Allah ligature garbled (هـ lost, marks scattered) |
| 372 | b | بِنَاءً وَإِعْرَابٍغَدَا مُتَنَقِّلَا | بِنَاءً وَإِعْرَابٍ غَدَا مُتَنَقِّلَا | word space lost |
| 374 | a | وَفِي الهَاءِ لِإِْضْمَارِ قَوْمٌ أَبَوْهُمَا | وَفِي الهَاءِ لِلْإِضْمَارِ قَوْمٌ أَبَوْهُمَا | lam + hamza ligature garbled (lām lost) |
| 378 | b | فَبِالهَاءِ قِفْ حَقّاً رِضاً وَمُعَوَّلاَِ | فَبِالهَاءِ قِفْ حَقّاً رِضاً وَمُعَوَّلَا | stray marks on the rhyme removed |
| 380 | a | وَقِفْ يَـٰأَ بَهۡ كُفْئاً دَنَا وَكَأَيِّنِ ال | وَقِفْ يَـٰأَبَهۡ كُفْئاً دَنَا وَكَأَيِّنِ الـ | word broken by a space; word split across the halves: kashida kept |
| 380 | b | وُقُوفُ بِنُونٍ وَهْوَ بِاليَاءِ حُصِّلَا | ـوُقُوفُ بِنُونٍ وَهْوَ بِاليَاءِ حُصِّلَا | word split across the halves: kashida kept |
| 381 | b | وَ «سَالَ»عَلَى مَا حَجَّ وَالخُلْفُ رُتِّلَا | وَ«سَالَ» عَلَى مَا حَجَّ وَالخُلْفُ رُتِّلَا | quote spacing as printed |
| 382 | a | وَيَٰأَ يُّهَفَوْقَ الدُّخَانِ وَأَيُّهَ | وَيَٰأَيُّهَ فَوْقَ الدُّخَانِ وَأَيُّهَ | word broken by a space, space lost |
| 385 | b | بِ: مَا، وَبِ: وَادِۦ ٱلنَّمۡلِ بِاليَا سَناً تَلَا | بِ: مَا، وَبِ: وَادِۦ ٱلنَّمۡلِ بِاليَا سَناً تَلَا | word space lost |
| 386 | a | وَفِي مَهۡ وَمِمَّهۡ قِفْ وَعَمَّهۡ لِمَهۡ بِمَهۡ | وَفِيمَهۡ وَمِمَّهۡ قِفْ وَعَمَّهۡ لِمَهۡ بِمَهۡ | image: وَفِيمَهۡ is one word (Zu'bi وَفي مَهْ) |
| 392 | a | ذَرُونِيَ وَٱدۡعُونِى ٱذۡكُرُونِىَ فَتْحُهَا | ذَرُونِىَ وَٱدۡعُونِى ٱذۡكُرُونِىَ فَتْحُهَا | Quranic final yā printed undotted |
| 398 | a | أَرَهۡطِى سَمَا مَوْلىً، وَمَالِى سَمَا لِواً لَ | أَرَهۡطِى سَمَا مَوْلىً، وَمَالِى سَمَا لِواً | stray letters from 398b removed |
| 398 | b | لَعَلِّيى لعُلَى سَمَا كُفْئاً، مَعِى نَفَرُ العُلَا | لَعَلِّى سَمَا كُفْئاً، مَعِى نَفَرُ العُلَى | first word garbled; rebuilt from the image |
| 403 | b | دُعَآءِي وَءَابَآءِي لِكُوفٍ تَجَمَّلَا | دُعَآءِى وَءَابَآءِى لِكُوفٍ تَجَمَّلَا | Quranic final yā printed undotted; word space lost |
| 409 | a | فَخَمْسَ عِبَادِى اعْدُدْ وَعَهۡدِى أَرَادَنِى ى ٱلَّ | فَخَمْسَ عِبَادِى اعْدُدْ وَعَهۡدِى أَرَادَنِى | stray letters from 409b removed |
| 409 | b | وَرَبِّي ٱلَّى ذِى، ءَاتَىٰنِ ءَايَٰتِىَ الحُلَا | وَرَبِّى ٱلَّذِى، ءَاتَىٰنِ ءَايَٰتِىَ الحُلَى | Allah-like ligature ٱلَّذِى garbled; rhyme ى as in the text layer and image |
| 414 | a | وَعَمَّ عُلىًوَجۡهِى، وَبَيۡتِى بِنُوحَ عَنْ | وَعَمَّ عُلىً وَجۡهِى، وَبَيۡتِى بِنُوحَ عَنْ | word space lost |
| 414 | b | مْلِواً وَسِوَاهُۥ عُدَّ أَصْلًلِيُحْفَلَا | لِواً وَسِوَاهُۥ عُدَّ أَصْلاً لِيُحْفَلَا | garbled start; space lost |
| 415 | a | وَمَعْ شُرَكَآءِي مِن وَرَآءِيَ دَوَّنُوا | وَمَعْ شُرَكَآءِى مِن وَرَآءِىَ دَوَّنُوا | Quranic final yā printed undotted |
| 418 | a | وَمَعْ تُؤۡمِنُواْ لِى يُؤۡمِنُواْ بِىَ جَا، وَيَٰ | وَمَعْ تُؤۡمِنُواْ لِى يُؤۡمِنُواْ بِىَ جَا، وَيَٰـ | word split across the halves: kashida kept |
| 418 | b | عِبَادِىَ صِفْ وَالحَذْفُ عَنْ شَاكِرٍ دَلاَ | ـعِبَادِىَ صِفْ وَالحَذْفُ عَنْ شَاكِرٍ دَلاَ | word split across the halves: kashida kept |
| 419 | b | وَمَالِىَ فَِي يَاسِينَ سَكِّنْ فَتُكْمِلَا | وَمَالِىَ فِي يَاسِينَ سَكِّنْ فَتُكْمِلَا | doubled vowel removed |
| 420 | b | لأَِنْ كُنَّ عَنْ خَطِّ المَصَاحِفِ مَعْزِلاَ | لِأَنْ كُنَّ عَنْ خَطِّ المَصَاحِفِ مَعْزِلاَ | lam + hamza ligature garbled |
| 423 | a | فَ: يَسۡرِۦ، إِلَى ٱلدَّاعِ، ٱلۡجَوَارِ، ٱلۡمُنَادِ، يَهۡ | فَ: يَسۡرِۦ، إِلَى ٱلدَّاعِ، ٱلۡجَوَارِ، ٱلۡمُنَادِ، يَهۡـ | word split across the halves: kashida kept |
| 423 | b | دِيَنۡ، يُؤۡتِيَنۡ، مَعْ أَن تُعَلِّمَنِۦ وِلَفَ:اَ | ـدِيَنۡ، يُؤۡتِيَنۡ، مَعْ أَن تُعَلِّمَنِۦ وِلَا | word split across the halves; rhyme garbled |
| 424 | a | وَأَخَّرۡتَنِالإِسْرَا وَتَتَّبِعَنۡ سَمَا | وَأَخَّرۡتَنِ الإِسْرَا وَتَتَّبِعَنۡ سَمَا | word space lost |
| 424 | b | وَفِي الكَهْفِ نَبۡغِۦ، يَ أۡتِ فِي هُودَ رُفِّلَا | وَفِي الكَهْفِ نَبۡغِۦ، يَأۡتِ فِي هُودَ رُفِّلَا | word broken by a space |
| 429 | a | وَفِي النَّمْلِ ءَاتَىٰ نِۦ وَيُفْتَحُ عَنْ أُولِي | وَفِي النَّمْلِ ءَاتَىٰنِۦ وَيُفْتَحُ عَنْ أُولِي | word broken by a space |
| 429 | b | حِمىً وَخِلَفُ الوَقْفِ بَيْنَ حُلىً عَلَا | حِمىً وَخِلَافُ الوَقْفِ بَيْنَ حُلىً عَلَا | alif of lam-alif lost by both extractors |
| 435 | a | وَفِي ٱلۡمُتَعَالِۦ دُرُّهُ، وَٱلتَّلَاقِ وَٱلتۡ | وَفِي ٱلۡمُتَعَالِۦ دُرُّهُ، وَٱلتَّلَاقِ وَٱلتۡـ | word split across the halves: kashida kept |
| 435 | b | تَنَادِۦ دَرَا بَاغِيهِ بِالخُلْفِ جُهَّلَا | ـتَنَادِۦ دَرَا بَاغِيهِ بِالخُلْفِ جُهَّلَا | word split across the halves: kashida kept |
| 437 | b | نِ، فَٱعۡتَزِلُونِۦ، سِتَّةٌ نُذُرِۦ جَاَوَلَا | نِ، فَٱعۡتَزِلُونِۦ، سِتَّةٌ نُذُرِۦ جَلَا | rhyme garbled |
| 438 | a | وَعِيدِۦ ثَاَثٌ، يُنقِذُونِ، يُكَذِّبُو | وَعِيدِۦ ثَلَاثٌ، يُنقِذُونِ، يُكَذِّبُو | alif of lam-alif lost by both extractors |
| 439 | a | فَبَشِّرۡ عِبَادِافْتَحْ وَقِفْ سَاكِناً يَداً | فَبَشِّرۡ عِبَادِ افْتَحْ وَقِفْ سَاكِناً يَداً | word space lost |
| 443 | a | وَإِنِّي لََأََرْجُوهُۥ لِنَظْمِ حُرُوفِهِمْ | وَإِنِّي لَأَرْجُوهُۥ لِنَظْمِ حُرُوفِهِمْ | doubled marks removed |
| 444 | b | وَمَا خَابَ ذُو جِدٍّ إِذَا هُوَ حَسْبَلَ | وَمَا خَابَ ذُو جِدٍّ إِذَا هُوَ حَسْبَلَا | rhyme alif lost; Zu'bi has no separator in 444 |

## 5. Heading list with ids (ids 5–33, reused from run 2's §5)

Ids 1–4 are the editor's front matter and carry no verses; they are not in `edition.json`. Ids 19–22 (ذكر ذال إذ … ذكر لام هل وبل) are printed exactly like the باب headings (same size, colour and centring, PDF pages 50–53) and the table of contents lists them flat, so they are stored flat (`parent: null`, `kind: "bab"`).

| Id | Heading (table of contents) | Kind | Parent | Verses | Al-Qasim title stored | Zu'bi title stored |
|---|---|---|---|---|---|---|
| 5 | مُقَدِّمَةُ النَّاظِمِ | bab | — | 1–94 | مُقَدِّمَةُ النَّاظِمِ | (مُقَدِّمَةٌ) |
| 6 | بَابُ الاِسْتِعَاذَةِ | bab | — | 95–99 | بَابُ الِاسْتِعَاذَةِ | بَابُ الاسْتِعَاذَةِ |
| 7 | بَابُ البَسْمَلَةِ | bab | — | 100–107 | بَابُ البَسْمَلَةِ | بَابُ الْبَسْمَلَةِ |
| 8 | سُورَةُ أُمِّ القُرْآنِ | bab | — | 108–115 | سُورَةُ أُمِّ القُرْآنِ | سُوْرَةُ أُمِّ الْقُرْآنِ |
| 9 | بَابُ الإدْغَامِ الكَبِيرِ | bab | — | 116–131 | بَابُ الإِدْغَامِ الكَبِيرِ | بَابُ الإدْغَامِ الْكَبِيرِ |
| 10 | بَابُ إِدْغَامِ الحَرْفَيْنِ المُتَقَارِبَيْنِ فِي كَلِمَةٍ وَفِي كَلِمَتَيْنِ | bab | — | 132–157 | بَابُ إِدْغَامِ الحَرْفَيْنِ المُتَقَارِبَيْنِ فِي كَلِمَةٍ وَفِي كَلِمَتَيْنِ | بَابُ إِدْغَامِ الْحَرْفَيْنِ الْمُتَقَارِبَيْنِ فِي كِلْمَةٍ وَفِي كِلْمَتَيْنِ |
| 11 | بَابُ هَاءِ الكِنَايَةِ | bab | — | 158–167 | بَابُ هَاءِ الكِنَايَةِ | بَابُ هَاءِ الْكِنَايَةِ |
| 12 | بَابُ المَدِّ وَالقَصْرِ | bab | — | 168–182 | بَابُ المَدِّ وَالقَصْرِ | بَابُ الْمَدِّ وَالْقَصْرِ |
| 13 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَةٍ | bab | — | 183–201 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَةٍ | بَابُ الْهَمْزَتَيْنِ مِنْ كَلِمَةٍ |
| 14 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ | bab | — | 202–213 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ | بَابُ الْهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ |
| 15 | بَابُ الهَمْزِ المُفْرَدِ | bab | — | 214–225 | بَابُ الهَمْزِ المُفْرَدِ | باب الهمز المفرد |
| 16 | بَابُ نَقْلِ حَرَكَةِ الهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا | bab | — | 226–234 | بَابُ نَقْلِ حَرَكَةِ الهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا | بَابُ نَقْلِ حَرَكَةِ الْهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا |
| 17 | بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الهَمْزِ | bab | — | 235–254 | بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الهَمْزِ | بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الْهَمْزِ |
| 18 | بَابُ الإِظْهَارِ وَالإِدْغَامِ | bab | — | 255–258 | بَابُ الإِظْهَارِ وَالإِدْغَامِ | بَابُ الإِظْهَارِ وَالإِدْغَامِ |
| 19 | ذِكْرُ ذَالِ إِذْ | bab | — | 259–261 | ذِكْرُ ذَالِ إِذْ | ذِكْرُ ذَالِ إِذْ |
| 20 | ذِكْرُ دَالِ قَدْ | bab | — | 262–265 | ذِكْرُ دَالِ قَدْ | ذِكْرُ دَالِ قَدْ |
| 21 | ذِكْرُ تَاءِ التَّأْنِيثِ | bab | — | 266–269 | ذِكْرُ تَاءِ التَّأْنِيثِ | ذِكْرُ تَاءِ التَّأْنِيثِ |
| 22 | ذِكْرُ لاَمِ هَلْ وَبَلْ | bab | — | 270–273 | ذِكْرُ لَامِ هَلْ وَبَلْ | ذِكْرُ لامِ هَلْ وَبَلْ |
| 23 | بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ، وَقَدْ، وَتَاءِ التَّأْنِيثِ، وَهَلْ وَبَلْ | bab | — | 274–276 | بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ، وَقَدْ، وَتَاءِ التَّأْنِيثِ، وَهَلْ وَبَلْ | بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ وَقَدْ وَتَاءِ التَّأْنِيثِ وَهَلْ وَبَلْ |
| 24 | بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا | bab | — | 277–285 | بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا | بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا |
| 25 | بَابُ أَحْكَامِ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ | bab | — | 286–290 | بَابُ أَحْكَامِ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ | بَابُ أَحْكَامِ النُّوْنِ السَّاكِنَةِ وَالتَّنْوِيْنِ |
| 26 | بَابُ الفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ | bab | — | 291–338 | بَابُ الفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ | بَابُ الْفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ |
| 27 | بَابُ مَذْهَبِ الكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الوَقْفِ | bab | — | 339–342 | بَابُ مَذْهَبِ الكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الوَقْفِ | بَابُ مَذْهَبِ الْكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الْوَقْفِ |
| 28 | بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ | bab | — | 343–358 | بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ | بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ |
| 29 | بَابُ اللَّمَاتِ | bab | — | 359–364 | بَابُ اللَّامَاتِ | بَابُ اللَّامَاتِ |
| 30 | بَابُ الوَقْفِ عَلَى أَوَاخِرِ الكَلِمِ | bab | — | 365–375 | بَابُ الوَقْفِ عَلَى أَوَاخِرِ الكَلِمِ | بَابُ الْوَقْفِ عَلَى أَوَاخِرِ الْكَلِمِ |
| 31 | بَابُ الوَقْفِ عَلَى مَرْسُومِ الخَط | bab | — | 376–386 | بَابُ الوَقْفِ عَلَى مَرْسُومِ الخَطِّ | بَابُ الْوَقْفِ عَلَى مَرْسُومِ الْخَطِّ |
| 32 | بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ | bab | — | 387–419 | بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ | بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ |
| 33 | بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ | bab | — | 420–444 | بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ | بَابُ يَاءَاتِ الزَّوَائِدِ |

- Id 5: the page prints no heading (only the basmala ornament), so the title is taken from the table of contents.
- Page titles corrected from the image where the text layer lost a letter of a lam-alif or a mark: 6 «الِاسْتِعَاذَةِ», 22 «لَامِ», 29 «اللَّامَاتِ», 31 «الخَطِّ» (the table of contents text layer also lacks the shadda).

## 6. Validation

**qasim/edition.json**
- continuous 1..1173: pass
- a and b non-empty: pass
- top-level sections cover every verse once: pass
- nesting only فرش → surah: pass
- section ids unique and sorted: pass
- NFC: pass
- U+0640 only at word splits or as a mark seat: pass
- only Arabic letters, marks, allowed punctuation: pass
- existing verses byte-identical: pass
- existing sections byte-identical: pass

**zubi/edition.json**
- continuous 1..1173: pass
- a and b non-empty: pass
- top-level sections cover every verse once: pass
- nesting only فرش → surah: pass
- section ids unique and sorted: pass
- NFC: pass
- U+0640 only at word splits or as a mark seat: pass
- only Arabic letters, marks, allowed punctuation: see note: {"0x22": 2}
- existing verses byte-identical: pass
- existing sections byte-identical: pass

- The byte-identical check compares every verse and section object of 445–1173 / ids 34–83 (JSON-serialised) with a copy taken before the run: all identical, none missing.
- qasim: U+0640 stays at word splits across the halves (115, 304, 308, 314, 325, 332, 336, 380, 418, 423, 435), as a mark seat (e.g. «شَطۡـَٔهُۥ», «هَدَىـٰنِۦ», «يَـٰأَبَهۡ»), and once at the end of a cut Quranic word inside a half (301a «أَنسَىٰنِيـ»). Splits without a kashida, as printed: 172 «هَٰؤُلَآ / ءِ», 328 «يُسَٰرِعُو / نَ», 437 «تَرۡجُمُو / نِ», 438 «يُكَذِّبُو / نِ».
- qasim: dashes «-» around parentheses as printed in 74, 75, 79, 154.
- zubi: the two U+0022 are Turath's straight quotes around «حِرْزَ الأَمَانِيْ» in 70a (kept as Turath has them).
- zubi: verses without « ... » in Turath, split where the PDF splits (same words): 107, 444.

## 7. Problems met (for the next run)

1. **pypdf loses the position of some pieces** ((0,0) for 254 pieces here, mostly «وَ», «،», short words). Keep them per page and match them back by letters; never drop them.
2. **PDFKit's page stream interleaves the two staggered halves** and inserts spaces between letters and marks; spaces in it mean nothing. A skeleton without ا and ل (both are lost in ligatures) locates a half reliably; its ends need a guard, or the window runs into the neighbouring half (the edge trim against the lost pieces does this).
3. **The rhyme «لا» loses its alif in both extractors** in about a third of the b-halves; restore it from the Zu'bi rhyme.
4. **Quranic font (KFGQPC)**: the undotted final yā is ي in pypdf and ى in PDFKit. Use the font name (pypdf gives it) to treat Quranic pieces apart.
5. **Small wāw/yā (ۥ ۦ)** are word-final marks: the word break after them is lost when the next piece has no space (fixed in the script, except inside «ٱلۡمَوۡءُۥدَةُ»).
6. **«كَ:» prefixes**: Al-Qasim writes the prefix of a quoted Quranic word apart with a colon; join it back before comparing with Zu'bi.
7. The 10% clean sample found nothing, but nearly every error found was in a flagged half; the script flags were the right net. The «always flag» glyph classes (lam-alif, اً, Allah, hamza seats) added 305 half-lines that needed only 10 corrections (marks doubled or a lost alif); a next run could sample those at 25% instead of 100%.
