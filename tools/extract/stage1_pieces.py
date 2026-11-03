#!/usr/bin/env python3
"""Stage 1: assign pypdf text pieces of each PDF page to verse halves.
Usage: python3 tools/extract/stage1_pieces.py <pdf> <firstPage> <lastPage> <out.json>
Anchors = verse-number pieces (digits, x >= 390). Half a sits on the number's line, half b ~28pt below.
Every other piece goes to the nearest anchor line within 14pt, else to 'other' (headings, ornaments).
Pieces with position (0,0) (pypdf lost the position) go to 'lost' for the page.
Output: {page: {"verses": {n: {"y": y, "a": [[x,y,text]...], "b": [...]}}, "other": [...], "lost": [...], "quran": [texts set in the KFGQPC Uthmanic fonts]}}"""
import json, re, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from common import pypdf_pieces_font as pypdf_pieces
from pypdf import PdfReader
pdf, f, l, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
r = PdfReader(pdf)
res = {}
B_OFF = 28.5
for pn in range(f, l + 1):
    P = pypdf_pieces(r.pages[pn - 1])
    quran = sorted(set(t for y, x, t, f in P if 'KFGQPC' in (f or '')))
    P = [p[:3] for p in P]
    lost = [t for y, x, t in P if x == 0 and y == 0]
    P = [p for p in P if not (p[1] == 0 and p[0] == 0) and p[0] < 600 and p[2].strip()]
    nums = [(y, x, t) for y, x, t in P if x >= 390 and re.fullmatch(r'\s*\d{1,3}\s*', t)]
    rest = [p for p in P if p not in nums]
    V = {int(t): {'y': y, 'a': [], 'b': []} for y, x, t in nums}
    targets = [(V[n]['y'], n, 'a') for n in V] + [(V[n]['y'] - B_OFF, n, 'b') for n in V]
    other = []
    for y, x, t in rest:
        if not targets: other.append([x, y, t]); continue
        d, n, h = min((abs(y - ty), n, h) for ty, n, h in targets)
        lim = 20 if all(not ('\u0621' <= c <= '\u064A') for c in t) else 14  # lone marks sit higher
        if d <= lim: V[n][h].append([x, y, t])
        else: other.append([x, y, t])
    res[pn] = {'verses': V, 'other': other, 'lost': lost, 'quran': quran}
json.dump(res, open(out, 'w'), ensure_ascii=False)
nv = sum(len(p['verses']) for p in res.values())
print(f'pages {f}-{l}: {nv} verse anchors; pages with lost pieces: {sum(1 for p in res.values() if p["lost"])}; '
      f'lost pieces: {sum(len(p["lost"]) for p in res.values())}; other pieces: {sum(len(p["other"]) for p in res.values())}')
