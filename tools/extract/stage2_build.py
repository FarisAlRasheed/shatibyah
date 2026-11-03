#!/usr/bin/env python3
"""Stage 2: build the Al-Qasim halves from the two PDF extractors, with Zu'bi as the word skeleton.
Usage: python3 tools/extract/stage2_build.py <turathCache> <turathFirstPg> <turathLastPg> <vmin> <vmax> \
           <pdfkit.json> <pieces.json> <out.json>
- pdfkit.json from pdfkit-strings.swift (reading order), pieces.json from stage1_pieces.py (pypdf, positions).
- For each half: find its window in the PDFKit stream (aligned on a loose skeleton without ا/ل),
  merge it letter by letter with the x-ordered pypdf pieces (pypdf keeps the tanwin of «اً» and the lām of
  lam-alif ligatures that PDFKit drops; PDFKit keeps order, the alif of lam-alif, and pieces pypdf lost),
  then cut into words on pypdf spaces / Zu'bi boundaries.
- Flags (-> image check): any merge that is not a clean known pattern, pieces lost by pypdf, kashida seats,
  word-count or split differences from Zu'bi, punctuation, lam-alif rebuilt, Allah, اً, hamza seats.
Prints only counts. Output: {"<n><h>": {page, text, flags[], W, P, Z}}"""
import json, re, sys, difflib, collections, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

cache, tf, tl, vmin, vmax, kf, pf, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6], sys.argv[7], sys.argv[8]
K = json.load(open(kf)); PC = json.load(open(pf))
Z, _ = zubi_parse(cache, tf, tl, vmin, vmax)
FOLD = str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي', 'ة': 'ه'})
PUN = set('،:«»()-.؟!')
def sk2(s): return ''.join(c for c in letters(s).translate(FOLD) if c not in 'لا')

def clusters(s):
    """[[base, marks]] ; base is a letter, kashida (only kept if it carries marks), punctuation, or ' '"""
    out = []
    for c in s:
        if is_mark(c):
            if out and out[-1][0] != ' ': out[-1][1] += c
            else: out.append(['', c])           # stray mark
        elif c == KASH:
            out.append([KASH, ''])
        elif c.isspace():
            if out and out[-1][0] != ' ': out.append([' ', ''])
        elif letters(c) or c in PUN:
            out.append([c, ''])
    # drop bare kashida (justification); keep kashida that carries a mark
    return [x for x in out if not (x[0] == KASH and not x[1])]

def window(S, zt):
    """S: page stream without spaces/digits. zt: target text. Returns (start, end) indexes into S."""
    L = [(i, ch.translate(FOLD)) for i, ch in enumerate(S) if letters(ch)]
    idx = [i for i, ch in L if ch not in 'لا']
    sk = ''.join(S[i].translate(FOLD) for i in idx)
    zs = sk2(zt)
    if not zs: return None
    sm = difflib.SequenceMatcher(None, zs, sk, autojunk=False)
    m = sm.find_longest_match(0, len(zs), 0, len(sk))
    if m.size < 2: return None
    lo = max(0, m.b - m.a - 8); hi = min(len(sk), m.b + len(zs) - m.a + 8)
    bl = [b for b in difflib.SequenceMatcher(None, zs, sk[lo:hi], autojunk=False).get_matching_blocks() if b.size >= 2]
    if not bl: return None
    a0 = bl[0].a; b0 = lo + bl[0].b; a1 = bl[-1].a + bl[-1].size; b1 = lo + bl[-1].b + bl[-1].size
    # unmatched skeleton letters at the ends: extend by the same number of letters
    st = idx[max(0, b0 - a0)]; en = idx[min(len(idx) - 1, b1 - 1 + (len(zs) - a1))]
    zl = letters(zt).translate(FOLD)
    lead = list(zl[:len(zl) - len(zl.lstrip('لا'))]); tail = list(zl[len(zl.rstrip('لا')):])
    def walk(i, step, exp):
        k = 0
        while k < len(exp):
            j = i + step
            while 0 <= j < len(S) and (is_mark(S[j]) or S[j] == KASH): j += step
            if not (0 <= j < len(S)): break
            c = S[j].translate(FOLD)
            if c == exp[k]: i = j; k += 1
            elif exp[k] == 'ل' and k + 1 < len(exp) and c == exp[k + 1]: i = j; k += 2   # lam lost in a ligature
            else: break
        return i
    st = walk(st, -1, lead[::-1])
    i = walk(en, 1, tail)
    en = i + 1
    while en < len(S) and (is_mark(S[en]) or S[en] == KASH): en += 1
    # punctuation directly before/after the window
    while st > 0 and S[st - 1] in '«(': st -= 1
    while en < len(S) and S[en] in '،:»)': en += 1
    return st, en

