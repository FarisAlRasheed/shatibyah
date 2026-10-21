# Diff report — متن الشاطبية, Al-Qasim vs Zu'bi, run 2 (فرش الحروف to the end)

Generated 2026-10-21 by the text agent. Al-Qasim = `sources/qasim.pdf` (the PDF always wins). Zu'bi = Turath book 7754.

## 1. Summary

- PDF pages **77–175** (printed 75–173). Verses **445–1173** (729 verses; the first فرش verse is 445, on PDF page 77).
- Sections: 50 (ids 34–83).
- **Real differences (Zu'bi → Al-Qasim): 1314** words (1306 word-level + 8 half-verses where the word split differs).
  - by kind (a word can have several): vowel only in qasim: 479, vowel conflict: 354, letter: 319, vowel only in zubi: 154, tanween: 91, shadda: 81. «vowel only in qasim/zubi» = a vowel printed in one edition and absent in the other.
- Quranic (Uthmani) spelling differences: 144 words (dagger alif for alif, ٱ, ءا for آ, ى for final ي in Quranic words). Listed in §2b; not counted as real.
- Style-only differences: 2068 words — alef-fatha placement: 476, sukun on al- lam: 421, uthmani marks: 403, punctuation: 325, tanween placement: 228, sukun on long vowel: 145, rhyme ى/ا: 70.
- Uncertain: **7 verses** plus one heading (§3).
- Image checks: 829 half-lines checked on 300-DPI crops (every flagged half-line plus a 10% random sample of 17 unflagged verses). Corrections from the image: 120 verses (§4). The sample found **no error** the script had missed, so no page needed a wider check.

### How the text was built
- pypdf gives each text-layer piece with its position, so each piece is assigned to its verse and half by the line it sits on.
- macOS PDFKit gives the same glyphs in reading order. The half is found in PDFKit's stream as the run whose letter counts equal pypdf's, then cut into words on the Zu'bi word boundaries.
- The two extractions are cross-checked letter by letter; a mark that PDFKit drops but pypdf keeps (mainly the tanwīn of «اً») is taken from pypdf.
- Every half with any doubt, and every real difference except a vowel present in one edition only, was checked on the image.

## 2. Real differences (Zu'bi → Al-Qasim)

Word-level. Kinds: letter, hamza form, shadda, tanwīn, vowel conflict, or vowel only in one edition. Many of the letter differences are the readings named in the verse (يعملون/تعملون and similar): Al-Qasim prints the Quranic word as the verse names it.

| Verse | Half | Kind | Zu'bi | Al-Qasim |
|---|---|---|---|---|
| 446 | a | vowel only in qasim | وخَفَّفَ | وَخَفَّفَ |
| 447 | a | letter | جِيءَ | جِاْيٓءَ |
| 447 | b | tanween, vowel only in zubi | ضَمَّا | ضَمّاً |
| 448 | b | letter | وَسِيئَتْ | وَسِيٓـَٔتۡ |
| 450 | a | vowel conflict | غَيْرُهُمُ | غَيْرُهُمْ |
| 452 | a | vowel only in qasim | كَلِمَاتِهِ | كَلِمَٰتِهِ |
| 453 | a | letter | وَيُقْبَلُ | وَتُقۡبَلُ |
| 453 | a | vowel only in qasim, vowel only in zubi | الاُولى | الُاولَى |
| 453 | a | letter | حَاجِزٍ | حَاجِرٍ |
| 453 | b | tanween | أَلِفَ | أَلِفٍ |
| 455 | a | vowel only in zubi | وَيَنْصُرُكُمْ | وَيَنصُرُكُمۡ |
| 457 | b | vowel only in qasim | في | فِي |
| 458 | a | vowel only in qasim | وَفي | وَفِي |
| 459 | a | vowel only in qasim | لِلنَّبيِّ | لِلنَّبِيِّ |
| 459 | b | vowel conflict | بُيُوتَ | بُيُوتِ |
| 459 | b | vowel only in qasim | النَّبيِّ | ٱلنَّبِيِّ |
| 460 | a | vowel only in qasim | وَفي | وَفِي |
| 460 | a | letter | الصَّابِئِينَ | ٱلصَّـٰبِـِٔينَ |
| 460 | a | letter | وَالصَّابِئُونَ | وَٱلصَّٰبِـُٔونَ |
| 460 | b | vowel only in qasim | في | فِي |
| 462 | a | letter | تَعْمَلُونَ | يَعۡمَلُونَ |
| 462 | b | vowel only in qasim | في | فِي |
| 462 | b | vowel conflict | ِإلَى | إِلَى |
| 462 | b | vowel conflict | صَفْوَهِ | صَفْوِهِ |
| 463 | a | letter | خَطِيئَتُهُ | خَطِيٓـَٔتُهُ |
| 464 | b | vowel conflict | وَاحْسِنْ | وَاحْسُنْ |
| 466 | a | letter | أَسْرَى | أَسۡرَىٰ |
| 466 | a | letter | أُسَارَى | أُسَٰرَىٰ، |
| 466 | b | letter | تُفَادُوهُمُو | تُفَـٰدُوهُمُۥ |
| 467 | a | vowel conflict | إِسُكَانُ | إِسْكَانُ |
| 468 | a | vowel only in zubi | وَيُنْزِلُ | وَيُنزِلُ |
| 468 | a | vowel only in zubi | وَتُنْزِلُ | وَتُنزِلُ |
| 468 | b | vowel only in zubi | وَنُنْزِلُ | وَنُنزِلُ |
| 468 | b | vowel only in qasim | في | فِي |
| 469 | a | vowel conflict | لِلْبَصْرِيْ | لِلْبِصْرِي |
| 469 | b | vowel only in qasim | في | فِي |
| 469 | b | letter | عَلَى | عَلَىٰ |
| 469 | b | vowel only in zubi | أَنْ | أَن |
| 470 | a | vowel only in zubi | وَمُنْزِلُهَا | وَمُنزِلُهَا |
| 470 | b | vowel only in zubi | يُنْزِلُ | يُنزِلُ |
| 471 | a | vowel conflict | وَجِبْرِيلَ | وَجِبۡرِيلُ |
| 472 | b | shadda | وَمَكِيُّهُمْ | وَمَكِّيُّهُمْ |
| 472 | b | vowel only in qasim | في | فِي |
| 472 | b | vowel only in qasim | بالْفَتْحِ | بِالفَتْحِ |
| 473 | a | letter | مِيكَائِيلَ | مِيكَٰٓـِٔيلَ |
| 474 | a | letter | وَلكِنْ | وَلَٰكِنۡ |
| 474 | a | vowel conflict | خَفَيفٌ | خَفِيفٌ |
| 474 | a | vowel only in qasim | وَالشَّيَاطِينُ | وَٱلشَّيَٰطِينُ |
| 475 | a | vowel conflict, vowel only in zubi | وَنَنْسَخْ | وَنُنسِخۡ |
| 475 | a | vowel only in zubi | وَنُنْـ | وَنُنـ |
| 476 | a | vowel only in qasim, vowel only in zubi | اْلاُولَى | الُاولَى |
| 476 | b | vowel only in zubi | وَكُنْ | وَكُن |
| 476 | b | vowel conflict | فَيَكُونُ | فَيَكُونَ |
| 476 | b | vowel only in qasim | في | فِي |
| 477 | a | vowel only in qasim | وَفي | وَفِي |
| 477 | a | vowel only in qasim | في | فِي |
| 477 | a | vowel only in qasim, vowel only in zubi | الاُولَى | الُاولَى |
| 478 | a | vowel only in qasim | وَفي | وَفِي |
| 478 | a | letter | يس | يَاسِينَ |
| 479 | a | letter | وَتُسْأَلُ | وَتُسۡـَٔلُ |
| 479 | a | shadda, vowel only in zubi | وَالَّلامَ | وَاللاَّمَ |
| 480 | a | vowel only in qasim | وَفيهاَ | وَفِيهَا |
| 480 | a | vowel only in qasim | وَفي | وَفِي |
| 480 | b | vowel conflict, vowel only in qasim | إَبْرَاهَامَ | إِبۡرَٰهَـٰمُ |
| 482 | a | vowel only in qasim | وَفي | وَفِي |
| 483 | a | vowel only in qasim | وَفي | وَفِي |
| 483 | a | vowel conflict | النَّجْمَ | النَّجْمِ |
| 483 | a | vowel only in qasim | وَفي | وَفِي |
| 483 | b | vowel only in qasim | في | فِي |
| 484 | a | vowel only in qasim, vowel only in zubi | لاِبْنِ | لِابْنِ |
| 484 | b | vowel conflict, vowel only in qasim | وَوَاتَّخِذُوا | وَوَٱتَّخَذُواْ |
| 485 | b | vowel only in qasim | وَفي | وَفِي |
| 485 | b | tanween | صَفًا | صَفَا |
| 486 | b | letter | أَوْصَى | أَوۡصَيٰ |
| 486 | b | letter | بِوَصَّى | بِ:وَصَّيٰ |
| 487 | a | vowel only in qasim | وَفي | وَفِي |
| 487 | a | letter | يَقُولُونَ | تَقُولُونَ |
| 488 | a | letter | يَعْمَلُونَ | تَعۡمَلُونَ |
| 488 | b | letter | مُوَلِّيْهَا | مُوَلَّىٰهَا |
| 489 | a | vowel only in qasim | وَفي | وَفِي |
| 489 | a | letter | يَعْمَلُونَ | تَعۡمَلُونَ |
| 489 | b | vowel only in qasim | وَفي | وَفِي |
| 490 | a | vowel only in qasim | وَفي | وَفِي |
| 490 | a | vowel only in qasim | وَالرِّيحَ | وَٱلرِّيحَ |
| 490 | b | vowel only in qasim | وَفي | وَفِي |
| 491 | a | vowel only in qasim | وَفي | وَفِي |
| 491 | b | vowel conflict | وَفَاطِرِ | وَفَاطِرَ |
| 491 | b | vowel only in qasim | وَفي | وَفِي |
| 492 | a | vowel only in qasim | وَفي | وَفِي |
| 492 | b | vowel only in qasim | وَفي | وَفِي |
| 493 | a | letter | تَرَى | تَرَىٰ |
| 493 | b | vowel only in qasim | وَفي | وَفِي |
| 493 | b | vowel conflict | يَرَوْنَ | يُرَوۡنَ |
| 494 | a | vowel only in zubi | أَتَي | أَتَى |
| 494 | a | vowel conflict, vowel only in qasim | خُطُوَاتٌ | خُطۡوَٰتٞ |
| 494 | b | tanween | زَاهِدً | زَاهِدٍ |
| 495 | a | vowel conflict | أَولَى | أُولَى |
| 496 | a | vowel only in zubi | انْقُصْ | ٱنقُصۡ، |
| 496 | b | vowel only in zubi | انْظُرْ | ٱنظُرۡ |
| 497 | a | vowel only in qasim, vowel only in zubi | لاِبْنِ | لِابْنِ |
| 497 | b | vowel only in qasim, vowel only in zubi | لِتَنْوِيِنهِ | لِتَنْوِينِهِ |
| 499 | a | letter | وَلكِنْ | وَلَٰكِنۡ |
| 500 | b | tanween | طَعَامٍ | طَعَامِ |
| 500 | b | tanween | غُصْنِ | غُصْنٍ |
| 501 | a | vowel only in qasim | مَسَاكِينَ | مَسَٰكِينَ |
| 502 | a | vowel only in qasim | وَالْقُرَانِ | وَٱلۡقُرَانِ |
| 503 | a | vowel conflict, vowel only in qasim | وَالْبُيُوتَ | وَٱلۡبُيُوتِ |
| 504 | a | letter | يَقْتُلُوكُمُو | يَقۡتُلُوكُمُۥ |
| 504 | b | vowel only in zubi | فَإِنْ | فَإِن |
| 505 | b | tanween | حَقًّا | حَقّاً |
| 506 | a | vowel only in qasim | وَفَتْحُك | وَفَتْحُكَ |
| 506 | a | vowel conflict | السِّلْمِ | ٱلسَّلۡمِ |
| 506 | a | letter | رِضًى | رِضاً |
| 506 | b | letter | وَحَتَّى | وَحَتَّيٰ |
| 506 | b | shadda, vowel only in qasim | اللاَّمِ | اللَّامِ |
| 507 | a | vowel only in qasim | وَفي | وَفِي |
| 507 | a | vowel only in qasim | التَّاء | التَّاءِ |
| 507 | b | tanween, vowel only in zubi | نَصَّا | نَصّاً |
| 508 | a | letter | كَبِيرٌ | كَثِيرٞ |
| 508 | b | vowel only in zubi | بِالَبَاءِ | بِالبَاءِ |
| 509 | a | vowel conflict | الْعَفْوَ | ٱلۡعَفۡوُ |
| 509 | a | vowel conflict | لِلْبَصْرِيِّ | لِلْبِصْرِيِّ |
| 509 | b | vowel conflict, vowel only in qasim | لأَعْنَتْكُمْ | لَأَعۡنَتَكُمۡ |
| 511 | a | vowel conflict | يَخَافاَ | يُخَافَا |
| 511 | b | vowel conflict | وَضَمَّ | وَضَمُّ |
| 511 | b | vowel conflict | الرَّاءَ | الرَّاءِ |
| 512 | a | vowel only in zubi | أَتَيْتُمْ | أَتَيۡتُم |
| 512 | a | shadda, vowel only in zubi | مِنْ | مِّن |
| 512 | a | shadda | رِبًا | رِّبٗا |
| 512 | a | letter | وَأَتَيْتمُو | وَأَتَيۡتُمُۥ |
| 512 | b | shadda, vowel only in qasim | إِلاَ | إِلَّا |
| 513 | a | vowel conflict | صَحَابٍ | صِحَابٍ، |
| 514 | a | tanween | وَصِيَّةً | وَصِيَّةٞ |
| 514 | a | letter | رِضىً | رِضاً |
| 514 | b | tanween | قُنْبُلِ | قُنْبُلٍ |
| 515 | a | vowel only in zubi | بَاقِيِهِمْ | بَاقِيهِمْ، |
| 515 | a | vowel only in qasim | وَفي | وَفِي |
| 515 | b | tanween | قَوْلاَ | قَوْلاً |
| 516 | a | vowel conflict, vowel only in qasim | يُضَاعِفَهُ | يُضَٰعِفُهُ |
| 516 | b | vowel only in qasim | في | فِي |
| 517 | a | tanween | مُضَعَّفَةٍ | مُضَعَّفَةٗ، |
| 517 | b | vowel conflict | عَسَيْتُمْ | عَسِيتُمۡ |
| 518 | a | vowel only in qasim | دِفَاعُ | دِفَٰعُ |
| 518 | b | vowel conflict | غَرْفَةً | غُرۡفَةٗ |
| 518 | b | vowel conflict, vowel only in zubi | وِلاِ | وَلَا |
| 519 | b | vowel only in qasim | شَفَاعَةَ | شَفَٰعَةَ |
| 519 | b | vowel conflict | أُِسْوَةٍ | إِسْوَةٍ |
| 521 | a | vowel only in qasim | في | فِي |
| 521 | a | vowel conflict | الْوَصْلَ | الوَصْلِ |
| 521 | b | vowel only in qasim | في | فِي |
| 522 | a | vowel only in zubi | وَنُنْشِزُهَا | وَنُنشِزُهَا |
| 524 | a | vowel conflict, vowel only in qasim, vowel only in zubi | الاِسْكَانَ | الِاسْكَانِ |
| 524 | b | letter | ذِكْرًا | ذِكْرَى |
| 524 | b | vowel only in qasim | وَفي | وَفِي |
| 525 | a | vowel only in qasim | وَفي | وَفِي |
| 525 | a | vowel conflict | الْمُؤْمِنِينِ | المُؤْمِنِينَ |
| 525 | a | vowel only in qasim | وَههُناَ | وَهَهُنَا |
| 525 | b | shadda, vowel only in qasim | الراءِ | الرَّاءِ |
| 525 | b | letter | نَبَّهْثُ | نَبَّهْتُ |
| 526 | a | vowel only in qasim | وَفي | وَفِي |
| 526 | b | letter | تَوَفَّى | تَوَفَّىٰ |
| 527 | a | vowel only in qasim | وَفي | وَفِي |
| 527 | b | shadda | فَتَفَرَّقَ | فَتَّفَرَّقَ |
| 527 | b | vowel conflict | مُثِّلَا | مَثَّلاَ |
| 528 | b | tanween | ثَلاَثاَ | ثَلَاثاً |
| 529 | b | letter | تَلَظَّى | تَلَظَّيٰ، |
| 529 | b | vowel conflict | ثُقِّلَا | ثَقَّلَا |
| 530 | b | vowel only in qasim | وَفي | وَفِي |
| 530 | b | vowel only in qasim, vowel only in zubi | وَالإِمْتِحاَنِ | وَالِامْتِحَانِ، |
| 531 | a | vowel only in qasim | تَنَازَعُوا | تَنَٰزَعُواْ |
| 531 | b | vowel only in qasim | في | فِي |
| 531 | b | vowel only in zubi | أَنْ | أَن |
| 532 | a | vowel only in qasim | وَفي | وَفِي |
| 533 | b | letter | تَلَهَّى | تَلَهَّيٰ |
| 534 | a | vowel only in qasim | وَفي | وَفِي |
| 535 | a | vowel only in zubi | وَكُنْتُمْ | وَكُنتُمۡ |
| 536 | a | vowel only in qasim | في | فِي |
| 537 | a | letter | وَنُكَفِّرْ | وَيُكَفِّرۡ |
| 538 | a | vowel conflict | وَيَحْسَبُ | وَيَحۡسِبُ |
| 538 | a | vowel conflict, vowel only in qasim | مُسْتَقبِلًا | مُسْتَقْبَلًا |
| 539 | b | vowel conflict | وَمَيْسَرَةٍ | وَمَيۡسُرَةٖ |
| 539 | b | vowel only in qasim | في | فِي |
| 540 | a | letter | نَمَا | نَمَى، |
| 541 | a | vowel only in qasim | وَفي | وَفِي |
| 541 | a | vowel only in zubi | أَنْ | أَن |
| 541 | b | tanween | حَقًّا | حَقّاً |
| 542 | a | tanween, vowel only in qasim | تِجَارَةٌ | تِجَٰرَةً |
| 542 | b | tanween, vowel only in qasim | وَحَاضِرةٌ | وَحَاضِرَةٗ |
| 543 | a | tanween | وَحَقٌّ | وَحَقُّ |
| 543 | a | vowel only in qasim | رِهَانٍ | رِهَٰنٍ |
| 544 | a | vowel only in qasim | وَكِتَابِهِ | وَكِتَٰبِهِ |
| 544 | b | vowel only in qasim | وَفي | وَفِي |
| 545 | a | vowel conflict, vowel only in qasim | فَاذُكُرُونِي | فَٱذۡكُرُونِى |
| 545 | b | vowel only in zubi | وَإِنِّيِ | وَإِنِّى |
| 547 | a | vowel only in qasim | وَفي | وَفِي |
| 547 | a | letter | تُغْلَبُونَ | يُغۡلَبُونَ |
| 547 | a | letter | تُحْشَرُونَ | يُحۡشَرُونَ |
| 547 | b | letter | وَتَرَوْنَ | وَيَرَوۡنَ |
| 547 | b | vowel conflict | خُصَّ | خَصَّ |
| 547 | b | vowel conflict | وَخُلِّلَا | وَخَلَّلَا |
| 548 | a | vowel only in qasim | وَرِضْوَانٌ | وَرِضۡوَٰنٞ |
| 548 | a | vowel conflict | اضْمُمْ | اضْمُمْ- |
| 548 | a | vowel conflict | الْعُقُودِ | العُقُودِ- |
| 548 | b | vowel conflict | إِنَّ | أَنَّ |
| 549 | a | vowel only in qasim | وَفي | وَفِي |
| 549 | a | vowel conflict, vowel only in qasim | يُقْتلُونَ | يَقۡتُلُونَ |
| 549 | a | vowel only in qasim | يُقَاتِلُو | يُقَـٰتِلُو |
| 550 | a | vowel only in qasim | وَفي | وَفِي |
| 550 | b | vowel only in qasim | وَالمَيْتَةُ | وَٱلۡمَيۡتَةُ |
| 551 | b | vowel only in qasim | لِلْكلِّ | لِلْكُلِّ |
| 553 | b | vowel only in zubi | الاُوَّلَا | الَاوَّلَا |
| 554 | a | vowel only in qasim | وأَضْجِعْهُ | وَأَضْجِعْهُ |
| 554 | b | vowel conflict | أَنَّ | إِنَّ |
| 554 | b | shadda, vowel only in qasim | اللهَ | ٱللَّهَ |
| 556 | a | vowel only in qasim | نعَمْ | نَعَمْ |
| 556 | a | vowel only in qasim | وَفي | وَفِي |
| 557 | a | letter | نُعَلِّمُهُ | يُعَلِّمُهُ |
| 558 | a | vowel only in qasim | طَائِرًا | طَٰئِرًا |
| 558 | b | letter | نُوَفِّيهِمُ | يُوَفِّيهِمُۥ |
| 559 | a | vowel only in zubi | هَأَنْتُمْ | هَأَنتُمۡ |
| 559 | a | letter | جَنًا | جَنىً |
| 560 | a | vowel only in qasim | وَفي | وَفِي |
| 562 | a | shadda, vowel only in qasim | التنْبِيهِ | التَّنْبِيهِ |
| 563 | a | vowel only in qasim | الْكِتَابَ | ٱلۡكِتَٰبَ |
| 564 | a | letter | يَأْمُرْكُمُو | يَأۡمُرۡكُمُۥ |
| 564 | a | vowel conflict | رُوحُهُ | رَوْحُهُ |
| 564 | b | vowel only in qasim | آتَيْناَ | ءَاتَيۡنَٰ |
| 565 | a | letter | تُرْجَعُو | يُرۡجَعُو |
| 565 | b | vowel only in qasim, vowel only in zubi | وَفيِ | وَفِي |
| 565 | b | letter | تَبْغُونَ | يَبۡغُونَ |
| 565 | b | vowel conflict | عَوَّلاَ | عُوِّلَا |
| 566 | a | vowel conflict | حَجُّ | حِجُّ |
| 566 | b | letter | تَفْعَلُوا | يَفۡعَلُواْ |
| 566 | b | vowel only in zubi | لَنْ | لَن |
| 566 | b | letter | تُكْفَرُوهُ | يُكۡفَرُوهُ |
| 568 | a | vowel conflict, vowel only in zubi | مُنْزِلِينَ | مُنزَلِينَ |
| 568 | a | vowel only in zubi | وَمُنْزِلُو | وَمُنزِلُو |
| 570 | a | vowel conflict | وَقَرْحٌ | وَقُرۡحٞ |
| 570 | a | vowel conflict, vowel only in qasim | وَالْقَرْحُ | وَٱلۡقُرۡحُ |
| 570 | b | vowel only in qasim | كَائِنْ | كَآئِنۡ |
| 571 | a | vowel only in qasim | وَقَاتَلَ | وَقَٰتَلَ |
| 572 | a | tanween, vowel only in zubi | ضَمَّا | ضَمّاً |
| 572 | b | letter | وَيَغْشَى | وَتَغۡشَيٰ |
| 573 | a | vowel conflict | كُلَّهُ | كُلُّهُۥ |
| 573 | a | shadda, vowel only in qasim | للهِ | لِلَّهِ |
| 574 | a | vowel conflict | وَمِتُّمْ | وَمُتُّمۡ |
| 574 | a | vowel conflict | وَمِتْناَ | وَمُتۡنَا، |
| 574 | a | vowel conflict | مُتَّ | مُتُّ |
| 575 | a | letter | تَجْمَعُونَ | يَجۡمَعُونَ، |
| 576 | a | shadda | قُتِلُوا | قُتِّلُواْ |
| 576 | b | vowel only in qasim | وَفي | وَفِي |
| 576 | b | vowel only in zubi | وَالآخِرُ | وَالَاخِرُ |
| 577 | b | vowel conflict | يَحْسَبَنَّ | يَحۡسِبَنَّ |
| 578 | a | vowel conflict | وَأَنَّ | وَإِنَّ |
| 579 | a | letter | يَحْسِبَنَّ | تَحۡسِبَنَّ |
| 580 | a | vowel conflict | الأنْفَالِ | الأَنْفَالِ |
| 581 | b | vowel conflict | وَقَتْلَ | وَقَتۡلُ |
| 581 | b | letter | نَقُولُ | يَقُولُ |
| 582 | b | vowel only in qasim | كِتَابِ | ـكِتَٰبِ |
| 583 | a | letter | يُبَيِّنُنْنَ | يُبَيِّنُنۡـ |
| 584 | a | tanween, vowel only in zubi | وَحَقَّا | وَحَقّاً |
| 585 | a | vowel only in qasim | قَاتَلُوا | قَٰتَلُواْ |
| 585 | b | vowel only in qasim | بَرَاءةَ | بَرَاءَةَ |
| 586 | b | vowel only in qasim, vowel only in zubi | وَاجْعَلْ | وَٱجۡعَل |
| 586 | b | shadda | لِيْ | لِّى |
| 586 | b | vowel only in qasim, vowel only in zubi | وَأَنْصَاريَ | وَأَنصَارِيَ |
| 586 | b | shadda | الْمِلَا | المِلّاَ |
| 587 | a | vowel only in qasim | تَسَّاءَلُونَ | تَسَّآءَلُونَ |
| 587 | b | vowel conflict, vowel only in qasim | وَالأَرْحَامَ | وَٱلۡأَرۡحَامِ |
| 588 | a | vowel only in qasim | قِيَامًا | قِيَٰمٗا |
| 588 | b | tanween, vowel only in qasim | وَاحِدَةً | وَٰحِدَةٞ |
| 589 | a | letter | وَيُوصَى | وَيُوصَيٰ |
| 589 | b | letter | مُجَمَّلَا | مُحَمَّلَا |
| 590 | a | tanween | أُمًّ | أُمِّ |
| 590 | a | vowel only in qasim | فَلأُمِّهِ | فَلِأُمِّهِ |
| 591 | a | vowel only in qasim | وَفي | وَفِي |
| 591 | a | vowel only in qasim | أُمَّهَاتِ | أُمَّهَٰتِ |
| 592 | b | vowel only in qasim | في | فِي |
| 593 | a | letter | وَهذَانِ | وَهَـٰذَٰنِ |
| 593 | a | vowel only in qasim | هاتَيْنِ | هَـٰتَيۡنِ |
| 593 | a | letter | الَّلذَانِ | ٱلَّذَانِ |
| 593 | a | letter | الَّلذَيْنِ | ٱلَّذَيۡنِ |
| 593 | b | letter | يُشَدَّدُ | تُشَدَّدُ |
| 593 | b | vowel only in qasim | فَذَانِكَ | فَذَٰنِكَ |
| 593 | b | vowel conflict | حَلَا | حُلَى |
| 594 | a | vowel conflict | كَرْهًا | كُرۡهٗا |
| 594 | a | vowel only in qasim | بَرَاءةٍ | بَرَاءَةٍ |
| 594 | b | vowel only in qasim | وَفي | وَفِي |
| 595 | a | vowel only in qasim | وَفي | وَفِي |
| 596 | a | vowel only in qasim | وَفي | وَفِي |
| 596 | a | vowel only in qasim | مُحْصَنَاتٍ | مُحۡصَنَٰتٍ |
| 596 | b | vowel only in qasim | وَفي | وَفِي |
| 596 | b | vowel only in qasim | المُحْصَنَاتِ | ٱلۡمُحۡصَنَٰتِ |
| 597 | a | vowel conflict | أَحَلَّ | أُحِلَّ |
| 597 | b | vowel conflict | أَحْصَنَّ | أُحۡصِنَّ |
| 598 | a | vowel conflict | مَدْخَلًا | مُدۡخَلٗا |
| 598 | a | vowel conflict | خَصَّهُ | خُصَّهُ، |
| 599 | a | vowel only in qasim | وَفي | وَفِي |
| 599 | a | vowel only in qasim | عَاقَدَتْ | عَـٰقَدَتۡ |
| 600 | a | vowel only in qasim | وَفي | وَفِي |
| 600 | b | letter | تَسَوَّى | تُسَوَّىٰ |
| 600 | b | letter | نَماَ | نَمَى |
| 600 | b | tanween | حَقًّا | حَقّاً |
| 601 | a | vowel only in qasim | وَلاَمَسْتُمُ | وَلَٰمَسۡتُمُ |
| 601 | b | shadda | مِنْهُمُ | مِّنۡهُمُ |
| 602 | a | letter | يَكُنْ | تَكُنۡ |
| 602 | a | letter | تُظْلَمُونَ | يُظۡلَمُونَ |
| 605 | a | vowel conflict, vowel only in qasim | السَّلاَمَ | ٱلسَّلَٰمِ |
| 605 | b | vowel conflict | وَغَيْرَ | وَغَيۡرُ |
| 606 | a | letter | وَنُؤْتِيهِ | وَيُؤۡتِيهِ |
| 606 | b | vowel only in qasim | وَفَتحُ | وَفَتْحُ |
| 606 | b | tanween | حَقٌّ | حَقُّ |
| 607 | a | vowel only in qasim | وَفي | وَفِي |
| 607 | a | vowel conflict | الاَوَّلِ | الَاوَّلُ |
| 609 | a | letter | وَتَلْوُوا | وَتَلۡوُۥاْ |
| 609 | a | vowel only in qasim, vowel only in zubi | الاُولى | الُاولَى |
| 609 | b | vowel conflict | مُجْهَّلَا | مُجَهَّلَا |
| 610 | b | vowel conflict, vowel only in zubi | وَأُنْزِلَ | وَأَنزَلَ |
| 610 | b | vowel conflict | نُزِّلاَ | نَزَّلَا |
| 611 | a | letter | تُؤْتِيِهِمْ | يُؤۡتِيهِمۡ |
| 611 | a | vowel only in qasim | عَزيزٌ | عَزِيزٌ، |
| 611 | b | vowel conflict | سَيُؤتِيهِمُ | سَيُؤۡتِيهِمُۥ، |
| 612 | a | vowel only in qasim, vowel only in zubi | بِالاِسْكَانِ | بِالِاسْكَانِ، |
| 613 | a | vowel only in qasim | وَفي | وَفِي |
| 613 | a | vowel only in qasim | الانْبِياَ | الأَنْبِيَا |
| 613 | a | vowel only in qasim | وَههُناَ | وَهَهُنَا |
| 613 | b | vowel only in qasim | وَفي | وَفِي |
| 614 | a | vowel conflict, vowel only in zubi | شَنَآنُ | شَنۡـَٔانُ |
| 614 | b | vowel only in qasim | وَفي | وَفِي |
| 614 | b | vowel conflict, vowel only in zubi | أَنَ | إِن |
| 614 | b | vowel conflict, vowel only in qasim | صَدُّوكمْ | صَدُّوكُمُۥ |
| 615 | a | vowel only in qasim | قَاسِيَةً | قَٰسِيَةٗ |
| 615 | b | vowel conflict | وَأَرْجُلِكُمْ | وَأَرۡجُلَكُمۡ |
| 616 | a | vowel only in qasim | وَفي | وَفِي |
| 616 | a | vowel conflict | رُسُلُنَا | رُسۡلِنَا |
| 616 | a | vowel conflict, vowel only in qasim | رُسْلُكُم | رُسۡلِكُمۡ |
| 616 | a | vowel conflict | رُسْلُهُمْ | رُسۡلِهِمۡ |
| 616 | b | vowel only in qasim | وَفي | وَفِي |
| 616 | b | vowel only in qasim, vowel only in zubi | الاِسْكَانُ | الِاسْكَانُ |
| 618 | b | letter | شَرْعُ | شَرْحُ |
| 618 | b | shadda | حَقٍ | حَقٍّ |
| 619 | a | vowel conflict, vowel only in qasim | وَالْعَيْنُ | وَٱلۡعَيۡنَ |
| 619 | b | letter | رِضىً | رِضاً، |
| 619 | b | vowel only in qasim | وَالْجُرُوحَ | وَٱلۡجُرُوحَ |
| 619 | b | letter | رِضى | رِضَا |
| 620 | b | letter | يَبْغُونَ | تَبۡغُونَ |
| 621 | a | vowel conflict | يَقُولَ | يَقُولُ |
| 621 | a | vowel only in qasim | غصْنٌ | غُصْنٌ |
| 621 | b | vowel only in zubi | مَنْ | مَن |
| 622 | b | vowel conflict, vowel only in qasim | وَالْكُفَّارَ | وَٱلۡكُفَّارِ |
| 623 | a | vowel conflict | عَبَدَ | عَبُدَ |
| 623 | a | letter | التَّا | التَّاءَ |
| 623 | b | letter | رِسَالَتَهُ | رِسَالَٰتِهِ |
| 624 | b | shadda, vowel only in zubi | وَعَقَّدْتُمُ | وَعَقَّدتُّمُ |
| 625 | a | vowel only in qasim | وَفي | وَفِي |
| 625 | a | vowel only in qasim | فَجَزَاءُ | فَجَزَآءُ |
| 625 | b | shadda | وِّنُوا | وِنُوا |
| 626 | a | vowel conflict | طَعاَمِ | طَعَامُ |
| 626 | a | vowel conflict | بَرَفْعِ | بِرَفْعِ |
| 626 | b | vowel only in qasim | قِيَامًا | قِيَٰمٗا |
| 627 | a | vowel conflict | لَحِفْصٍ | لِحَفْصٍ |
| 627 | b | vowel only in qasim | وَفي | وَفِي |
| 627 | b | vowel only in qasim | الأَوْلَياَنِ | ٱلۡأَوۡلَيَٰنِ |
| 628 | a | letter | عُيُونًا | عُيُونٍ |
| 628 | b | letter | صُحْبَهٌ | صُحْبَةٌ |
| 629 | a | vowel only in qasim | وَسَاحِرٌ | وَسَـٰحِرٞ |
| 629 | b | tanween | بِسِحْرٌ | بِ:سِحۡرٍ |
| 630 | a | letter | يَسْتَطِيعُ | تَسۡتَطِيعُ |
| 630 | b | vowel conflict | بِالنَّصْبَ | بِالنَّصْبِ |
| 631 | a | vowel conflict | وَيَوْمَ | وَيَوۡمُ |
| 633 | a | vowel only in qasim | بالرَّفْعِ | بِالرَّفْعِ |
| 633 | b | vowel conflict | رَبِّناَ | رَبَّنَا |
| 635 | a | shadda, vowel only in qasim | اللاَّمِ | اللَّامِ |
| 635 | a | vowel only in qasim, vowel only in zubi | الاُخْرَى | الُاخْرَى |
| 635 | b | vowel only in qasim, vowel only in zubi | وَالآخِرَةُ | وَٱلَاخِرَةُ |
| 635 | b | vowel conflict | بِالْخِفْضِ | بِالخَفْضِ |
| 636 | a | letter | عُلًا | عُلىً |
| 636 | b | vowel conflict | فَي | فِي |
| 637 | b | vowel conflict | رُحْبًا | رَحْباً |
| 637 | b | vowel only in qasim | تأَوُّلَا | تَأَوُّلَا |
| 638 | a | letter | أَرَيْتَ | رَءَيۡتَ |
| 638 | a | vowel only in qasim, vowel only in zubi | الاِسْتِفْهَامِ | الِاسْتِفْهَامِ |
| 639 | b | vowel conflict | كِلَا | كَلَا |
| 640 | a | vowel only in qasim | ههُناَ | هَهُنَا |
| 641 | a | vowel conflict | وَإِنَّ | وَأَنَّ |
| 641 | b | letter | نَماَ | نَمَى، |
| 642 | a | vowel conflict | سَبِيلَ | سَبِيلُ |
| 643 | a | vowel only in qasim | وَذكَّرَ | وَذَكَّرَ |
| 643 | b | vowel only in qasim | وَاسْتَهْوَاهُ | وَٱسۡتَهۡوَىٰهُ |
| 644 | a | vowel only in qasim | خُفيَةً | خُفۡيَةٗ |
| 644 | b | vowel only in zubi | وَأَنْجَيْتَ | وَأَنجَيۡتَ |
| 644 | b | tanween, vowel only in zubi | لِلْكًوِفِيِّ | لِلْكُوفِيِّ |
| 644 | b | letter | أَنْجَى | أَنجَىٰ |
| 645 | a | shadda, vowel only in qasim | اللهُ | ٱللَّهُ |
| 645 | a | vowel only in zubi | يُنْجِيكُمْ | يُنجِيكُمۡ |
| 645 | b | vowel only in zubi | يُنْسِيَنَّكَ | يُنسِيَنَّكَ |
| 646 | a | letter | رَأَى | رَءَا |
| 647 | a | vowel conflict | مُضْمِرٍ | مُضْمَرٍ |
| 647 | b | vowel only in qasim | في | فِي |
| 647 | b | vowel conflict | قَلِّلَا | قُلِّلَا |
| 648 | a | vowel only in qasim | وَقَبلَ | وَقَبْلَ |
| 650 | a | vowel conflict | وَخَفِّفَ | وَخَفَّفَ |
| 650 | a | shadda, vowel only in qasim | اللهِ | ٱللَّهِ |
| 652 | a | vowel only in qasim | وَاقْتَدِهْ | وَٱقۡتَدِهۡ |
| 652 | b | tanween | شِفَاءً | شِفَاءٌ |
| 654 | a | letter | وَتُبْدُونَهَا | وَيُبۡدُونَهَا، |
| 654 | a | letter | تُخْفُونَ | يُخۡفُونَ |
| 654 | a | letter | تَجْعَلُونَهُ | يَجۡعَلُونَهُ |
| 654 | b | tanween | حَقًّا | حَقّاً |
| 654 | b | vowel conflict, vowel only in zubi | وَيُنْذِرُ | وَيُنذِرَ |
| 655 | a | vowel only in qasim | وَجَا | وَجَٰـ |
| 655 | b | vowel conflict | ثُمِّلاَ | ثَمَّلَا |
| 656 | a | letter | اللَّيْلِ | ٱلَّيۡلِ |
| 656 | a | vowel conflict | بِمُسْتَقَرْ | بِ:مُسۡتَقِرۡ |
| 656 | b | tanween | رٌ | رٍ |
| 656 | b | tanween | حَقًّا | حَقّاً، |
| 657 | a | vowel conflict | ثَمَرٍ | ثُمُرٍ |
| 657 | b | vowel only in qasim | وَدَارَسْتَ | وَدَٰرَسۡتَ |
| 658 | a | shadda, vowel only in qasim | وَسَكنْ | وَسَكِّنْ |
| 658 | a | vowel only in qasim | وَاكْسِر | وَاكْسِرِ |
| 659 | a | letter | يُؤْمِنُونَ | تُؤۡمِنُونَ |
| 659 | b | letter | كُفْؤٍ | كُفْءٍ |
| 660 | a | vowel conflict | قِبَلًا | قُبُلٗا |
| 661 | a | tanween, vowel only in qasim | كَلِماَتٌ | كَلِمَٰتُ |
| 661 | b | vowel only in qasim | وَفي | وَفِي |
| 662 | a | vowel only in zubi | مُنْزَلٌ | مُنزَلٞ |
| 662 | b | vowel conflict | إذْ | إِذْ |
| 663 | a | vowel conflict | وَفُصِّلَ | وَفَصَّلَ |
| 663 | a | vowel conflict | يَضِلُّونَ | يُضِلُّونَ |
| 663 | a | vowel conflict | ضَمَّ | ضُمَّ |
| 663 | b | vowel conflict | يَضِلُّوا | يُضِلُّواْ |
| 663 | b | vowel only in qasim, vowel only in zubi | ثَاِبتًا | ثَابِتاً |
| 664 | a | vowel only in qasim | رِسَالاَتِ | رِسَالَٰتِ |
| 664 | b | vowel conflict | حَرِّكُ | حَرِّكْ |
| 664 | b | shadda, vowel conflict | مُثْقِلَا | مُثَقِّلاَ |
| 665 | b | vowel conflict | إلْفٌ | إِلْفٌ |
| 667 | a | letter | ونَحْشُرَ | وَيَحۡشُرُ |
| 667 | a | vowel conflict | وَهُوَ | وَهْوَ |
| 667 | b | vowel only in zubi | سَبَأَ | سَبَا |
| 667 | b | letter | نَقُولُ | يَقُولُ |
| 667 | b | vowel only in zubi | الأَرْبَعِ | الَارْبَعِ |
| 668 | a | letter | يَعْلَمُونَ | تَعۡلَمُونَ، |
| 668 | a | vowel only in zubi | وَمَنْ | وَمَن |
| 668 | a | letter | تَكُو | يَكُو |
| 669 | a | vowel only in qasim | مَكَانَاتِ | مَكَانَٰتِ |
| 669 | a | vowel only in qasim | شعْبَةٌ | شُعْبَةٌ |
| 669 | b | vowel conflict | بِزَعْمِهِمُ | بِزُعۡمِهِمُ |
| 670 | a | vowel conflict | وَزَيَّنَ | وَزُيِّنَ |
| 670 | b | vowel conflict | لَ | ـلُ |
| 670 | b | vowel conflict, vowel only in qasim | أَوْلاَدِهِمْ | أَوۡلَٰدَهُمۡ |
| 671 | a | vowel only in qasim | شُرَكَاؤُهُمْ | شُرَكَآؤُهُمۡ |
| 672 | b | shadda, vowel conflict | الظُرْفِ | الظَّرْفِ |
| 673 | b | letter | مُلِيمِي | مُلِيمِ |
| 673 | b | shadda, vowel only in qasim | إِلاَّ | إِلَّا |
| 674 | b | letter | دَةَ | دَهَ» |
| 675 | a | vowel only in zubi | وَإِنْ | وَإِن |
| 675 | a | letter | يَكُن | تَكُنَ |
| 675 | a | letter | كُفْؤَ | كُفْءَ |
| 675 | b | vowel conflict | حِصَادِ | حَصَادِ |
| 676 | a | letter | نَمَا | نَمَى، |
| 676 | b | letter | يَكُونُ | تَكُونُ |
| 677 | a | tanween | شَذَا | شَذاً |
| 677 | b | vowel conflict | وَأَنَّ | وَإِنَّ |
| 678 | a | vowel only in qasim | فَارَقُوا | فَٰرَقُواْ |
| 679 | b | vowel only in zubi | مَمَاتِيَ | مَمَاتِىَ |
| 680 | a | vowel only in qasim | صِرَاطِيْ | صِرَٰطِي |
| 686 | a | vowel only in zubi | وَأَنْ | وَأَن |
| 686 | a | shadda | لَعْنَةُ | لَّعۡنَةُ |
| 687 | b | vowel only in qasim | وَوَالشَّمْسُ | وَوَٱلشَّمۡسُ |
| 688 | b | vowel conflict | ذَلِّلَا | ذُلِّلاَ |
| 689 | a | vowel only in qasim | وَفي | وَفِي |
| 689 | a | shadda, vowel only in qasim | الضمِّ | الضَّمِّ |
| 690 | a | letter | إِلهٍ | إِلَٰهٍ |
| 691 | a | letter | مُفْسِدِ | مُفۡسِدِيـ |
| 691 | b | letter | يْنَ | ـنَ |
| 691 | b | letter | كُفْؤًا | كُفْئاً، |
| 691 | b | letter | إِنَّكُمُو | إِنَّكُمُۥ |
| 692 | a | letter | وعَلَى | وَعَلاَ |
| 692 | a | vowel conflict | إنَّ | إِنَّ |
| 692 | b | vowel conflict | الإسْكَانَ | الإِسْكَانُ |
| 692 | b | vowel conflict | حَرْمِيُّهُ | حِرْمِيُّهُ |
| 693 | a | letter | عَلَى | عَلَىٰ |
| 693 | a | vowel only in qasim | وَفي | وَفِي |
| 693 | a | vowel only in qasim | سَاحِرٍ | سَٰحِرٍ |
| 695 | a | vowel conflict | ذَكَا | ذُكَا |
| 695 | b | vowel conflict | الْكَسْرُ | الكَسْرَ |
| 696 | a | vowel only in qasim | وَفي | وَفِي |
| 696 | b | letter | وَأَنْجَى | وَأَنجَىٰ |
| 697 | a | vowel only in qasim | وَدَكَّاءَ | وَدَكَّآءَ |
| 698 | a | vowel only in qasim | رسَالاَتِي | رِسَٰلَٰتِي |
| 698 | b | vowel only in qasim | وَفي | وَفِي |
| 699 | b | vowel conflict | بَكَسْرٍ | بِكَسْرٍ |
| 699 | b | vowel only in qasim, vowel only in zubi | وَالاِتْبَاعُ | وَالِاتْبَاعُ |
| 700 | a | letter | يَرْحَمْنَا | تَرۡحَمۡنَا |
| 700 | a | letter | وَيَغْفِرْ | وَتَغۡفِرۡ |
| 701 | a | letter | كُفْؤَ | كُفْءَ |
| 701 | b | vowel only in qasim | وَآصَارَهُمْ | وَءَاصَٰرَهُمۡ |
| 702 | a | letter | خَطِيئَاتُكُمْ | خَطِيٓـَٔـٰتُكُمۡ |
| 702 | a | vowel conflict | وَحِّدَهُ | وَحِّدْهُ |
| 703 | a | vowel only in qasim | وَلكِنْ | وَلَكِنْ |
| 703 | a | vowel only in qasim | خَطَايَا | خَطَٰيَٰ |
| 703 | b | tanween | وَمَعْذِرَةً | وَمَعۡذِرَةٞ |
| 703 | b | vowel only in qasim | حَفْصِهمْ | حَفْصِهِمْ |
| 704 | b | vowel only in qasim | هذَيْنِ | هَذَيْنِ |
| 705 | a | letter | وَبَيْئَسٍ | وَبَيۡـَٔسٍ |
| 705 | b | tanween | صَفَا | صَفاً |
| 707 | b | shadda | وَّلِ | وَلِ |
| 707 | b | vowel conflict | لِلْبَصْرِيْ | لِلْبِصْرِي |
| 708 | a | vowel conflict | وَحُيْثُ | وَحَيْثُ |
| 708 | b | shadda, vowel only in qasim | الضمِّ | الضَّمِّ |
| 712 | a | vowel only in qasim | طَائِفٌ | طَٰٓئِفٞ |
| 712 | a | letter | رِضىً | رِضاً |
| 713 | b | vowel only in zubi | عَذَابِيَ | عَذَابِىَ، |
| 713 | b | vowel only in qasim | آيَاتِيْ | ءَايَٰتِي |
| 715 | a | tanween | خِفًّا | خِفّاً |
| 715 | b | tanween | حَقًّا | حَقّاً، |
| 715 | b | vowel only in qasim | وَالنُّعَاسَ | وَٱلنُّعَاسَ |
| 716 | a | vowel conflict | الأَوَّلَينَ | الأَوَّلَيْنِ |
| 716 | a | letter | وَلـ | وَلَٰـ |
| 716 | b | shadda, vowel only in qasim | اللهُ | ٱللَّهُ |
| 716 | b | vowel only in qasim | هَاءهُ | هَاءَهُ |
| 717 | b | vowel conflict | كَيْدَ | كَيۡدِ |
| 717 | b | vowel conflict | عَوَّلَا | عُوِّلَا |
| 718 | a | vowel conflict | وَإِنَّ | وَأَنَّ |
| 718 | a | letter | عُلًا | عُلىً، |
| 718 | b | tanween | حَقًّا | حَقّاً |
| 719 | a | letter | حَيِيَ | حَـِۧيَ |
| 719 | b | letter | يَتَوَفَّى | تَتَوَفَّىٰ |
| 720 | a | letter | تَحْسَبَنَّ | يَحۡسِبَنَّ |
| 721 | a | vowel conflict | وَإِنَّهُمُ | وَأَنَّهُمُ |
| 721 | a | vowel only in qasim, vowel only in zubi | كَاِفيًا | كَافِياً، |
| 721 | b | vowel conflict | السَّلْمَ | السِّلۡمَ |
| 723 | a | vowel conflict, vowel only in qasim | وِفي | وَفِي |
| 723 | b | letter | يَكُونَ | تَكُونَ |
| 723 | b | letter | الأَسْرَى | ٱلۡأَسۡرَىٰ |
| 723 | b | letter | الأُسَارَى | ٱلۡأُسَٰرَىٰ |
| 723 | b | letter | حُلًا | حُلىً |
| 724 | a | vowel conflict, vowel only in qasim | وَلاَيَتِهِمْ | وِلَٰيَتِهِمۡ |
| 725 | a | vowel conflict, vowel only in qasim | أَيْمَانَ | إِيمَٰنَ |
| 725 | b | shadda, vowel only in qasim | اللهِ | ٱللَّهِ |
| 726 | a | vowel only in qasim | عَشِيرَاتُكُمْ | عَشِيرَٰتُكُمۡ |
| 726 | a | vowel only in qasim | بِالجمْعِ | بِالجَمْعِ |
| 726 | b | letter | رِضَى | رِضَا |
| 727 | a | vowel only in qasim | يُضَاهُونَ | يُضَٰهُونَ |
| 727 | b | vowel only in qasim | عَنهُ | عَنْهُ |
| 728 | a | vowel conflict | يَضِلُّ | يُضَلُّ |
| 729 | a | vowel only in zubi | وَأَنْ | وَأَن |
| 729 | a | letter | تُقْبَلَ | يُقۡبَلَ |
| 731 | a | vowel only in qasim | وَطَائِفَةٌ | وَطَآئِفَةٞ |
| 732 | b | vowel conflict | ضَمُّهُ | ضَمَّهُ |
| 734 | a | vowel only in qasim | في | فِي |
| 734 | b | letter | مُرْجَئُونَ | مُرۡجَـُٔونَ |
| 735 | b | vowel conflict | مَنَ | مَنُ |
| 735 | b | vowel conflict | اَسَّسَ | اسِّسَ |
| 735 | b | vowel only in qasim | وَبُنْيَانُهُ | وَبُنۡيَٰنُهُۥ |
| 736 | a | vowel only in qasim | سكونُ | سُكُونُ |
| 736 | b | vowel conflict | تُقَطَّعُ | تَقَطَّعَ |
| 737 | a | letter | يَرَوْنَ | تَرَوۡنَ |
| 737 | a | vowel conflict | مُخَاطَبٌ | مُخَاطِبٌ |
| 737 | b | letter | حُمِّلَا | جُمِّلَا |
| 738 | b | vowel conflict | وَلَا | وِلَا |
| 739 | b | letter | رِضًى | رِضاً |
| 739 | b | vowel conflict | وَتَحْتَ | وَتَحْتُ |
| 740 | a | letter | حَم | حَامِيمَ |
| 740 | b | letter | أَدْرَى | أَدۡرَىٰ |
| 741 | a | vowel only in qasim | وَذو | وَذُو |
| 742 | a | letter | نُفَصِّلُ | يُفَصِّلُ |
| 742 | a | tanween, vowel conflict | عُلًا | عَلَا، |
| 742 | a | vowel only in qasim | سَاحِرٌ | سَٰحِرٞ |
| 742 | a | tanween | ظُبَى | ظُبىً |
| 742 | b | tanween, vowel only in qasim | ضِيَاءً | ضِيَآءٞ |
| 744 | a | vowel only in qasim | وَفي | وَفِي |
| 745 | a | letter | يُشْرِكُونَ | تُشۡرِكُونَ |
| 745 | b | vowel only in qasim | وَفي | وَفِي |
| 745 | b | vowel only in qasim | في | فِي |
| 746 | a | vowel only in zubi | يَنْشُرُكُمْ | يَنشُرُكُمۡ |
| 746 | b | vowel conflict, vowel only in qasim | مَتَاعَ | مَتَٰعُ |
| 747 | b | vowel only in qasim | وفِي | وَفِي |
| 748 | a | vowel conflict | يَهَدِّي | يَهِدِّي |
| 748 | a | tanween | صَفِيًّا | صَفِيّاً |
| 749 | a | letter | وَلكِنْ | وَلَٰكِنۡ |
| 749 | b | letter | يَجْمَعُونَ | تَجۡمَعُونَ |
| 750 | a | tanween | سَبَأٍ | سَبَأً |
| 750 | b | vowel conflict | وَأَصْغَرَ | وَأَصۡغَرُ |
| 750 | b | vowel conflict | وَأَكْبَرَ | وَأَكۡبَرُ |
| 751 | a | vowel only in qasim | الْمدِّ | المَدِّ |
| 752 | b | letter | ـاجَ | جَ |
| 753 | a | vowel conflict | أَنَّهُ | إِنَّهُ |
| 753 | b | letter | صِفْوَ | صِفْ، |
| 753 | b | letter | الْخِفُّ | وَالخِفُّ |
| 753 | b | vowel only in zubi | نُنْجِ | نُنجِ |
| 753 | b | letter | رِضىً | رِضاً |
| 753 | b | vowel conflict | عَلَا | عُلَى |
| 754 | b | vowel only in zubi | أَجْرِيَ | أَجۡرِي |
| 755 | a | vowel conflict | وَإِنِّي | وَأَنِّى |
| 755 | b | letter | وَبَادِيءَ | وَبَادِيَ |
| 756 | a | vowel only in zubi | وَمِنْ | وَمِن |
| 756 | a | vowel conflict | قَدْ | «قَدَ |
| 756 | b | shadda, tanween | شَذًّا | شَذاً |
| 757 | a | vowel conflict | مَجْرَاهَا | مُجۡرَىٰهَا |
| 757 | a | vowel only in qasim | يَا | يَٰـ |
| 757 | b | vowel conflict | بُنَيِّ | ـبُنَيَّ |
| 758 | a | vowel conflict | وَآخِرُ | وَآخِرَ |
| 759 | b | shadda, vowel only in qasim | إِلاَّ | إِلَّا |
| 760 | a | letter | وَتَسْئَلْنِ | وَتَسۡـَٔلۡنِ |
| 760 | a | tanween | ظِلٌّ | ظِلُّ |
| 760 | a | tanween | حِمًي | حِمىً |
| 760 | a | letter | وَهَا | وَهَـ |
| 761 | a | vowel conflict | وَيَوْمَئِذٍ | وَيَوۡمِئِذٍ |
| 761 | b | vowel conflict | ثُمِّلاَ | ثَمَّلَا |
| 762 | a | letter | ثَمُودَ | ثَمُودَاْ |
| 763 | a | letter | نَمَا | نَمَى، |
| 763 | b | vowel conflict | وَيَعْقُوبُ | وَيَعۡقُوبَ |
| 764 | a | vowel only in qasim | كسْرُهُ | كَسْرُهُ |
| 764 | b | letter | تَنَزُّلاَش | تَنَزُّلَا |
| 765 | a | vowel only in qasim | وَفَاسْرِ | وَفَٱسۡرِ، |
| 765 | a | letter | وَهَا | وَهَـ |
| 765 | b | shadda, vowel conflict, vowel only in qasim | إِلاَّ | اِلَّا |
| 765 | b | vowel conflict | امْرَاتَكَ | ٱمۡرَاتُكَ |
| 766 | b | vowel only in zubi | وَإِنْ | وَإِن |
| 766 | b | shadda, tanween | كُلًاّ | كُلّٗا |
| 767 | a | letter | يس | يَاسِينَ |
| 767 | a | letter | العُلا | العُلَى |
| 768 | a | vowel only in qasim | وَفي | وَفِي |
| 768 | b | vowel conflict | وَيَرْجِعُ | وَيُرۡجَعُ |
| 768 | b | vowel only in qasim | فِيه | فِيهِ |
| 769 | a | letter | يَعْمَلُونَ | تَعۡمَلُونَ |
| 769 | a | letter | هُنَا | بِهَا |
| 770 | a | tanween | ثَمَانِيا | ثَمَانِياً |
| 770 | b | letter | وَلكِنِّيْ | وَلَٰكِنِّي |
| 772 | a | vowel only in qasim | وَيَا | وَيَـٰ |
| 772 | a | vowel conflict | أَبَتِ | أَبَتَ |
| 772 | a | vowel only in qasim, vowel only in zubi | لاِبْنِ | لِابْنِ |
| 772 | b | vowel only in qasim | آيَاتٌ | ءَايَٰتٞ |
| 773 | a | vowel only in qasim | غَيَابَاتِ | غَيَٰبَٰتِ |
| 773 | b | letter | وَتَأْمَنُنَا | وَتَأۡمَـۨنَا |
| 774 | b | letter | وَنَرْتَعْ | وَيَرۡتَعۡ |
| 774 | b | letter | وَنَلْعَبْ | وَيَلۡعَبۡ |
| 775 | a | letter | حِمًا | حِمىً |
| 775 | b | vowel only in qasim | وَبُشْرَايَ | وَبُشۡرَٰيَ |
| 776 | a | tanween | شِفَاءٌ | شِفَاءً، |
| 776 | a | tanween | جِهْبِذَا | جِهْبِذاً، |
| 777 | a | vowel conflict | وَهَيْتَ | وَهِيتَ |
| 777 | a | letter | كُفْؤٍ | كُفْءٍ |
| 777 | b | letter | لِوَى | لِوَا |
| 777 | b | vowel conflict | خُلْفُهُ | خُلْفِهِ |
| 778 | a | shadda, vowel only in qasim, vowel only in zubi | الَّلامِ | اللَّامِ |
| 778 | b | vowel conflict | الْكُلُّ | الكُلِّ |
| 779 | a | vowel only in qasim | معًا | مَعاً |
| 779 | a | letter | حَاشَا | حَٰشَ |
| 779 | b | letter | يَعْصِرُونَ | تَعۡصِرُونَ |
| 780 | a | letter | وَنَكْتَلْ | وَيَكۡتَلۡ |
| 780 | a | letter | يَشَاءُ | نَشَآءُ |
| 780 | b | vowel only in qasim | حَافِظًا | حَٰفِظٗا |
| 781 | a | vowel only in qasim | فِتْيَانِهِ | فِتۡيَٰنِهِ |
| 781 | b | vowel only in qasim, vowel only in zubi | بِالاِخْبَارِ | بِالِاخْبَارِ |
| 781 | b | letter | أَئِنَّكَ | أَءِنَّكَ |
| 782 | a | letter | وَيَيْأَسْ | وَيَايَسۡ |
| 782 | a | letter | وَاسْتَيْأَسَ | وَٱسۡتَٰيَسَ |
| 782 | a | letter | اسْتَيْأَسُوا | ٱسۡتَٰيَسُواْ |
| 782 | a | letter | وَتَيْـ | وَتَا |
| 782 | b | letter | ـأَسُوا | يَسُواْ |
| 783 | a | letter | وَيُوحَى | وَنُوحِي |
| 783 | b | letter | عُلًا | عُلىً، |
| 783 | b | letter | يُوحَى | نُوحِي |
| 784 | a | letter | نُنْجِ | نُـۨجِي |
| 785 | a | vowel conflict | وَإِنَّىْ | وَإِنِّى |
| 785 | b | vowel conflict | لَيُحْزِنُنِي | لَيَحۡزُنُنِي |
| 786 | b | vowel only in zubi | لَعَلِّيَ | لَعَلِّىَ، |
| 786 | b | vowel only in qasim | آبَاءِيْ | ءَابَآءِي، |
| 787 | a | tanween | صِنْوَانٍ | صِنۡوَانٞ |
| 787 | b | letter | عَلَى | عَلَا |
| 788 | a | letter | تُسْقَى | يُسۡقَيٰ |
| 789 | a | letter | آئِذَا | أَٰءِذَا |
| 789 | b | letter | أَئِنَّا | أَءِنَّا |
| 791 | b | vowel only in qasim | في | فِي |
| 792 | a | tanween | رِضَا | رِضاً |
| 793 | b | vowel conflict | أُصُولِهِمْ | أُصُولِهِمُۥ، |
| 793 | b | letter | لِوَى | لِوَا |
| 796 | b | vowel only in qasim | الْكَافِرُ | ٱلۡكَٰفِرُ |
| 797 | a | shadda, vowel only in qasim | اللهِ | ٱللَّهِ |
| 797 | a | vowel only in qasim | خَا | خَٰـ |
| 798 | a | vowel only in qasim, vowel only in zubi | وَالأرْضَ | وَٱلَارۡضَ |
| 798 | a | letter | هَا | هَـ |
| 799 | a | vowel only in zubi | أَوْ | اَوْ |
| 800 | a | vowel conflict | يَضِلُّوا | يُضِلُّواْ |
| 800 | a | vowel conflict | يَضِلَّ | يُضِلَّ |
| 800 | b | letter | وَأَفْئِدَةً | وَأَفۡـِٔـۧدَةٗ |
| 802 | a | letter | نَمَا | نَمَى، |
| 803 | a | vowel conflict | وَانُصِبِ | وَانْصِبِ |
| 803 | b | vowel only in qasim | مَلائِكَةَ | ـمَلَٰٓئِكَةَ |
| 804 | b | tanween, vowel only in zubi | حِرْمِيَّا | حِرْمِيّاً |
| 804 | b | vowel conflict | الْحَذُفُ | الحَذْفُ |
| 805 | a | vowel conflict | وَيَقْنَطُ | وَيَقۡنِطُ |
| 805 | a | vowel conflict | يَقْنَطُونَ | يَقۡنِطُونَ |
| 805 | a | vowel conflict | وَتَقْنَطُوا | وَتَقۡنِطُواْ |
| 806 | a | vowel only in zubi | وَمُنْجُوهُمُ | وَمُنجُوهُمُۥ |
| 806 | a | vowel only in zubi | نُنْـ | نُنـ |
| 806 | b | vowel only in zubi | مُنْجُوكَ | مُنجُوكَ |
| 807 | b | shadda, vowel only in qasim | وَأَنيْ | وَأَنِّى |
| 808 | a | letter | وَيُنْبِتُ | وَنُنۢبِتُ |
| 809 | a | tanween | نَافِع | نَافِعٌ |
| 810 | a | letter | يَهْدِيْ | يُهۡدَيٰ |
| 810 | b | vowel only in zubi | وَاْلآخِرُ | وَالَاخِرُ |
| 811 | a | tanween | أَضاَ | أَضاً، |
| 811 | a | letter | يَتَفَيَّؤاُ | تَتَفَيَّؤُاْ |
| 811 | b | vowel conflict | لِلْبَصْرِيِّ | لِلْبِصْرِيِّ |
| 812 | a | vowel conflict | ضَمَّ | ضَمُّ |
| 812 | a | letter | نَسْقِيكُمُو | نُسۡقِيكُمُۥ |
| 812 | a | tanween | مَعَا | مَعاً |
| 812 | b | letter | يَجْحَدُونَ | تَجۡحَدُونَ |
| 812 | b | vowel conflict | مُعَلَّلَا | مُعَلِّلاَ |
| 813 | a | letter | وَنَجْـ | وَيَجۡـ |
| 813 | b | vowel conflict | نُوِّلَا | نَوَّلاَ |
| 814 | a | vowel conflict | مَلَكْتُ | مَلَكْتَ |
| 815 | a | vowel conflict | فَتَنُوا | فُتِنُواْ |
| 815 | b | vowel conflict | ضَيْقٍ | ضِيقٖ |
| 816 | a | letter | لِيَسُوءَ | لِنَسُوٓأَ |
| 816 | b | vowel conflict | وَالْمَدِّ | وَالمَدُّ |
| 818 | a | vowel conflict | أُفِّ | أُفَّ |
| 818 | b | letter | كُفْؤًا | كُفْئاً |
| 819 | a | tanween | خِطْأً | خِطۡـٔٗا |
| 819 | a | tanween | مُصَوَّب | مُصَوَّبٌ |
| 820 | a | letter | يُسْرِفْ | تُسۡرِفۡ |
| 820 | b | vowel conflict | بِالْقِسْطَاسِ | بِٱلۡقُسۡطَاسِ |
| 820 | b | letter | شَذٍ | شَذاً |
| 822 | a | vowel conflict | وَاضُمُمْ | وَاضْمُمْ |
| 824 | a | letter | يُسَبِّحُ | تُسَبِّحُ |
| 825 | a | letter | وَيَخْسِفَ | وَنَخۡسِفَ |
| 825 | a | shadda, tanween, vowel only in qasim | حق | حَقٌّ |
| 825 | a | letter | وَيُعِيدَكُمْ | وَنُعِيدَكُمۡ |
| 825 | b | letter | فَيُغْرِقَكُمْ | فَنُغۡرِقَكُمۡ |
| 825 | b | letter | يُرْسِلَ | نُرۡسِلَ |
| 825 | b | letter | يُرْسِلَا | نُرۡسِلَا |
| 826 | a | vowel only in qasim | خِلاَفَكَ | خِلَٰفَكَ |
| 826 | b | letter | نَآى | نَـَٔا |
| 826 | b | vowel conflict | مَلَا | مُلَا |
| 827 | b | vowel conflict | وَلَا | وِلَا |
| 828 | a | vowel only in qasim | وَفي | وَفِي |
| 828 | a | tanween | سَبَأٍ | سَبَأً |
| 829 | a | vowel only in qasim | قَالَ | قَٰلَ |
| 829 | a | vowel only in qasim, vowel only in zubi | اْلاُولَى | الُاولَى |
| 829 | a | vowel conflict | وَضُمَّ | وَضَمُّ |
| 829 | b | vowel conflict | عَلِمْتَ | عَلِمۡتُ |
| 829 | b | letter | رِضىً | رِضاً، |
| 831 | a | tanween | رَاق | رَاقٖ |
| 832 | a | vowel only in zubi | وَمِنْ | وَمِن |
| 832 | a | shadda | لَدْنِهِ | لَّدۡنِهِۦ |
| 832 | a | vowel only in qasim | في | فِي |
| 834 | a | vowel conflict | مِرْفَقًا | مَرۡفِقٗا |
| 835 | a | vowel only in qasim, vowel only in zubi | ثَاِبتٌ | ثَابِتٌ |
| 836 | a | vowel conflict | بَوَرْقِكُمُ | بِوَرۡقِكُمُ |
| 838 | b | vowel only in zubi | حُصِّلاِ | حُصِّلَا |
| 839 | a | shadda | مِنْهُمَا | مِّنۡهُمَا |
| 839 | a | vowel conflict | حُكْمُ | حُكْمَ |
| 839 | b | letter | لكِنَّا | لَٰكِنَّا |
| 840 | a | letter | تَكُنْ | يَكُنۡ |
| 841 | a | vowel conflict | وَعُقُبًا | وَعُقۡبٗا |
| 841 | b | vowel conflict | مَلَا | مِلاَ |
| 842 | a | vowel conflict, vowel only in qasim | وَالْجِبَالَ | وَٱلۡجِبَالُ |
| 842 | b | vowel conflict | وَيَوْمُ | وَيَوۡمَ |
| 842 | b | vowel only in qasim | يقُولُ | يَقُولُ |
| 843 | b | shadda, vowel only in qasim | الْلاَّمِ | اللَّامِ |
| 844 | a | vowel only in zubi | أَنْسَانِيهِ | أَنسَىٰنِيهِ |
| 844 | b | vowel conflict | عَلَيْهِ | عَلَيۡهُ |
| 844 | b | shadda, vowel only in qasim | اللهَ | ٱللَّهَ |
| 845 | b | vowel conflict | أَهْلَهَا | أَهۡلُهَا |
| 846 | a | vowel only in qasim | زَاكِيَةً | زَٰكِيَةً |
| 846 | b | vowel conflict | وَنُونَ | وَنُونُ |
| 848 | a | vowel conflict | يُبْدِلُ | يُبۡدِلَ |
| 848 | a | letter | هَاهُنَا | هَهُنَا |
| 849 | b | vowel only in qasim | وَحَامِيَةٍ | وَحَٰمِيَةٖ |
| 850 | a | vowel conflict | عَنْهُمْ | عَنْهُمُۥ |
| 850 | b | vowel only in qasim | جَزَاءُ | جَزَآءُ |
| 850 | b | vowel only in zubi | وَأَقْبَلَا | وَاقْبَلاَ |
| 851 | a | vowel conflict | السُّدَّيْنِ | السَّدَّيۡنِ، |
| 851 | a | vowel conflict | سُدًّا | سَدّٗا |
| 852 | a | vowel only in zubi | وَيَأْجُوجَ | وَيَاجُوجَ |
| 852 | a | vowel only in zubi | مَأْجُوجَ | مَاجُوجَ |
| 853 | a | vowel only in qasim | وَالمُؤْمِنينَ | وَالمُؤْمِنِينَ |
| 853 | b | vowel only in qasim | خَرَاجًا | خَرَٰجًا |
| 854 | b | vowel conflict | شُعْبَةَ | شُعْبَةِ |
| 855 | b | letter | ائْتُونِي | ٱءۡتُونِى |
| 858 | a | vowel only in qasim | اسْطَاعُوا | ٱسۡطَٰعُواْ |
| 858 | a | vowel conflict | شَدِّدُوا | شَدَّدُوا |
| 858 | b | vowel only in zubi | وَأَنْ | وَأَن |
| 858 | b | letter | تَنْفَدَ | يَنفَدَ |
| 858 | b | vowel conflict | تَأَوَّلَا | تَأَوُّلَا |
| 859 | a | tanween | ثَلاَثٌ | ثَلَاثُ |
| 859 | a | vowel only in qasim | مَعيْ | مَعِي، |
| 859 | b | vowel only in zubi | إِنْ | إِن |
| 859 | b | vowel only in qasim | شَاءَ | شَآءَ |
| 860 | a | tanween | حُلْوُ | حُلْوٌ |
| 860 | a | letter | رِضىً | رِضاً، |
| 860 | b | vowel only in qasim | خَلَقْنَا | خَلَقۡنَٰ |
| 861 | b | vowel conflict, vowel only in qasim | عُتيًّا | عِتِيّٗا |
| 861 | b | vowel conflict | صُلِيًّا | صِلِيّٗا |
| 861 | b | vowel conflict | جُثِيًّا | جِثِيّٗا |
| 863 | a | vowel conflict, vowel only in zubi | وَمَنْ | وَمِن |
| 863 | a | vowel conflict | تَحْتَهَا | تَحۡتِهَا |
| 863 | b | vowel only in qasim | تَسَاقَطْ | تَسَٰقَطۡ |
| 865 | a | vowel conflict | وَأَنَّ | وَإِنَّ |
| 865 | a | shadda, vowel only in qasim | اللهَ | ٱللَّهَ |
| 865 | a | vowel only in qasim | وأَخْبَروا | وَأَخْبَرُوا |
| 866 | a | shadda, vowel only in zubi | وَنُنَجِّي | وَنُنجِي |
| 866 | a | vowel conflict | مَقَامًا | مُقَامٗا |
| 867 | a | tanween | وَوُلْدَا | وَوُلۡدًا |
| 869 | a | vowel only in qasim | وَفي | وَفِي |
| 870 | a | vowel only in qasim | وَرَاءِيَ | وَرَآءِيَ |
| 870 | a | vowel only in qasim, vowel only in zubi | وَاجْعَلْ | وَٱجۡعَل |
| 870 | a | shadda | لِي | لِّى |
| 870 | b | letter | الْعُلا | الوُلَى |
| 871 | b | vowel conflict | إِنِّي | أَنِّى |
| 872 | a | tanween | طُوًى | طُوٗي |
| 872 | b | vowel only in qasim | اخْتَرْناَكَ | ٱخۡتَرۡنَٰكَ |
| 873 | b | vowel conflict | وَأَشْرِكْهُ | وَأُشۡرِكۡهُ |
| 874 | a | vowel only in qasim | معَ | مَعَ |
| 874 | b | vowel only in qasim | مِهَادًا | مِهَٰدٗا |
| 874 | b | vowel conflict | سِوىً | سُوٗى |
| 875 | b | vowel conflict | الأَصُولِ | الأُصُولِ |
| 876 | a | vowel conflict, vowel only in qasim | فَيَسْحَتَكمْ | فَيُسۡحِتَكُمۡ |
| 877 | a | letter | وَهذَيْنِ | وَهَٰذَۦۡنِ |
| 877 | a | letter | هذَانِ | هَٰذَٰنِ |
| 877 | b | vowel only in qasim | فَاجْمَعُوا | فَٱجۡمَعُواْ |
| 878 | a | vowel only in qasim | سَاحِرٍ | سَٰحِرٖ |
| 878 | b | letter | يُخَيَّلُ | تُخَيَّلُ |
| 879 | a | vowel only in zubi | وَأَنْجَيْتُكُمْ | وَأَنجَيۡتُكُمۡ |
| 879 | a | shadda, vowel only in qasim, vowel only in zubi | وَاعَدْتُكُمْ | وَٰعَدتُّكُمۡ |
| 880 | b | vowel conflict | يَحْلِلْ | يَحۡلُلۡ |
| 881 | a | vowel only in qasim | وَفي | وَفِي |
| 881 | a | vowel only in qasim | مُلكِناَ | مُلۡكِنَا |
| 882 | a | letter | يَبْصُرُوا | تَبۡصُرُواْ |
| 883 | a | vowel only in zubi | بِنَنْفُخُ | بِ:نَنفُخُ |
| 883 | b | vowel only in qasim | وَفي | وَفِي |
| 883 | b | vowel only in zubi | الْعَلاِ | العَلَا |
| 884 | b | vowel conflict | وَأَنَّكَ | وَإِنَّكَ |
| 885 | a | letter | تُرْضَى | تَرۡضَىٰ |
| 885 | a | letter | يَأْتِهِمْ | تَأۡتِهِمۡ |
| 887 | a | vowel conflict | وَآخِرُهَا | وَآخِرَهَا |
| 888 | b | vowel conflict, vowel only in qasim | وَالصُّمَّ | وَٱلصُّمُّ |
| 889 | b | vowel conflict | وَمِثْقَالُ | وَمِثۡقَالَ |
| 890 | a | vowel only in qasim | جُذَاذًا | جُذَٰذًا |
| 890 | a | vowel conflict | وَنُونُهْ | وَنُونُهُ |
| 891 | b | letter | وَنُنْجِي | وَنُـۨجِي |
| 891 | b | vowel only in zubi | اِحْذِفْ | احْذِفْ |
| 893 | a | letter | سُكَارَى | سُكَٰرَىٰ |
| 893 | a | tanween | مَعاَ | مَعاً |
| 893 | a | letter | سَكْرَى | سَكۡرَىٰ |
| 893 | b | shadda, vowel only in qasim | اللاَّمِ | اللَّامِ |
| 895 | a | vowel conflict | فَاطِرِ | فَاطِرَ |
| 895 | a | vowel conflict | نَظْمُ | نَظْمَ |
| 895 | b | vowel only in qasim | سَوَاءً | سَوَآءً |
| 896 | a | vowel only in qasim, vowel only in zubi | الشَّرِيَعةِ | الشَّرِيعَةِ، |
| 897 | b | vowel only in qasim | معًا | مَعاً |
| 897 | b | vowel conflict, vowel only in zubi | مَنْسَكًا | مَنسِكٗا |
| 897 | b | vowel only in qasim | بالكَسْرِ | بِالكَسْرِ |
| 898 | a | vowel conflict | وَيُدْفَعُ | وَيَدۡفَعُ |
| 898 | b | vowel only in qasim | يُدَافِعُ | يُدَٰفِعُ، |
| 899 | a | vowel only in qasim | يُقَاتِلُو | يُقَٰتِلُو |
| 899 | b | vowel conflict | دُلَا | دَلَا |
| 900 | a | vowel conflict | وَبَصْرِيٌّ | وَبِصْرِيٌّ |
| 900 | a | vowel only in qasim, vowel only in zubi | أَهْلَكْنَا | اَهۡلَكۡنَـٰ |
| 901 | a | tanween | سَبَإٍ | سَبَأً |
| 901 | a | vowel only in qasim | مُعَاجِزِيْـ | مُعَٰجِزِيـ |
| 901 | b | vowel conflict | ثُقِّلَا | ثَقَّلَا |
| 903 | a | vowel only in qasim | أَمَانَاتِهِمْ | أَمَٰنَٰتِهِمۡ |
| 903 | b | letter | صَلاَتِهِمُ | صَلَوٰتِهِمُۥ |
| 904 | b | vowel only in zubi | بِتَنْبُتُ | بِ:تَنۢبُتُ، |
| 904 | b | vowel conflict, vowel only in qasim | سِيناَءَ | سَيۡنَآءَ |
| 905 | a | vowel conflict, vowel only in zubi | مَنْزِلًا | مُنزَلٗا |
| 905 | a | vowel conflict | غَيْرَ | غَيْرُ |
| 906 | a | vowel conflict | وَأَنَّ | وَإِنَّ |
| 907 | a | shadda, vowel only in qasim | لِلهِ | لِلَّهِ |
| 908 | a | vowel only in qasim | وَعَالِمُ | وَعَٰلِمُ |
| 908 | b | vowel conflict | وَحَرِّكُهُ | وَحَرِّكْهُ |
| 910 | a | vowel conflict | أَنَّهُمْ | إِنَّهُمۡ |
| 910 | a | letter | وَتُرْجَعُـ | وَتُرۡجَعُو |
| 910 | b | letter | ـونَ | نَ |
| 910 | b | vowel only in qasim | في | فِي |
| 910 | b | vowel only in qasim | الْجيمَ | الجِيمَ |
| 911 | a | vowel only in qasim | وَفي | وَفِي |
| 911 | a | vowel only in qasim | قَالَ | قَٰلَ |
| 911 | b | vowel conflict | عُلِّلَا | عَلَّلَا |
| 912 | a | vowel only in qasim | وَفَرَّضْناَ | وَفَرَّضۡنَٰ |
| 913 | a | vowel only in qasim | خَامِسَةُ | خَٰمِسَةُ |
| 914 | a | vowel conflict | بَعْدَ | بَعْدُ |
| 914 | a | vowel conflict | الْجَرِّ | الجَرَّ، |
| 914 | b | vowel conflict | وَغَيْرُ | وَغَيۡرِ |
| 915 | a | letter | رِضَى | رِضاً |
| 916 | a | letter | وَيوقَدُ | وَتُوقَدُ |
| 917 | a | vowel conflict | وَرَفْعُهُمْ | وَرَفْعَهُمْ |
| 917 | b | vowel only in qasim | ظُلُمَاتٍ | ظُلُمَٰتٍ |
| 920 | a | letter | وَيَأْكُلُ | وَنَأۡكُلُ |
| 921 | a | letter | وَنَحْشُرُ | وَيَحۡشُرُ |
| 921 | a | letter | فَيَقُولُ | فَنَقُولُ |
| 921 | a | letter | نُـ | نُو |
| 921 | b | letter | ـونُ | نُ |
| 922 | a | letter | وَنُزِّلَ | وَنُنزِلُ |
| 922 | a | vowel conflict | وَخِفَّ | وَخَفَّ |
| 922 | a | vowel only in qasim | وَالْـ | وَٱلۡـ |
| 922 | b | vowel only in qasim | ـمَلاَئِكَةُ | ـمَلَٰٓئِكَةُ |
| 924 | b | vowel only in qasim | يُضَاعَفْ | يُضَٰعَفۡ |
| 926 | a | vowel only in qasim | وَلَيْتَنِي | وَلَيۡتَنِيَ |
| 927 | a | vowel only in qasim | حَاذِرُونَ | حَٰذِرُونَ |
| 927 | a | vowel only in qasim | الْمدُّ | المَدُّ |
| 927 | a | vowel only in qasim | فَارِهِيْـ | فَٰرِهِي |
| 928 | a | letter | وَالأيْكَةِ | وَلۡـَٔيۡكَةِ |
| 928 | a | shadda, vowel only in qasim | اللاَّمُ | اللَّامُ |
| 929 | a | shadda | نَزَّلَ | نَزَلَ |
| 929 | a | vowel only in qasim | وَالرُّوحُ | وَٱلرُّوحُ |
| 929 | a | vowel only in qasim | وَالأَمِيْـ | وَٱلۡأَمِيـ |
| 929 | b | shadda | عُلْوٌّ | عُلْوٌ |
| 930 | a | letter | يَكُنْ | تَكُنۡ |
| 930 | a | vowel only in zubi | آيَةً | ايَةً |
| 932 | a | tanween | شِهَابٍ | شِهَابِ |
| 933 | a | tanween | حِمًى | حِمَى |
| 933 | b | vowel conflict | زُهْرًا | زَهْراً |
| 934 | b | vowel only in qasim | وَياَ | وَيَٰ |
| 934 | b | vowel only in zubi | وَأبْدَأْهُ | وَابْدَأْهُ |
| 935 | a | vowel only in qasim | هؤُلاَءِ | هَؤُلَاءِ |
| 937 | a | letter | عَلَى | عَلَا |
| 937 | b | letter | تُمِدُّونَنِي | تُمِدُّونَنِ |
| 938 | a | vowel only in qasim | السُّوقِ | ٱلسُّؤۡقِ |
| 938 | a | vowel only in qasim | سَاقَيهاَ | سَأۡقَيۡهَا |
| 938 | a | vowel only in qasim | وَسُوقِ | وَسُؤۡقِ |
| 941 | a | vowel only in zubi | أدَّارَكَ | ٱدَّٰرَكَ |
| 942 | a | vowel only in qasim | بِهَادِيْ | بِهَٰدِي |
| 942 | a | vowel conflict | الْعُمْيِ | ٱلۡعُمۡيَ |
| 943 | b | letter | تَفْعَلُونَ | يَفۡعَلُونَ |
| 948 | b | letter | مُوسَى | مُوسَيٰ |
| 949 | a | letter | نَمَا | نَمَى |
| 949 | a | vowel conflict | يَرْجِعُو | يُرۡجَعُو |
| 949 | b | vowel only in qasim | سَاحِرَانِ | سَٰحِرَانِ |
| 950 | a | letter | وَيُجْبَى | وَيُجۡبَيٰ |
| 950 | b | letter | الْفَتْحَتَيْنِ | الفَتْحَيْنِ |
| 951 | a | vowel only in zubi | وَعِنْدِيْ | وَعِندِي |
| 952 | a | letter | يَرَوْا | تَرَوۡاْ |
| 952 | b | vowel only in qasim | ـنَشَاءَةِ | ـنَشَآءَةِ |
| 952 | b | shadda | حَقًاّ | حَقّاً |
| 953 | a | tanween | مَوَدَّةً | مَوَدَّةٌ |
| 954 | b | letter | آيَةٌ | ءَايَتٞ |
| 954 | b | shadda, vowel only in zubi | مِنْ | مِّن |
| 954 | b | shadda | رَبِّهِ | رَّبِّهِۦ |
| 955 | a | letter | وَنَقُولُ | وَيَقُولُ |
| 956 | a | vowel conflict | نُبُوِّئَنْـ | نُبَوِّئَنۡـ |
| 957 | a | vowel conflict | وَإِسْكَانُ | وَإِسْكَانَ |
| 958 | a | vowel only in qasim | وَعَاقِبَةُ | وَعَٰقِبَةُ |
| 958 | b | letter | نُذِيقُ | يُذِيقَ |
| 958 | b | vowel only in qasim | لِلْعَالَمِينَ | لِلۡعَٰلَمِينَ |
| 959 | a | letter | لِيَرْبُوا | لِتُرۡبُواْ |
| 959 | b | vowel only in qasim | آثَارِ | ءَاثَٰرِ |
| 960 | a | vowel only in zubi | وَيَنْفَعُ | وَيَنفَعُ |
| 960 | b | tanween | وَرَحْمَةً | وَرَحۡمَةٞ |
| 961 | a | vowel conflict | وَيَتَّخِذَ | وَيَتَّخِذُ |
| 961 | b | letter | تُصَعِّرْ | تُصَٰعِرۡ |
| 961 | b | vowel only in qasim | بِمدٍّ | بِمَدٍّ |
| 963 | a | vowel only in qasim | وَالْبَحْرُ | وَٱلۡبَحۡرُ. |
| 965 | a | letter | اللاَّءِ | ٱلَّـٰٓيِٕ |
| 969 | a | letter | الظَّنُونَ | ٱلظُّنُونَا۠ |
| 969 | a | shadda, vowel conflict, vowel only in qasim | وَالرَّ | وَٱلرۡ |
| 969 | b | letter | سُولَ | رَسُولَا۠ |
| 969 | b | vowel only in zubi | السَّبِيَلا | ٱلسَّبِيلَا۠ |
| 970 | b | vowel conflict | حُلاَ | حَلَا |
| 971 | a | tanween | إِسْوَةٌ | إِسۡوَةٍ |
| 971 | b | vowel only in qasim | يُضَاعَفْ | يُضَٰعَفۡ |
| 972 | a | vowel conflict | الْعَذَابَ | ٱلۡعَذَابِ |
| 972 | b | letter | وَتَعْمَلْ | وَيَعۡمَلۡ، |
| 972 | b | letter | نُؤْتِ | يُؤۡتِ |
| 973 | a | vowel conflict | وَقِرْنَ | وَقَرۡنَ |
| 973 | a | vowel conflict | افْتَحْ | افْتَحِ |
| 973 | a | letter | ثَوى | ثَرىً |
| 973 | b | vowel conflict | الْبَصْرِيْ | البِصْرِي، |
| 974 | a | letter | نَمَا | نَمَى، |
| 974 | a | vowel only in qasim | سَادَاتِنَا | سَادَٰتِنَا |
| 974 | a | letter | بِكَسْرَةٍ | بِكَسْرِهِ |
| 975 | a | vowel only in qasim | وَعَالِمِ | وَعَٰلِمِ |
| 975 | a | shadda, vowel only in qasim | عَلاَّمِ | عَلَّٰمِ |
| 975 | b | vowel only in zubi | مِنْ | مِن |
| 975 | b | shadda | رِجْزٍ | رِّجۡزٍ |
| 976 | b | letter | وَنَخْسِفْ | وَيَخۡسِفۡ، |
| 976 | b | letter | نَشَأْ | يَشَأۡ، |
| 976 | b | letter | نُسْقِطْ | يُسۡقِطۡ |
| 976 | b | letter | شَمْلَلَا | شُمِّلَا |
| 977 | a | vowel conflict | الرِّيحَ | ٱلرِّيحِ |
| 977 | a | vowel conflict, vowel only in zubi | مِنْسَأَتَهْ | مِنسَاتَهُۥ |
| 978 | a | vowel only in qasim | مَسَاكِنِهِمْ | مَسَٰكِنِهِمۡ |
| 979 | a | vowel only in qasim | نُجَازِي | نُجَٰزِي |
| 979 | a | vowel only in qasim | وَالْكَفُو | وَٱلۡكَفُو |
| 979 | b | vowel conflict | رَ | رُ |
| 980 | a | tanween | لِوَا | لِواً |
| 980 | a | vowel only in qasim | بَاعِدْ | بَٰعِدۡ |
| 980 | a | tanween | مُشَدَّدَا | مُشَدَّداً |
| 981 | b | vowel conflict | أَذِنَ | أُذِنَ |
| 982 | a | letter | الْغُرْفَةِ | ٱلۡغُرۡفَتِ |
| 982 | a | vowel conflict | وَيُهْمَزْ | وَيُهْمَزُ |
| 983 | b | vowel conflict | غَيْرُ | غَيۡرِ |
| 983 | b | shadda, vowel only in qasim | اللهِ | ٱللَّهِ |
| 984 | a | letter | وَنَجْزِي | وَيُجۡزَيٰ |
| 984 | b | vowel conflict | وَكُلَّ | وَكُلُّ |
| 985 | a | vowel conflict | السَّيِّئِ | ٱلسَّيِّيِٕ |
| 985 | b | vowel only in qasim | بَيِّناتٍ | بَيِّنَٰتٖ |
| 985 | b | tanween | حَقٍّ | حَقِّ |
| 986 | a | vowel only in zubi | وَتَنْزِيلُ | وَتَنزِيلُ |
| 987 | b | vowel only in qasim | وَوَالْقَمَرَ | وَوَٱلۡقَمَرَ |
| 989 | b | vowel only in qasim | ظِلاَلٍ | ظِلَٰلٍ |
| 989 | b | shadda, vowel only in qasim | اللاَّمَ | اللَّامَ |
| 991 | a | letter | وَتَنْكُسْهُ | وَنَنكُسۡهُ |
| 992 | a | vowel only in zubi | لِيُنْذِرَ | لِيُنذِرَ |
| 994 | a | shadda, vowel only in qasim | وَخَلاَّدُهُمْ | وَخَلَّادُهُمْ |
| 994 | a | vowel only in qasim | فَالْمُلْقِياَتِ | فَٱلۡمُلۡقِيَٰتِ |
| 994 | a | vowel only in qasim | فَالْـ | فَٱلۡـ |
| 994 | b | vowel only in qasim | ـمُغِيرَاتِ | ـمُغِيرَٰتِ |
| 995 | a | vowel conflict, vowel only in qasim | وَالْكَوَاكِبِ | وَٱلۡكَوَاكِبَ |
| 996 | a | vowel conflict | عَجِبْتَ | عَجِبۡتُ |
| 996 | b | vowel only in qasim | آبَاؤُنَا | ءَابَآؤُنَا |
| 997 | a | vowel conflict, vowel only in zubi | يُنْزَفُونَ | يُنزِفُونَ |
| 997 | b | vowel only in qasim | في | فِي |
| 997 | b | vowel only in qasim, vowel only in zubi | الاُخْرى | الُاخْرَى |
| 997 | b | vowel conflict | يَزِفُّونَ | يُزِفُّونَ |
| 998 | a | letter | تُرِي | تَرَىٰ |
| 999 | a | shadda, vowel conflict, vowel only in qasim | اللهَ | ٱللَّهُ |
| 999 | a | vowel conflict | رَبَّكُمْ | رَبُّكُمۡ |
| 1000 | b | vowel only in zubi | وَأَنِّيَ | وَأَنِّىَ |
| 1000 | b | vowel only in qasim | اجْمِلَا | أُجْمِلاَ |
| 1001 | a | vowel conflict | فَوَاقٍ | فُوَاقٖ |
| 1001 | b | vowel conflict | الرَّحْبُ | الرُّحْبُ، |
| 1002 | a | vowel only in qasim | وَفي | وَفِي |
| 1002 | a | vowel conflict, vowel only in qasim | دمُ | دُمْ |
| 1002 | a | letter | حُلًا | حُلىً |
| 1002 | b | vowel conflict | وَثَقَّلْ | وَثَقَّلَ |
| 1003 | a | vowel conflict | لِلْبَصْرِيْ | لِلْبِصْرِي |
| 1003 | a | vowel conflict | بَضَمٍّ | بِضَمٍّ |
| 1003 | b | vowel only in qasim | اتَّخَذْناَهُمْ | ٱتَّخَذۡنَٰهُمۡ |
| 1004 | a | vowel only in qasim | وَفَالْحَقُّ | وَفَٱلۡحَقُّ |
| 1005 | a | vowel only in qasim | سَالِمًا | سَٰلِمٗا |
| 1005 | b | vowel only in zubi | اِجْمَعْ | اجْمَعْ |
| 1006 | a | vowel only in qasim | كَاشِفاَتٌ | كَٰشِفَٰتٞ |
| 1006 | a | vowel only in qasim | مُمْسِكَاتٌ | مُمۡسِكَٰتٞ |
| 1006 | b | vowel conflict | النَّصْبُ | النَّصْبَ |
| 1007 | a | letter | قَضَى | قَضَيٰ |
| 1007 | b | tanween, vowel only in qasim | مَفَازَاتٍ | مَفَازَٰتِ |
| 1008 | a | vowel only in qasim | تَأْمُرونِيْ | تَأۡمُرُونِى |
| 1008 | b | vowel only in zubi | النَّبإ | النَّبَا |
| 1009 | b | vowel only in qasim | يَا | يَٰ |
| 1009 | b | letter | فَحَصِّلَا | مُحَصِّلاَ |
| 1010 | a | letter | وَيَدْعُونَ | وَتَدۡعُونَ |
| 1014 | a | vowel only in qasim | وَادْعُونِيْ | وَٱدۡعُونِي |
| 1014 | b | shadda, vowel only in zubi | لَعَلِيِّ | لَعَلِّى |
| 1016 | b | vowel only in qasim | وَأَعْدَاءُ | وَأَعۡدَآءُ |
| 1017 | a | vowel only in qasim | ثَمَرَاتٍ | ثَمَرَٰتٖ، |
| 1017 | a | letter | شُرَكَائِىَ | شُرَكَآءِيَ |
| 1018 | a | letter | وَيُوحَى | وَيُوحَيٰ |
| 1018 | b | vowel conflict | يَعْلَمَ | يَعۡلَمُ |
| 1019 | a | vowel only in qasim | في | فِي |
| 1019 | b | vowel only in qasim | كَبَائِرَ | كَبَٰٓئِرَ |
| 1020 | a | vowel conflict | وَيُرْسِلَ | وَيُرۡسِلُ |
| 1020 | b | vowel conflict, vowel only in zubi | وَأَنْ | وَإِن |
| 1020 | b | vowel only in zubi | كُنْتُمْ | كُنتُمۡ |
| 1021 | a | letter | وَيَنْشَأُ | وَيَنشَؤُاْ |
| 1021 | b | vowel only in qasim | عِبَادُ | عِبَٰدُ |
| 1021 | b | vowel only in zubi | عِنْدَ | عِندَ |
| 1022 | a | letter | أَؤُشْهِدوا | أَ۟شۡهِدُواْ |
| 1023 | a | vowel only in qasim | قَالَ | قَٰلَ |
| 1023 | a | letter | كُفْؤٍ | كُفْءٍ، |
| 1024 | a | vowel only in qasim | جَاءَنَا | جَآءَنَا |
| 1025 | a | vowel conflict | سَلَفًا | سُلُفٗا |
| 1026 | a | letter | ءَآلِهةٌ | ءَأَٰلِهَتٞ |
| 1027 | b | letter | تُرْجَعُونَ | يُرۡجَعُونَ |
| 1028 | b | letter | يَعْلَمُونَ | تَعۡلَمُونَ |
| 1029 | a | letter | عُلًا | عُلىً |
| 1029 | b | letter | السَّموَاتِ | ٱلسَّمَٰوَٰتِ |
| 1030 | a | vowel conflict | إِنَّكَ | أَنَّكَ |
| 1030 | b | vowel conflict | الْيَاءُ | اليَاءَ |
| 1031 | a | vowel only in qasim | آيَاتٍ | ءَايَٰتٍ |
| 1031 | b | vowel conflict, vowel only in qasim | اَوَّلَا | اُوِّلَا |
| 1032 | a | letter | لِنَجْزِيَ | لِيَجۡزِيَ |
| 1032 | a | vowel only in qasim | وَغِشَاوَةً | وَغِشَٰوَةٗ |
| 1033 | a | vowel conflict, vowel only in qasim | وَوَالسَّاعَةَ | وَوَٱلسَّاعَةُ |
| 1033 | b | vowel conflict | ـمُحَسِّنُ | ـمُحَسَّنُ |
| 1033 | b | vowel only in qasim | إِحْسَانًا | إِحۡسَٰنًا |
| 1034 | a | vowel conflict | أَحْسَنَ | أَحۡسَنُ |
| 1035 | a | vowel conflict | وَقَلْ | وَقُلْ |
| 1035 | b | letter | نُوَفيَهُمْ | يُوَفِّيَهُمۡ |
| 1036 | a | letter | تَرَى | يُرَىٰ |
| 1036 | b | vowel conflict, vowel only in qasim | مَسَاكِنَهُمْ | مَسَٰكِنُهُمۡ |
| 1037 | a | letter | وَلكِنِّيْ | وَلَٰكِنِّي |
| 1037 | b | letter | بَلَا | تَلاَ |
| 1038 | a | vowel only in qasim | قَاتَلُوا | قَٰتَلُواْ |
| 1039 | b | vowel only in zubi | وَأُمْلِيَ | وَأُمۡلِىَ |
| 1040 | a | letter | وَنَبْلُوَنْـ | وَيَبۡلُوَنۡـ |
| 1040 | b | letter | نَعْلَمَ | يَعۡلَمَ |
| 1040 | b | letter | وَنَبْلُوَ | وَيَبۡلُوَاْ |
| 1041 | b | vowel only in qasim | وَفي | وَفِي |
| 1041 | b | vowel only in qasim, vowel only in zubi | يُؤْتيِهِ | يُؤۡتِيهِۦ |
| 1042 | b | vowel only in qasim | كلاَمَ | كَلَٰمَ |
| 1042 | b | shadda, vowel only in qasim | اللهِ | ٱللَّهِ |
| 1043 | a | letter | شَطْأَهُ | شَطۡـَٔهُ |
| 1043 | b | vowel conflict, vowel only in zubi | فَآزَرَهُ | فَـَٔازَرَهُۥ |
| 1044 | a | vowel conflict | إذْ | اِذْ |
| 1044 | b | vowel conflict, vowel only in qasim | أَدْبَارَ | إِدۡبَٰرَ |
| 1044 | b | vowel conflict, vowel only in qasim | إذ | إِذْ |
| 1045 | a | letter | يُنَادِيْ | يُنَادِۦ |
| 1045 | a | tanween | دَلِيلاَ | دَلِيلاً |
| 1046 | a | vowel only in qasim | وَفي | وَفِي |
| 1046 | b | vowel conflict | وَقَوْمَ | وَقَوۡمِ |
| 1047 | a | vowel only in qasim | وَأَتْبَعنَا | وَأَتۡبَعۡنَٰ |
| 1047 | a | vowel only in qasim | بِوَاتَّبَعَتْ | بِ:وَٱتَّبَعَتۡ، |
| 1047 | b | vowel only in qasim | أَلَتْنَا | أَلَتۡنَـٰ |
| 1048 | a | vowel conflict | يَصْعَقُونَ | يُصۡعَقُونَ |
| 1048 | a | vowel conflict | اضُمُمْهُ | اضْمُمْهُ |
| 1048 | a | letter | وَالْمُسَيْـ | وَٱلۡمُصَۜيۡـ |
| 1050 | a | vowel only in qasim | تُمَارُونَهُ | تُمَٰرُونَهُۥ |
| 1050 | b | letter | مَناءَةَ | مَنَوٰٓءَةَ |
| 1050 | b | vowel only in zubi | وَأَحْفِلَا | وَاحْفِلاَ |
| 1051 | a | vowel only in qasim | ويَهْمِزُ | وَيَهْمِزُ |
| 1051 | a | letter | ضِيزَى | ضِئۡزَىٰ. |
| 1051 | a | vowel only in qasim | خَاشِعًا | خَٰشِعًا |
| 1051 | b | letter | يَعْلَمُونَ | تَعۡلَمُونَ |
| 1051 | b | vowel only in qasim | فطِبْ | فَطِبْ |
| 1052 | a | vowel only in qasim | وَوَالْحَبُّ | وَوَٱلۡحَبُّ |
| 1053 | b | vowel conflict, vowel only in zubi | الْمُنْشَآتُ | ٱلۡمُنشَـَٔاتُ |
| 1053 | b | vowel conflict | الشِّينُ | الشِّينَ |
| 1054 | a | letter | نَفْرُغُ | يَفۡرُغُ |
| 1055 | a | tanween | نُحَاسٌ | نُحَاسٖ |
| 1055 | b | vowel only in qasim, vowel only in zubi | الاُولَى | الُاولَى |
| 1056 | a | letter | اللَّيْثِ | لِلَّيْثِ |
| 1056 | b | vowel conflict | وَنَصُّ | وَنَصَّ |
| 1056 | b | vowel conflict | اللَّيْثِ | اللَّيْثُ |
| 1057 | a | vowel conflict | أَيُّهُمَا | أَيَّهُمَا |
| 1058 | a | vowel conflict | وَآخِرُهَا | وَآخِرَهَا |
| 1058 | a | vowel only in qasim | الْجَلاَلِ | ٱلۡجَلَٰلِ |
| 1060 | a | vowel conflict | شُرْبَ | شَرۡبَ |
| 1060 | b | tanween | صَفَا | صَفاً |
| 1061 | b | vowel conflict | أَخَذَ | أُخِذَ |
| 1062 | a | vowel only in qasim | ومِيثَاقُكُمْ | وَمِيثَٰقُكُمۡ |
| 1062 | a | vowel only in zubi | وَأَنْـ | وَأَنـ |
| 1063 | a | vowel only in qasim | وَيؤْخَذُ | وَيُؤۡخَذُ |
| 1065 | a | vowel only in qasim | وَفي | وَفِي |
| 1065 | a | vowel only in qasim | يَتَنَاجَوْنَ | يَتَنَٰجَوۡنَ |
| 1066 | a | vowel conflict | وَكَسْرُ | وَكَسْرَ |
| 1066 | a | vowel only in zubi | انْشِزُوا | ٱنشِزُواْ |
| 1066 | a | vowel conflict | صَفْوَ | صَفْوُ |
| 1066 | b | letter | عُلًا | عُلىً |
| 1066 | b | vowel only in qasim | المَجَالِسِ | ٱلۡمَجَـٰلِسِ |
| 1067 | a | vowel only in qasim | وَفي | وَفِي |
| 1067 | b | tanween | دُوْلَةً | دُولَةٞ |
| 1067 | b | letter | يَكُونَ | تَكُونَ |
| 1068 | a | vowel conflict | وَكَسْرَ | وَكَسْرُ |
| 1068 | a | vowel only in qasim | جِدَارٍ | جِدَٰرٖ |
| 1068 | a | vowel conflict | وَالْفَتْحَ | وَالفَتْحُ |
| 1068 | b | vowel conflict | أُسْوَةٍ | إِسْوَةٍ، |
| 1068 | b | vowel conflict | بَياءٍ | بِيَاءٍ |
| 1069 | b | vowel conflict | كُمِّلَا | كَمَّلَا |
| 1070 | a | vowel only in qasim | وَفى | وَفِي |
| 1071 | a | shadda, vowel only in qasim | وَلِله | وَلِلَّهِ |
| 1071 | a | vowel only in qasim | زِد | زِدْ |
| 1071 | a | vowel only in zubi | وَأَنْصَارَ | وَأَنصَارَ |
| 1071 | a | letter | نَوِّنًا | نَوِّنَنْ |
| 1072 | a | vowel only in zubi | وَأَنْصَارِيْ | وَأَنصَارِي |
| 1074 | a | vowel only in qasim | وَبَالِغُ | وَبَٰلِغُ |
| 1074 | b | shadda, vowel conflict | وَبِالتَّخَّفِيفِ | وَبِالتَّخْفِيفِ |
| 1075 | a | vowel only in zubi | مِنْ | مِن |
| 1076 | a | letter | وَآمِنْتُمُو | وَءَامِنتُمُۥ |
| 1076 | b | vowel only in qasim | وَفي | وَفِي |
| 1076 | b | vowel only in qasim, vowel only in zubi | الاُولَى | الُاولَى |
| 1078 | a | vowel conflict | يَزْلِقُونَكَ | يُزۡلِقُونَكَ |
| 1078 | b | vowel only in zubi | وَمَنْ | وَمَن |
| 1079 | a | letter | وَيَخْفَى | وَيَخۡفَيٰ |
| 1079 | a | tanween | شِفَاءً | شِفَاءٌ، |
| 1079 | b | vowel only in qasim | وَسُلْطَانِيَهْ | وَسُلۡطَٰنِيَهۡ |
| 1079 | b | vowel only in qasim | فَتُوصلَا | فَتُوصَلَا |
| 1082 | a | tanween | وَنَزَّاعَةً | وَنَزَّاعَةٞ |
| 1082 | a | vowel only in qasim | فَارْفعْ | فَارْفَعْ |
| 1082 | b | letter | شَهَادَاتِهِمْ | شَهَـٰدَتِهِمۡ |
| 1083 | a | letter | إِلى | إِلَىٰ |
| 1083 | a | vowel conflict | فَاضُمُمْ | فَاضْمُمْ |
| 1083 | a | letter | عُلا | عُلَى |
| 1083 | b | vowel conflict | وُدًّا | وَدّٗا |
| 1084 | a | letter | دُعَائِيْ | دُعَآءِى |
| 1084 | b | vowel only in qasim | علَا | عَلاَ |
| 1085 | a | vowel only in qasim | المَسَاجِدَ | ٱلۡمَسَٰجِدَ |
| 1085 | b | vowel conflict, vowel only in qasim | أَنّهُ | إِنَّهُۥ |
| 1086 | a | letter | وَنَسْلُكْهُ | وَيَسۡلُكۡهُ |
| 1086 | a | vowel only in qasim | قَالَ | قَٰلَ |
| 1086 | b | tanween | نَصًّا | نَصّاً |
| 1088 | a | letter | وَوَطْئًا | وَوَطۡـٔٗا |
| 1088 | a | vowel only in qasim | وِطَاءً | وِطَآءٗ |
| 1090 | a | vowel only in qasim | وَوَالرِّجْزَ | وَوَٱلرِّجۡزَ |
| 1090 | a | vowel only in zubi | إذْ | اذۡ |
| 1091 | a | vowel only in zubi | مُسْتَنْفِرَهْ | مُسۡتَنفِرَهۡ |
| 1091 | b | vowel conflict | الْغَيْبَ | الغَيْبُ |
| 1091 | b | vowel conflict | خُصَّ | خَصَّ |
| 1091 | b | vowel conflict | وَخُلِّلَا | وَخَلَّلَا |
| 1092 | b | letter | يُمْنَى | يُمۡنَيٰ |
| 1092 | b | letter | عُلًا | عُلىً |
| 1093 | a | letter | سَلاَسِلَ | سَلَٰسِلَاْ |
| 1093 | b | vowel only in qasim | وَبَالْقَصْرِ | وَبِالقَصْرِ |
| 1093 | b | tanween | هُدىً | هُدَى |
| 1093 | b | vowel conflict | خُلْفُهُمْ | خُلْفِهِمْ |
| 1096 | a | vowel conflict, vowel only in qasim | وَعَالِيهِمُ | وَعَٰلِيهِمَ |
| 1096 | b | letter | حُلًا | حُلىً |
| 1097 | b | vowel only in qasim | تَشَاءُونَ | تَشَآءُونَ |
| 1097 | b | letter | حِصْنٌ | حِصْناً. |
| 1097 | b | letter | وُقِّتَتْ | أُقِّتَتۡ |
| 1098 | a | letter | ثَقِيلًا | ثَقِيلٌ |
| 1098 | b | vowel only in qasim | وَجِماَلاَتٌ | وَجِمَٰلَٰتٞ |
| 1099 | a | vowel only in qasim | لاَبِثِينَ | لَٰبِثِينَ |
| 1099 | a | vowel only in qasim | وقُلْ | وَقُلْ |
| 1099 | b | vowel only in qasim | كِذَابًا | كِذَٰبٗا |
| 1100 | a | vowel only in qasim | وَفي | وَفِي |
| 1100 | a | vowel conflict | رَبُّ | رَبِّ |
| 1100 | a | letter | السَّموَاتِ | ٱلسَّمَٰوَٰتِ |
| 1100 | b | letter | الرَّحْمنِ | ٱلرَّحۡمَٰنِ |
| 1101 | a | vowel only in qasim | وَنَاخِرَةً | وَنَٰخِرَةٗ |
| 1101 | a | vowel only in qasim | وَفي | وَفِي |
| 1101 | b | letter | تَزَكَّى | تَزَكَّىٰ. |
| 1101 | b | letter | تَصَدَّى | تَصَدَّىٰ |
| 1102 | a | vowel only in zubi | فَتَنْفَعُهُ | فَتَنفَعُهُ |
| 1103 | a | vowel conflict | نُشِّرْتْ | نُشِّرَتۡ |
| 1105 | a | vowel only in qasim | فَاكهِينَ | فَـٰكِهِينَ |
| 1105 | a | tanween, vowel conflict | عُلًا | عَلَا، |
| 1105 | a | vowel only in qasim | وَخِتاَمُهُ | وَخِتَٰمُهُ |
| 1106 | a | letter | يُصَلَّى | يُصَلَّىٰ |
| 1106 | b | vowel conflict | تَرْكَبَنَّ | تَرۡكَبُنَّ |
| 1108 | a | vowel only in qasim | يُوْثِرُونَ | يُؤۡثِرُونَ |
| 1108 | a | letter | وَتَصْلَى | وَتُصۡلَىٰ |
| 1108 | b | letter | تُسْمَعُ | يُسۡمَعُ |
| 1108 | b | vowel conflict | جِلَا | جَلَا |
| 1109 | a | letter | أُولُوا | أُولُو |
| 1109 | a | vowel only in qasim | وَلاَغِيَةٌ | وَلَٰغِيَةٞ |
| 1110 | a | vowel only in qasim | وَالْوَتْرِ | وَٱلۡوَتۡرِ |
| 1110 | b | vowel conflict | اليَحْصَبْيُّ | اليَحْصَبِيُّ |
| 1111 | a | vowel only in zubi | بَلْ | بَل |
| 1111 | a | shadda, vowel only in qasim | لاَ | لَّا |
| 1111 | b | letter | يَحُضُّونَ | تَحُضُّونَ |
| 1112 | b | vowel conflict | وَفَكَّ | وَفَكُّ |
| 1113 | b | vowel only in qasim | إِطْعَامٌ | إِطۡعَٰمٞ |
| 1114 | a | tanween, vowel conflict | حِمىً | حَمَى. |
| 1114 | b | letter | بِالْفاَءِ | بِالفَا |
| 1114 | b | letter | وَانْجَلَا | وَأَبْجَلَا |
| 1115 | a | tanween | مُجاَهِدِ | مُجَاهِدٍ |
| 1116 | a | vowel conflict, vowel only in qasim | وَمَطلَعِ | وَمَطۡلِعِ |
| 1116 | a | shadda, vowel only in qasim | اللاَّمِ | اللَّامِ |
| 1116 | a | vowel only in qasim | وَحَرْفَي | وَحَرْفَيِ |
| 1117 | a | vowel only in qasim | في | فِي |
| 1117 | a | vowel only in qasim, vowel only in zubi | الاُولَى | الُاولَى |
| 1118 | a | vowel conflict | عَمَدٍ | عُمُدٖ |
| 1118 | b | vowel only in qasim | لإِيلاَفِ | لِإِيلَٰفِ |
| 1119 | a | letter | وَإِيلاَفِ | وَإِۦلَٰفِ |
| 1119 | a | vowel only in qasim | في | فِي |
| 1120 | a | letter | وَهَا | وَهَاءَ |
| 1120 | a | vowel only in qasim, vowel only in zubi | بِالاِسْكَانِ | بِالِاسْكَانِ |
| 1121 | a | shadda, vowel only in qasim | اللهِ | اللَّهِ |
| 1121 | b | vowel only in qasim | فَتُمحِلَا | فَتُمْحِلَا |
| 1122 | b | vowel only in qasim | لِلْعَبدِ | لِلْعَبْدِ |
| 1124 | a | vowel only in qasim | ومَنْ | وَمَنْ |
| 1125 | a | shadda, vowel only in qasim | إِلاَّ | إِلَّا |
| 1125 | a | letter | افْتِتَاحُهُ | فْتِتَاحُهُ |
| 1125 | b | vowel conflict | حِلًاّ | حَلاًّ |
| 1127 | a | vowel only in qasim | في | فِي |
| 1132 | a | shadda, vowel only in qasim | اللهُ | «أَللَّهُ |
| 1132 | b | vowel conflict | لَأَحْمَدَ | لِأَحْمَدَ |
| 1132 | b | letter | فَهَلَّلَا | فَهَيْلَلَا |
| 1133 | a | vowel only in qasim | بِهذَا | بِهَذَا |
| 1135 | a | vowel only in qasim, vowel only in zubi | رِيَبةٌ | رِيبَةٌ |
| 1135 | b | vowel only in qasim, vowel only in zubi | الاِبْتِلَا | الِابْتِلاَ |
| 1136 | a | letter | الأُولَى | الأُلَى |
| 1137 | a | vowel conflict, vowel only in qasim | فَابْدَأْ | فَأَبْدَأُ |
| 1138 | b | vowel conflict | جُمِّلَا | جَمَّلاَ |
| 1139 | a | vowel conflict | وَفَوْقَهْ | وَفَوْقَهُ |
| 1141 | b | tanween | مُقَلَّلًا | مُقَلَّلاَ |
| 1143 | a | vowel conflict | مَدْخَلٌ | مُدْخَلٌ |
| 1143 | b | vowel only in qasim | سِيبَويْهِ | سِيبَوَيْهِ |
| 1146 | a | shadda, vowel only in qasim | الثنَايَا | الثَّنَايَا |
| 1146 | b | vowel conflict | مِنْ | مِنَ |
| 1148 | a | shadda, vowel conflict | أَوَّلٍ | أُوَلٍ |
| 1148 | b | tanween | كِلْمَةٌ | كِلْمَةُ |
| 1148 | b | vowel only in qasim | اَوَّلَا | أَوَّلَا |
| 1150 | a | tanween | ثَناَ | ثَناً |
| 1150 | b | vowel conflict | سَجْلُ | سَجْلَ |
| 1150 | b | tanween | وُجُوهِ | وُجُوهٍ |
| 1151 | b | letter | يُجْتَلَى | تُجْتَلَى |
| 1152 | a | vowel conflict | وَرَخْوٌ | وَرِخْوٌ |
| 1154 | a | vowel conflict | رَخْوٍ | رِخْوٍ |
| 1154 | b | vowel conflict | وَالرَّخْوِ | وَالرِّخْوَ |
| 1155 | a | vowel conflict | عُلُوٍ | عُلْوٍ، |
| 1158 | b | vowel conflict | جَدٍّ) | جِدٍّ |
| 1159 | a | tanween | كُلُّ | كُلٌّ |
| 1159 | b | vowel only in qasim | فَهذَا | فَهَذَا |
| 1160 | a | shadda, vowel only in qasim | وَفقَ | وَفَّقَ |
| 1160 | a | shadda, vowel only in qasim | اللهُ | اللَّهُ |
| 1160 | b | vowel only in qasim | لإِكْمَالِهَا | لِإِكْمَالِهَا |
| 1161 | b | letter | مِائَةٍ | مِئَةٍ |
| 1163 | a | shadda, vowel only in qasim | اللهِ | اللَّهِ |
| 1163 | a | vowel conflict | الْخَلْقِ | الخُلْقِ |
| 1164 | a | vowel only in qasim | وَلكِنَّهَا | وَلَكِنَّهَا |
| 1164 | a | letter | كُفْؤَهَا | كُفْئَهَا |
| 1165 | a | shadda, vowel only in qasim | إِلاَّ | إِلَّا |
| 1166 | a | letter | الرَّحمنُّ | الرَّحْمَـٰنُ |
| 1166 | a | tanween | حَيًّا | حَيّاً |
| 1166 | b | vowel only in qasim | لِلإِنْصَافِ | لِلْإِنْصَافِ |
| 1167 | a | shadda, vowel only in qasim | اللهُ | اللَّهُ |
| 1169 | b | shadda, vowel only in qasim | اللهُ | أَللَّهُ |
| 1170 | b | shadda, vowel only in qasim | لِلهِ | لِلَّهِ |
| 1171 | a | shadda, vowel only in qasim | اللهِ | اللَّهِ |
| 1171 | b | vowel conflict | مُتَنَخِّلَا | مُتَنَخَّلاَ |

