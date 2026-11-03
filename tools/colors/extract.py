"""Extract the red (reader codes) and green (Quranic words) spans of the Qasim PDF.

Usage: python3 -I tools/colors/extract.py <firstPdfPage> <lastPdfPage> <firstVerse> <lastVerse> [edition.json]
Merges into tools/colors/_spans.json (verses in range are replaced, others kept): {verse: [{h, s, e, k, t}]}, where h is the half ("a"/"b"),
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


def order_from(prev, n):
    """Run indices to try next. The content stream draws each line from left to right,
    so the next run in reading order is most likely the one just before the last."""
    if prev is None:
        return range(n)
    return sorted(range(n), key=lambda i: abs(i - (prev - 1)))


def cover(target, runs, used):
    """Order unused runs so their texts concatenate to target. Returns [(runIndex, start)]."""
    best = None

    def dfs(pos, acc):
        nonlocal best
        if pos == len(target):
            best = list(acc)
            return True
        for i in order_from(acc[-1][0] if acc else None, len(runs)):
            r = runs[i]
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


DROP = set('اٱأإآ')
# Halves with no cover whose coloured run occurs more than once: (verse, half, letters)
# -> which occurrence, read off a crop. 897b: the text has «بالكسر في السين», the PDF
# «في السين بالكسر»; the red ش is the first letter of «شُلْشُلَا».
PLACE = {(897, 'b', 'ش'): 0}


def skel(text):
    """Looser letters for the fallback cover: alef forms and small letters dropped, ى as ي."""
    return [('ي' if c == 'ى' else c, i) for i, c in enumerate(text)
            if c not in DROP and unicodedata.category(c) != 'Lm']


def cover_relaxed(chars, runs, used, src, gaps=2):
    """Fallback when the exact cover fails (alef/ya spellings differ, or the PDF drops a
    letter). Matches on skel(), may skip up to `gaps` letters of the text, and lets a
    run's final ya be absent from the text. Returns [(runIndex, firstChar, lastChar)]
    as indices into chars."""
    tsk = skel(''.join(c for c, _ in chars))
    target = ''.join(c for c, _ in tsk)
    rsk = [''.join(c for c, _ in skel(r['text'])) for r in runs]
    best, short = None, False

    def dfs(pos, acc, g):
        nonlocal best
        if pos == len(target):
            best = list(acc)
            return True
        taken = {j for j, _, _ in acc}
        for i in order_from(acc[-1][0] if acc else None, len(runs)):
            r = runs[i]
            if r['i'] in used or i in taken or not rsk[i]:
                continue
            for t in [rsk[i]] + ([rsk[i][:-1]] if short and rsk[i].endswith('ي') else []):
                if t and target.startswith(t, pos):
                    acc.append((i, pos, pos + len(t) - 1))
                    if dfs(pos + len(t), acc, g):
                        return True
                    acc.pop()
        if g > 0:
            return dfs(pos + 1, acc, g - 1)
        return False

    # Least loose first: no dropped ya, then no skipped letter, then up to `gaps`.
    for short, g in [(False, 0), (True, 0)] + [(True, k) for k in range(1, gaps + 1)]:
        if dfs(0, [], g):
            break
    else:
        return None
    def gap(x, y):
        """A space between letters x and y of chars: they are in different words."""
        return any(c in ' \n' for c in src[chars[x][1]:chars[y][1]])

    out = []
    for i, a, b in best:
        lo, hi = tsk[a][1], tsk[b][1]
        text = runs[i]['text']
        # Take in the dropped letters (alef forms) the run itself has at its edges.
        lead = len(text) - len(text.lstrip(''.join(DROP)))
        trail = len(text) - len(text.rstrip(''.join(DROP) + 'ى'))
        while lead and lo > 0 and chars[lo - 1][0] in DROP and not gap(lo - 1, lo):
            lo, lead = lo - 1, lead - 1
        while trail and hi + 1 < len(chars) and chars[hi + 1][0] in DROP | {'ى', 'ي'} \
                and (b + 1 >= len(tsk) or tsk[b + 1][1] > hi + 1) and not gap(hi, hi + 1):
            hi, trail = hi + 1, trail - 1
        out.append((i, lo, hi))
    return out


def main():
    first, last, v0, v1 = map(int, sys.argv[1:5])
    ed_path = Path(sys.argv[5]) if len(sys.argv) > 5 else ROOT / 'data/editions/qasim/edition.json'
    edition = json.loads(ed_path.read_text())
    verses = {v['n']: v for v in edition['verses'] if v0 <= v['n'] <= v1}
    reader = PdfReader(str(ROOT / 'sources/qasim.pdf'))
    runs = [r for i in range(first - 1, last) for r in page_runs(reader.pages[i])]
    for idx, r in enumerate(runs):
        r['i'] = idx

    # Each verse's runs follow its number in the content stream.
    segments, current = {}, None
    # Page numbers are digits too: a number starts a verse only in sequence.
    for r in runs:
        if r.get('num') in verses and (r['num'] == min(verses) if current is None else r['num'] == current + 1):
            current = r['num']
            continue
        r['v'] = current
        if current is not None:
            segments.setdefault(current, []).append(r)

    used, out, failed, relaxed = set(), {}, [], []
    sys.setrecursionlimit(10000)
    for n in sorted(verses):
        spans = []
        for h in ('a', 'b'):
            src = verses[n][h]
            chars = norm(src)
            target = ''.join(c for c, _ in chars)
            window = segments.get(n, [])
            order = cover(target, window, used)
            if order is not None:
                order = [(wi, pos, pos + len(window[wi]['text']) - 1) for wi, pos in order]
            else:
                order = cover_relaxed(chars, window, used, src)
                if order is None:
                    # Last resort (the text's word order differs from the PDF's): place
                    # each coloured run of the verse found exactly once in this half.
                    failed.append(f'{n}{h}')
                    tsk = skel(target)
                    flat = ''.join(c for c, _ in tsk)
                    order = []
                    for wi, r in enumerate(window):
                        t = ''.join(c for c, _ in skel(r['text']))
                        if r['i'] in used or r['k'] == '.' or not t:
                            continue
                        if flat.count(t) == 1:
                            a = flat.index(t)
                        elif (n, h, t) in PLACE:  # checked on a crop
                            a = [m for m in range(len(flat)) if flat.startswith(t, m)][PLACE[n, h, t]]
                        else:
                            continue
                        order.append((wi, tsk[a][1], tsk[a + len(t) - 1][1]))
                else:
                    relaxed.append(f'{n}{h}')
            starts = {}
            for wi, lo, hi in order:
                r = window[wi]
                used.add(r['i'])
                starts[wi] = chars[lo][1]
                if r['k'] == '.':
                    continue
                s, e = chars[lo][1], mark_end(src, chars[hi][1])
                spans.append({'h': h, 's': s, 'e': e, 'k': r['k']})
            # A coloured run that is only an alef (the alef of a lam-alef ligature, or a
            # word's first alef the loose cover skipped) goes on the alef just before the
            # run that follows it in reading order (the one drawn before it in the stream).
            for wi, r in enumerate(window):
                if r['i'] in used or r['k'] == '.' or not r['text'] or set(r['text']) - DROP:
                    continue
                if wi - 1 not in starts:
                    continue
                j = starts[wi - 1] - 1
                while j >= 0 and (is_mark(src[j]) or src[j] == '\u0640'):
                    j -= 1
                if j >= 0 and src[j] in DROP:
                    used.add(r['i'])
                    spans.append({'h': h, 's': j, 'e': starts[wi - 1], 'k': r['k']})
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

    unused = [r for r in runs if r['i'] not in used and r['k'] != '.'
              and not (r['k'] == 'r' and ('سورة' in r['text'] or 'باب' in r['text']))]
    store = ROOT / 'tools/colors/_spans.json'
    allspans = json.loads(store.read_text()) if store.exists() else {}
    for n in verses:
        allspans.pop(str(n), None)
    for n, v in out.items():
        allspans[str(n)] = v
    allspans = dict(sorted(allspans.items(), key=lambda kv: int(kv[0])))
    store.write_text(json.dumps(allspans, ensure_ascii=False, indent=1))
    print('verses', len(out), 'no cover (coloured runs placed by search, check on a crop):', failed)
    print('relaxed cover (check on a crop):', relaxed)
    print('red', sum(1 for v in out.values() for s in v if s['k'] == 'r'),
          'green', sum(1 for v in out.values() for s in v if s['k'] == 'g'))
    print('coloured runs not placed:', len(unused), [(r.get('v'), r['k'], r['text']) for r in unused][:60])


if __name__ == '__main__':
    main()
