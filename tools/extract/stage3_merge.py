#!/usr/bin/env python3
"""Stage 3: apply the image-check corrections, build both editions for a verse range, merge them into the
existing edition.json files (existing verses/sections untouched), validate, and write atomically.
Usage: python3 tools/extract/stage3_merge.py <build.json> <corrections.json> <heads.json> <turathCache> <tf> <tl> \
           <vmin> <vmax> <repoRoot> <outValidation.json> [--write]
- corrections.json: {"<n><h>": {"text": ..., "note": ...}} typed from the 300-DPI crops (the image wins).
- heads.json: {"qasim": {id: title}, "zubi": {id: title}, "starts": {id: firstVerse}, "lastVerse": n}
Without --write it only validates and prints a summary."""
import json, os, re, sys, unicodedata, collections
sys.path.insert(0, os.path.dirname(__file__))
from common import zubi_parse, letters, is_mark, KASH
bj, cj, hj, cache, tf, tl, vmin, vmax, root, outv = sys.argv[1:11]
tf, tl, vmin, vmax = int(tf), int(tl), int(vmin), int(vmax)
WRITE = '--write' in sys.argv
B = json.load(open(bj)); C = json.load(open(cj)); HD = json.load(open(hj))
Z, _ = zubi_parse(cache, tf, tl, vmin, vmax)
nfc = lambda s: unicodedata.normalize('NFC', s)

def clean(t):
    t = nfc(re.sub(r'\s+', ' ', t).strip())
    return t

# --- Al-Qasim verses
qv = []
for n in range(vmin, vmax + 1):
    a = clean(C[f'{n}a']['text'] if f'{n}a' in C else B[f'{n}a']['text'])
    b = clean(C[f'{n}b']['text'] if f'{n}b' in C else B[f'{n}b']['text'])
    qv.append({'n': n, 'a': a, 'b': b})
# --- Zu'bi verses: as Turath has them; a missing separator is split where the PDF splits (same words)
zv = []; zsplit = []
for n in range(vmin, vmax + 1):
    v = Z[n]
    if v['sep']:
        zv.append({'n': n, 'a': nfc(v['a']), 'b': nfc(v['b'])})
    else:
        w = v['a'].split(); k = len([x for x in qv[n - vmin]['a'].split() if letters(x)])
        zv.append({'n': n, 'a': nfc(' '.join(w[:k])), 'b': nfc(' '.join(w[k:]))}); zsplit.append(n)

def sections(titles):
    ids = sorted(int(i) for i in HD['starts'])
    out = []
    for i, sid in enumerate(ids):
        st = HD['starts'][str(sid)]
        en = (HD['starts'][str(ids[i + 1])] - 1) if i + 1 < len(ids) else HD['lastVerse']
        out.append({'id': sid, 'title': nfc(titles[str(sid)]), 'kind': 'bab', 'parent': None, 'start': st, 'end': en})
    return out

ALLOWED_P = set('،:«»().؟!-')
def validate(d, label):
    res = {}
    ns = [v['n'] for v in d['verses']]
    res['continuous 1..1173'] = ns == list(range(1, 1174))
    res['a and b non-empty'] = all(v['a'].strip() and v['b'].strip() for v in d['verses'])
    top = [s for s in d['sections'] if s['parent'] is None]
    cov = collections.Counter()
    for s in top:
        for n in range(s['start'], s['end'] + 1): cov[n] += 1
    res['top-level sections cover every verse once'] = all(cov[n] == 1 for n in ns)
    res['nesting only فرش → surah'] = all((s['parent'] is None) or (s['parent'] == 34 and s['kind'] == 'surah') for s in d['sections'])
    res['section ids unique and sorted'] = [s['id'] for s in d['sections']] == sorted(set(s['id'] for s in d['sections']))
    res['NFC'] = all(nfc(v[h]) == v[h] for v in d['verses'] for h in 'ab')
    bad_k = []
    for v in d['verses']:
        for h in 'ab':
            t = v[h]
            for m in re.finditer(KASH, t):
                i = m.start()
                nxt = t[i + 1] if i + 1 < len(t) else ''
                prv = t[i - 1] if i > 0 else ''
                ok = (nxt and is_mark(nxt)) or (h == 'a' and i == len(t) - 1) or (h == 'b' and i == 0) or (nxt in ('', ' ') and label == 'qasim')
                if not ok: bad_k.append(f"{v['n']}{h}")
    res['U+0640 only at word splits or as a mark seat'] = bad_k or True
    odd = collections.Counter()
    for v in d['verses']:
        for h in 'ab':
            for c in v[h]:
                if c == ' ' or c in ALLOWED_P or is_mark(c) or letters(c) or c == KASH: continue
                odd[hex(ord(c))] += 1
    res['only Arabic letters, marks, allowed punctuation'] = dict(odd) or True
    return res

out = {'zubi_split': zsplit}
for ed, verses, titles in (('qasim', qv, HD['qasim']), ('zubi', zv, HD['zubi'])):
    path = os.path.join(root, 'data', 'editions', ed, 'edition.json')
    old = json.load(open(path))
    keep_v = [v for v in old['verses'] if not (vmin <= v['n'] <= vmax)]
    new_ids = set(int(i) for i in HD['starts'])
    keep_s = [s for s in old['sections'] if s['id'] not in new_ids]
    d = {'id': old['id'], 'name': old['name'], 'source': HD['source'][ed], 'verseCount': old['verseCount']}
    d['sections'] = sorted(sections(titles) + keep_s, key=lambda s: s['id'])
    d['verses'] = sorted(verses + keep_v, key=lambda v: v['n'])
    # existing data byte-identical
    ov = {v['n']: json.dumps(v, ensure_ascii=False) for v in old['verses']}
    os_ = {s['id']: json.dumps(s, ensure_ascii=False) for s in old['sections']}
    same_v = all(json.dumps(v, ensure_ascii=False) == ov[v['n']] for v in d['verses'] if v['n'] in ov)
    same_s = all(json.dumps(s, ensure_ascii=False) == os_[s['id']] for s in d['sections'] if s['id'] in os_)
    val = validate(d, ed)
    val['existing verses byte-identical'] = same_v and len([v for v in d['verses'] if v['n'] in ov]) == len(ov)
    val['existing sections byte-identical'] = same_s and len([s for s in d['sections'] if s['id'] in os_]) == len(os_)
    out[ed] = val
    if WRITE:
        tmp = path + '.tmp'
        with open(tmp, 'w') as f: f.write(json.dumps(d, ensure_ascii=False, indent=2))
        os.replace(tmp, path)
json.dump(out, open(outv, 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, v)
print('written' if WRITE else 'dry run')
