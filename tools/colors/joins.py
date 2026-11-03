"""Find green pieces that are one Quran word or phrase split in two, and keep tools/colors/joins.json.

Usage: python3 tools/colors/joins.py <quran.txt>

Two green marks next to each other are a candidate when nothing but spaces (or the kashida that
breaks a word across the halves) lies between them: the end of half a and the start of half b
(«ٱلۡـ / ـقِتَالُ», «وَٰسِعٌ / عَلِيمٞ»), or two marks in one half. The joined text is searched
in the Quran (green.py's matching):
  sure   the phrase is in the place one of the pieces already had, or a piece is a broken word
         («ٱلۡـ», a lone «ما» with no place) and the phrase is found;
  doubt  the phrase is found but in neither piece's place: the owner decides in the editor.
Not found: the pieces stay apart. Decisions already in joins.json (approved / rejected) are kept.
annotate.py applies the joins that are sure or approved: both marks get the phrase's place and
`w`, the whole phrase shown when either piece is tapped.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from green import ROOT, SECTION_SURAHS, find, load_quran, words  # noqa: E402

JOINS = ROOT / 'tools/colors/joins.json'


def section_of(sections, n):
    best = None
    for s in sections:
        if s['start'] <= n <= s['end'] and (best is None or s['end'] - s['start'] < best['end'] - best['start']):
            best = s
    return best['id'] if best else None


def main():
    ayat = load_quran(sys.argv[1])
    ed = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text())
    verses = {v['n']: v for v in ed['verses']}
    colors = json.loads((ROOT / 'data/editions/qasim/colors.json').read_text())
    old = json.loads(JOINS.read_text()) if JOINS.exists() else {}
    out = {}
    for key, marks in colors['verses'].items():
        n = int(key)
        v = verses[n]
        g = [m for m in marks if m['k'] == 'g']
        for m1, m2 in zip(g, g[1:]):
            t1, t2 = v[m1['h']][m1['s']:m1['e']], v[m2['h']][m2['s']:m2['e']]
            if m1['h'] == m2['h']:
                if v[m1['h']][m1['e']:m2['s']].strip():
                    continue
            elif v['a'][m1['e']:].strip(' ـ') or v['b'][:m2['s']].strip(' ـ'):
                continue
            broken = t1.endswith('ـ') or t2.startswith('ـ') or (m1['h'] != m2['h'] and v['a'].rstrip().endswith('ـ'))
            w = (t1.rstrip('ـ') + t2.lstrip('ـ')) if broken else f'{t1} {t2}'
            qw = words(w)
            hits = find(ayat, qw, 0) or find(ayat, qw, 1)
            if not hits:
                continue
            id_ = f'{n}:{m1["h"]}{m1["s"]}'
            had = [tuple(q) for m in (m1, m2) for q in m.get('q', [])]
            inside = [h for h in hits if (h[0], h[1]) in had]
            sec = SECTION_SURAHS.get(section_of(ed['sections'], n))
            local = [h for h in hits if sec and sec[0] <= h[0] <= sec[1]]
            pick = (inside or local or hits)[0]
            lone = not m1.get('q') or not m2.get('q')
            status = 'sure' if inside or broken or lone else 'doubt'
            entry = {'n': n, 'marks': [[m1['h'], m1['s']], [m2['h'], m2['s']]], 'w': w,
                     'q': [list(pick[:2])], 'x': pick[2], 'status': status,
                     'was': [t1, t2], 'places': len(hits)}
            if len(hits) > 1 and not inside and not local:
                entry['note'] = 'حيث وقع'
            prev = old.get(id_)
            if prev and prev['status'] in ('approved', 'rejected') and prev['w'] == w:
                entry['status'] = prev['status']
                entry['q'], entry['x'] = prev['q'], prev['x']
            out[id_] = entry
    JOINS.write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    by = {}
    for e in out.values():
        by[e['status']] = by.get(e['status'], 0) + 1
    print(len(out), 'joins', by)


if __name__ == '__main__':
    main()
