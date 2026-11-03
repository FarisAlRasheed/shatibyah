#!/usr/bin/env python3
"""Usage: python3 tools/timing/pdf_verses.py <out.json> [first_verse last_verse]
Reads sources/qasim.pdf text layer (pypdf) and writes {verse_number: raw_text_lines} for the verse range.
A verse line starts with its number; the next line is the second half. Headers/footers are skipped.
Word order inside a line may be scrambled (known); we only use word sets / letter counts."""
import sys, re, json, pypdf
out = sys.argv[1]
lo = int(sys.argv[2]) if len(sys.argv) > 2 else 1
hi = int(sys.argv[3]) if len(sys.argv) > 3 else 444
r = pypdf.PdfReader('sources/qasim.pdf')
verses = {}; cur = None
HDR = ('حِرْزُ الأَمَانِي', 'مُتُونُ طَالِبِ')
for pi in range(10, 100):
    for line in r.pages[pi].extract_text().split('\n'):
        if any(h in line for h in HDR): continue
        m = re.match(r'^\s*(\d{1,4})\s{2,}(\S.*)$', line)
        if m and int(m.group(1)) == (max(verses) + 1 if verses else 1):
            cur = int(m.group(1)); verses[cur] = [m.group(2).strip()]
        elif cur is not None and len(verses[cur]) < 2 and line.strip():
            verses[cur].append(line.strip())
        elif cur is not None and line.strip():
            verses[cur].append('#' + line.strip())  # extra text (heading/footnote glued)
    if hi in verses and len(verses[hi]) >= 2: break
json.dump({str(k): v for k, v in verses.items() if lo <= k <= hi}, open(out, 'w'), ensure_ascii=False)
print(len(verses), 'verses; last', max(verses), '; with extra text:', sum(any(x.startswith('#') for x in v) for v in verses.values()))
