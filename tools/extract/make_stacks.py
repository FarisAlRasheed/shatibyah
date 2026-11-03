#!/usr/bin/env python3
"""Make stacked half-line crop images for the image check.
Usage: python3 tools/extract/make_stacks.py <pieces.json> <pagesDir> <outDir> <prefix> <key> [<key> ...]  (or @file with keys)
keys like 12a / 12b. Pages rendered at 300 DPI by tools/render-pdf.swift as p%03d.png. 10 crops per image.
Prints the list of images written."""
import json, sys, os, subprocess
pieces, pages, outd, prefix = sys.argv[1:5]
keys = sys.argv[5:]
if keys and keys[0].startswith('@'): keys = open(keys[0][1:]).read().split()
P = json.load(open(pieces)); S = 300 / 72; PH = 680.315
loc = {}
for pg, pd in P.items():
    for n, v in pd['verses'].items():
        loc[n] = (int(pg), v)
os.makedirs(outd, exist_ok=True)
spec = []; batch = []
def flush():
    if batch:
        spec.append({'out': os.path.join(outd, f'{prefix}{len(spec) + 1:02d}.png'), 'items': list(batch)}); batch.clear()
for k in keys:
    n, h = k[:-1], k[-1]
    pg, v = loc[n]
    y = v['y'] if h == 'a' else v['y'] - 28.5
    xs = [p[0] for p in v[h]] or ([198] if h == 'a' else [62])
    x0 = max(40, min(xs) - 8) if h == 'a' else 50
    x1 = 430 if h == 'a' else 290
    top = PH - (y + 20)
    batch.append({'img': os.path.join(pages, f'p{pg:03d}.png'), 'x': int(x0 * S), 'y': int(top * S),
                  'w': int((x1 - x0) * S), 'h': int(32 * S), 'label': k})
    if len(batch) == 10: flush()
flush()
sp = os.path.join(outd, f'{prefix}spec.json'); json.dump(spec, open(sp, 'w'))
subprocess.run(['swift', os.path.join(os.path.dirname(__file__), 'stack-crops.swift'), sp], check=True)
print(' '.join(os.path.basename(e['out']) for e in spec))
