# Timing report, run 3: مقدمة الناظم and the أصول (verses 1-444)

## Summary
- Verses timed: 444 (1-444); app files: 29 (`audio/s5.mp3` ... `audio/s33.mp3`), total 28.35 MB (source files copied with `-c copy`, no re-encode; file 01 only lost its credits lead-in).
- Confidence < 0.6: 3; < 0.8: 70; neighbour-test failures: 1; other flags (shifted / nopause / duration / weakedge): 55.
- Merge: `reciter.json` now holds verses 1-1173 and 77 files; entries for 445-1173 and `audio/s35`-`s82` are unchanged (checked against the copy taken before this run); `partial` removed.
- Tools (all in `tools/timing/`): `whisper_all.sh`, `transcribe_fix.py`, `pdf_verses.py`, `align.py`, `assemble.py`.

## File to section mapping (one file per section; verified against the spoken titles)
| site file | section id | heading | app file | source cut (s) | verses | bytes |
|---|---|---|---|---|---|---|
| 0814AsShaatibiyyah_01_Intro_MahmudHaleem.mp3 | 5 | مُقَدِّمَةُ النَّاظِمِ | audio/s5.mp3 | 47.82-867.64 | 1-94 (94) | 5750160 |
| 0814AsShaatibiyyah_02_Istiadhah_MahmudHaleem.mp3 | 6 | بَابُ الاِسْتِعَاذَةِ | audio/s6.mp3 | 0.0-45.8 | 95-99 (5) | 330381 |
| 0814AsShaatibiyyah_03_Basmalah_MahmudHaleem.mp3 | 7 | بَابُ البَسْمَلَةِ | audio/s7.mp3 | 0.0-72.43 | 100-107 (8) | 516749 |
| 0814AsShaatibiyyah_04_SurahUmmAlQuraan_MahmudHaleem.mp3 | 8 | سُورَةُ أُمِّ القُرْآنِ | audio/s8.mp3 | 0.0-72.87 | 108-115 (8) | 519843 |
| 0814AsShaatibiyyah_05_AlIdghamAlKabir_MahmudHaleem.mp3 | 9 | بَابُ الإدْغَامِ الكَبِيرِ | audio/s9.mp3 | 0.0-144.19 | 116-131 (16) | 1019069 |
| 0814AsShaatibiyyah_06_IdghamAlHarfyn_MahmudHaleem.mp3 | 10 | بَابُ إِدْغَامِ الحَرْفَيْنِ المُتَقَارِبَيْنِ فِي كَلِمَةٍ وَفِي كَلِمَتَيْنِ | audio/s10.mp3 | 0.0-232.77 | 132-157 (26) | 1639144 |
| 0814AsShaatibiyyah_07_HaAlKinayah_MahmudHaleem.mp3 | 11 | بَابُ هَاءِ الكِنَايَةِ | audio/s11.mp3 | 0.0-92.71 | 158-167 (10) | 658709 |
| 0814AsShaatibiyyah_08_AlMaddWaAlQasr_MahmudHaleem.mp3 | 12 | بَابُ المَدِّ وَالقَصْرِ | audio/s12.mp3 | 0.0-134.91 | 168-182 (15) | 954095 |
| 0814AsShaatibiyyah_09_AlHamzataynMinKalimah_MahmudHaleem.mp3 | 13 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَةٍ | audio/s13.mp3 | 0.0-161.01 | 183-201 (19) | 1136823 |
| 0814AsShaatibiyyah_10_AlHamzataynMinKalimatyn_MahmudHaleem.mp3 | 14 | بَابُ الهَمْزَتَيْنِ مِنْ كَلِمَتَيْنِ | audio/s14.mp3 | 0.0-107.68 | 202-213 (12) | 763541 |
| 0814AsShaatibiyyah_11_AlHamzAlMufrad_MahmudHaleem.mp3 | 15 | بَابُ الهَمْزِ المُفْرَدِ | audio/s15.mp3 | 0.0-108.52 | 214-225 (12) | 769365 |
| 0814AsShaatibiyyah_12_NaqlHarakatAlHamzah_MahmudHaleem.mp3 | 16 | بَابُ نَقْلِ حَرَكَةِ الهَمْزَةِ إِلَى السَّاكِنِ قَبْلَهَا | audio/s16.mp3 | 0.0-86.65 | 226-234 (9) | 616304 |
| 0814AsShaatibiyyah_13_WaqafHamzahWaHishamAlaAlHamz_MahmudHaleem.mp3 | 17 | بَابُ وَقْفِ حَمْزَةَ وَهِشَامٍ عَلَى الهَمْزِ | audio/s17.mp3 | 0.0-179.52 | 235-254 (20) | 1266408 |
| 0814AsShaatibiyyah_14_AlIzharWaAlIdgham_MahmudHaleem.mp3 | 18 | بَابُ الإِظْهَارِ وَالإِدْغَامِ | audio/s18.mp3 | 0.0-41.93 | 255-258 (4) | 303264 |
| 0814AsShaatibiyyah_15_DhalIdh_MahmudHaleem.mp3 | 19 | ذِكْرُ ذَالِ إِذْ | audio/s19.mp3 | 0.0-32.0 | 259-261 (3) | 233740 |
| 0814AsShaatibiyyah_16_DalQad_MahmudHaleem.mp3 | 20 | ذِكْرُ دَالِ قَدْ | audio/s20.mp3 | 0.0-39.28 | 262-265 (4) | 284700 |
| 0814AsShaatibiyyah_17_TaAtTanith_MahmudHaleem.mp3 | 21 | ذِكْرُ تَاءِ التَّأْنِيثِ | audio/s21.mp3 | 0.0-41.54 | 266-269 (4) | 300534 |
| 0814AsShaatibiyyah_18_LamHalWaBal_MahmudHaleem.mp3 | 22 | ذِكْرُ لاَمِ هَلْ وَبَلْ | audio/s22.mp3 | 0.0-43.02 | 270-273 (4) | 310908 |
| 0814AsShaatibiyyah_19_IttifaqhimFiIdgham_MahmudHaleem.mp3 | 23 | بَابُ اتِّفَاقِهِمْ فِي إِدْغَامِ إِذْ، وَقَدْ، وَتَاءِ التَّأْنِيثِ، وَهَلْ وَبَلْ | audio/s23.mp3 | 0.0-37.28 | 274-276 (3) | 270686 |
| 0814AsShaatibiyyah_20_HurufQarubtMakharijuha_MahmudHaleem.mp3 | 24 | بَابُ حُرُوفٍ قَرُبَتْ مَخَارِجُهَا | audio/s24.mp3 | 0.0-86.26 | 277-285 (9) | 613574 |
| 0814AsShaatibiyyah_21_AhkamAnNunAsSakinahWaAtTanwin_MahmudHaleem.mp3 | 25 | بَابُ أَحْكَامِ النُّونِ السَّاكِنَةِ وَالتَّنْوِينِ | audio/s25.mp3 | 0.0-52.98 | 286-290 (5) | 380614 |
| 0814AsShaatibiyyah_22_AlFathWalImalah_MahmudHaleem.mp3 | 26 | بَابُ الفَتْحِ وَالإِمَالَةِ وَبَيْنَ اللَّفْظَيْنِ | audio/s26.mp3 | 0.0-426.57 | 291-338 (48) | 2995773 |
| 0814AsShaatibiyyah_23_MadhhabAlKisaiFiImalah_MahmudHaleem.mp3 | 27 | بَابُ مَذْهَبِ الكِسَائِيِّ فِي إِمَالَةِ هَاءِ التَّأْنِيثِ فِي الوَقْفِ | audio/s27.mp3 | 0.0-44.4 | 339-342 (4) | 320554 |
| 0814AsShaatibiyyah_24_MadhahibihimFiArRaat_MahmudHaleem.mp3 | 28 | بَابُ مَذَاهِبِهِمْ فِي الرَّاءَاتِ | audio/s28.mp3 | 0.0-144.45 | 343-358 (16) | 1020890 |
| 0814AsShaatibiyyah_25_AlLamat_MahmudHaleem.mp3 | 29 | بَابُ اللَّمَاتِ | audio/s29.mp3 | 0.0-56.59 | 359-364 (6) | 405912 |
| 0814AsShaatibiyyah_26_AlWaqfAlaAwakhirAlKalim_MahmudHaleem.mp3 | 30 | بَابُ الوَقْفِ عَلَى أَوَاخِرِ الكَلِمِ | audio/s30.mp3 | 0.0-95.7 | 365-375 (11) | 679640 |
| 0814AsShaatibiyyah_27_AlWaqfAlaMarsumAlKhatt_MahmudHaleem.mp3 | 31 | بَابُ الوَقْفِ عَلَى مَرْسُومِ الخَط | audio/s31.mp3 | 0.0-96.63 | 376-386 (11) | 686192 |
| 0814AsShaatibiyyah_28_MadhahibihimFiYaatAlIdafah_MahmudHaleem.mp3 | 32 | بَابُ مَذَاهِبِهِمْ فِي يَاءَاتِ الإِضَافَةِ | audio/s32.mp3 | 0.0-290.31 | 387-419 (33) | 2041911 |
| 0814AsShaatibiyyah_29_MadhahibihimFiAzZawaid_MahmudHaleem.mp3 | 33 | بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ | audio/s33.mp3 | 0.0-221.88 | 420-444 (25) | 1562886 |

