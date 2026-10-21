# Timing report — د. محمود بن حليم (فرش الحروف → end of book)

## Summary
- Verses timed: 729 (445–1173), edition `qasim`; app files: 48, total 44.17 MB (source file 30 is 44.17 MB; copied with `-c copy`, no re-encode).
- Confidence < 0.6: 2; < 0.8: 30; lowest 0.5.
- Method: whisper.cpp `large-v3-turbo` (ggml, word timestamps, run once on file 30 and cached) to find each spoken title and to score each verse (trigram Dice between the transcript inside the verse's interval and the verse's PDF words, word order ignored); silence candidates at noise floor (~-36.5 dB) + 10 dB (-26 dB); DP over pauses with verse length ∝ letter count, a half-verse pause bonus, position drift and the whisper match. Confidence = 0.5·whisper match + 0.2·length fit + 0.2·boundary pause clarity + 0.1·mid-verse pause.
- Audio: all sections, including التكبير and مخارج الحروف (with the closing verses), are inside source file 30. The site also lists a whole-book file (`0814AsShaatibiyyah_MahmudHaleem.mp3`), not used.
- Whisper hallucinated a loop on الشعراء (4116–4140 s); that 70 s stretch was re-transcribed alone (`--max-context 0`) and patched in.

## Sections
| id | title | file | source cut (s) | how the cut was found | verses |
|---|---|---|---|---|---|
| 35 | سُورَةُ البَقَرَةِ | audio/s35.mp3 | 0.0–873.47 | start of file (title «باب فرش الحروف سورة البقرة» spoken first) | 445–545 (101) |
| 36 | سُورَةِ آلِ عِمْرَانَ | audio/s36.mp3 | 873.47–1220.6 | title spoken at ~872.2 s; middle of the longest silence around it | 546–586 (41) |
| 37 | سُورَةُ النِّسَاءِ | audio/s37.mp3 | 1220.6–1454.8 | title spoken at ~1220.0 s; middle of the longest silence around it | 587–613 (27) |
| 38 | سُورَةُ المَائِدَةِ | audio/s38.mp3 | 1454.8–1610.5 | title spoken at ~1454.2 s; middle of the longest silence around it | 614–631 (18) |
| 39 | سُورَةُ الأَنْعَامِ | audio/s39.mp3 | 1610.5–2020.63 | owner-given | 632–680 (49) |
| 40 | سُورَةُ الأَعْرَافِ | audio/s40.mp3 | 2020.63–2304.76 | owner-given | 681–713 (33) |
| 41 | سُورَةُ الأَنْفَالِ | audio/s41.mp3 | 2304.76–2398.13 | owner-given (end of الأعراف) | 714–724 (11) |
| 42 | سُورَةُ التَّوْبَةِ | audio/s42.mp3 | 2398.13–2508.47 | title spoken at ~2397.3 s; middle of the longest silence around it | 725–737 (13) |
| 43 | سُورَةُ يُونُسَ | audio/s43.mp3 | 2508.47–2651.1 | title spoken at ~2507.7 s; middle of the longest silence around it | 738–754 (17) |
| 44 | سُورَةُ هُودٍ | audio/s44.mp3 | 2651.1–2794.25 | title spoken at ~2650.0 s; middle of the longest silence around it | 755–771 (17) |
| 45 | سُورَةُ يُوسُفَ | audio/s45.mp3 | 2794.25–2922.09 | title spoken at ~2793.7 s; middle of the longest silence around it | 772–786 (15) |
| 46 | سُورَةُ الرَّعْدِ | audio/s46.mp3 | 2922.09–3007.56 | title spoken at ~2921.6 s; middle of the longest silence around it | 787–796 (10) |
| 47 | سُورَةُ إِبْرَاهِيمَ | audio/s47.mp3 | 3007.56–3054.56 | title spoken at ~3006.5 s; middle of the longest silence around it | 797–801 (5) |
| 48 | سُورَةُ الحِجْرِ | audio/s48.mp3 | 3054.56–3106.61 | title spoken at ~3053.8 s; middle of the longest silence around it | 802–807 (6) |
| 49 | سُورَةُ النَّحْلِ | audio/s49.mp3 | 3106.61–3174.41 | title spoken at ~3105.6 s; middle of the longest silence around it | 808–815 (8) |
| 50 | سُورَةُ الإِسْرَاءِ | audio/s50.mp3 | 3174.41–3289.6 | title spoken at ~3173.9 s; middle of the longest silence around it | 816–829 (14) |
| 51 | سُورَةُ الكَهْفِ | audio/s51.mp3 | 3289.6–3533.53 | title spoken at ~3287.2 s; middle of the longest silence around it | 830–859 (30) |
| 52 | سُورَةُ مَرْيَمَ | audio/s52.mp3 | 3533.53–3627.7 | title spoken at ~3532.0 s; middle of the longest silence around it | 860–870 (11) |
| 53 | سُورَةُ طَاهَا | audio/s53.mp3 | 3627.7–3761.98 | title spoken at ~3627.4 s; middle of the longest silence around it | 871–886 (16) |
| 54 | سُورَةُ الأَنْبِيَاءِ | audio/s54.mp3 | 3761.98–3817.6 | title spoken at ~3760.8 s; middle of the longest silence around it | 887–892 (6) |
| 55 | سُورَةُ الحَج | audio/s55.mp3 | 3817.6–3906.34 | title spoken at ~3816.9 s; middle of the longest silence around it | 893–902 (10) |
| 56 | سُورَةُ المُؤْمِنِينَ | audio/s56.mp3 | 3906.34–3985.01 | title spoken at ~3904.9 s; middle of the longest silence around it | 903–911 (9) |
| 57 | سُورَةُ النُّورِ | audio/s57.mp3 | 3985.01–4055.95 | title spoken at ~3984.5 s; middle of the longest silence around it | 912–919 (8) |
| 58 | سُورَةُ الفُرْقَانِ | audio/s58.mp3 | 4055.95–4118.06 | title spoken at ~4055.4 s; middle of the longest silence around it | 920–926 (7) |
| 59 | سُورَةُ الشُّعَرَاءِ | audio/s59.mp3 | 4118.06–4161.66 | title spoken at ~4116.6 s; middle of the longest silence around it | 927–931 (5) |
| 60 | سُورَةُ النَّمْلِ | audio/s60.mp3 | 4161.66–4276.83 | title spoken at ~4161.0 s; middle of the longest silence around it | 932–944 (13) |
| 61 | سُورَةُ القَصَصِ | audio/s61.mp3 | 4276.83–4338.44 | title spoken at ~4276.1 s; middle of the longest silence around it | 945–951 (7) |
| 62 | سُورَةُ العَنْكَبُوتِ | audio/s62.mp3 | 4338.44–4392.72 | no spoken title; cut at the pause between verse 951 and 952 (transcript match) | 952–957 (6) |
| 63 | وَمِنْ سُورَةِ الرُّومِ إِلَى سُورَةِ سَبَأَ | audio/s63.mp3 | 4392.72–4544.5 | title spoken at ~4393.0 s; middle of the longest silence around it | 958–974 (17) |
| 64 | سُورَةُ سَبَأَ وَفَاطِرٍ | audio/s64.mp3 | 4544.5–4642.83 | title spoken at ~4543.9 s; middle of the longest silence around it | 975–985 (11) |
| 65 | سُورَةُ يَاسِينَ | audio/s65.mp3 | 4642.83–4708.07 | title spoken at ~4641.6 s; middle of the longest silence around it | 986–992 (7) |
| 66 | سُورَةُ وَالصَّافَّاتِ | audio/s66.mp3 | 4708.07–4780.9 | title spoken at ~4707.1 s; middle of the longest silence around it | 993–1000 (8) |
| 67 | سُورَةُ صَادْ | audio/s67.mp3 | 4780.9–4818.44 | title spoken at ~4780.2 s; middle of the longest silence around it | 1001–1004 (4) |
| 68 | سُورَةُ الزُّمَرِ | audio/s68.mp3 | 4818.44–4864.76 | title spoken at ~4817.7 s; middle of the longest silence around it | 1005–1009 (5) |
| 69 | سُورَةُ المُؤْمِنِ | audio/s69.mp3 | 4864.76–4912.42 | title spoken at ~4863.7 s; middle of the longest silence around it | 1010–1014 (5) |
| 70 | سُورَةُ فُصِّلَتْ | audio/s70.mp3 | 4912.42–4938.71 | title spoken at ~4909.6 s; middle of the longest silence around it | 1015–1017 (3) |
| 71 | سُورَةُ الشُّورَى وَالزُّخْرُفِ وَالدُّخَانِ | audio/s71.mp3 | 4938.71–5052.65 | title spoken at ~4937.9 s; middle of the longest silence around it | 1018–1030 (13) |
| 72 | سُورَةُ الشَّرِيعَةِ وَالأَحْقَافِ | audio/s72.mp3 | 5052.65–5119.02 | title spoken at ~5052.0 s; middle of the longest silence around it | 1031–1037 (7) |
| 73 | وَمِنْ سُورَةِ مُحَمَّدٍ ﷺ إِلَى الرَّحْمَـٰنِ | audio/s73.mp3 | 5119.02–5248.93 | title spoken at ~5119.1 s; middle of the longest silence around it | 1038–1051 (14) |
| 74 | سُورَةُ الرَّحْمَـٰنِ | audio/s74.mp3 | 5248.93–5309.19 | title spoken at ~5248.3 s; middle of the longest silence around it | 1052–1058 (7) |
| 75 | سُورَةُ الوَاقِعَةِ وَالحَدِيدِ | audio/s75.mp3 | 5309.19–5361.53 | title spoken at ~5308.6 s; middle of the longest silence around it | 1059–1064 (6) |
| 76 | وَمِنْ سُورَةِ المُجَادَلَةِ إِلَى سُورَةِ نُونْ | audio/s76.mp3 | 5361.53–5472.88 | title spoken at ~5361.2 s; middle of the longest silence around it | 1065–1077 (13) |
| 77 | وَمِنْ سُورَةِ نُونْ إِلَى سُورَةِ القِيَامَةِ | audio/s77.mp3 | 5472.88–5598.42 | title spoken at ~5472.7 s; middle of the longest silence around it | 1078–1091 (14) |
| 78 | وَمِنْ سُورَةِ القِيَامَةِ إِلَى سُورَةِ النَّبَا | audio/s78.mp3 | 5598.42–5662.23 | title spoken at ~5598.2 s; middle of the longest silence around it | 1092–1098 (7) |
| 79 | إِلَى سُورَةِ العَلَقِ وَمِنْ سُورَةِ النَّبَا | audio/s79.mp3 | 5662.23–5801.79 | title spoken at ~5662.0 s; middle of the longest silence around it | 1099–1114 (16) |
| 80 | وَمِنْ سُورَةِ العَلَقِ إِلَى آخِرِ القُرْآنِ | audio/s80.mp3 | 5801.79–5859.59 | title spoken at ~5801.8 s; middle of the longest silence around it | 1115–1120 (6) |
| 81 | بَابُ التَّكْبِيرِ | audio/s81.mp3 | 5859.59–5978.18 | title spoken at ~5858.9 s; middle of the longest silence around it | 1121–1133 (13) |
| 82 | بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا الَّتِي يَحْتَاجُ القَارِئُ إِلَيْهَا | audio/s82.mp3 | 5978.18–6337.64 | title spoken at ~5977.5 s; middle of the longest silence around it | 1134–1173 (40) |