def ms(cl): return collections.Counter(m for c in cl for m in c[1])

def merge(Wc, Pc, Psp, flags, depth=0):
    """letter-by-letter merge of PDFKit clusters Wc and pypdf clusters Pc.
    fin items: [base, marks, space_after|None, added_marks|None, 'W' if PDFKit-only]"""
    Wb = [c[0] for c in Wc]; Pb = [c[0] for c in Pc]
    sm = difflib.SequenceMatcher(None, Wb, Pb, autojunk=False)
    fin = []; wonly = []; ponly = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for i, j in zip(range(i1, i2), range(j1, j2)):
                wm, pm = Wc[i][1], Pc[j][1]
                add = collections.Counter(wm) - collections.Counter(pm)
                fin.append([Pc[j][0], pm + ''.join(add.elements()), Psp[j], ''.join(add.elements())])
        elif op == 'replace' and i2 - i1 == j2 - j1 and all(Wb[i] == 'ا' and Pb[j] == 'ل' for i, j in zip(range(i1, i2), range(j1, j2))):
            for i, j in zip(range(i1, i2), range(j1, j2)):    # lam-alif: pypdf kept ل, PDFKit kept ا
                pm = Pc[j][1]; rest = (collections.Counter(Wc[i][1]) - collections.Counter(pm))
                fin.append(['ل', pm, False]); fin.append(['ا', ''.join(rest.elements()), Psp[j]])
            flags.append('lamalif-rebuilt')
        elif op == 'replace' and i2 - i1 == j2 - j1 and all(Wb[i].translate(FOLD) == Pb[j].translate(FOLD) for i, j in zip(range(i1, i2), range(j1, j2))):
            for i, j in zip(range(i1, i2), range(j1, j2)):    # same letter, other code (ى/ي, أ/ا ...)
                wm, pm = Wc[i][1], Pc[j][1]
                add = collections.Counter(wm) - collections.Counter(pm)
                base = 'ى' if {Wb[i], Pb[j]} == {'ى', 'ي'} else Pb[j]   # undotted yā is printed: one extractor saw it
                fin.append([base, pm + ''.join(add.elements()), Psp[j]])
                flags.append('code-differs:%s/%s' % (Wb[i], Pb[j]))
        else:
            if i2 > i1:
                wonly.append((len(fin), Wc[i1:i2]))
                for i in range(i1, i2): fin.append([Wc[i][0], Wc[i][1], None, None, 'W'])
            if j2 > j1:
                ponly.append((len(fin), Pc[j1:j2], Psp[j1:j2]))
                for j in range(j1, j2): fin.append([Pc[j][0], Pc[j][1], Psp[j], None, 'P'])
    # moved groups: a pypdf-only run that matches a PDFKit-only run elsewhere (pieces in the wrong order)
    if depth == 0 and wonly and ponly:
        drop = set(); repl = {}
        for pi, pc, psp in ponly:
            k = sk2(''.join(c[0] for c in pc))
            for wi, wc in wonly:
                if wi in repl or not k: continue
                if sk2(''.join(c[0] for c in wc)) == k:
                    sub = merge(wc, pc, psp, flags, 1)
                    repl[wi] = (len(wc), sub); drop.update(range(pi, pi + len(pc)))
                    flags.append('moved-group:' + ''.join(c[0] for c in pc)); break
        if repl:
            new = []; i = 0
            while i < len(fin):
                if i in repl:
                    ln, sub = repl[i]; new.extend(sub); i += ln; continue
                if i not in drop: new.append(fin[i])
                i += 1
            fin = new
    return fin

