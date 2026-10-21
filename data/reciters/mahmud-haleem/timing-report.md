# Timing report — د. محمود بن حليم (pilot)

## Summary
- Verses timed: 82 (632–713), edition `qasim`
- App audio files: 2, total 4.86 MB
- Verses with confidence < 0.6: 0; lowest confidence: 0.71
- Method: silence/energy pauses (≤ -27 dB, ≥0.15 s) + DP over pause candidates fitted to letter count per verse and the صدر/عجز mid-pause. No speech recognition (Whisper not installed), so confidence is pause+length fit only.

## File ↔ section matching
| App file | Section | Source | Given cut (s) | Snapped cut (s) | bytes |
|---|---|---|---|---|---|
| audio/farsh-1.mp3 | سُورَةُ الأَنْعَامِ | file 30 (فرش الحروف) | 1610–2020 | 1610.5–2020.63 | 2867646 |
| audio/farsh-2.mp3 | سُورَةُ الأَعْرَافِ | file 30 (فرش الحروف) | 2020–2305 | 2020.63–2304.76 | 1989678 |

Snapping: 1610→1610.50 (silence 1610.07–1610.92 at -38 dB); 2020→2020.63 (silence 2020.21–2021.06 at -28 dB); 2305→2304.76 (silence 2304.52–2304.99 at -28 dB). All within ±3 s.

## 40 lowest-confidence verses
| Verse | File | Start | End | Confidence |
|---|---|---|---|---|
| 656 | farsh-1 | 201.91 | 209.57 | 0.71 |
| 680 | farsh-1 | 400.73 | 409.65 | 0.75 |
| 657 | farsh-1 | 209.91 | 218.14 | 0.77 |
| 712 | farsh-2 | 265.59 | 274.29 | 0.78 |
| 635 | farsh-1 | 27.1 | 35.06 | 0.8 |
| 693 | farsh-2 | 104.26 | 112.53 | 0.8 |
| 704 | farsh-2 | 197.42 | 205.93 | 0.83 |
| 655 | farsh-1 | 193.7 | 201.45 | 0.86 |
| 707 | farsh-2 | 223.25 | 230.99 | 0.86 |
| 645 | farsh-1 | 109.07 | 117.06 | 0.88 |
| 666 | farsh-1 | 284.59 | 292.62 | 0.88 |
| 671 | farsh-1 | 325.32 | 332.83 | 0.88 |
| 672 | farsh-1 | 333.19 | 341.26 | 0.88 |
| 713 | farsh-2 | 274.38 | 283.67 | 0.88 |
| 637 | farsh-1 | 43.73 | 51.19 | 0.89 |
| 639 | farsh-1 | 59.83 | 67.52 | 0.9 |
| 688 | farsh-2 | 61.74 | 69.87 | 0.9 |
| 690 | farsh-2 | 78.81 | 86.96 | 0.9 |
| 705 | farsh-2 | 206.24 | 214.6 | 0.9 |
| 667 | farsh-1 | 292.97 | 300.67 | 0.91 |
| 691 | farsh-2 | 87.32 | 95.45 | 0.91 |
| 698 | farsh-2 | 146.24 | 154.17 | 0.91 |
| 649 | farsh-1 | 142.83 | 150.64 | 0.92 |
| 679 | farsh-1 | 392.04 | 400.43 | 0.92 |
| 686 | farsh-2 | 45.06 | 53.28 | 0.92 |
| 703 | farsh-2 | 188.78 | 197.04 | 0.92 |
| 706 | farsh-2 | 214.73 | 223.05 | 0.92 |
| 638 | farsh-1 | 51.6 | 59.5 | 0.93 |
| 652 | farsh-1 | 167.8 | 176.59 | 0.93 |
| 685 | farsh-2 | 36.42 | 44.64 | 0.94 |
| 709 | farsh-2 | 239.41 | 247.99 | 0.94 |
| 644 | farsh-1 | 100.86 | 108.75 | 0.95 |
| 694 | farsh-2 | 112.82 | 120.83 | 0.95 |
| 708 | farsh-2 | 231.23 | 239.17 | 0.95 |
| 711 | farsh-2 | 256.76 | 265.13 | 0.95 |
| 653 | farsh-1 | 176.87 | 184.98 | 0.96 |
| 661 | farsh-1 | 242.96 | 250.85 | 0.96 |
| 674 | farsh-1 | 350.04 | 358.04 | 0.96 |
| 683 | farsh-2 | 20.04 | 28.03 | 0.96 |
| 684 | farsh-2 | 28.38 | 36.09 | 0.96 |

## Notes
- Pilot run: only سورة الأنعام and سورة الأعراف were processed (verses 632–713).
- Each farsh file begins with about 3 s of speech before the first verse (the surah title); it is kept at the start of the file and is not counted as a verse.
- No speech-recognition check was run (Whisper not installed). Boundaries come from pause analysis plus a dynamic-programming fit to verse length, so confidence reflects pause and length fit only; spot-check with tools/timing-check.html.
- No repeated, skipped or inserted verse was detected: the DP found exactly one plausible verse-length segment per verse in both files, but this was not confirmed by listening or ASR.

## Problems met
- ffmpeg and numpy were missing; installed with the owner's approval (`brew install ffmpeg`, `pip3 install --user numpy`). Whisper was not installed, so no ASR check.
- Silence at -38 dB (the brief's usual range) found nothing near the 2020 s and 2305 s cuts: the MP3 background noise floor is about -37 dB. Pauses only show at -27/-28 dB. The prompt should say to use a threshold relative to the noise floor.
- Half-verse pauses (~0.45–0.65 s) and verse pauses (~0.6–0.8 s) are almost the same length, so pause length separates them poorly. The length-proportional DP and the mid-pause position do the real work.
- The 2305 s cut snaps to a short (0.47 s) pause. It fits the verse timing (verse 713 ends 0.5 s before the file end), but it was not checked by ear.
- The `partial` field was also added to reciter.json to match the edition.