Section 34 (باب فرش الحروف) has no verses of its own; its title is spoken at the start of s35.

## 40 lowest-confidence verses
| Verse | File | Start | End | Confidence | whisper match |
|---|---|---|---|---|---|
| 674 | s39 | 350.06 | 353.71 | 0.5 | 0.3 |
| 1017 | s70 | 21.07 | 25.9 | 0.57 | 0.45 |
| 1016 | s70 | 12.81 | 20.97 | 0.63 | 0.32 |
| 833 | s51 | 27.66 | 33.47 | 0.65 | 0.45 |
| 1037 | s72 | 56.73 | 65.94 | 0.66 | 0.44 |
| 623 | s38 | 78.0 | 86.17 | 0.67 | 0.38 |
| 1150 | s82 | 141.05 | 149.86 | 0.67 | 0.22 |
| 675 | s39 | 354.15 | 366.24 | 0.68 | 0.4 |
| 927 | s59 | 2.81 | 9.92 | 0.69 | 0.39 |
| 739 | s43 | 12.15 | 20.23 | 0.71 | 0.35 |
| 1047 | s73 | 84.95 | 93.18 | 0.71 | 0.39 |
| 1114 | s79 | 130.61 | 139.32 | 0.72 | 0.47 |
| 1117 | s80 | 21.8 | 30.17 | 0.72 | 0.4 |
| 830 | s51 | 4.0 | 11.37 | 0.73 | 0.32 |
| 951 | s61 | 52.26 | 61.24 | 0.73 | 0.39 |
| 1063 | s75 | 35.72 | 43.06 | 0.73 | 0.38 |
| 761 | s44 | 52.86 | 60.69 | 0.74 | 0.43 |
| 1015 | s70 | 4.4 | 12.66 | 0.74 | 0.39 |
| 834 | s51 | 33.53 | 39.93 | 0.75 | 0.39 |
| 1093 | s78 | 12.51 | 20.27 | 0.75 | 0.36 |
| 947 | s61 | 18.72 | 26.29 | 0.76 | 0.45 |
| 829 | s50 | 104.78 | 114.93 | 0.77 | 0.39 |
| 831 | s51 | 11.75 | 19.81 | 0.78 | 0.38 |
| 957 | s62 | 45.04 | 53.99 | 0.78 | 0.41 |
| 1018 | s71 | 4.48 | 11.8 | 0.78 | 0.63 |
| 1149 | s82 | 132.13 | 140.7 | 0.78 | 0.34 |
| 704 | s40 | 197.45 | 205.72 | 0.79 | 0.58 |
| 736 | s42 | 92.99 | 100.89 | 0.79 | 0.37 |
| 780 | s45 | 69.21 | 77.22 | 0.79 | 0.36 |
| 863 | s52 | 27.54 | 35.09 | 0.79 | 0.4 |
| 460 | s35 | 129.96 | 138.19 | 0.8 | 0.43 |
| 626 | s38 | 103.9 | 111.15 | 0.8 | 0.46 |
| 1032 | s72 | 8.38 | 21.01 | 0.8 | 0.58 |
| 1079 | s77 | 12.98 | 21.35 | 0.8 | 0.41 |
| 602 | s37 | 130.46 | 138.43 | 0.81 | 0.39 |
| 996 | s66 | 28.94 | 37.01 | 0.81 | 0.43 |
| 1031 | s72 | 2.7 | 7.98 | 0.81 | 0.52 |
| 485 | s35 | 343.48 | 351.69 | 0.82 | 0.44 |
| 548 | s36 | 19.28 | 26.76 | 0.82 | 0.56 |
| 721 | s41 | 59.69 | 67.0 | 0.82 | 0.54 |

