#!/usr/bin/env python3
"""Fetch Turath book pages (raw JSON) into a cache folder, via curl (urllib gets 403).
Usage: python3 tools/extract/fetch_turath.py <cacheDir> <firstPg> <lastPg> [bookId=7754]
Also saves <cacheDir>/book.json (with indexes). Skips pages already cached. Prints only counts."""
import json, os, subprocess, sys
out, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
bid = int(sys.argv[4]) if len(sys.argv) > 4 else 7754
os.makedirs(out, exist_ok=True)
def get(url):
    return subprocess.run(['curl', '-s', '-m', '30', '-A', 'Mozilla/5.0', url], capture_output=True, check=True).stdout
bk = os.path.join(out, 'book.json')
if not os.path.exists(bk):
    open(bk, 'wb').write(get(f'https://api.turath.io/book?id={bid}&include=indexes'))
n = 0
for pg in range(a, b + 1):
    p = os.path.join(out, f'p{pg:04d}.json')
    if os.path.exists(p): continue
    raw = get(f'https://api.turath.io/page?book_id={bid}&pg={pg}')
    json.loads(raw)
    open(p, 'wb').write(raw); n += 1
print(f'fetched {n} pages ({a}-{b}) into {out}')