def classify(fin, flags):
    for i, c in enumerate(fin):
        if len(c) < 5: continue
        prev = fin[i - 1][0] if i > 0 else ''
        nxt = fin[i + 1][0] if i + 1 < len(fin) else ''
        if c[4] == 'P' and c[0] == 'ا' and prev == 'ل': flags.append('lamalif-pdfkit-lost-alif')
        elif c[4] == 'P' and c[0] in 'ىي' and prev == 'ل': flags.append('lamya-pdfkit-lost-ya')
        elif c[4] == 'W' and c[0] == 'ل' and nxt == 'ا': flags.append('lamalif-pypdf-lost-lam')
        else: flags.append(('pdfkit-only:' if c[4] == 'W' else 'pypdf-only:') + c[0])

res = {}
stats = collections.Counter()
for pg, pd in PC.items():
    S = re.sub(r'[\s\d]+', '', K[pg]).replace('\x1a', '').replace('�', '')
    S = re.sub(r'(?<![ء-ۿ])-|-(?![ء-ۿ])', '', S)   # verse-number dashes
    lostp = ' '.join(PC[pg]['lost'])
    for n, v in pd['verses'].items():
        n = int(n)
        for h in 'ab':
            flags = []
            z = Z[n][h] if Z[n]['sep'] else None
            if not Z[n]['sep']: flags.append('zubi-no-separator')
            P0 = ''.join(t for x, y, t in sorted(v[h], key=lambda q: -q[0]))
            win = window(S, z if z else P0)
            W = S[win[0]:win[1]] if win else ''
            Wl = letters(W)
            def place(piece):
                pl = letters(piece[2])
                if not pl: return (10 ** 6, -piece[0])
                m = difflib.SequenceMatcher(None, pl, Wl, autojunk=False).find_longest_match(0, len(pl), 0, len(Wl))
                return ((m.b - m.a) if m.size >= min(2, len(pl)) else 10 ** 5, -piece[0])
            xo = sorted(v[h], key=lambda q: (-round(q[0], 1), -len(letters(q[2]))))
            ordered = xo
            if Wl:
                longp = [p for p in xo if len(letters(p[2])) >= 3]
                lw = sorted(longp, key=place)
                if lw != longp:
                    # long pieces in PDFKit order; short pieces stay right after their x-order predecessor
                    ordered = []; att = {id(p): [] for p in longp}; head = []
                    last = None
                    for p in xo:
                        if id(p) in att: last = p
                        elif last is None: head.append(p)
                        else: att[id(last)].append(p)
                    ordered = head + [q for p in lw for q in [p] + att[id(p)]]
                    flags.append('pieces-reordered')
            P = ''.join(t if letters(t) else ' ' + t.strip() + ' ' for x, y, t in ordered)   # lone marks stay stray
            if not win: flags.append('no-window')
            Wc = [c for c in clusters(W)]
            Pc_all = clusters(P)
            stray = [mk for b, mk in Pc_all if b == '']
            Pc = [c for c in Pc_all if c[0] not in ('', ' ')]
            # space-after flags from pypdf
            Psp = []
            for i, c in enumerate(Pc_all):
                if c[0] in ('', ' '): continue
                nxt = Pc_all[i + 1][0] if i + 1 < len(Pc_all) else ' '
                Psp.append(nxt == ' ')
            fin = merge(Wc, Pc, Psp, flags)
            # PDFKit-only letters at the edges of the half that are not in pypdf's lost pieces: window overshoot
            lostl = collections.Counter(letters(lostp))
            for edge in (0, -1):
                while fin and len(fin[edge]) > 4 and fin[edge][4] == 'W' and not lostl[fin[edge][0]] and fin[edge][0] not in PUN:
                    fin.pop(edge); flags.append('edge-trimmed')
            # PDFKit-only runs that are whole pypdf pieces with a lost position: take the piece's own codes
            lostpieces = [clusters(t) for t in PC[pg]['lost']]
            i = 0
            while i < len(fin):
                if len(fin[i]) > 4 and fin[i][4] == 'W':
                    j = i
                    while j < len(fin) and len(fin[j]) > 4 and fin[j][4] == 'W': j += 1
                    run = ''.join(c[0] for c in fin[i:j])
                    for lp in lostpieces:
                        lpc = [c for c in lp if c[0] not in ('', ' ')]
                        if ''.join(c[0] for c in lpc) == run:
                            for k, c in enumerate(lpc):
                                add = collections.Counter(fin[i + k][1]) - collections.Counter(c[1])
                                fin[i + k] = [c[0], c[1] + ''.join(add.elements()), None, ''.join(add.elements())]
                            flags.append('lost-piece:' + run); lostpieces.remove(lp); break
                    i = j
                else: i += 1
            classify(fin, flags)
            # lam-alif: PDFKit puts the ligature's marks on whichever letter it kept; don't double them
            added = collections.Counter()
            for i, c in enumerate(fin):
                if len(c) > 3 and c[3] and len(c) < 5:
                    nb = fin[i + 1] if i + 1 < len(fin) else None
                    pb = fin[i - 1] if i > 0 else None
                    for m in list(c[3]):
                        if (c[0] == 'ل' and nb and nb[0] == 'ا' and m in nb[1]) or (c[0] == 'ا' and pb and pb[0] == 'ل' and m in pb[1]):
                            c[1] = c[1].replace(m, '', 1); c[3] = c[3].replace(m, '', 1)
                    if c[3]: added.update(c[3])
            # marks PDFKit placed and pypdf only had as stray (position-less) pieces: placement is PDFKit's
            sc = collections.Counter(''.join(stray))
            placed = added & sc
            if placed: flags.append('stray-mark-placed:' + ''.join(placed.elements()))
            if added - sc: flags.append('mark-added-from-pdfkit:' + ''.join((added - sc).elements()))
            stray_left = sc - added
            # mark check: PDFKit marks (over the letters both have) vs merged marks
            wmarks = collections.Counter(m for c in Wc for m in c[1]); fmarks = ms(fin)
            extra_p = fmarks - wmarks
            if extra_p:
                kinds = ''.join(sorted(set(extra_p.elements())))
                flags.append('mark-only-pypdf:' + kinds)
            # stray pypdf marks (positions lost): add only if the merged text lacks them
            if stray_left:
                flags.append('stray-mark:' + ''.join(stray_left.elements()))
            # tanwin of اً present in pypdf but not PDFKit is handled by the mark merge above
            # the rhyme: every b half ends in لا / لى; restore an alif both extractors lost
            if h == 'b' and fin and fin[-1][0] == 'ل' and z and letters(z)[-2:] in ('لا', 'لى'):
                fin.append(['ا', '', None]); flags.append('rhyme-alif-added')
            qset = set(PC[pg].get('quran', []))
            qp = [t for x, y, t in v[h] if t in qset and letters(t)]
            combos = qp + [p + q for p in qp for q in qp if p is not q]
            qwords = sorted({letters(w) for c in combos for w in re.sub(r'\s+(?=[\u064b-\u065f\u0670\u06d6-\u06ed\u0640])', '', c).split()
                             if letters(w).endswith('ي')})
            res_q = qwords
            res[f'{n}{h}'] = {'qya': res_q, 'page': int(pg), 'fin': fin, 'flags': flags, 'W': W, 'P': P, 'Z': z or ''}
            for f_ in flags: stats[f_.split(':')[0]] += 1

