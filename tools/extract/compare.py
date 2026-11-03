"""Word-level comparison of a Zu'bi half and an Al-Qasim half (imported by stage2/stage3/report scripts).
compare_half(z, q) -> list of (zword, qword, real_kinds:set, style_kinds:set, quranic:bool)"""
import re, difflib, unicodedata
from common import letters, is_mark, KASH

SUK = 'ْ'; FAT = 'َ'; DAM = 'ُ'; KAS = 'ِ'; SHD = 'ّ'
TAN = {'ً', 'ٌ', 'ٍ', 'ࣰ', 'ࣱ', 'ࣲ', 'ۢ'}
VOW = {FAT, DAM, KAS}
PUNCT = '،:«»()-."!؟'
HAMZA = str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ء': ''})

def cl(w):
    out = []
    for c in w:
        if is_mark(c):
            if out: out[-1][1] += c
        elif c == KASH or c in PUNCT or c.isspace(): continue
        else: out.append([c, ''])
    return out

def uthmani(w):
    """fold Quranic (Uthmani) spelling to plain: dagger alif, ٱ, small letters, ءا -> آ"""
    w = w.replace('ۡ', SUK)                     # Quranic sukun -> plain sukun (style, counted separately)
    w = w.replace('ٱ', 'ا').replace('ءَا', 'آ').replace('ءا', 'آ')
    w = w.replace('\u0657', '\u064B').replace('\u065E', '\u064C').replace('\u0656', '\u064D')   # open tanwin
    w = re.sub('[\u06E5\u06E6\u06E7\u06E8\u06DC\u0653\u06EA\u06ED\u06E0\u06DF]', '', w)
    w = w.replace('ٰ', 'ا')   # dagger alif
    w = w.replace('ىا', 'ى')        # ىٰ -> ى
    return w

def style(w):
    """remove style-only variation; returns (normalised, set of kinds that applied)"""
    kinds = set(); o = w
    w2 = ''.join(c for c in w if c not in PUNCT)
    if w2 != w: kinds.add('punctuation')
    w = w2.replace(KASH, '')
    if 'ۡ' in w: kinds.add('uthmani marks'); w = w.replace('ۡ', SUK)
    c = cl(w)
    # the name Allah: Zu'bi writes اللهُ without shadda/dagger alif on the lams
    s0 = ''.join(b for b, m in c)
    m0 = re.match('^([وفبت]?)(ا?لل)ه$', s0) or re.match('^([وفب]?)(ال)له$', s0)
    if re.match('^[وفبت]?ا?لله$', s0):
        st = len(s0) - 3
        for i in range(st, st + 2):
            nm = c[i][1].replace(SHD, '').replace('\u0670', '').replace(SUK, '')
            if nm != c[i][1]: kinds.add('Allah spelling')
            c[i][1] = nm
    # sukun on the lam of al-
    s = ''.join(b for b, m in c)
    m_ = re.match('^(?:[وفبكل]{0,2})ال', s)
    if m_:
        i = m_.end() - 1
        if SUK in c[i][1]: c[i][1] = c[i][1].replace(SUK, ''); kinds.add('sukun on al- lam')
    # sukun on long vowels
    for i in range(1, len(c)):
        b, m = c[i]
        if SUK in m and ((b == 'ا') or (b in 'يى' and KAS in c[i - 1][1]) or (b == 'و' and DAM in c[i - 1][1])):
            c[i][1] = m.replace(SUK, ''); kinds.add('sukun on long vowel')
    # alef-fatha placement: fatha written on the alif instead of the letter before it
    for i in range(1, len(c)):
        if c[i][0] == 'ا' and FAT in c[i][1] and not (VOW & set(c[i - 1][1])):
            c[i][1] = c[i][1].replace(FAT, ''); c[i - 1][1] += FAT; kinds.add('alef-fatha placement')
    # tanween placement: اً vs ًا
    for i in range(1, len(c)):
        if c[i][0] in 'اى' and (set(c[i][1]) & TAN) and not (set(c[i - 1][1]) & TAN):
            t = ''.join(x for x in c[i][1] if x in TAN)
            c[i][1] = ''.join(x for x in c[i][1] if x not in TAN); c[i - 1][1] += t; kinds.add('tanween placement')
    # rhyme ى/ا
    if c and c[-1][0] in 'ىا' and len(c) > 1:
        if c[-1][0] == 'ى': kinds.add('_final_ya')
        c[-1][0] = 'ا'
    w = ''.join(b + ''.join(sorted(m)) for b, m in c)
    return unicodedata.normalize('NFC', w), kinds

def real_kinds(z, q):
    kinds = set()
    zc, qc = cl(z), cl(q)
    zb = ''.join(b for b, m in zc); qb = ''.join(b for b, m in qc)
    if zb != qb:
        if zb.translate(HAMZA) == qb.translate(HAMZA): kinds.add('hamza form')
        else: kinds.add('letter')
        sm = difflib.SequenceMatcher(None, zb, qb, autojunk=False)
        pairs = [(i, j) for a, b, n in sm.get_matching_blocks() for i, j in zip(range(a, a + n), range(b, b + n))]
    else:
        pairs = list(zip(range(len(zc)), range(len(qc))))
    for i, j in pairs:
        zm, qm = set(zc[i][1]), set(qc[j][1])
        if (SHD in zm) != (SHD in qm): kinds.add('shadda')
        if bool(zm & TAN) != bool(qm & TAN) or (zm & TAN and qm & TAN and zm & TAN != qm & TAN): kinds.add('tanween')
        zv = zm & (VOW | {SUK}); qv = qm & (VOW | {SUK})
        if zm & TAN or qm & TAN: zv -= {FAT, DAM, KAS}; qv -= {FAT, DAM, KAS}
        if zv and qv and zv != qv: kinds.add('vowel conflict')
        elif zv and not qv: kinds.add('vowel only in zubi')
        elif qv and not zv: kinds.add('vowel only in qasim')
    return kinds

def compare_word(z, q):
    zs, zk = style(uthmani(z)); qs, qk = style(uthmani(q))
    quranic = uthmani(q) != q.replace('ۡ', SUK)
    if zs == qs:
        sk = (zk ^ qk) | ({'uthmani marks'} if 'ۡ' in q or 'ۡ' in z else set())
        if '_final_ya' in sk: sk.discard('_final_ya'); sk.add('rhyme ى/ا')
        zp, qp = style(z)[0], style(q)[0]
        return set(), {k for k in sk if not k.startswith('_')}, (zp != qp)
    return real_kinds(zs, qs), set(), False

def words(s):
    # Al-Qasim writes a one-letter prefix apart before a quoted Quranic word («كَ: يَعۡلَمُ»): join it back
    s = re.sub(r'(^|\s)([كبفو][\u064e\u0650]?)\s*:\s*', r'\1\2', s)
    return [w for w in re.sub('[،:«»()"]', ' ', s).split() if letters(w)]

def compare_half(z, q):
    zw, qw = words(z), words(q)
    out = []
    if len(zw) == len(qw):
        for a, b in zip(zw, qw):
            if a == b: continue
            r, s, qu = compare_word(a, b)
            out.append((a, b, r, s, qu))
    else:
        out.append((' '.join(zw), ' '.join(qw), {'word split'}, set(), False))
    return out