## Notes
- Verse numbers, words and headings come from the PDF text layer (sources/qasim.pdf); timings from pause analysis + dynamic programming + whisper.cpp large-v3-turbo transcript matching (no Turath).
- Each app file begins with the spoken surah/bab title (about 1.5-5 s); it is not part of any verse. Verse 1121 (first of باب التكبير) starts about 1.4 s after the cut.
- Sections 61 (القصص) and 62 (العنكبوت): the reciter does not announce سورة العنكبوت, so the cut is placed at the pause between verses 951 and 952.
- Cuts for الأنعام (1610.5), الأعراف (2020.63) and الأنفال start (2304.76) are the owner-given ones, kept exactly.
- Several verses (e.g. 674, 1016, 1017, 1149, 1150) have damaged or abjad-letter text in the PDF text layer, so their whisper match is low; their timing follows the pause/length fit and neighbours that match well.
- No repeated, skipped or inserted verse was detected: every section's verse count fit its duration at about 0.2 s per letter.
- Section ids follow the literal order of the PDF table of contents (entries 2-4 النسخ المعتمدة / رموز القراء / الأضداد are counted). If the text agent excluded them, ids shift by 3.

## Heading list with ids (PDF table of contents order)
1. المُقَدِّمَةُ
2. النُّسَخُ المُعْتَمَدَةُ فِي التَّحْقِيقِ
3. رموز القرَّاء السَّبعة منفردين ومجتمعين
4. الأضداد المستعمَلة في النَّظم
5. مُقَدِّمَةُ النَّاظِمِ
6. بَابُ الاِسْتِعَاذَةِ
7. بَابُ البَسْمَلَةِ
8. سُورَةُ أُمِّ القُرْآنِ
9. بَابُ الإدْغَامِ الكَبِيرِ
10. بَابُ إِدْغَامِ الحَرْفَيْنِ المُتَقَارِبَيْنِ فِي كَلِمَةٍ وَفِي كَلِمَتَيْنِ
11. بَابُ هَاءِ الكِنَايَةِ
12. بَابُ المَدِّ وَالقَصْرِ
13. بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَةٍ
14. بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ
15. بَابُ الهَمْزِ المُفْرَدِ
16. بَابُ نَقْلِ حَرَكَةِ الهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا
17. بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الهَمْزِ
18. بَابُ الإِظْهَارِ وَالإِدْغَامِ
19. ذِكْرُ ذَالِ إِذْ
20. ذِكْرُ دَالِ قَدْ
21. ذِكْرُ تَاءِ التَّأْنِيثِ
22. ذِكْرُ لاَمِ هَلْ وَبَلْ
23. بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ، وَقَدْ، وَتَاءِ التَّأْنِيثِ، وَهَلْ وَبَلْ
24. بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا
25. بَابُ أَحْكَامِ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ
26. بَابُ الفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ
27. بَابُ مَذْهَبِ الكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الوَقْفِ
28. بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ
29. بَابُ اللَّمَاتِ
30. بَابُ الوَقْفِ عَلَى أَوَاخِرِ الكَلِمِ
31. بَابُ الوَقْفِ عَلَى مَرْسُومِ الخَط
32. بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ
33. بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ
34. بَابُ فَرْشِ الحُرُوفِ
35. سُورَةُ البَقَرَةِ
36. سُورَةِ آلِ عِمْرَانَ
37. سُورَةُ النِّسَاءِ
38. سُورَةُ المَائِدَةِ
39. سُورَةُ الأَنْعَامِ
40. سُورَةُ الأَعْرَافِ
41. سُورَةُ الأَنْفَالِ
42. سُورَةُ التَّوْبَةِ
43. سُورَةُ يُونُسَ
44. سُورَةُ هُودٍ
45. سُورَةُ يُوسُفَ
46. سُورَةُ الرَّعْدِ
47. سُورَةُ إِبْرَاهِيمَ
48. سُورَةُ الحِجْرِ
49. سُورَةُ النَّحْلِ
50. سُورَةُ الإِسْرَاءِ
51. سُورَةُ الكَهْفِ
52. سُورَةُ مَرْيَمَ
53. سُورَةُ طَاهَا
54. سُورَةُ الأَنْبِيَاءِ
55. سُورَةُ الحَج
56. سُورَةُ المُؤْمِنِينَ
57. سُورَةُ النُّورِ
58. سُورَةُ الفُرْقَانِ
59. سُورَةُ الشُّعَرَاءِ
60. سُورَةُ النَّمْلِ
61. سُورَةُ القَصَصِ
62. سُورَةُ العَنْكَبُوتِ
63. وَمِنْ سُورَةِ الرُّومِ إِلَى سُورَةِ سَبَأَ
64. سُورَةُ سَبَأَ وَفَاطِرٍ
65. سُورَةُ يَاسِينَ
66. سُورَةُ وَالصَّافَّاتِ
67. سُورَةُ صَادْ
68. سُورَةُ الزُّمَرِ
69. سُورَةُ المُؤْمِنِ
70. سُورَةُ فُصِّلَتْ
71. سُورَةُ الشُّورَى وَالزُّخْرُفِ وَالدُّخَانِ
72. سُورَةُ الشَّرِيعَةِ وَالأَحْقَافِ
73. وَمِنْ سُورَةِ مُحَمَّدٍ ﷺ إِلَى الرَّحْمَـٰنِ
74. سُورَةُ الرَّحْمَـٰنِ
75. سُورَةُ الوَاقِعَةِ وَالحَدِيدِ
76. وَمِنْ سُورَةِ المُجَادَلَةِ إِلَى سُورَةِ نُونْ
77. وَمِنْ سُورَةِ نُونْ إِلَى سُورَةِ القِيَامَةِ
78. وَمِنْ سُورَةِ القِيَامَةِ إِلَى سُورَةِ النَّبَا
79. إِلَى سُورَةِ العَلَقِ وَمِنْ سُورَةِ النَّبَا
80. وَمِنْ سُورَةِ العَلَقِ إِلَى آخِرِ القُرْآنِ
81. بَابُ التَّكْبِيرِ
82. بَابُ مَخَارِجِ الحُرُوفِ وَصِفَاتِهَا الَّتِي يَحْتَاجُ القَارِئُ إِلَيْهَا

TOC entries 83 (`[`, printed page 172, the closing verses' bracket heading, not readable in the text layer) and 84 (فهرس الموضوعات) are not counted as sections; the closing verses are inside s82.

## Problems met
- `pypdf` was not importable under `python3 -I` (user site excluded); ran it normally from outside the project.
- Heading lines for يونس, هود, يوسف, إبراهيم, مريم, الأنبياء, محمد and الرحمن were glued to the preceding verse's text in the PDF text layer; their first verses (738, 755, 772, 797, 860, 887, 1038, 1052) were chosen from the transcript/length fit and confirmed by whisper match (all > 0.35).
- The PDF text has scrambled word order and some merged or lost words; matching therefore uses per-word trigram sets, which separate the right verse (mean 0.7) from its neighbour (0.08) clearly.
- Whisper word start times lag: a word's `from` is the previous word's end. So the spoken title's real start is after the silence the transcript puts it in; cuts use the longest silence starting within -1…+3.5 s of the transcript time (the owner-given cuts fall in the same silences, confirming the rule).
- The pilot's verses 673–675 (4 s late) differ from this run; the new boundaries match the transcript better (673: 0.93 vs 0.66).
