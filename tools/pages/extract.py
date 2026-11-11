#!/usr/bin/env python3
"""Usage: python3 -I tools/pages/extract.py
Printed page numbers of the Qasim edition (UX-PLAN 6.1) from sources/qasim.pdf (pypdf text layer).

For each PDF page:
- the printed page number is read from the page's own running header (its first text line:
  «15   حِرْزُ الأَمَانِي…» on odd pages, «مُتُونُ طَالِبِ العِلْمِ… 16» on even pages);
- verse numbers are the lines that start with a number followed by spaces, as in
  tools/timing/pdf_verses.py. Each number is accepted only if the text under it (up to the next
  number) holds the letters of that verse in data/editions/qasim/edition.json. The text layer
  scrambles letter order and sometimes drops the coloured words, so the check compares letter
  counts: at least 80% of the verse's letters; or at least 50% and clearly more than the
  neighbouring verses n−1 and n+1 would score on the same text; or at least 50% with the
  accepted numbers just before and after it being exactly n−1 and n+1.

Writes data/editions/qasim/pages.json and asserts every verse 1..N lies in exactly one page entry.
Pages that cannot be resolved are reported and left out; nothing is filled in by counting lines."""
import json, os, re, site, sys
from collections import Counter

# pypdf is a user install (pip --user), which -I hides; add the user site back explicitly.
sys.path.append(site.getusersitepackages())
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'extract'))
import pypdf  # noqa: E402
from common import AR_DIG, skel  # noqa: E402

PDF = os.path.join(ROOT, 'sources', 'qasim.pdf')
EDITION = os.path.join(ROOT, 'data', 'editions', 'qasim', 'edition.json')
OUT = os.path.join(ROOT, 'data', 'editions', 'qasim', 'pages.json')
MIN_SCORE = 0.8  # share of the verse's letters (as counts) found in the text under its number
LOW_SCORE, MARGIN = 0.5, 0.1  # fallback: lower share, but beating both neighbouring verses

edition = json.load(open(EDITION))
verses = {v['n']: v for v in edition['verses']}
N = len(verses)
assert sorted(verses) == list(range(1, N + 1)), 'edition verses are not 1..N'


def score(text, n):
    """letter-count overlap between PDF text and verse n (0..1)"""
    want = Counter(skel(verses[n]['a'] + verses[n]['b']))
    got = Counter(skel(text))
    return sum((want & got).values()) / max(1, sum(want.values()))


def header_number(line):
    """printed page number from the running header line, or None"""
    line = line.translate(AR_DIG).replace('\xa0', ' ').strip()
    m = re.match(r'^(\d{1,3})\s', line) or re.search(r'\s(\d{1,3})$', line)
    return int(m.group(1)) if m else None


reader = pypdf.PdfReader(PDF)
# Pass 1: every verse-number line in reading order, scored against its verse and the neighbours.
cands = []  # dicts: pdf, n, s, near, ok
headers = {}
for pi, page in enumerate(reader.pages):
    lines = page.extract_text().split('\n')
    marks = []
    for i, ln in enumerate(lines[1:], 1):
        m = re.match(r'^\s*(\d{1,4})\s{2,}(\S.*)$', ln.translate(AR_DIG))
        if m and 1 <= int(m.group(1)) <= N:
            marks.append((i, int(m.group(1)), m.group(2)))
    if marks:
        headers[pi + 1] = header_number(lines[0])
    # A verse's text runs from its number line to the next number line.
    for k, (i, n, rest) in enumerate(marks):
        end = marks[k + 1][0] if k + 1 < len(marks) else len(lines)
        text = ' '.join([rest] + lines[i + 1:end])
        s = score(text, n)
        near = max(score(text, m) for m in (n - 1, n + 1) if 1 <= m <= N)
        cands.append({'pdf': pi + 1, 'n': n, 's': round(s, 2), 'near': round(near, 2),
                      'ok': 'text' if s >= MIN_SCORE else 'margin' if s >= LOW_SCORE and s >= near + MARGIN else None})

# Pass 2: a weaker match is still accepted when the accepted numbers just before and after it
# (in reading order, across pages) are exactly n−1 and n+1.
accepted = [c for c in cands if c['ok']]
for c in cands:
    if c['ok'] or c['s'] < LOW_SCORE:
        continue
    before = [a for a in accepted if (a['pdf'], cands.index(a)) < (c['pdf'], cands.index(c))]
    after = [a for a in accepted if (a['pdf'], cands.index(a)) > (c['pdf'], cands.index(c))]
    if before and after and before[-1]['n'] == c['n'] - 1 and after[0]['n'] == c['n'] + 1:
        c['ok'] = 'sequence'

pages, problems = [], []
for pdf in sorted({c['pdf'] for c in cands}):
    found = [c['n'] for c in cands if c['pdf'] == pdf and c['ok']]
    if not found:
        continue
    printed = headers.get(pdf)
    if printed is None:
        problems.append(f'pdf page {pdf}: verses {min(found)}–{max(found)} but no printed page number in the header (left out)')
        continue
    if found != sorted(found) or len(set(found)) != len(found):
        problems.append(f'pdf page {pdf}: verse numbers out of order {found} (left out)')
        continue
    missing = sorted(set(range(found[0], found[-1] + 1)) - set(found))
    if missing:
        problems.append(f'pdf page {pdf}: numbers {missing} not accepted, but they lie between accepted numbers {found[0]}–{found[-1]} on the same page')
    pages.append({'page': printed, 'pdf': pdf, 'from': found[0], 'to': found[-1]})

pages.sort(key=lambda p: p['page'])

# Every verse in exactly one entry: entries are ordered, contiguous, and cover 1..N.
covered = Counter(n for p in pages for n in range(p['from'], p['to'] + 1))
gaps = [n for n in range(1, N + 1) if covered[n] == 0]
overlaps = [n for n, c in covered.items() if c > 1]
for a, b in zip(pages, pages[1:]):
    assert b['pdf'] > a['pdf'] and b['page'] > a['page'], f'pages out of order: {a} {b}'

offsets = Counter(p['pdf'] - p['page'] for p in pages)
print(f'{len(pages)} pages with verses: printed {pages[0]["page"]}–{pages[-1]["page"]}, pdf {pages[0]["pdf"]}–{pages[-1]["pdf"]}')
print('pdf − printed offsets seen:', dict(offsets))
short = lambda kind: [(c['pdf'], c['n'], c['s'], c['near']) for c in cands if c['ok'] == kind]
print('accepted by text:', len(short('text')), 'number lines')
print('accepted by margin over neighbours (pdf, verse, score, best neighbour):', short('margin') or 'none')
print('accepted by sequence (pdf, verse, score, best neighbour):', short('sequence') or 'none')
print('rejected (pdf, verse, score, best neighbour):', short(None) or 'none')
for p in problems:
    print('NOTE', p)
if gaps or overlaps:
    print('UNRESOLVED verses (not written):', 'gaps', gaps, 'overlaps', overlaps)
    sys.exit(1)

with open(OUT, 'w') as f:  # one page per line
    f.write('{ "edition": "qasim", "pages": [\n' + ',\n'.join('  ' + json.dumps(p) for p in pages) + '\n] }\n')
print(f'all {N} verses in exactly one page; wrote {os.path.relpath(OUT, ROOT)}')
