# Prompt: Shatibiyyah timing agent, run 3 (مقدمة الناظم and the أصول, verses 1–444)

Project folder: `/Users/faris/Documents/WebProjects/shatibiahReader`. Read first:
1. `EXTRACTION-METHOD.md` (the method; §3 is yours)
2. `prompts/02-timing-agent.md` (run 2's prompt: facts, tools, output format)
3. `data/reciters/mahmud-haleem/timing-report.md`: the Summary, Notes and Problems met sections only.

Run 2's prompt still applies, with the changes below. Where they differ, this file wins.

## Scope
- Verses **1 to 444**: مقدمة الناظم (section 5) through بَابُ مَذَاهِبِهِمْ فِي الزَّوَائِدِ (section 33).
- Reciter د. محمود بن حليم, source page https://a-alqasim.com/sounds-explain/081401asshaatibiyyah_mahmudhaleem/ (the owner has confirmed permission).
- Download source files **01–29** with curl into `data/reciters/mahmud-haleem/_source/` (git-ignored). File 30 is already there; don't re-download it.

## Section ids and files
- Section ids are in `data/editions/qasim/diff-report.md` §5 (read only that table): مقدمة الناظم = 5 … الزوائد = 33. Sections 1–4 are front matter with no verses.
- **First check** how the 29 site files map to sections 5–33. Expected: one file per section. If it is one-to-one, each app file `audio/s<id>.mp3` is its source file, with only the lead-in trimmed if needed (`ffmpeg -c copy`). Where one file holds several headings (for example sections 19–22), cut on the spoken titles as in run 2.
- Put the mapping in the report.

## Changes from run 2 (these fix the 11 verses the owner had to re-cut)
1. **Anchor on words first.** Each verse start = the pause just before the whisper word(s) matching the verse's first word(s). Dynamic programming over pauses only fills verses with no clear anchor.
2. **Exclude non-verse speech** before fitting: spoken titles, the closing formula, any du'a or comment. No verse may start inside or end after such speech.
3. **Neighbour test:** flag every verse whose own words match its interval less than a neighbour's words do, or whose first and last words aren't inside its interval. Fix what you can; list the rest.
4. **Whisper loops:** detect repeated n-grams in the transcript and re-transcribe that window alone with `--max-context 0`, in the script.
5. **Times are speech edges:** `start` = speech onset, `end` = speech offset; the gap between verses stays silent. The player pads into that gap itself.
6. **Verse words:** take them from the PDF text layer (`sources/qasim.pdf`), as in run 2. The text agent is rewriting `data/editions/*/edition.json` right now, so don't rely on it.
7. Tools are installed: `whisper-cli` and `~/.cache/whisper/ggml-large-v3-turbo.bin`. Run whisper once per file and cache the JSON in the scratchpad.
8. **Save your scripts** in `tools/timing/` (with a short usage comment at the top of each), so the run can be repeated cheaply.

## Merge, don't overwrite
- `data/reciters/mahmud-haleem/reciter.json` already holds 445–1173 and files `s35`–`s82`. **Add** verses 1–444 and the new files. Leave the existing entries and audio files untouched (check against a copy you take first).
- Remove `partial` when it covers 1–1173. Add to `notes`; don't drop the old notes.
- Write the run-3 report to `data/reciters/mahmud-haleem/timing-report-usul.md`. It also lists the neighbour-test failures and every verse below 0.8, for the owner to check in `tools/cut-editor.html`.

## Limits
- Write only `data/reciters/mahmud-haleem/*`, `tools/timing/*` and scratch files.
- Don't touch `data/editions/` or `tools/colors/`; other agents are working there.
- No app code, no git commits, no deploy.

## When finished, report
The file-to-section mapping, the number of app files and the total size, the verses below 0.6 and 0.8, the neighbour-test failures, the section list with verse ranges, and the paths you wrote.
