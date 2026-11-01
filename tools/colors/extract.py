"""Extract the red (reader codes) and green (Quranic words) spans of the Qasim PDF.

Usage: python3 -I tools/colors/extract.py <firstPdfPage> <lastPdfPage> <firstVerse> <lastVerse>
Writes tools/colors/_spans.json: {verse: [{h, s, e, k, t}]}, where h is the half ("a"/"b"),
s/e are character offsets into the verse text in edition.json, k is "r" or "g", t the text.

The PDF text layer keeps each run's exact characters and fill colour, but not the reading
order. So each half-verse of edition.json is rebuilt as a sequence of the page's runs
(an exact cover, ignoring kashida and spaces), which tells which of its letters are coloured.
"""
import json
import sys
import unicodedata
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
RED = (b'k', (0.0, 1.0, 0.0, 0.0))
GREEN = (b'rg', (0.2, 0.6, 0.4))
SKIP = {'ـ', ' ', '\n', '‌', '‍'}


def is_mark(ch):
    return unicodedata.category(ch) == 'Mn'


def norm(s):
    """Letters of s (no marks, kashida, spaces or punctuation), each with its index in s.

    Matching on letters only: the stored text and the PDF sometimes order the marks
    differently (e.g. «لَا» / «لاَ»). A coloured letter takes its own marks with it.
    The PDF also drops letters inside ligatures: the alef of some lam-alefs («اللام» comes
    out «اللم») and the ha of the word Allah («ٱللَّهُ» comes out «ٱللَُّ»). Both are
    skipped on both sides.
    """
    out = []
    for i, ch in enumerate(s):
        if not unicodedata.category(ch).startswith('L') or ch == '\u0640':
            continue
        prev = out[-1] if out else None
        joined = prev is not None and not any(c in ' \n' for c in s[prev[1]:i])
        if joined and ch == '\u0627' and prev[0] == '\u0644':
            continue
        if joined and ch == '\u0647' and len(out) > 1 and prev[0] == out[-2][0] == '\u0644':
            continue
        out.append((ch, i))
    return out


def mark_end(s, i):
    """Index just past the letter at i and what belongs to it: its marks, kashida, and a
    ligature letter skipped by norm (the alef of lam-alef, the ha of Allah)."""
    kept = {j for _, j in norm(s)}
    i += 1
    while i < len(s) and (is_mark(s[i]) or s[i] == '\u0640' or (s[i] in '\u0627\u0647' and i not in kept)):
        i += 1
    return i


def page_runs(page):
    runs, cur = [], [None]

    def op(o, args, cm, tm):
        if o in (b'rg', b'k', b'g'):
            cur[0] = (o, tuple(round(float(a), 2) for a in args))

    def tx(text, cm, tm, fd, fs):
        chars = ''.join(c for c, _ in norm(unicodedata.normalize('NFC', text)))
        raw = text.strip()
        if raw.isdigit():
            runs.append({'text': '', 'num': int(raw), 'k': '.'})
        elif chars:
            kind = 'r' if cur[0] == RED else 'g' if cur[0] == GREEN else '.'
            runs.append({'text': chars, 'k': kind})

    page.extract_text(visitor_operand_before=op, visitor_text=tx)
    return runs


def cover(target, runs, used):
    """Order unused runs so their texts concatenate to target. Returns [(runIndex, start)]."""
    best = None

    def dfs(pos, acc):
        nonlocal best
        if pos == len(target):
            best = list(acc)
            return True
        for i, r in enumerate(runs):
            if r['i'] in used or i in {j for j, _ in acc}:
                continue
            t = r['text']
            if target.startswith(t, pos):
                acc.append((i, pos))
                if dfs(pos + len(t), acc):
                    return True
                acc.pop()
        return False

    dfs(0, [])
    return best


def main():
    first, last, v0, v1 = map(int, sys.argv[1:5])
    edition = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text())
    verses = {v['n']: v for v in edition['verses'] if v0 <= v['n'] <= v1}
    reader = PdfReader(str(ROOT / 'sources/qasim.pdf'))
    runs = [r for i in range(first - 1, last) for r in page_runs(reader.pages[i])]
    for idx, r in enumerate(runs):
        r['i'] = idx

    # Each verse's runs follow its number in the content stream.
    segments, current = {}, None
    for r in runs:
        if r.get('num') in verses:
            current = r['num']
            continue
        if current is not None:
            segments.setdefault(current, []).append(r)

    used, out, failed = set(), {}, []
    sys.setrecursionlimit(10000)
    for n in sorted(verses):
        spans = []
        for h in ('a', 'b'):
            src = verses[n][h]
            chars = norm(src)
            target = ''.join(c for c, _ in chars)
            window = segments.get(n, [])
            order = cover(target, window, used)
            if order is None:
                failed.append(f'{n}{h}')
                continue
            for wi, pos in order:
                r = window[wi]
                used.add(r['i'])
                if r['k'] == '.':
                    continue
                s, e = chars[pos][1], mark_end(src, chars[pos + len(r['text']) - 1][1])
                spans.append({'h': h, 's': s, 'e': e, 'k': r['k']})
        # Merge touching pieces of one colour (e.g. «أ» + «َ» + «نَّ»).
        spans.sort(key=lambda x: (x['h'], x['s']))
        merged = []
        for sp in spans:
            src = verses[n][sp['h']]
            if merged and merged[-1]['h'] == sp['h'] and merged[-1]['k'] == sp['k'] \
                    and not src[merged[-1]['e']:sp['s']].strip():
                if src[merged[-1]['e']:sp['s']] == '':
                    merged[-1]['e'] = sp['e']
                    continue
            merged.append(dict(sp))
        for sp in merged:
            sp['t'] = verses[n][sp['h']][sp['s']:sp['e']]
        out[n] = merged

    unused = [r for r in runs if r['i'] not in used and r['k'] != '.']
    (ROOT / 'tools/colors/_spans.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('verses', len(out), 'failed', failed)
    print('red', sum(1 for v in out.values() for s in v if s['k'] == 'r'),
          'green', sum(1 for v in out.values() for s in v if s['k'] == 'g'))
    print('coloured runs not placed:', [(r['k'], r['text']) for r in unused])


if __name__ == '__main__':
    main()
