#!/usr/bin/env python3
"""Print markdown tables for the diff report: real differences (Zu'bi -> Al-Qasim) and style-only counts,
for a verse range of the two edition.json files.
Usage: python3 tools/extract/report_tables.py <repoRoot> <vmin> <vmax> > tables.md"""
import json, sys, os, collections
sys.path.insert(0, os.path.dirname(__file__))
from compare import compare_half
root, vmin, vmax = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
q = {v['n']: v for v in json.load(open(os.path.join(root, 'data/editions/qasim/edition.json')))['verses']}
z = {v['n']: v for v in json.load(open(os.path.join(root, 'data/editions/zubi/edition.json')))['verses']}
rows = []; R = collections.Counter(); S = collections.Counter(); nq = 0; quran_rows = []; split = 0
for n in range(vmin, vmax + 1):
    for h in 'ab':
        for a, b, r, s, qu in compare_half(z[n][h], q[n][h]):
            if r:
                rows.append((n, h, ', '.join(sorted(r)), a, b)); R.update(r)
                if 'word split' in r: split += 1
            elif qu: nq += 1; quran_rows.append((n, h, a, b))
            S.update(s)
print(f'<!-- real words: {len(rows)} (word split halves: {split}); quranic: {nq} -->')
print('KINDS', dict(R.most_common())); print('STYLE', dict(S.most_common())); print('QURANIC', nq); print()
print('| Verse | Half | Kind | Zu\'bi | Al-Qasim |'); print('|---|---|---|---|---|')
for n, h, k, a, b in rows: print(f'| {n} | {h} | {k} | {a} | {b} |')
print(); print('QURANIC-TABLE'); print('| Verse | Half | Zu\'bi | Al-Qasim |'); print('|---|---|---|---|')
for n, h, a, b in quran_rows: print(f'| {n} | {h} | {a} | {b} |')