Sections 1-4 (front matter) and 34 (باب فرش الحروف, spoken at the start of s35) have no verses of their own.

## Verses below 0.8 (listen to these in tools/cut-editor.html)
| verse | file | start | end | conf | match | flags |
|---|---|---|---|---|---|---|
| 137 | s10 | 50.43 | 58.64 | 0.47 | 0.0 | neighbour,weakedge |
| 144 | s10 | 111.22 | 119.63 | 0.51 | 0.08 |  |
| 424 | s33 | 37.69 | 47.8 | 0.59 | 0.43 | nopause_end,duration,weakedge |
| 284 | s24 | 65.78 | 74.28 | 0.6 | 0.16 |  |
| 262 | s20 | 3.31 | 11.74 | 0.62 | 0.18 |  |
| 271 | s22 | 12.88 | 21.33 | 0.64 | 0.22 |  |
| 70 | s5 | 596.23 | 604.52 | 0.65 | 0.32 | shifted |
| 323 | s26 | 287.7 | 296.19 | 0.65 | 0.29 |  |
| 263 | s20 | 12.34 | 19.91 | 0.66 | 0.39 |  |
| 398 | s32 | 96.65 | 104.4 | 0.66 | 0.28 |  |
| 425 | s33 | 48.1 | 54.83 | 0.66 | 0.35 | nopause_start |
| 441 | s33 | 184.95 | 192.63 | 0.66 | 0.33 | shifted |
| 182 | s12 | 125.0 | 133.78 | 0.67 | 0.38 |  |
| 268 | s21 | 21.93 | 30.36 | 0.67 | 0.4 |  |
| 408 | s32 | 184.56 | 192.79 | 0.67 | 0.25 | shifted |
| 270 | s22 | 3.65 | 12.08 | 0.68 | 0.3 |  |
| 275 | s23 | 17.88 | 26.19 | 0.68 | 0.25 |  |
| 286 | s25 | 9.16 | 14.61 | 0.68 | 0.67 | nopause_start,duration,weakedge |
| 380 | s31 | 36.57 | 44.29 | 0.68 | 0.28 |  |
| 162 | s11 | 38.36 | 46.55 | 0.71 | 0.32 |  |
| 259 | s19 | 3.65 | 12.05 | 0.71 | 0.29 |  |
| 297 | s26 | 58.26 | 66.16 | 0.71 | 0.35 |  |
| 326 | s26 | 314.88 | 322.66 | 0.71 | 0.31 |  |
| 164 | s11 | 56.18 | 64.37 | 0.72 | 0.32 |  |
| 166 | s11 | 74.04 | 82.08 | 0.72 | 0.31 |  |
| 260 | s19 | 12.62 | 20.68 | 0.72 | 0.35 |  |
| 412 | s32 | 220.14 | 228.73 | 0.72 | 0.32 | shifted |
| 419 | s32 | 281.5 | 289.83 | 0.72 | 0.44 |  |
| 147 | s10 | 137.39 | 145.34 | 0.73 | 0.35 |  |
| 161 | s11 | 29.81 | 37.85 | 0.73 | 0.35 |  |
| 266 | s21 | 4.44 | 12.74 | 0.73 | 0.35 |  |
| 281 | s24 | 39.75 | 47.9 | 0.73 | 0.33 | shifted |
| 317 | s26 | 234.41 | 242.53 | 0.73 | 0.32 |  |
| 402 | s32 | 131.0 | 139.06 | 0.73 | 0.32 |  |
| 264 | s20 | 20.33 | 28.36 | 0.74 | 0.49 |  |
| 274 | s23 | 8.91 | 17.19 | 0.74 | 0.34 |  |
| 330 | s26 | 348.85 | 356.33 | 0.74 | 0.34 |  |
| 403 | s32 | 139.93 | 148.35 | 0.74 | 0.39 |  |
| 209 | s14 | 63.92 | 71.39 | 0.75 | 0.4 |  |
| 261 | s19 | 21.47 | 30.35 | 0.75 | 0.45 |  |
| 269 | s21 | 31.0 | 39.82 | 0.75 | 0.45 |  |
| 409 | s32 | 193.43 | 201.57 | 0.75 | 0.38 |  |
| 429 | s33 | 80.9 | 88.54 | 0.75 | 0.38 |  |
| 254 | s17 | 167.1 | 178.64 | 0.76 | 0.74 | nopause_start,shifted,duration,weakedge |
| 378 | s31 | 21.02 | 28.13 | 0.76 | 0.47 |  |
| 384 | s31 | 69.48 | 77.47 | 0.76 | 0.4 | shifted |
| 396 | s32 | 80.39 | 88.45 | 0.76 | 0.39 |  |
| 416 | s32 | 255.58 | 263.9 | 0.76 | 0.39 |  |
| 438 | s33 | 158.57 | 166.75 | 0.76 | 0.47 | shifted |
| 329 | s26 | 340.39 | 348.2 | 0.77 | 0.4 |  |
| 350 | s28 | 64.23 | 72.24 | 0.77 | 0.38 |  |
| 395 | s32 | 72.07 | 79.76 | 0.77 | 0.43 |  |
| 397 | s32 | 89.19 | 96.19 | 0.77 | 0.4 |  |
| 426 | s33 | 55.41 | 63.17 | 0.77 | 0.39 |  |
| 100 | s7 | 3.85 | 11.44 | 0.78 | 0.4 |  |
| 102 | s7 | 20.35 | 28.53 | 0.78 | 0.43 |  |
| 277 | s24 | 5.03 | 13.08 | 0.78 | 0.44 |  |
| 289 | s25 | 32.66 | 41.14 | 0.78 | 0.4 |  |
| 382 | s31 | 52.7 | 60.36 | 0.78 | 0.4 |  |
| 385 | s31 | 77.87 | 85.86 | 0.78 | 0.42 |  |
| 386 | s31 | 86.47 | 95.21 | 0.78 | 0.55 |  |
| 418 | s32 | 273.12 | 281.0 | 0.78 | 0.42 |  |
| 434 | s33 | 123.67 | 131.82 | 0.78 | 0.45 |  |
| 170 | s12 | 21.33 | 29.3 | 0.79 | 0.4 |  |
| 310 | s26 | 172.71 | 180.61 | 0.79 | 0.42 |  |
| 316 | s26 | 225.94 | 233.92 | 0.79 | 0.42 |  |
| 338 | s26 | 417.15 | 426.66 | 0.79 | 0.63 |  |
| 392 | s32 | 46.84 | 54.62 | 0.79 | 0.45 |  |
| 415 | s32 | 246.97 | 254.86 | 0.79 | 0.41 |  |
| 428 | s33 | 72.54 | 80.36 | 0.79 | 0.44 |  |

## Neighbour-test failures
137

## Other flagged verses (confidence >= 0.8 but check)
`shifted` = the pause chosen is more than ~1 s from the whisper words assigned to the verse; `nopause_*` = no real silence found at that edge; `duration` = more than 18% away from the section median; `weakedge` = no clear rise/fall in loudness at the start/end (shallow pause).

1(shifted), 55(shifted), 56(shifted), 60(shifted), 94(duration), 106(weakedge), 112(shifted,weakedge), 113(nopause_end,weakedge), 114(nopause_start,duration,weakedge), 122(shifted), 128(weakedge), 134(shifted), 135(shifted), 140(shifted), 145(shifted), 178(shifted), 179(shifted), 194(shifted), 195(shifted), 226(weakedge), 230(shifted,weakedge), 231(shifted), 232(shifted), 252(shifted,weakedge), 253(nopause_end,shifted,weakedge), 272(weakedge), 280(shifted), 282(shifted), 299(shifted), 304(shifted), 311(shifted), 335(shifted), 340(weakedge), 341(weakedge), 357(shifted), 358(shifted), 361(weakedge), 362(weakedge), 383(shifted), 413(shifted), 433(shifted), 439(shifted), 444(duration)