**Half-verses whose word split differs** (Zu'bi's word count ≠ Al-Qasim's):

| Verse | Half | Zu'bi | Al-Qasim |
|---|---|---|---|
| 583 | b | لاَ تَحْسَبَنَّ الْغَيْبُ كَيْفَ سَمَا اعْتَلَا | ـنَ، لَا يَحۡسِبَنَّ الغَيْبُ كَيْفَ سَمَا اعْتَلَى |
| 651 | a | وَفي دَرَجَاتِ النُّونُ مَعْ يُوسُفٍ | وَفِي دَرَجَٰتِ النُّونُ مَعْ يُوسُفٍ ثَوَى |
| 651 | b | ثَوَى وَوَالَّليْسَعَ الْحَرْفاَنِ حَرِّكْ مُثَقِّلَا | وَوَٱلۡيَسَعَ الحَرْفَانِ حَرِّكْ مُثَقِّلاَ |
| 733 | a | وَمِنْ تَحْتِهَا المَكِّيْ | وَمِن تَحۡتِهَا المَكِّي يَجُرُّ وَزَادَ مِنۡ |
| 733 | b | يَجُرُّ وَزَادَ مِنْ صَلاَتَكَ وَحِّدْ وَافْتَحِ التَّا شَذًّا عَلَا | صَلَوٰتَكَ وَحِّدْ وَافْتَحِ التَّا شَذاً عَلَا |
| 919 | a | وَثَانِيْ ثَلاَثَ ارْفَعْ سِوَى صُحْبَةٍ | وَثَانِي ثَلَٰثُ ارْفَعْ سِوَى صُحْبَةٍ وَقِفْ |
| 919 | b | وَقِفْ وَلاَ وَقْفَ قَبْلَ النَّصْبِ إِنْ قُلْتَ أُبْدِلَا | وَلَا وَقْفَ قَبْلَ النَّصْبِ إِنْ قُلْتَ أُبْدِلَا |
| 999 | b | وَرَبَّ وَإِلْيَاسِينَ بِالْكَسْرِ وُصِّلَا | وَرَبُّ، وَإِلۡ يَاسِينَ بِالكَسْرِ وُصِّلاَ |

### 2b. Quranic (Uthmani) spelling

| Verse | Half | Zu'bi | Al-Qasim |
|---|---|---|---|
| 452 | a | وَآدَمَ | وَءَادَمَ |
| 458 | a | النَّبِيءِ | ٱلنَّبِيٓءِ |
| 458 | a | النُّبُو | ٱلنُّبُوٓ |
| 465 | a | وَتَظَّاهَرُونَ | وَتَظَّٰهَرُونَ |
| 467 | a | الْقُدْسُ | ٱلۡقُدۡسُ |
| 470 | b | الْغَيْثَ | ٱلۡغَيۡثَ |
| 496 | a | ادْعُوا | ٱدۡعُواْ، |
| 496 | a | اخْرُجْ | ٱخۡرُجۡ، |
| 496 | a | اعْبُدُوا | ٱعۡبُدُواْ |
| 496 | b | اسْتُهْزِئَ | ٱسۡتُهۡزِئَ |
| 498 | b | الْبِرُّ | ٱلۡبِرُّ |
| 499 | a | اْلبِرَّ | ٱلۡبِرَّ |
| 507 | a | الْ | ٱلۡ |
| 515 | a | الْخَلْقِ | ٱلۡخَلۡقِ |
| 523 | a | اعْلَمْ | ٱعۡلَمۡ |
| 528 | b | وَيَرْوِى | وَيَرْوِي |
| 545 | b | وَبِيْ | وَبِى |
| 546 | a | التَّوْرَاةَ | ٱلتَّوۡرَىٰةَ |
| 548 | b | الدِّينَ | ٱلدِّينَ |
| 550 | a | المَيْتِ | ٱلۡمَيۡتِ |
| 554 | a | فَنَادَاهُ | فَنَادَىٰهُۥ |
| 566 | a | الْبَيْتِ | ٱلۡبَيۡتِ |
| 572 | a | الرُّعْبِ | ٱلرُّعۡبِ |
| 582 | a | وَبِالزُّبُرِ | وَبِٱلزُّبُرِ |
| 582 | a | وَبِالْـ | وَبِٱلۡـ |
| 586 | a | وَيَاآتُها | وَيَاءَاتُهَا: |
| 599 | b | الْبُخْلِ | ٱلۡبُخۡلِ |
| 605 | b | أُولِيْ | أُوْلِى |
| 605 | b | فِى | فِي |
| 606 | a | فِى | فِي |
| 608 | a | وَيَصَّالَحَا | وَيَصَّٰلَحَا |
| 611 | b | فِي | فِى |
| 611 | b | الدَّرْكِ | ٱلدَّرۡكِ |
| 613 | a | الزَّبُورِ | ٱلزَّبُورِ |
| 617 | a | السُّحْتِ | ٱلسُّحۡتِ |
| 626 | a | وَكَفَّارَةٌ | وَكَفَّٰرَةٞ |
| 627 | a | اسْتُحِقَّ | ٱسۡتُحِقَّ |
| 627 | b | الأَوَّلِينَ | ٱلۡأَوَّلِينَ |
| 628 | a | الْغُيُوبِ | ٱلۡغُيُوبِ |
| 628 | a | الْـ | ٱلۡـ |
| 631 | a | وَإِنِّي | وَإِنِّى |
| 640 | a | وَبِالْغُدْوَةِ | وَبِٱلۡغُدۡوَةِ |
| 643 | b | تَوَفَّاهُ | تَوَفَّىٰهُ |
| 676 | a | المَعْزِ | ٱلۡمَعۡزِ |
| 679 | b | وَيَاآتُهَا | وَيَاءَاتُهَا: |
| 680 | a | إِنِّيْ | إِنِّى |
| 693 | b | سَحَّارٍ | سَحَّـٰرٍ |
| 698 | b | الرُّشْدِ | ٱلرُّشۡدِ |
| 701 | a | ابْنَ | ٱبۡنَ |
| 706 | a | ذُرِّيَّاتِ | ذُرِّيَّٰتِ |
| 713 | a | وَإِنِّيْ | وَإِنِّى |
| 718 | b | الْعُدْوَةِ | ٱلۡعُدۡوَةِ |
| 724 | b | إِنِّيْ | إِنِّى |
| 732 | a | السَّوْءِ | ٱلسَّوۡءِ |
| 735 | a | الَّذِينَ | ٱلَّذِينَ |
| 749 | a | النَّاسَ | ٱلنَّاسَ |
| 751 | a | السِّحْرِ | ٱلسِّحۡرِ |
| 754 | b | وَإِنِّي | وَإِنِّى |
| 754 | b | وَلِي | وَلِى |
| 765 | a | اسْرِ | ٱسۡرِ |
| 770 | a | وَيَاآتُهاَ | وَيَاءَاتُهَا: |
| 770 | a | وَإِنِّيْ | وَإِنِّى |
| 771 | a | شِقَاقِيْ | شِقَاقِى |
| 778 | b | الْمُخْلِصِينَ | ٱلۡمُخۡلِصِينَ |
| 785 | a | وَأَنِّيْ | وَأَنِّى |
| 785 | b | أَرَانِيْ | أَرَىٰنِي |
| 786 | a | إِخْوَتِيْ | إِخۡوَتِى، |
| 786 | a | حُزْنِيْ | حُزۡنِى، |
| 786 | a | سَبِيلِيْ | سَبِيلِىَ، |
| 786 | a | بِيْ | بِى، |
| 786 | a | وَلِيْ | وَلِى |
| 786 | b | أَبِيْ | أَبِى |
| 796 | b | الْكُفَّارُ | ٱلۡكُفَّٰرُ |
| 797 | a | الَّذِي | ٱلَّذِي |
| 801 | b | لِيْ | لِى، |
| 801 | b | إِنِّيْ | إِنِّى، |
| 803 | a | الْ | ٱلۡـ |
| 807 | b | بَناتِيْ | بَنَاتِى |
| 807 | b | إِنِّيْ | إِنِّىَ |
| 809 | b | يَتَوَفَّاهُمْ | يَتَوَفَّىٰهُمۡ |
| 813 | b | الَّذِينَ | ٱلَّذِينَ |
| 817 | a | وَيُلَقَّاهُ | وَيُلَقَّىٰهُۥ |
| 824 | a | حِميً | حِمىً |
| 835 | a | وَتَزَّاوَرُ | وَتَزَّٰوَرُ |
| 840 | a | الْحَقِّ | ٱلۡحَقِّ |
| 846 | b | لَدُنِّي | لَدُنِّى |
| 854 | b | الصُّدْفَيْنِ | ٱلصُّدۡفَيۡنِ |
| 859 | a | دُونِيْ | دُونِى |
| 864 | b | الْحَقِّ | ٱلۡحَقِّ |
| 870 | a | وَإِنِّيْ | وَإِنِّى |
| 870 | b | وَآتَانِيْ | وَءَاتَىٰنِي |
| 871 | a | امْكُثُوا | ٱمۡكُثُواْ |
| 872 | b | اخْتَرْتُكَ | ٱخۡتَرۡتُكَ |
| 886 | a | إِنِّيْ | إِنِّى |
| 886 | a | لِيْ | لِى |
| 892 | b | إِنِّيْ | إِنِّى، |
| 904 | a | الْعَظْمِ | ٱلۡعَظۡمِ، |
| 918 | a | اسْتُخْلِفَ | ٱسۡتُخۡلِفَ |
| 925 | a | ذُرِّيَّاتِنَا | ذُرِّيَّٰتِنَا |
| 931 | b | أَبِيْ | أَبِى، |
| 931 | b | إِنِّيْ | إِنِّى |
| 940 | a | النَّاسَ | ٱلنَّاسَ |
| 943 | a | وَآتُوهُ | وَءَاتُوهُ |
| 944 | a | وَمَالِيْ | وَمَالِى |
| 944 | a | وَإِنِّيْ | وَإِنِّى |
| 944 | b | لِيَبْلُوَنِي | لِيَبۡلُوَنِى |
| 947 | b | الرَّهْبِ | ٱلرَّهۡبِ |
| 951 | b | لَعَلِّيْ | لَعَلِّى |
| 952 | a | النْـ | ٱلنۡـ |
| 967 | a | وَتَظَّاهَرُونَ | وَتَظَّٰهَرُونَ |
| 970 | b | وَآتَوْهَا | وَءَاتَوۡهَا |
| 982 | a | التْـ | ٱلتۡـ |
| 983 | a | وَأَجْرِىْ | وَأَجۡرِي، |
| 1000 | b | وَإِنِّيْ | وَإِنِّى |
| 1003 | a | وَآخَرُ | وَءَاخَرُ |
| 1004 | a | فِى | فِي |
| 1004 | a | لِيْ | لِى |
| 1004 | b | وَإِنِّيْ | وَإِنِّى |
| 1004 | b | إِلَى | إِلَىٰ |
| 1009 | a | تَأْمُرُونِي | تَأۡمُرُونِى، |
| 1009 | a | أَرَادَنِيْ | أَرَادَنِى |
| 1009 | b | وَإِنِّيْ | وَإِنِّى |
| 1011 | b | الْفَسَادَ | ٱلۡفَسَادَ |
| 1014 | b | مَالِيْ | مَالِى |
| 1014 | b | إِلى | إِلَىٰ |
| 1025 | b | فِى | فِي |
| 1030 | a | اعْتِلُوهُ | ٱعۡتِلُوهُ |
| 1030 | b | إِنِّيْ | إِنِّى |
| 1030 | b | وَلِيْ | وَلِى |
| 1038 | b | آسِنٍ | ءَاسِنٖ |
| 1039 | a | آنِفًا | ءَانِفًا |
| 1046 | a | الصَّعْقَةِ | ٱلصَّعۡقَةِ |
| 1052 | a | الرَّيْحاَنُ | ٱلرَّيۡحَانُ |
| 1053 | b | وَفِى | وَفِي |
| 1064 | a | وَآتَاكُمُ | وَءَاتَىٰكُمُۥ |
| 1064 | a | الْـ | ٱلۡـ |
| 1068 | b | إِنِّيْ | إِنِّى |
| 1084 | a | وَإِنِّيْ | وَإِنِّى |
| 1107 | a | الْـ | ٱلۡـ |
| 1115 | b | رَآهُ | رَءَاهُ |
| 1116 | a | الْـ | ٱلۡـ |
| 1119 | b | وَلِى | وَلِي |
| 1120 | a | أَبِي | أَبِى |
| 1127 | b | الْمُفْلِحُونَ | ٱلۡمُفۡلِحُونَ |

## 3. Uncertain

| Verse | Half | PDF page | What is unclear | Reading used |
|---|---|---|---|---|
| 773 | b | 116 | وَتَأۡمَـۨنَا: the image shows a small nūn with a ḍamma above it; the text layer has the small high nūn (U+06E8) only. | وَتَأۡمَـۨنَا (text-layer codes kept; the ḍamma on the small nūn is not encoded) |
| 985 | a | 147 | ٱلسَّيِّيِٕ: the text layer has one yā with misplaced marks; the image shows shadda on sīn and on yā, then a yā with hamza below and kasra. | ٱلسَّيِّيِٕ (standard Uthmani spelling of the printed word) |
| 1111 | a | 167 | The words «بَل لَّا» are missing from the text layer; read from the image. No sukūn is visible on the lām of بَل. | بَل لَّا |
| 1068 | a | 161 | جِدَٰرٖ: the dagger alif is visible in the image but missing from the text layer; open or closed kasratan cannot be told apart at this size. | جِدَٰرٖ (text-layer tanwīn code kept) |
| 1084 | a | 163 | دُعَآءِى: the final yā looks undotted in the image; the text layer says ي. | دُعَآءِى |
| 1047 | b | 158 | أَلَتۡنَـٰ: the أَ was missing from the text layer; the form of the sukūn on تـ is from the text layer. | أَلَتۡنَـٰ |
| 1097 | b | 165 | أُقِّتَتۡ: the text layer was garbled («ااۥُ.قِّتَتۡ»); rebuilt from the image. | أُقِّتَتۡ |

- Headings 78 and 79: «النَّبَأَ» — the image shows alif with a hamza and a fatḥa-like stroke above; the text layer has «النَّبَاَ» (no hamza). Written «النَّبَأَ».

## 4. Image vs text layer

Systematic text-layer faults, fixed by script and checked on the image:
- **lam-alif ligatures**: the font maps some لا ligatures to one letter only (pypdf keeps ل, PDFKit keeps ا). The missing letter is restored only where the Zu'bi skeleton and the other extraction prove it.
- **Allah ligature** (اللَّه): the text layer drops the هـ and scatters the marks. Rebuilt as «ٱللَّهِ / ٱللَّهُ / ٱللَّهَ / لِلَّهِ» with the case vowel seen in the image.
- **Detached marks and tanwīn**: hamza, fatḥa and the tanwīn of «اً» are sometimes stored away from their letter; they are moved back to their letter.
- **Ornament glyphs**: after 34 verses (the ends of the ياءات الإضافة lists and the last verse) the text layer has three control or private-use codes (U+001A / U+F05F) for a printed ornament. They were removed. Verses: 545, 586, 613, 631, 713, 724, 737, 754, 771, 786, 807, 829, 859, 870, 886, 892, 902, 926, 931, 944, 951, 957, 992, 1004, 1009, 1017, 1030, 1037, 1051, 1077, 1114, 1120, 1159, 1173.
- **Honorific glyphs in headings** (عليه السلام, ﷻ and similar after some surah names) are not in the text layer and are not stored. «ﷺ» in heading 73 is in the text layer and is kept.

Verse-level corrections where the image overrode the text layer (text layer → stored):

| Verse | Half | Text layer | Stored (from the image) | Note |
|---|---|---|---|---|
| 457 | a | وَذَكِّرْ هُنَا أَصْلاً وَلِلشَّامِ أَنَّثُواءَ | وَذَكِّرْ هُنَا أَصْلاً وَلِلشَّامِ أَنَّثُوا | hamza of the split word belongs to 458b |
| 458 | b | ةِ الهَمْزَ كُلٌّ غَيْرَ نَافِعٍ اَبْدَلَا | ءَةِ الهَمْزَ كُلٌّ غَيْرَ نَافِعٍ اَبْدَلَا | split word ٱلنُّبُوٓ/ءَةِ as printed |
| 484 | b | واْوَٱتَّخَذُوَ بِالفَتْحِ عَمَّ وَأَوْغَلَا | وَوَٱتَّخَذُواْ بِالفَتْحِ عَمَّ وَأَوْغَلَا | image: order of letters |
| 486 | b | فَأمۡتِعُهُۥ وَصَّيٰ بِ:وۡصَيٰ كَمَا عْتَلَ | فَأُمۡتِعُهُۥ، أَوۡصَيٰ بِ:وَصَّيٰ كَمَا اعْتَلَى | image: word order, missing letters |
| 500 | b | طَعَامٍِ لَدَى غُصْنٍ دَنَا وَتَذَلَّلاَ | طَعَامِ لَدَى غُصْنٍ دَنَا وَتَذَلَّلاَ | image: single kasra |
| 506 | a | وَفَتْحُكَ سِينَ ٱلسَّلۡمِ صْلُ رِضاًأَ دَنَا | وَفَتْحُكَ سِينَ ٱلسَّلۡمِ أَصْلُ رِضاً دَنَا | image: hamza belongs to أَصْلُ image: أُ lost |
| 506 | b | وَحَتَّيٰ يَقُولَ الرَّفْعُ فِي اللَّامِ وِّلاَ | وَحَتَّيٰ يَقُولَ الرَّفْعُ فِي اللَّامِ أُوِّلاَ | image: hamza belongs to أَصْلُ image: أُ lost |
| 507 | b | أُمُورُ سَمَا نَصّا وَحَيْثُ تَنَزَّلَاً | أُمُورُ سَمَا نَصّاً وَحَيْثُ تَنَزَّلَا | image: tanween on نَصّاً |
| 528 | b | وَيَرْوِي ثَلَاًثا فِي تَلَقَّفُ مُثَّلَا | وَيَرْوِي ثَلَاثاً فِي تَلَقَّفُ مُثَّلَا | image: tanween on final alef |
| 529 | b | نَ، نَارٗا تَلَظَّيٰ، ذۡ تَلَقَّوۡنَ ثَقَّلَإِ | نَ، نَارٗا تَلَظَّيٰ، إِذۡ تَلَقَّوۡنَ ثَقَّلَا | image: إِ belongs to إِذۡ |
| 554 | b | وَمِنْ بَعْدُ إِنَّ ٱللَّهَ يُكْسَرُ فِي كِلََّاَ | وَمِنْ بَعْدُ إِنَّ ٱللَّهَ يُكْسَرُ فِي كِلَا | image: extra marks from the Allah ligature |
| 564 | b | وَبِالتَّاءِءَ اتَيۡنَٰ مَعَ الضَّمِّ خُوِّلَا | وَبِالتَّاءِ ءَاتَيۡنَٰ مَعَ الضَّمِّ خُوِّلَا | image: word boundary |
| 573 | a | وَقُلْ كُلُّهُۥ للَِِّهِ بِالرَّفْعِ حَامِداً | وَقُلْ كُلُّهُۥ لِلَّهِ بِالرَّفْعِ حَامِداً | image: Allah ligature |
| 577 | a | لَدَرَاكِ، وَقَدْ قَالَا فِي الَانْعَامِ قَتَّلُواْ | دَرَاكِ، وَقَدْ قَالَا فِي الَانْعَامِ قَتَّلُواْ | image: stray lam from 576b |
| 583 | b | ـنَلَ،ا يَحۡسِبَنَّ الغَيْبُ كَيْفَ سَمَا اعْتَلَى | ـنَ، لَا يَحۡسِبَنَّ الغَيْبُ كَيْفَ سَمَا اعْتَلَى | image: order |
| 605 | a | وَُعَمَّ فَتىً قَصْرُ ٱلسَّلَٰمِ مُؤَخَّراً | وَعَمَّ فَتىً قَصْرُ ٱلسَّلَٰمِ مُؤَخَّراً | image: stray damma |
| 609 | a | لَوَتَلۡوُۥاْ بِحَذْفِ الوَاوِ الُاولَى وَلَامَهُ | وَتَلۡوُۥاْ بِحَذْفِ الوَاوِ الُاولَى وَلَامَهُ | image: stray lam |
| 617 | b | وَكَيْفِ أَتَى أُذۡنٞ بِهِ نَافِعٌ تَلاَ | وَكَيْفَ أَتَى أُذۡنٞ بِهِ نَافِعٌ تَلاَ | image: fatha on fa (text layer had kasra) |
| 628 | a | وَضَمَّ ٱلۡغُيُوبِ يَكْسِرَانِ، عُيُونٍٱ لۡـ | وَضَمَّ ٱلۡغُيُوبِ يَكْسِرَانِ، عُيُونٍ ٱلۡـ | image: word boundary |
| 638 | a | الرَءَيۡتَ فِي الِاسْتِفْهَامِ لَا عَيْنَ رَاجِعٌ | رَءَيۡتَ فِي الِاسْتِفْهَامِ لَا عَيْنَ رَاجِعٌ | image: stray al- |
| 645 | a | قُلِ ٱللَُّهُ يُنجِيكُمۡ يُثَقِّلُ مَعْهُمُ | قُلِ ٱللَّهُ يُنجِيكُمۡ يُثَقِّلُ مَعْهُمُ | image: Allah ligature |
| 650 | a | وَخَفَّفَ نُونا قَبْلَ فِي ٱللَِّهِ مَنْ لَهُ | وَخَفَّفَ نُوناً قَبْلَ فِي ٱللَّهِ مَنْ لَهُ | image: tanween; Allah ligature |
| 651 | a | وَفِي دَرَجَٰتِ النُّونُ مَعْ يُوسُفٍثَوَى | وَفِي دَرَجَٰتِ النُّونُ مَعْ يُوسُفٍ ثَوَى | image: ثَوَى ends half a (Zu’bi puts it in half b) image |
| 651 | b |  وَوَٱلۡيَسَعَ الحَرْفَانِ حَرِّكْ مُثَقِّلاَ | وَوَٱلۡيَسَعَ الحَرْفَانِ حَرِّكْ مُثَقِّلاَ | image: ثَوَى ends half a (Zu’bi puts it in half b) image |
| 663 | a | وَفَصَّلَ ذْ ثَنَّى، يُضِلُّونَ ضُمَّ مَعْ | وَفَصَّلَ إِذْ ثَنَّى، يُضِلُّونَ ضُمَّ مَعْ | image: إِ lost image: final alef |
| 663 | b | يُضِلُّو الَّذِي فِي يُونُسٍ ثَابِتاً وَلاَ | يُضِلُّواْ الَّذِي فِي يُونُسٍ ثَابِتاً وَلاَ | image: إِ lost image: final alef |
| 668 | a | وَخَاطَبَ شَامٍ تَعۡلُمَونَ، وَمَن يَكُو | وَخَاطَبَ شَامٍ تَعۡلَمُونَ، وَمَن يَكُو | image: vowel order |
| 692 | a | أَلَ،ا وَعَاَ الحِرْمِيُّ إِنَّ لَنَا هُنَا | أَلَا، وَعَلاَ الحِرْمِيُّ إِنَّ لَنَا هُنَا | image: lam-alef ligatures |
| 708 | a | يَقُولُواْ مَعاً غَيْبٌ حَمِيدٌ، وَحَيْثُ يُلۡ | يَقُولُواْ مَعاً غَيْبٌ حَمِيدٌ، وَحَيْثُ يُلۡـ | image: lam-alef image: word split across halves image: word split |
| 708 | b | حِدُونَ بِفَتْحِ الضَّمِّ وَالكَسْرِ فُصِّلۡاَ | ـحِدُونَ بِفَتْحِ الضَّمِّ وَالكَسْرِ فُصِّلَا | image: lam-alef image: word split across halves image: word split |
| 713 | b | عَذَابِىَ،ءَ ايَٰتِي مُضَافَاتُهَا العُلَى | عَذَابِىَ، ءَايَٰتِي مُضَافَاتُهَا العُلَى | image: word boundary |
| 716 | b | ـكِنِ ٱللَُّهُ وَارْفَعْ هَاءَهُ شَاعَ كُفَّلَا | ـكِنِ ٱللَّهُ وَارْفَعْ هَاءَهُ شَاعَ كُفَّلَا | image: Allah ligature |
| 723 | b | تَكُونَ مَعَ ٱلۡأَسۡرَىٰ ٱلۡأُسَٰرَ حَلىًٰ حُلَى | تَكُونَ مَعَ ٱلۡأَسۡرَىٰ ٱلۡأُسَٰرَىٰ حُلىً حَلَا | image: order of marks/letters |
| 725 | b | وَوَحَّدَ حَقٌّ مَسۡجِدَ ٱللَِّهِ الَاوَّلَا | وَوَحَّدَ حَقٌّ مَسۡجِدَ ٱللَّهِ الَاوَّلَا | image: Allah ligature |
| 733 | a | وَمِن تَحۡتِهَا المَكِّييَجُرُّوَزَادَمِنۡ | وَمِن تَحۡتِهَا المَكِّي يَجُرُّ وَزَادَ مِنۡ | image: word boundaries image: letters order |
| 733 | b |  وٰ  صَلَتَكَ وَحِّدْ وَافْتَحِ التَّا شَذاً عَلَا | صَلَوٰتَكَ وَحِّدْ وَافْتَحِ التَّا شَذاً عَلَا | image: word boundaries image: letters order |
| 742 | a | يُفَصِّلُ يَا حَقٍّ عَلَاًَ، سَٰحِرٞ ظُبىً | يُفَصِّلُ يَا حَقٍّ عَلَا، سَٰحِرٞ ظُبىً | image: stray marks |
| 747 | b | وَفِي بَاءِ تَبۡلُو التَّاءُ شَاعَ تَنَزُّلَاْ | وَفِي بَاءِ تَبۡلُو التَّاءُ شَاعَ تَنَزُّلَا | image: no mark on final alef |
| 749 | a | وَلَٰكِنۡ خَفِيفٌ وَارْفَعِ ٱلنَّاسَ عَنْهُمَاَ | وَلَٰكِنۡ خَفِيفٌ وَارْفَعِ ٱلنَّاسَ عَنْهُمَا | image |
| 750 | a | وَيَعۡزُبُ كَسْرُ الضَّمِّ مَعْ سَبَا رَسَا | وَيَعۡزُبُ كَسْرُ الضَّمِّ مَعْ سَبَأً رَسَا | image: hamza and fathatan on alef |
| 753 | b | وَنَجۡعَلُ صِفْ،وَ الخِفُّ نُنجِ رِضاً عُلَى | وَنَجۡعَلُ صِفْ، وَالخِفُّ نُنجِ رِضاً عُلَى | image: boundary |
| 754 | b | وَرَبِّيَ مَعْ أَجۡرِي وَإِنِّى وَِلِى حُلَى | وَرَبِّيَ مَعْ أَجۡرِي وَإِنِّى وَلِى حُلَى | image |
| 758 | a | وَآخِرَ لُقْمَانٍ يُوَالِيهِ أَحْمَدٌ | وَآخِرَ لُقْمَانٍ يُوَالِيهِ أَحْمَدُ | image: single damma image |
| 758 | b | وَسَكَّنَهُ زَاكٍ، وَشَيْخُهُ الَاوَّلَآ | وَسَكَّنَهُ زَاكٍ، وَشَيْخُهُ الَاوَّلَا | image: single damma image |
| 759 | b | وَغَيۡرَ ارْفَعُوا إِلَّا لكِسَائِيَّ ذَا المَلَا | وَغَيۡرَ ارْفَعُوا إِلَّا الكِسَائِيَّ ذَا المَلَا | image: alef lost |
| 765 | a | لَّوَفَٱسۡرِ، أَنِ ٱسۡرِ الوَصْلُ أَصْلٌ دَنَا، وَهَـ | وَفَٱسۡرِ، أَنِ ٱسۡرِ الوَصْلُ أَصْلٌ دَنَا، وَهَـ | image: stray lam image: lam lost |
| 765 | b | ـهُنَا حَقٌّ اِلَّا ٱمۡرَاتُكَ ارْفَعْ وَأَبْدِا | ـهُنَا حَقٌّ اِلَّا ٱمۡرَاتُكَ ارْفَعْ وَأَبْدِلَا | image: stray lam image: lam lost |
| 766 | b | وَخِفُّ وَإِن كُلّٗا لَى صَفْوِهِ دَلاَ | وَخِفُّ وَإِن كُلّٗا إِلَى صَفْوِهِ دَلاَ | image: إِ lost |
| 769 | a | وَخَاطَبَ عَمَّا تَعۡمَلُونَبِ هَا وَآ | وَخَاطَبَ عَمَّا تَعۡمَلُونَ بِهَا وَآ | image: boundary |
| 772 | b | وَوُحِّدَ لِلْمَكِّيِّءَ ايَٰتٞ الوِلَا | وَوُحِّدَ لِلْمَكِّيِّ ءَايَٰتٞ الوِلَا | image: boundary |
| 773 | b | وَتَأۡمَـۨنَۨاَ لِلْكُلِّ يُخْفَى مُفَصَّلَا | وَتَأۡمَـۨنَا لِلْكُلِّ يُخْفَى مُفَصَّلَا | image: stray fatha; UNCERTAIN small noon carries a damma not in the text layer |
| 777 | a | وَهِيتَ بِكَسْرٍ أَصْلُ كُفْءٍوَ هَمْزُهُ | وَهِيتَ بِكَسْرٍ أَصْلُ كُفْءٍ وَهَمْزُهُ | image: boundary |
| 778 | a | وَفِي كَافَ فَتْحُ اللَّامِ فِي مُخۡلِصٗا ثَوَى | وَفِي «كَافَ» فَتْحُ اللَّامِ فِي مُخۡلِصٗا ثَوَى | image: quotes |
| 782 | a | وَيَيَاسۡ مَعاً وَٱسۡيَتَٰسَ ٱسۡيَتَٰسُواْ وَتَا | وَيَايَسۡ مَعاً وَٱسۡتَٰيَسَ ٱسۡتَٰيَسُواْ وَتَا | image: letter order |
| 783 | b | وَنُونٌ عُلاً ىً،نُوحِي إِلَيۡهِ شَذاً عَلاَ | وَنُونٌ عُلىً، نُوحِي إِلَيۡهِ شَذاً عَلاَ | image |
| 785 | a | وَأَنِّى وَِإِنِّى الخَمْسُ رَبِّي بِأَرْبَعٍ | وَأَنِّى وَإِنِّى الخَمْسُ رَبِّي بِأَرْبَعٍ | image |
| 786 | b | لَعَلِّىَ،ءَ ابَآءِي، أَبِى فَاخْشَ مَوْحَلَاّ | لَعَلِّىَ، ءَابَآءِي، أَبِى فَاخْشَ مَوْحَلَا | image: boundary image: no shadda |
| 787 | b | لَدَى خَفْضِهَا رَفْعٌ عَاَ حَقُّهُ طُلَى | لَدَى خَفْضِهَا رَفْعٌ عَلَا حَقُّهُ طُلَى | image: lam-alef |
| 797 | a | وَفِي الخَفْضِ فِي ٱللَّهِ ٱلَِّذِي الرَّفْعُ عَمَّ، خَٰـ | وَفِي الخَفْضِ فِي ٱللَّهِ ٱلَّذِي الرَّفْعُ عَمَّ، خَٰـ | image: stray kasra (Allah ligature marks) |
| 811 | a | وَرَا مُفۡرِطُونَ اكْسِرْ أَضا، تَتَفَيَّؤُاْ الًـ | وَرَا مُفۡرِطُونَ اكْسِرْ أَضاً، تَتَفَيَّؤُاْ الـ | image: tanween on أَضاً |
| 813 | a | وَظَعۡنِكُمُۥ إِسْكَانُهُ ذَائِعٌ، وَيَجۡٱ | وَظَعۡنِكُمُۥ إِسْكَانُهُ ذَائِعٌ، وَيَجۡـ | image: split word; ٱ belongs to ٱلَّذِينَ image |
| 813 | b | زِيَنَّ لَّذِينَ النُّونُ دَاعِيهِ نَوَّلاَ | ـزِيَنَّ ٱلَّذِينَ النُّونُ دَاعِيهِ نَوَّلاَ | image: split word; ٱ belongs to ٱلَّذِينَ image |
| 828 | a | وَفِي سَبَا حَفْصٌ مَعَ الشُّعَرَاءِ قُلْ | وَفِي سَبَأً حَفْصٌ مَعَ الشُّعَرَاءِ قُلْ | image: hamza and fathatan on alef |
| 839 | b | وَفِي الوَصْلِ كِنَّا فَمُدَّ لَهُ مُلَلَٰ | وَفِي الوَصْلِ لَٰكِنَّا فَمُدَّ لَهُ مُلَا | image: letter order |
| 844 | b | وَمَعْهُ عَلَيۡهُ ٱللَّهَ فِي الفَتْحِ وَصَّلََّاَ | وَمَعْهُ عَلَيۡهُ ٱللَّهَ فِي الفَتْحِ وَصَّلَا | image: stray marks |
| 855 | b | لَدَى رَدۡمًا ٱءۡتُونِ وَقَبْلُ اكْسِرِ الوِلَا | لَدَى رَدۡمًا ٱءۡتُونِى وَقَبْلُ اكْسِرِ الوِلَا | image: final ya lost |
| 856 | b | وَلَا كَسْرَ، وَابْدَأْ فِيهِمَا اليَاءَ مُبْدِلَلِ | وَلَا كَسْرَ، وَابْدَأْ فِيهِمَا اليَاءَ مُبْدِلَا | image |
| 867 | a | وَوُلۡدًا بِهَاً وَالزُّخْرُفِ اضْمُمْ وَسَكِّنَنْ | وَوُلۡدًا بِهَا وَالزُّخْرُفِ اضْمُمْ وَسَكِّنَنْ | image |
| 870 | a | وَرَآءِيَ وَٱجۡعَل لِّى وَِإِنِّى كِلَاهُمَاّ | وَرَآءِيَ وَٱجۡعَل لِّى وَإِنِّى كِلَاهُمَا | image |
| 871 | a | لِحَمْزَةَ فَاضْمُمْ كَسْرَ«هَا» أَهۡلَِهِ ٱمۡكُثُواْ | لِحَمْزَةَ فَاضْمُمْ كَسْرَ«هَا» أَهۡلِهِ ٱمۡكُثُواْ | image image |
| 871 | b | مَعاً، وَافْتَحُوا أَنِّى أَنَا دَاًئِما حُلَى | مَعاً، وَافْتَحُوا أَنِّى أَنَا دَائِماً حُلَى | image image |
| 878 | b | فَعِ الجَزْمَ مَعْ أُنْثَى يَّخَتُلُ مُقْبِلَا | فَعِ الجَزْمَ مَعْ أُنْثَى تُخَيَّلُ مُقْبِلَا | image: letter order |
| 885 | a | ىوَبِالضَّمِّ تَرۡضَىٰ صِفْ رِضاً، تَأۡتِهِمۡ مُؤَنْـ | وَبِالضَّمِّ تَرۡضَىٰ صِفْ رِضاً، تَأۡتِهِمۡ مُؤَنْـ | image: stray ya |
| 893 | a | سُكَٰرَىٰ مَعا سَكۡرَىٰ شَفَاً، وَمُحَرَّكٌ | سُكَٰرَىٰ مَعاً سَكۡرَىٰ شَفَا، وَمُحَرَّكٌ | image: tanween on مَعاً |
| 901 | a | وَفِي سَبَاٍ حَرْفَانِ مَعْهَا مُعَٰجِزِيـ | وَفِي سَبَأً حَرْفَانِ مَعْهَا مُعَٰجِزِيـ | image: hamza and fathatan |
| 907 | a | وَفِي لَامِ للَِِّهِ الأَخِيرَيْنِ حَذْفُهَا | وَفِي لَامِ لِلَّهِ الأَخِيرَيْنِ حَذْفُهَا | image: Allah ligature image: و lost image |
| 907 | b | فِي الهَاءِ رَفْعُ الجَرِّ عَنْ وَلَدِ العَلَوَ | وَفِي الهَاءِ رَفْعُ الجَرِّ عَنْ وَلَدِ العَلَا | image: Allah ligature image: و lost image |
| 911 | b | شَفَا، وَبِهَا يَاءٌ لَعَلِّيَ عَلَّلّاَ | شَفَا، وَبِهَا يَاءٌ لَعَلِّيَ عَلَّلَا | image |
| 916 | a | يُسَبِّحُ فَتْحُ البَا كَذَا صِفْ، وَتُوقَدُ ال | يُسَبِّحُ فَتْحُ البَا كَذَا صِفْ، وَتُوقَدُ الـ | image: word split image: closing quote |
| 916 | b | مُؤَنَّثُ صِفْ شَرْعاً وَحَقٌّ «تَفَعَّلَا | ـمُؤَنَّثُ صِفْ شَرْعاً وَحَقٌّ «تَفَعَّلَا» | image: word split image: closing quote |
| 919 | a | وَثَانِي ثَلَٰثُ ارْفَعْ سِوَى صُحْبَةٍوَقِفْ | وَثَانِي ثَلَٰثُ ارْفَعْ سِوَى صُحْبَةٍ وَقِفْ | image: وَقِفْ ends half a (Zu’bi puts it in half b) image |
| 919 | b | لَ وَلَا وَقْفَ قَبْلَ النَّصْبِ إِنْ قُلْتَ أُبْدِلَا | وَلَا وَقْفَ قَبْلَ النَّصْبِ إِنْ قُلْتَ أُبْدِلَا | image: وَقِفْ ends half a (Zu’bi puts it in half b) image |
| 922 | a | وَنُنزِلُ زِدْهُ النُّونَ وَارْفَعْ وَخَفَّ وَٱلۡ | وَنُنزِلُ زِدْهُ النُّونَ وَارْفَعْ وَخَفَّ وَٱلۡـ | image: word split image |
| 922 | b |  مَلَٰٓئِكَةُ المَرْفُوعُ يُنْصَبُ دُخْلُلۡاَ | ـمَلَٰٓئِكَةُ المَرْفُوعُ يُنْصَبُ دُخْلُلَا | image: word split image |
| 927 | b | ينَ ذَاعَ، وَخَلۡقُ اضْمُمْ وَحَرِّكْ بِهِ العُلَا | نَ ذَاعَ، وَخَلۡقُ اضْمُمْ وَحَرِّكْ بِهِ العُلَى | image: duplicated ya image: rhyme ya |
| 928 | a | كَمَا فِي نَدٍ، وَلۡـَٔايۡكَةِ اللَّامُ سَاكِنٌ | كَمَا فِي نَدٍ، وَلۡـَٔيۡكَةِ اللَّامُ سَاكِنٌ | image: no alef (restoration artifact) |
| 935 | a | لَأَرَادَ: أَلَا يَا هَؤُلَءِا اسْجُدُوا، وَقِفْ | أَرَادَ: أَلَا يَا هَؤُلَاءِ اسْجُدُوا، وَقِفْ | image image image |
| 935 | b | هُ قَبْلَهُ، وَالغَيْرُ أَدْرَجَ مُبْدِلَأَ | لَهُ قَبْلَهُ، وَالغَيْرُ أَدْرَجَ مُبْدِلَا | image image image |
| 937 | a | وَيُخۡفُونَ خَاطِبْ يُعۡلِنُونَ عَلَ رِضاً | وَيُخۡفُونَ خَاطِبْ يُعۡلِنُونَ عَلَا رِضاً | image: lam-alef |
| 940 | b | كُوفٍ، وَأَمَّا يُشۡرِكُونَ نَدٍ حَلِاَ | لِكُوفٍ، وَأَمَّا يُشۡرِكُونَ نَدٍ حَلَا | image image |
| 941 | a | وَشَدِّدْ وَصِلْ وَامْدُدْ بَلِ ٱدَّٰرَكَ لَّذِي | وَشَدِّدْ وَصِلْ وَامْدُدْ بَلِ ٱدَّٰرَكَ الَّذِي | image |
| 942 | a | بِهَٰدِي مَعاً تَهۡدِي فَشَا ٱلۡعُمۡيَ نَاًصِبا | بِهَٰدِي مَعاً تَهۡدِي فَشَا ٱلۡعُمۡيَ نَاصِباً | image |
| 948 | b | وَقُلْ قَالَ مُوسَ وَاحْذِفِ الوَاوَ دُخْلُلَيٰ | وَقُلْ قَالَ مُوسَيٰ وَاحْذِفِ الوَاوَ دُخْلُلَا | image |
| 951 | b | لَعَلِّى مَعا، رَبِّي ثَلاَثٌ، مَعِي اعْتَلَى | لَعَلِّى مَعاً، رَبِّي ثَلاَثٌ، مَعِي اعْتَلَى | image |
| 954 | b | هُنَاءَ ايَتٞ مِّن رَّبِّهِۦ صُحْبَةٌ دَلَا | هُنَا ءَايَتٞ مِّن رَّبِّهِۦ صُحْبَةٌ دَلَا | image |
| 959 | b | أَتَى، وَاجْمَعُواءَ اثَٰرِ كَمْ شَرَفاً عَلَا | أَتَى، وَاجْمَعُوا ءَاثَٰرِ كَمْ شَرَفاً عَلَا | image |
| 975 | b | ـ ضِهِ عَمَّ، مِن رِّجۡزٍ أَلِيمٖ مَعاً وِلَا | ـضِهِ عَمَّ، مِن رِّجۡزٍ أَلِيمٖ مَعاً وِلَا | image |
| 983 | b | وَقُلْ رَفْعُ غَيۡرِ ٱللَِّهِ بِالخَفْضِ شُكِّلَا | وَقُلْ رَفْعُ غَيۡرِ ٱللَّهِ بِالخَفْضِ شُكِّلَا | image: Allah ligature |
| 985 | a | وَفِي ٱلسَِّيِٕ المَخْفُوضِ هَمْزاً سُكُونُهُ | وَفِي ٱلسَّيِّيِٕ المَخْفُوضِ هَمْزاً سُكُونُهُ | image; UNCERTAIN: text layer has one ya with misplaced marks, image shows shadda on sin and ya, hamza below with kasra; written as the standard Uthmani ٱلسَّيِّيِٕ |
| 996 | b | كِنٌ مَعاً اَوۡءَ ابَآؤُنَا كَيْفَ بَلَّلَا | كِنٌ مَعاً اَوۡ ءَابَآؤُنَا كَيْفَ بَلَّلَا | image |
| 999 | a | وَغَيْرُ صِحَابٍ رَفْعُهُ ٱللَُّهُ رَبُّكُمۡ | وَغَيْرُ صِحَابٍ رَفْعُهُ ٱللَّهُ رَبُّكُمۡ | image: Allah ligature image: printed as two words |
| 999 | b | وَرَبُّ، وَإِلۡيَاسِينَ بِالكَسْرِ وُصِّلاَ | وَرَبُّ، وَإِلۡ يَاسِينَ بِالكَسْرِ وُصِّلاَ | image: Allah ligature image: printed as two words |
| 1000 | b | وَإِنِّى وَ«ذُو الثُّنْيَا» وَِأَنِّىَ أُجْمِلاَ | وَإِنِّى وَ«ذُو الثُّنْيَا» وَأَنِّىَ أُجْمِلاَ | image |
| 1003 | b | وَوَصْلُ تَّخَذۡنَٰهُمۡ حَلَا شَرْعُهُ وِلاَ | وَوَصْلُ ٱتَّخَذۡنَٰهُمۡ حَلَا شَرْعُهُ وِلاَ | image: ٱ lost |
| 1023 | a | وَقُلۡ قَٰلَ عَنْ كُفْءٍ،وَ سَقۡفٗا بِضَمِّهِ | وَقُلۡ قَٰلَ عَنْ كُفْءٍ، وَسَقۡفٗا بِضَمِّهِ | image |
| 1026 | a | أَٰلِهَتٞ كُوفٍ يُحَقِّقُ ثَانِياً | ءَأَٰلِهَتٞ كُوفٍ يُحَقِّقُ ثَانِياً | image: initial hamza lost |
| 1029 | b | وَرَبُّ ٱلسَّوَٰتِ اخْفِضُوا الرَّفْعَ ثُمَّلَمَٰ | وَرَبُّ ٱلسَّمَٰوَٰتِ اخْفِضُوا الرَّفْعَ ثُمَّلَا | image: letter order |
| 1030 | b | رَبِيعاً، وَقُلْ إِنِّى وَِلِى اليَاءَ حُمِّلَا | رَبِيعاً، وَقُلْ إِنِّى وَلِى اليَاءَ حُمِّلَا | image |
| 1031 | a | مَعاً رَفْعُءَ ايَٰتٍ عَلَى كَسْرِهِ شَفَا | مَعاً رَفْعُ ءَايَٰتٍ عَلَى كَسْرِهِ شَفَا | image |
| 1038 | b | عَلَى حُجَّةٍ، وَالقَصْرُ فِيءَ اسِنٖ دَلَا | عَلَى حُجَّةٍ، وَالقَصْرُ فِي ءَاسِنٖ دَلَا | image |
| 1039 | a | وَفِيءَ انِفًا خُلْفٌ هَدَى، وَبِضَمِّهِمْ | وَفِي ءَانِفًا خُلْفٌ هَدَى، وَبِضَمِّهِمْ | image |
| 1040 | b | ـنَكُمۡ، يَعۡلَمَ اليَا صِفْ وَيَبۡلُوَ وَاقْبَلَ.اْ | ـنَكُمۡ، يَعۡلَمَ اليَا صِفْ وَيَبۡلُوَاْ وَاقْبَلَا. | image image: اْ belongs to وَيَبۡلُوَاْ |
| 1042 | b | بِلاَمِ كَلَٰمَ ٱللَِّهِ وَالقَصْرُ وُكِّلَا | بِلاَمِ كَلَٰمَ ٱللَّهِ وَالقَصْرُ وُكِّلَا | image: Allah ligature |
| 1046 | b | وَقَوۡمِ بِخَفْضِ المِيمِ شَرَّفَ حُمَّلَ.ا | وَقَوۡمِ بِخَفْضِ المِيمِ شَرَّفَ حُمَّلَا. | image |
| 1047 | b | لِتۡنَٰ اكْسِرُوا دِنْياً، وَإِنَّ افْتَحُوا الجَلاَ | أَلَتۡنَـٰ اكْسِرُوا دِنْياً، وَإِنَّ افْتَحُوا الجَلاَ | image: أَ lost |
| 1048 | a | رِضاً، يُصۡعَقُونَ اضْمُمْهُ كَمْ نَصَّ، وَٱصَۜلۡمَُيۡ | رِضاً، يُصۡعَقُونَ اضْمُمْهُ كَمْ نَصَّ، وَٱلۡمُصَۜيۡـ | image: letter order, split word image: split word |
| 1048 | b | طِرُونَ لِسَانٌ عَابَ بِالخُلْفِ زُمَّلَا | ـطِرُونَ لِسَانٌ عَابَ بِالخُلْفِ زُمَّلَا | image: letter order, split word image: split word |
| 1061 | a | بِمَوۡقِعُِ بِالإِسْكَانِ وَالقَصْرِ شَائِعٌ. | بِمَوۡقِعِ بِالإِسْكَانِ وَالقَصْرِ شَائِعٌ. | image |
| 1068 | a | وَكَسْرُ جِدَرٖ ضُمَّ وَالفَتْحُ وَاقْصُرُوا | وَكَسْرُ جِدَٰرٖ ضُمَّ وَالفَتْحُ وَاقْصُرُوا | image: dagger alef lost |
| 1071 | a | وَللَِِّهِ زِدْ لَاَما وَأَنصَارَ نَوِّنَنْ | وَلِلَّهِ زِدْ لَاماً وَأَنصَارَ نَوِّنَنْ | image |
| 1076 | b | وَءَفِي الوَصْلِ الُاولَى قُنْبُلٌ وَاواً اَبْدَلَا | وَفِي الوَصْلِ الُاولَى قُنْبُلٌ وَاواً اَبْدَلَا | image: stray hamza |
| 1084 | a | دُعَآءِي وَإِنِّى ثُمَّ بَيۡتِي مُضَافُهَا. | دُعَآءِى وَإِنِّى ثُمَّ بَيۡتِي مُضَافُهَا. | image: undotted final ya |
| 1092 | a | وَرَا بَرِقَ افْتَحْ مِناً، يَذَرُونَ مَعْ | وَرَا بَرِقَ افْتَحْ آمِناً، يَذَرُونَ مَعْ | image: آ lost image: order |
| 1092 | b | يُحِبُّونَ حَقٌّ كَفَّ، يُمۡنَيٰ عَلَا. عُلا | يُحِبُّونَ حَقٌّ كَفَّ، يُمۡنَيٰ عُلىً عَلَا. | image: آ lost image: order |
| 1097 | b | تَشَآءُونَ حِصْن ااۥُ.قِّتَتۡ وَاًوُهُ حَلاَ | تَشَآءُونَ حِصْناً. أُقِّتَتۡ وَاوُهُ حَلاَ | image |
| 1098 | a | وَبِالهَمْزِ بَاقِيهِمْ، قَدَرۡنَاٌ ثَقِيلاِ ذْ | وَبِالهَمْزِ بَاقِيهِمْ، قَدَرۡنَا ثَقِيلٌ اِذْ | image |
| 1099 | b | كِذَبٗا بِتَخْفِيفِ الكِسَائِيِّ أَقْبَلَا | كِذَٰبٗا بِتَخْفِيفِ الكِسَائِيِّ أَقْبَلَا | image: dagger alef lost |
| 1100 | b | ذَلُولٌ، وَفِي ٱلرَّحۡنِ نَامِيهِ كَمَّلَ.مَٰ | ذَلُولٌ، وَفِي ٱلرَّحۡمَٰنِ نَامِيهِ كَمَّلَا. | image |
| 1101 | b | تَزَكَّ تَصَدَّىٰ الثَّانِ حِرْمِيٌّ اَثْقَلَا | تَزَكَّىٰ. تَصَدَّىٰ الثَّانِ حِرْمِيٌّ اَثْقَلَا | image |
| 1105 | a | وَفِي فَـٰكِهِينَ اقْصُرْ عَلَ،ا وَخِتَٰمُهُ | وَفِي فَـٰكِهِينَ اقْصُرْ عَلَا، وَخِتَٰمُهُ | image |
| 1106 | b | وَبَا تَرۡكَبُنَّ اضْمُمْ حَياً عَمَّ نُهَّلَ.ا | وَبَا تَرۡكَبُنَّ اضْمُمْ حَياً عَمَّ نُهَّلَا. | image |
| 1111 | a | وَأَرْبَعُ غَيْبٍ بَعْدَ   حُصُولُهَا | وَأَرْبَعُ غَيْبٍ بَعْدَ بَل لَّا حُصُولُهَا | image: words missing from the text layer; UNCERTAIN whether بَل carries a sukun (none visible) |
| 1116 | a | وَمَطۡلِعِ كَسْرُ اللَّامِ رَحْبٌ. وَحَرْفَيِ ٱلۡ | وَمَطۡلِعِ كَسْرُ اللَّامِ رَحْبٌ. وَحَرْفَيِ ٱلۡـ | image image: split word image: split word |
| 1116 | b | بَرِيَّةِ فَاهْمِزْ آهِلًاَ مُتَأَهِّلۡا | ـبَرِيَّةِ فَاهْمِزْ آهِلًا مُتَأَهِّلَا. | image image: split word image: split word |
| 1132 | b | لَِاحْمَدَ زَادَ ابْنُ الحُبَابِ فَهَيْلَاَ | لِأَحْمَدَ زَادَ ابْنُ الحُبَابِ فَهَيْلَلَا | image image |
| 1135 | a | وَلَاَ رِيبَةٌ فِي عَيْنِهِنَّ وَلَا رِبا | وَلَا رِيبَةٌ فِي عَيْنِهِنَّ وَلَا رِبا | image |
| 1160 | b | لِِاكْمَالِهَا حَسْنَاءَ مَيْمُونَةَ الجِلاَ | لِإِكْمَالِهَا حَسْنَاءَ مَيْمُونَةَ الجِلاَ | image: lam-alef-hamza ligature |
| 1166 | b | فَتىً كَانَ لِإِْنْصَافِ وَالحِلْمِ مَعْقِلَا | فَتىً كَانَ لِلْإِنْصَافِ وَالحِلْمِ مَعْقِلَا | image: lam lost in ligature |

## 5. Heading list with ids (PDF table of contents, literal order, المقدمة = 1)

Ids are positions in the table of contents, counting the editor's front-matter entries 2–4, as the timing agent did. Entry 83 is printed «[الخَاتِمَةُ]» on PDF page 174; the text layer of the table of contents shows it only as «[».

| Id | Heading (table of contents) | Kind | Parent | Verses (this run) | Al-Qasim title on the page |
|---|---|---|---|---|---|
| 1 | المُقَدِّمَةُ | bab | — | (أصول, later run) |  |
| 2 | النُّسَخُ المُعْتَمَدَةُ فِي التَّحْقِيقِ | bab | — | (أصول, later run) |  |
| 3 | رموز القرَّاء السَّبعة منفردين ومجتمعين | bab | — | (أصول, later run) |  |
| 4 | الأضداد المستعمَلة في النَّظم | bab | — | (أصول, later run) |  |
| 5 | مُقَدِّمَةُ النَّاظِمِ | bab | — | (أصول, later run) |  |
| 6 | بَابُ الاِسْتِعَاذَةِ | bab | — | (أصول, later run) |  |
| 7 | بَابُ البَسْمَلَةِ | bab | — | (أصول, later run) |  |
| 8 | سُورَةُ أُمِّ القُرْآنِ | bab | — | (أصول, later run) |  |
| 9 | بَابُ الإدْغَامِ الكَبِيرِ | bab | — | (أصول, later run) |  |
| 10 | بَابُ إِدْغَامِ الحَرْفَيْنِ المُتَقَارِبَيْنِ فِي كَلِمَةٍ وَفِي كَلِمَتَيْنِ | bab | — | (أصول, later run) |  |
| 11 | بَابُ هَاءِ الكِنَايَةِ | bab | — | (أصول, later run) |  |
| 12 | بَابُ المَدِّ وَالقَصْرِ | bab | — | (أصول, later run) |  |
| 13 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَةٍ | bab | — | (أصول, later run) |  |
| 14 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ | bab | — | (أصول, later run) |  |
| 15 | بَابُ الهَمْزِ المُفْرَدِ | bab | — | (أصول, later run) |  |
| 16 | بَابُ نَقْلِ حَرَكَةِ الهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا | bab | — | (أصول, later run) |  |
| 17 | بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الهَمْزِ | bab | — | (أصول, later run) |  |
| 18 | بَابُ الإِظْهَارِ وَالإِدْغَامِ | bab | — | (أصول, later run) |  |
| 19 | ذِكْرُ ذَالِ إِذْ | bab | — | (أصول, later run) |  |
| 20 | ذِكْرُ دَالِ قَدْ | bab | — | (أصول, later run) |  |
| 21 | ذِكْرُ تَاءِ التَّأْنِيثِ | bab | — | (أصول, later run) |  |
| 22 | ذِكْرُ لاَمِ هَلْ وَبَلْ | bab | — | (أصول, later run) |  |
| 23 | بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ، وَقَدْ، وَتَاءِ التَّأْنِيثِ، وَهَلْ وَبَلْ | bab | — | (أصول, later run) |  |
| 24 | بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا | bab | — | (أصول, later run) |  |
| 25 | بَابُ أَحْكَامِ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ | bab | — | (أصول, later run) |  |
| 26 | بَابُ الفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ | bab | — | (أصول, later run) |  |
| 27 | بَابُ مَذْهَبِ الكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الوَقْفِ | bab | — | (أصول, later run) |  |
| 28 | بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ | bab | — | (أصول, later run) |  |
| 29 | بَابُ اللَّمَاتِ | bab | — | (أصول, later run) |  |
| 30 | بَابُ الوَقْفِ عَلَى أَوَاخِرِ الكَلِمِ | bab | — | (أصول, later run) |  |
| 31 | بَابُ الوَقْفِ عَلَى مَرْسُومِ الخَط | bab | — | (أصول, later run) |  |
| 32 | بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ | bab | — | (أصول, later run) |  |
| 33 | بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ | bab | — | (أصول, later run) |  |
| 34 | بَابُ فَرْشِ الحُرُوفِ | bab | — | 445–1120 | بَابُ فَرْشِ الحُرُوفِ |
| 35 | سُورَةُ البَقَرَةِ | surah | 34 | 445–545 | سُورَةُ البَقَرَةِ |
| 36 | سُورَةِ آلِ عِمْرَانَ | surah | 34 | 546–586 | سُورَةُ آلِ عِمْرَانَ |
| 37 | سُورَةُ النِّسَاءِ | surah | 34 | 587–613 | سُورَةُ النِّسَاءِ |
| 38 | سُورَةُ المَائِدَةِ | surah | 34 | 614–631 | سُورَةُ المَائِدَةِ |
| 39 | سُورَةُ الأَنْعَامِ | surah | 34 | 632–680 | سُورَةُ الأَنْعَامِ |
| 40 | سُورَةُ الأَعْرَافِ | surah | 34 | 681–713 | سُورَةُ الأَعْرَافِ |
| 41 | سُورَةُ الأَنْفَالِ | surah | 34 | 714–724 | سُورَةُ الأَنْفَالِ |
| 42 | سُورَةُ التَّوْبَةِ | surah | 34 | 725–737 | سُورَةُ التَّوْبَةِ |
| 43 | سُورَةُ يُونُسَ | surah | 34 | 738–754 | سُورَةُ يُونُسَ  |
| 44 | سُورَةُ هُودٍ | surah | 34 | 755–771 | سُورَةُ هُودٍ  |
| 45 | سُورَةُ يُوسُفَ | surah | 34 | 772–786 | سُورَةُ يُوسُفَ  |
| 46 | سُورَةُ الرَّعْدِ | surah | 34 | 787–796 | سُورَةُ الرَّعْدِ |
| 47 | سُورَةُ إِبْرَاهِيمَ | surah | 34 | 797–801 | سُورَةُ إِبْرَاهِيمَ  |
| 48 | سُورَةُ الحِجْرِ | surah | 34 | 802–807 | سُورَةُ الحِجْرِ |
| 49 | سُورَةُ النَّحْلِ | surah | 34 | 808–815 | سُورَةُ النَّحْلِ |
| 50 | سُورَةُ الإِسْرَاءِ | surah | 34 | 816–829 | سُورَةُ الإِسْرَاءِ |
| 51 | سُورَةُ الكَهْفِ | surah | 34 | 830–859 | سُورَةُ الكَهْفِ |
| 52 | سُورَةُ مَرْيَمَ | surah | 34 | 860–870 | سُورَةُ مَرْيَمَ  |
| 53 | سُورَةُ طَاهَا | surah | 34 | 871–886 | سُورَةُ طَاهَا |
| 54 | سُورَةُ الأَنْبِيَاءِ | surah | 34 | 887–892 | سُورَةُ الأَنْبِيَاءِ  |
| 55 | سُورَةُ الحَج | surah | 34 | 893–902 | سُورَةُ الحَجِّ |
| 56 | سُورَةُ المُؤْمِنِينَ | surah | 34 | 903–911 | سُورَةُ المُؤْمِنِينَ |
| 57 | سُورَةُ النُّورِ | surah | 34 | 912–919 | سُورَةُ النُّورِ |
| 58 | سُورَةُ الفُرْقَانِ | surah | 34 | 920–926 | سُورَةُ الفُرْقَانِ |
| 59 | سُورَةُ الشُّعَرَاءِ | surah | 34 | 927–931 | سُورَةُ الشُّعَرَاءِ |
| 60 | سُورَةُ النَّمْلِ | surah | 34 | 932–944 | سُورَةُ النَّمْلِ |
| 61 | سُورَةُ القَصَصِ | surah | 34 | 945–951 | سُورَةُ القَصَصِ |
| 62 | سُورَةُ العَنْكَبُوتِ | surah | 34 | 952–957 | سُورَةُ العَنْكَبُوتِ |
| 63 | وَمِنْ سُورَةِ الرُّومِ إِلَى سُورَةِ سَبَأَ | surah | 34 | 958–974 | وَمِنْ سُورَةِ الرُّومِ إِلَى سُورَةِ سَبَأَ |
| 64 | سُورَةُ سَبَأَ وَفَاطِرٍ | surah | 34 | 975–985 | سُورَةُ سَبَأَ وَفَاطِرٍ |
| 65 | سُورَةُ يَاسِينَ | surah | 34 | 986–992 | سُورَةُ يَاسِينَ |
| 66 | سُورَةُ وَالصَّافَّاتِ | surah | 34 | 993–1000 | سُورَةُ وَالصَّافَّاتِ |
| 67 | سُورَةُ صَادْ | surah | 34 | 1001–1004 | سُورَةُ صَادْ |
| 68 | سُورَةُ الزُّمَرِ | surah | 34 | 1005–1009 | سُورَةُ الزُّمَرِ |
| 69 | سُورَةُ المُؤْمِنِ | surah | 34 | 1010–1014 | سُورَةُ المُؤْمِنِ |
| 70 | سُورَةُ فُصِّلَتْ | surah | 34 | 1015–1017 | سُورَةُ فُصِّلَتْ |
| 71 | سُورَةُ الشُّورَى وَالزُّخْرُفِ وَالدُّخَانِ | surah | 34 | 1018–1030 | سُورَةُ الشُّورَى وَالزُّخْرُفِ وَالدُّخَانِ |
| 72 | سُورَةُ الشَّرِيعَةِ وَالأَحْقَافِ | surah | 34 | 1031–1037 | سُورَةُ الشَّرِيعَةِ وَالأَحْقَافِ |
| 73 | وَمِنْ سُورَةِ مُحَمَّدٍ ﷺ إِلَى الرَّحْمَـٰنِ | surah | 34 | 1038–1051 | وَمِنْ سُورَةِ مُحَمَّدٍ ﷺ إِلَى الرَّحْمَٰنِ  |
| 74 | سُورَةُ الرَّحْمَـٰنِ | surah | 34 | 1052–1058 | سُورَةُ الرَّحْمَٰنِ  |
| 75 | سُورَةُ الوَاقِعَةِ وَالحَدِيدِ | surah | 34 | 1059–1064 | سُورَةُ الوَاقِعَةِ وَالحَدِيدِ |
| 76 | وَمِنْ سُورَةِ المُجَادَلَةِ إِلَى سُورَةِ نُونْ | surah | 34 | 1065–1077 | وَمِنْ سُورَةِ المُجَادَلَةِ إِلَى سُورَةِ نُونْ |
| 77 | وَمِنْ سُورَةِ نُونْ إِلَى سُورَةِ القِيَامَةِ | surah | 34 | 1078–1091 | وَمِنْ سُورَةِ نُونْ إِلَى سُورَةِ القِيَامَةِ |
| 78 | وَمِنْ سُورَةِ القِيَامَةِ إِلَى سُورَةِ النَّبَا | surah | 34 | 1092–1098 | وَمِنْ سُورَةِ القِيَامَةِ إِلَى سُورَةِ النَّبَأَ |
| 79 | إِلَى سُورَةِ العَلَقِ وَمِنْ سُورَةِ النَّبَا | surah | 34 | 1099–1114 | وَمِنْ سُورَةِ النَّبَأَ إِلَى سُورَةِ العَلَقِ |
| 80 | وَمِنْ سُورَةِ العَلَقِ إِلَى آخِرِ القُرْآنِ | surah | 34 | 1115–1120 | وَمِنْ سُورَةِ العَلَقِ إِلَى آخِرِ القُرْآنِ |
| 81 | بَابُ التَّكْبِيرِ | bab | — | 1121–1133 | بَابُ التَّكْبِيرِ |
| 82 | بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا الَّتِي يَحْتَاجُ القَارِئُ إِلَيْهَا | bab | — | 1134–1159 | بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا الَّتِي يَحْتَاجُ القَارِئُ إِلَيْهَا |
| 83 | [الخَاتِمَةُ] (shown as «[») | bab | — | 1160–1173 | [الخَاتِمَةُ] |

## 6. Validation

**qasim/edition.json**
- continuous 445..1173: pass
- a and b non-empty: pass
- top-level sections cover every verse once: pass
- surahs cover فرش exactly once: pass
- nesting only فرش → surah: pass
- NFC: pass
- U+0640 only at word splits (or as a hamza/alef seat): pass
- only Arabic letters, marks, allowed punctuation: see note: {"0x2d": 2}

**zubi/edition.json**
- continuous 445..1173: pass
- a and b non-empty: pass
- top-level sections cover every verse once: pass
- surahs cover فرش exactly once: pass
- nesting only فرش → surah: pass
- NFC: pass
- U+0640 only at word splits (or as a hamza/alef seat): pass
- only Arabic letters, marks, allowed punctuation: pass

- qasim: the two U+002D are the dashes printed around «- غَيْرَ ثَانِي العُقُودِ -» in verse 548a (kept as printed).
- U+0640 also stays where it is a seat for a hamza, dagger alif, small yā or small nūn (e.g. «خَطِيٓـَٔتُهُ», «سَحَّـٰرٍ»): dropping it would detach the mark. This is outside convention 3 as written; see §7.
- zubi: stored as NFC (Turath's mark order differs in places). Turath wrote verses 922, 975 with the separator twice («… … ـ»); the extra «...» was dropped.
- zubi verses without « ... » in Turath (split where the PDF splits, same words): .

## 7. Problems met (fix in the prompt for the أصول run)

1. **The text layer is not letter-exact.** lam-alif ligatures, the Allah ligature, «اً», hamza seats and the 3-glyph ornaments are mapped wrongly or partly. Use two extractors (pypdf for position, PDFKit for order) and cross-check them; never trust one alone.
2. **pypdf word order is scrambled inside a half and even inside a word** (pieces reversed). PDFKit `page.string` has the right reading order, but its `characterBounds` do not match its string indices and rectangle selection merges the two staggered halves. Locate each half in the PDFKit stream by matching letter counts against pypdf's half.
3. **Convention 3 (kashida)** needs an exception: U+0640 used as a seat for a mark (ـٔ ـٰ ـۧ ـۨ) must stay.
4. **Section ids**: the rule «المقدمة = 1» is ambiguous, because the table of contents starts with the editor's المقدمة and three more front-matter entries before مُقَدِّمَةُ النَّاظِمِ. Both agents used the literal order (فرش = 34). State this explicitly.
5. **The closing heading** «[الخَاتِمَةُ]» (id 83, verses 1160–1173) is unreadable in the table of contents text layer. The timing agent left it inside s82; its file needs `sectionIds: [82, 83]`, or a cut at verse 1160.
6. Turath's heading for آل عمران carries «فَرْشُ» in front, and its الحجر heading has no title tag. Both are kept as Turath has them.
7. Images: stacking about 10 half-line crops (1100×116 px each) per image with a label column was the cheapest way to check; zoom crops were needed only for single marks.