# word boundaries: pypdf spaces where known, else Zu'bi boundaries mapped by letter alignment
def zubi_bounds(fin, z):
    zw = z.split(); zl = []; zb = set()
    for w in zw:
        for c in letters(w).translate(FOLD): zl.append(c)
        zb.add(len(zl) - 1)
    fl = [(i, c[0].translate(FOLD)) for i, c in enumerate(fin) if letters(c[0])]
    sm = difflib.SequenceMatcher(None, [c for _, c in fl], zl, autojunk=False)
    out = set(); mapped = set()
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            mapped.add(fl[a + k][0])
            if b + k in zb: out.add(fl[a + k][0])
    # non-letter clusters (punctuation) count as mapped
    mapped |= {i for i, c in enumerate(fin) if not letters(c[0])}
    return out, mapped

for key, r in res.items():
    fin = r['fin']; flags = r['flags']
    zb, zmapped = zubi_bounds(fin, r['Z']) if r['Z'] else (set(), set())
    zmap = True if r['Z'] else None
    spdiff = []
    text = ''
    for i, c in enumerate(fin):
        b, mk, sp = c[0], c[1], c[2]
        text += b + mk
        if i == len(fin) - 1: break
        nb = fin[i + 1][0]
        if nb in '،:»)': continue
        if b in '،:': sp = True
        elif nb == '«': sp = True
        elif r['Z'] and i in zmapped: sp = i in zb
        elif sp is None: sp = False
        if sp and b not in '«(': text += ' '
    text = nfc(re.sub(r' +', ' ', text).strip())
    # small wāw/yā (ۥ ۦ) end a word: a letter right after them starts the next word
    text = re.sub('([\u06E5\u06E6][\u064b-\u0652]*)(?=[\u0621-\u064A\u0671])', r'\1 ', text)
    # a lone alif token (طَاهَ ا, عَادً ا) belongs to the word before it
    text = re.sub(r'(\S) (ا[\u064b-\u0652]*)(?= |$)', r'\1\2', text)
    if r['Z']:
        zw = [w for w in re.sub(r'[،:«»()]', ' ', r['Z']).split() if letters(w)]; qw = [w for w in re.sub(r'[،:«»()]', ' ', text).split() if letters(w)]
        if len(zw) != len(qw): flags.append('word-count')
        elif any(sk2(a) != sk2(b) for a, b in zip(zw, qw)): flags.append('word-split-or-letters')
        if letters(r['Z']).translate(FOLD).replace('ا', '') != letters(text).translate(FOLD).replace('ا', ''): flags.append('letters-differ')
    # Quranic words (KFGQPC Uthmanic font): the final yā is printed undotted (ى) though the text layer says ي
    if r.get('qya'):
        ws = text.split(' ')
        for i, w in enumerate(ws):
            lw = letters(w)
            if lw.endswith('ي') and any(lw == q or (len(q) >= 2 and lw.endswith(q)) for q in r['qya']):
                j = max(k for k, ch in enumerate(w) if ch == 'ي')
                ws[i] = w[:j] + 'ى' + w[j + 1:]; flags.append('quranic-final-ya')
        text = ' '.join(ws)
    if KASH in text: flags.append('kashida')
    if any(c in PUN for c in text): flags.append('punct')
    if re.search('ل[ً-ْٰ]*ل[ً-ْ]*ه', text) and 'الل' in text.replace(KASH, ''): flags.append('allah')
    if re.search('اً|ًا', text): flags.append('tanwin-alif')
    r['text'] = text
    for f_ in flags[-6:]: pass
