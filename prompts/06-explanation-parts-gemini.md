# Gemini job: tag which sentences explain which verse

Use: step 3 of `EXPLANATION-PLAN.md`. Run Gemini as an agent inside this project folder (for example
Gemini CLI started in the project root) and give it everything below the line. It reads the input
files, writes the answers, runs the merge and writes a report. The same prompt resumes an unfinished run.

---

You are working inside the project folder of a reading app for the poem «الشاطبية» (حرز الأماني) on the seven Quran readings. The app shows a commentary, «الوافي في شرح الشاطبية», next to the poem. The commentary is already split into blocks; in many blocks the commentator explains several verses together. Your job is to say which sentences of each block are about which verse, save your answers, merge them with the project's script, and write a report of your work.

Do the whole job yourself, start to finish, without asking questions. If you run out of room, stop cleanly after finishing a file; the job can be resumed with this same prompt.

## Files

- Input, read only: `data/commentaries/wafi/_parts/in/s<number>.json` (71 files).
- Your answers: `data/commentaries/wafi/_parts/out/s<number>.json`, one per input file, same file name.
- Your report: `data/commentaries/wafi/_parts/gemini-report.md`.
- Merge script, run it, do not edit it: `python3 tools/commentary/parts.py`

You may create or change only files inside `data/commentaries/wafi/_parts/out/` and the report file. The merge script updates `data/commentaries/wafi/s<number>.json` for you; never edit those files by hand. Do not change any other file, do not commit, do not deploy, do not install anything.

## Input format

```json
{
  "blocks": [
    {
      "id": "b144",
      "verses": [
        { "n": 144, "text": "وَلِلدَّالِ كِلْمٌ: تُرْبُ سَهْلٍ ذَكَا شَذاً ضَفَا ثَمَّ زُهْدٌ صِدْقُهُ ظَاهِرٌ جَلَا" },
        { "n": 145, "text": "وَلَمْ تُدَّغَمْ مَفْتُوحَةً بَعْدَ سَاكِنٍ بِحَرْفٍ بِغَيْرِ التَّاءِ فَاعْلَمْهُ وَاعْمَلَا" }
      ],
      "sentences": [
        "المعنى: تدغم الدال في عشرة أحرف وهي المجموعة في أوائل الكلمات المذكورة وهي التاء،",
        "والسين، والذال، والشين، ... والأمثلة هكذا.",
        "ويشترط في إدغام الدال في أي حرف من هذه الحروف ألا تكون مفتوحة بعد ساكن،",
        "واستثنى من ذلك التاء، فإن الدال تدغم فيها ..."
      ]
    }
  ]
}
```

Sentences are numbered from 0 in the order they appear. Long sentences were cut into pieces at their commas, so an entry may be part of a sentence; treat each entry as one unit.

## Answer format

Each answer file holds one JSON object and nothing else:

```json
{ "b144": { "144": [0, 1], "145": [2, 3] } }
```

- One key for every block `id` in the input file, in the same order.
- Inside it, one key for each verse number that has sentences, with the sentence numbers in rising order.

## Tagging rules

1. Answer with sentence numbers only. Never copy, correct, shorten or translate any text.
2. Assign a sentence to a verse when it explains that verse's ruling, words, examples, or the reciters it names. Examples and exceptions belong to the verse whose ruling they illustrate.
3. A sentence that quotes words of a verse in brackets, such as (والعين فارفع إلخ), belongs to the verse those words come from.
4. A piece that continues the sentence before it (a list of examples, the rest of a clause) goes with the same verse as that sentence.
5. A sentence that clearly covers two verses may be listed under both.
6. Leave a sentence out when it is about the whole group, is a general remark, or you are not sure. Leaving it out is always acceptable; guessing is not.
7. A verse with no sentences of its own is left out of that block's object. A block where nothing can be assigned is `{}`.
8. Use only verse numbers listed in that block's `verses` and only sentence numbers that exist in that block's `sentences`.
9. The commentary usually follows the order of the verses. Use that as a guide when the wording alone does not decide.

Read each block and judge it yourself. Do not write a script or use keyword matching to produce the tags; scripts are allowed only for listing files and checking that your JSON is valid.

## Steps

1. List the input files. Skip any file that already has a valid answer file in `_parts/out/`.
2. Start with `s10.json`, then go through the rest in number order. Handle one file at a time: read it, tag every block in it, write its answer file, then move to the next. Do not stop early and do not skip blocks.
3. After every 10 files, and once at the end, run `python3 tools/commentary/parts.py`. It prints one line for each block it rejected and a final line `merged N blocks, skipped M`.
4. For every rejected block, read the reason, correct that block in your answer file, and run the script again. Repeat until it reports `skipped 0`, or until only blocks you cannot fix remain.
5. Write the report.

## Report

Write `data/commentaries/wafi/_parts/gemini-report.md` in English with these parts:

1. **Summary**: files done out of 71, blocks tagged, blocks answered `{}`, and the last line printed by the merge script, copied exactly.
2. **Files not done**, if any, with the reason.
3. **Blocks to review**: a table with the columns file, block id, verses, what you were unsure about. List every block where you hesitated, where the commentary does not follow the verse order, or where you left more than half the sentences unassigned.
4. **Rejected blocks you could not fix**, with the script's message for each.
5. **Problems in the input**, if you noticed any: a block whose text seems to belong to other verses, text cut in the wrong place, a verse missing from a group. Describe them only; do not fix them.
6. **Ten samples**: ten blocks from different files, each with its id, verse numbers and your answer, so the reviewer can check your judgment quickly.

Be exact in the report. If something was not done or not checked, say so plainly.
