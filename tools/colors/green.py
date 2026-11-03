"""Find the Quran places of the green spans by script, and keep tools/colors/green.json.

Usage:
  python3 tools/colors/green.py <quran.txt> <firstVerse> <lastVerse> [edition.json]
      Proposes entries for verses in range that green.json lacks (or whose span count
      changed). A span with exactly one place (in the section's surahs, else in the whole
      Quran) is filled by script; the rest go to tools/colors/_pending.json with their
      candidates, for a decision by hand.
  python3 tools/colors/green.py --apply <decisions.json>
      Merges hand decisions {verse: {index: entry}} into green.json.

quran.txt: Tanzil «simple-clean», lines «surah|ayah|text» (data only, kept out of the repo).
green.json: {verse: [{q: [[surah, ayah], ...], x: snippet, note?, by}]}, one entry per green
span in reading order. by: "script", "script-quran" (one place, outside the section's
surahs), "judgement", "sharh" (أبو شامة «إبراز المعاني», Turath 5486, or السخاوي «فتح
الوصيد», Turath 880), "pilot", "first" (الأصول: the first of several places, «حيث وقع»), or "letter" (مخارج الحروف: a letter, not a Quran word).
"""
import json
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GREEN = ROOT / 'tools/colors/green.json'
PENDING = ROOT / 'tools/colors/_pending.json'

# Section id of edition.json -> the surahs it covers (first, last).
SECTION_SURAHS = {
    35: (2, 2), 36: (3, 3), 37: (4, 4), 38: (5, 5), 39: (6, 6), 40: (7, 7), 41: (8, 8),
    42: (9, 9), 43: (10, 10), 44: (11, 11), 45: (12, 12), 46: (13, 13), 47: (14, 14),
    48: (15, 15), 49: (16, 16), 50: (17, 17), 51: (18, 18), 52: (19, 19), 53: (20, 20),
    54: (21, 21), 55: (22, 22), 56: (23, 23), 57: (24, 24), 58: (25, 25), 59: (26, 26),
    60: (27, 27), 61: (28, 28), 62: (29, 29), 63: (30, 34), 64: (34, 35), 65: (36, 36),
    66: (37, 37), 67: (38, 38), 68: (39, 39), 69: (40, 40), 70: (41, 41), 71: (42, 44),
    72: (45, 46), 73: (47, 55), 74: (55, 55), 75: (56, 57), 76: (58, 68), 77: (68, 75),
    78: (75, 78), 79: (78, 96), 80: (96, 114), 81: (93, 114),
}
# Plain alef forms drop (the two scripts spell long a differently); every hamza is ء.
DROPPED = set('اٱـ')
MAP = {'ى': 'ي', 'ة': 'ه', 'ء': 'ء', 'أ': 'ء', 'إ': 'ء', 'ؤ': 'ء', 'ئ': 'ء', 'آ': 'ء', '\u0654': 'ء', '\u0655': 'ء'}
PREFIXES = {'', 'و', 'ف', 'ب', 'ل', 'ك', 'س', 'لل', 'ول', 'فل', 'بل', 'كل', 'وب', 'فب', 'وك',
            'فس', 'وس', 'ولل', 'فلل', 'وبل', 'فبل', 'وكل', 'لت', 'ولت', 'فلت'}
SUFFIXES = {'ه', 'ها', 'هم', 'هن', 'هما', 'كم', 'كن', 'نا', 'ي', 'ك', 'ن', 'و', 'ون', 'ين', 'ت', 'تم', 'وا'}


def sk(word):
    out = []
    for c in unicodedata.normalize('NFC', word):
        cat = unicodedata.category(c)
        if c in MAP:
            if not (MAP[c] == 'ء' and out and out[-1] == 'ء'):
                out.append(MAP[c])
            continue
        if not cat.startswith('L') or cat == 'Lm' or c in DROPPED:
            continue
        out.append(c)
    return ''.join(out)


def words(text):
    return [w for w in (sk(x) for x in text.split()) if w]


BASMALA = 'بسم الله الرحمن الرحيم'
LETTER = {'q': [], 'x': '', 'note': 'حرف من حروف الباب، لا كلمة قرآنية', 'by': 'letter'}


def load_quran(path):
    ayat = []
    for line in Path(path).read_text(encoding='utf-8').splitlines():
        parts = line.split('|')
        if len(parts) == 3 and parts[0].isdigit():
            s, a, text = int(parts[0]), int(parts[1]), parts[2]
            if a == 1 and s != 1 and text.startswith(BASMALA):  # Tanzil puts it on ayah 1
                text = text[len(BASMALA):].lstrip()
            # Pause marks are tokens of their own; keep only the words, so that a match's
            # index also finds its words for the snippet.
            text = ' '.join(t for t in text.split() if sk(t))
            ayat.append((s, a, text, words(text)))
    ayat = [(s, a, t, w, ''.join(w)) for s, a, t, w in ayat]
    return ayat


def lev1(x, y):
    """Edit distance of x and y is at most 1."""
    if abs(len(x) - len(y)) > 1:
        return False
    i = 0
    while i < min(len(x), len(y)) and x[i] == y[i]:
        i += 1
    return x[i + 1:] == y[i + 1:] or x[i:] == y[i + 1:] or x[i + 1:] == y[i:]