for r in res.values():
    for f_ in set(x.split(':')[0] for x in r['flags']): pass
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=0)
fl = collections.Counter(f_ for r in res.values() for f_ in set(x.split(':')[0] for x in r['flags']))
print('halves', len(res), 'with no flag', sum(1 for r in res.values() if not r['flags']))
print('flag counts (halves):', dict(fl.most_common()))

# ---- flag classes and real differences (used by the image-check stage) ----
from compare import compare_half
SOFT = {'quranic-final-ya', 'rhyme-alif-added', 'stray-mark-placed', 'lamalif-rebuilt', 'lamalif-pdfkit-lost-alif', 'lamya-pdfkit-lost-ya', 'lamalif-pypdf-lost-lam', 'lost-piece',
        'tanwin-alif', 'punct', 'allah', 'kashida'}
for k, r in res.items():
    hard = [f for f in r['flags'] if f.split(':')[0] not in SOFT and f != 'mark-only-pypdf:ً']
    diffs = compare_half(r['Z'], r['text']) if r['Z'] else []
    realk = set().union(*[d[2] for d in diffs]) if diffs else set()
    r['real'] = sorted(realk)
    r['hard'] = hard
    r['glyph'] = sorted(set(f.split(':')[0] for f in r['flags'] if f.split(':')[0] in SOFT - {'punct'}) |
                        ({'hamza-seat'} if re.search('[أإؤئآٔٱ]', r['text']) and any(f.startswith(('mark-', 'code-')) for f in r['flags']) else set()))
    r['need'] = bool(hard) or bool(realk - {'vowel only in qasim', 'vowel only in zubi'})
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=0)
print('need image (hard flag or real difference):', sum(r['need'] for r in res.values()),
      '| glyph-pattern only:', sum(1 for r in res.values() if not r['need'] and r['glyph']),
      '| clean:', sum(1 for r in res.values() if not r['need'] and not r['glyph']))