def wmatch(q, a, level):
    """level 0: same word, or one with a prefix (و ف ب ل ك ال ...); 1: also a suffix
    (pronoun, plural); 2: also one letter different (the poem spells a variant reading)."""
    if q == a:
        return True
    for x, y in ((q, a), (a, q)):
        if y.endswith(x) and y[:len(y) - len(x)] in PREFIXES and len(x) >= 2:
            return True
    if level >= 1 and len(q) >= 3:
        for p in PREFIXES:
            if a.startswith(p) and a[len(p):].startswith(q) and a[len(p) + len(q):] in SUFFIXES:
                return True
            if q.startswith(p) and len(q) - len(p) >= 3 and a.startswith(q[len(p):]) \
                    and a[len(q) - len(p):] in SUFFIXES:
                return True
    if level >= 2 and len(q) >= 3:
        qh, ah = q.replace('ء', ''), a.replace('ء', '')
        if qh == ah and len(qh) >= 2:
            return True
        return len(q) >= 4 and any(lev1(q[len(p):], a[len(r):]) for p in ('', 'و', 'ف')
                                   for r in ('', 'و', 'ف') if q.startswith(p) and a.startswith(r))
    return False


def find(ayat, qw, level, surahs=None):
    hits = []
    # Below level 2 a match contains the query word less at most 3 prefix letters.
    core = max(qw, key=len)[3:] if level < 2 else ''
    for s, a, text, aw, joined in ayat:
        if surahs and not surahs[0] <= s <= surahs[1]:
            continue
        if core and core not in joined:
            continue
        for i in range(len(aw) - len(qw) + 1):
            if all(wmatch(q, aw[i + j], level) for j, q in enumerate(qw)):
                ws = text.split()
                lo, hi = max(0, i - 1), min(len(ws), i + len(qw) + 1)
                hits.append((s, a, ' '.join(ws[lo:hi])))
                break
    return hits


def is_gap(c):
    return c.isspace() or c in ':،؛.'


def expand(v, sp, nxt):
    """(coloured text, whole words of the half it touches, the word before, the word
    after). A word broken across the halves («مُعَٰجِزِيـ / نَ») takes in its end from
    half b when that end is green too."""
    src = v[sp['h']]
    s, e = sp['s'], sp['e']
    while s > 0 and not is_gap(src[s - 1]):
        s -= 1
    while e < len(src) and not is_gap(src[e]):
        e += 1
    text, coloured = src[s:e], sp['t']
    if sp['h'] == 'a' and e >= len(src.rstrip()) and nxt and nxt['h'] == 'b' and nxt['s'] == 0:
        text += nxt['t']
        coloured += nxt['t']
    return coloured, text, src[:s].split()[-1:], src[e:].split()[:1]


def search(ayat, sp, v, surahs, nxt):
    """(entry, candidates) for one green span; see the module doc for `by`.
    Places in the section's own surahs come first, by stricter match first; a place
    elsewhere is taken only when nothing in the section fits at all."""
    coloured, text, before, after = expand(v, sp, nxt)
    queries = [words(coloured)]
    if words(text) != queries[0]:
        queries.append(words(text))
    queries = [q for q in queries if q and sum(map(len, q)) >= 2]
    if not queries:
        return None, []
    cands, by = [], None
    for level, by in ((0, 'script'), (1, 'script'), (2, 'script-fuzzy')):
        for qw in queries:
            cands = find(ayat, qw, level, surahs)
            if cands:
                break
        if cands:
            break
    if not cands:
        for level in (0, 1):
            for qw in queries:
                cands = find(ayat, qw, level)
                if cands:
                    by = 'script-quran'
                    break
            if cands:
                break
    if len(cands) == 1:
        return {'q': [list(cands[0][:2])], 'x': cands[0][2], 'by': by}, cands
    # Several places: a neighbouring word of the poem may be Quranic too and pick one.
    for qw in (words(' '.join([text] + after)), words(' '.join(before + [text]))):
        if len(qw) <= len(queries[0]):
            continue
        sub = {(s, a) for s, a, _ in find(ayat, qw, 1)}
        inside = [c for c in cands if (c[0], c[1]) in sub]
        if len(inside) == 1:
            return {'q': [list(inside[0][:2])], 'x': inside[0][2], 'by': 'script-context'}, inside
    # Places found only by the loosest match are marked, so none is taken as «first».
    return None, cands if by != 'script-fuzzy' else [c + ('fuzzy',) for c in cands]


def section_of(edition, n):
    best = None
    for sec in edition['sections']:
        if sec['start'] <= n <= sec['end'] and sec['id'] in SECTION_SURAHS:
            best = sec['id']
    return best


def propose(quran_path, v0, v1, ed_path):
    ayat = load_quran(quran_path)
    edition = json.loads(Path(ed_path).read_text())
    verses = {v['n']: v for v in edition['verses']}
    spans = json.loads((ROOT / 'tools/colors/_spans.json').read_text())
    green = json.loads(GREEN.read_text()) if GREEN.exists() else {}
    pending, stats, seq = {}, {'script': 0, 'script-quran': 0, 'pending': 0, 'kept': 0}, []
    for key, items in spans.items():
        n = int(key)
        if not v0 <= n <= v1:
            continue
        gs = [sp for sp in sorted(items, key=lambda x: (x['h'], x['s'])) if sp['k'] == 'g']
        if not gs:
            continue
        if key in green and len(green[key]) == len(gs):
            stats['kept'] += len(gs)
            continue
        sec = section_of(edition, n)
        lo, hi = SECTION_SURAHS.get(sec, (1, 114))
        entries = []
        for idx, sp in enumerate(gs):
            qw = words(sp['t'])
            prev = gs[idx - 1] if idx else None
            if sp['h'] == 'b' and sp['s'] == 0 and prev and prev['h'] == 'a' \
                    and prev['e'] >= len(verses[n]['a'].rstrip()) and entries \
                    and (verses[n]['a'].rstrip().endswith('ـ') or len(''.join(qw)) <= 2):
                # The end of a word broken across the halves: same place as its start.
                entry = entries[-1] and {**entries[-1], 'by': entries[-1]['by']}
                cands = seq[-1][5] if seq else []
            elif sec is None and len(''.join(qw)) <= 1:
                # الأصول list single letters in green (the letters a rule applies to).
                entry, cands = dict(LETTER), []
            else:
                entry, cands = search(ayat, sp, verses[n], (lo, hi), gs[idx + 1] if idx + 1 < len(gs) else None)
            if entry:
                stats[entry['by']] = stats.get(entry['by'], 0) + 1
            seq.append((n, idx, sec if sec is not None else -n, lo == hi and lo, ' '.join(qw), cands or []))
            entries.append(entry)
        green[key] = entries

    # Second pass, for spans with several places: a word repeated from the last few verses
    # takes the same place ("repeat"); otherwise, in a one-surah section, the فرش follows
    # the mushaf, so a single place between the nearest places found before and after it
    # in the same section is taken ("order").
    def place(i):
        n, idx, *_ = seq[i]
        e = green[str(n)][idx]
        return e['q'][0][1] if e and e['by'] in ('script', 'script-context', 'pilot') and len(e['q']) == 1 else None

    for i, (n, idx, sec, surah, key, cands) in enumerate(seq):
        if green[str(n)][idx] is not None:
            continue
        entry = None
        for j in range(i - 1, -1, -1):
            pn, pidx, psec, _, pkey, _ = seq[j]
            if n - pn > 3:
                break
            pe = green[str(pn)][pidx]
            if pkey == key and pe:
                entry = {**pe, 'by': 'repeat'}
                break
        if not entry and surah and cands:
            before = next((place(j) for j in range(i - 1, -1, -1) if seq[j][2] == sec and place(j)), 0)
            after = next((place(j) for j in range(i + 1, len(seq)) if seq[j][2] == sec and place(j)), 999)
            inside = [c for c in cands if c[0] == surah and before <= c[1] <= after]
            if before <= after and len(inside) == 1:
                entry = {'q': [list(inside[0][:2])], 'x': inside[0][2], 'by': 'order'}
        if not entry and sec < 0 and 1 < len(cands) <= 400 and len(cands[0]) == 3:
            # الأصول name a word for the whole Quran: its first place, «حيث وقع».
            entry = {'q': [list(cands[0][:2])], 'x': cands[0][2], 'note': 'حيث وقع', 'by': 'first'}
        if entry:
            green[str(n)][idx] = entry
            stats[entry['by']] = stats.get(entry['by'], 0) + 1
        else:
            stats['pending'] += 1
            sp = [x for x in sorted(spans[str(n)], key=lambda x: (x['h'], x['s'])) if x['k'] == 'g'][idx]
            pending.setdefault(str(n), {})[idx] = {
                't': sp['t'], 'h': sp['h'],
                'c': [f'{c[0]}:{c[1]} {c[2]}' for c in cands[:8]], 'nc': len(cands)}
    green = dict(sorted(green.items(), key=lambda kv: int(kv[0])))
    GREEN.write_text(dump(green))
    PENDING.write_text(json.dumps(pending, ensure_ascii=False, indent=1))
    print(stats)


def dump(green):
    """One line per verse keeps green.json easy to read and diff."""
    lines = [f' "{k}": ' + json.dumps(v, ensure_ascii=False) for k, v in green.items()]
    return '{\n' + ',\n'.join(lines) + '\n}\n'


def apply(path):
    green = json.loads(GREEN.read_text())
    decisions = json.loads(Path(path).read_text())
    for key, items in decisions.items():
        for idx, entry in items.items():
            green[key][int(idx)] = entry
    GREEN.write_text(dump(green))
    left = sum(e is None for v in green.values() for e in v)
    print('applied', sum(len(v) for v in decisions.values()), 'still empty', left)


if __name__ == '__main__':
    if sys.argv[1] == '--apply':
        apply(sys.argv[2])
    else:
        propose(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]),
                sys.argv[4] if len(sys.argv) > 4 else ROOT / 'data/editions/qasim/edition.json')
