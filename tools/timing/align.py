#!/usr/bin/env python3
"""Usage: python3 tools/timing/align.py <wh_dir> <verses.json> <out_dir> [NN ...]
Word-anchored verse timing for the one-file-per-section audio (أصول run).
Inputs: <wh_dir>/NN.words.json (from transcribe_fix.py), <wh_dir>/wav/NN.wav, verses.json (from pdf_verses.py).
Method: (1) Viterbi over whisper words: each word gets a label  title(0) -> verse a .. verse b -> after(b+1),
 score +w if the word matches the verse's PDF word set, -0.5 otherwise; so every verse start is anchored on the
 words that really follow it, and spoken titles / closing speech are labelled non-verse and never inside a verse.
 (2) each boundary is moved to the silence between the last word of verse k-1 and the first of verse k
 (start = speech onset, end = speech offset). (3) confidence and the neighbour test.
Writes <out_dir>/NN.align.json  {verses:[{n,start,end,conf,match,flags,..}], ...}"""
import sys, os, re, json, wave, difflib, math, numpy as np
WH, VJ, OUT = sys.argv[1:4]
SEC = {  # file NN -> (section id, first verse, last verse)
 '01':(5,1,94),'02':(6,95,99),'03':(7,100,107),'04':(8,108,115),'05':(9,116,131),'06':(10,132,157),'07':(11,158,167),
 '08':(12,168,182),'09':(13,183,201),'10':(14,202,213),'11':(15,214,225),'12':(16,226,234),'13':(17,235,254),
 '14':(18,255,258),'15':(19,259,261),'16':(20,262,265),'17':(21,266,269),'18':(22,270,273),'19':(23,274,276),
 '20':(24,277,285),'21':(25,286,290),'22':(26,291,338),'23':(27,339,342),'24':(28,343,358),'25':(29,359,364),
 '26':(30,365,375),'27':(31,376,386),'28':(32,387,419),'29':(33,420,444)}
# NOTE: ranges above are from headings glued in the PDF text layer; align.py verifies them against the audio.
def norm(t):
    t = re.sub(r'[ً-ٰٟـۖ-ۭ]', '', t)
    t = re.sub('[أإآٱ]', 'ا', t).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ','و').replace('ئ','ي')
    return re.sub(r'[^ء-ي]', '', t)
raw = json.load(open(VJ))
def verse_tokens(n):
    L = raw[str(n)]; main = [x for x in L[:2] if not x.startswith('#')]
    toks = [norm(t) for l in main for t in l.split()]; toks = [t for t in toks if t]
    if sum(len(t) for t in toks) < 38:   # broken text layer: use the glued extra lines too
        for l in L[2:]:
            l = l[1:]
            if '\x1a' in l or re.match(r'^(بَابُ|ذِكْرُ|سُورَةُ)', l.strip()): continue
            toks += [t for t in (norm(x) for x in l.split()) if t]
    return toks
_sim = {}
def similar(a, b):
    if a == b: return True
    if min(len(a), len(b)) < 4 or abs(len(a)-len(b)) > 2: return False
    k = (a, b) if a < b else (b, a)
    if k not in _sim: _sim[k] = difflib.SequenceMatcher(None, a, b).ratio() >= 0.78
    return _sim[k]
TITLES = {  # TOC headings (no marks needed; norm() is applied). Used to find where the spoken title ends.
 '02':'باب الاستعاذة','03':'باب البسملة','04':'سورة أم القرآن','05':'باب الإدغام الكبير',
 '06':'باب إدغام الحرفين المتقاربين في كلمة وفي كلمتين','07':'باب هاء الكناية','08':'باب المد والقصر',
 '09':'باب الهمزتين من كلمة','10':'باب الهمزتين من كلمتين','11':'باب الهمز المفرد','12':'باب نقل حركة الهمزة إلى الساكن قبلها',
 '13':'باب وقف حمزة وهشام على الهمز','14':'باب الإظهار والإدغام','15':'ذكر ذال إذ','16':'ذكر دال قد','17':'ذكر تاء التأنيث',
 '18':'ذكر لام هل وبل','19':'باب اتفاقهم في إدغام إذ وقد وتاء التأنيث وهل وبل','20':'باب حروف قربت مخارجها',
 '21':'باب أحكام النون الساكنة والتنوين','22':'باب الفتح والإمالة وبين اللفظين','23':'باب مذهب الكسائي في إمالة هاء التأنيث في الوقف',
 '24':'باب مذاهبهم في الراءات','25':'باب اللامات','26':'باب الوقف على أواخر الكلم','27':'باب الوقف على مرسوم الخط',
 '28':'باب مذاهبهم في ياءات الإضافة','29':'باب مذاهبهم في الزوائد'}
LEAD01 = 'بدأت'   # file 01 opens with the book title, the editor's credits and a bismillah: verse 1 starts at this word
def title_end(nn, W, ws):
    """index of the last whisper word that belongs to the spoken title / lead-in, or -1"""
    if nn == '01':
        for i, w in enumerate(W):
            if w == norm(LEAD01) and ws[i][0] > 30: return i - 1
        return -1
    toks = [t for t in (norm(x) for x in TITLES[nn].split()) if t]; j = 0; last = -1
    for i, w in enumerate(W[:len(toks) + 6]):
        if j < len(toks) and (similar(w, toks[j]) or (len(toks[j]) >= 3 and toks[j] in w) or (len(w) >= 3 and w in toks[j])):
            j += 1; last = i
        elif j < len(toks) and j + 1 < len(toks) and (similar(w, toks[j+1]) or toks[j+1] in w):
            j += 2; last = i
    return last
def wscore(w): return 0.4 if len(w) <= 2 else 1.0
def matches(w, S):
    return w in S or any(similar(w, s) for s in S)
def frames(nn):
    x = wave.open(f'{WH}/wav/{nn}.wav'); a = np.frombuffer(x.readframes(x.getnframes()), dtype=np.int16).astype(float)
    n = len(a)//160; db = 10*np.log10((a[:n*160].reshape(n,160)**2).mean(1)+1)
    db = np.convolve(db, np.ones(5)/5, mode='same'); return db, max(np.percentile(db, 5)+10, np.percentile(db, 50)-13)
def silences(db, thr, minlen=0.12):
    sil = db < thr; out = []; i = 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if (j-i)/100 >= minlen: out.append((i/100, j/100))
            i = j
        else: i += 1
    return out
def run(nn):
    sid, a, b = SEC[nn]; ws = json.load(open(f'{WH}/{nn}.words.json'))
    W = [norm(w[2]) for w in ws]; keep = [i for i, w in enumerate(W) if w]; ws = [ws[i] for i in keep]; W = [W[i] for i in keep]
    ns = list(range(a, b+1)); K = len(ns); n = len(W)
    toks = {v: verse_tokens(v) for v in ns}; sets = {v: set(toks[v]) for v in ns}
    # score matrix
    sc = np.full((K, n), -0.5)
    for ki, v in enumerate(ns):
        for i, w in enumerate(W):
            if matches(w, sets[v]): sc[ki, i] = wscore(w)
    te = title_end(nn, W, ws)
    letters0 = {v: sum(len(t) for t in toks[v]) for v in ns}
    med = float(np.median(list(letters0.values())))
    letters0 = {v: (l if l >= 0.75 * med else med) for v, l in letters0.items()}   # damaged text layer (e.g. verse 70): assume a normal length
    tstart = np.array([w[0] for w in ws]); tend = np.array([w[1] for w in ws])
    def segdp(spl):
        """verse-level DP: verse k covers words [bnd[k-1], bnd[k]); score = word matches - 0.5 per non-match,
        minus a length penalty comparing its duration with letters*spl (spl = seconds per letter, fitted per file)"""
        NEG = -1e9; WMAX = 50; s0 = te + 1
        cum = np.concatenate([np.zeros((K, 1)), np.cumsum(sc, axis=1)], axis=1)
        dp = np.full((K+1, n+1), NEG); bp = np.zeros((K+1, n+1), int); dp[0, s0] = 0
        for k in range(1, K+1):
            exp = max(letters0[ns[k-1]], 20) * spl + 0.5
            for j in range(s0 + k, n+1):
                lo = max(s0 + k - 1, j - WMAX)
                if j - 2 <= lo: continue
                i = np.arange(lo, j - 2)
                t_end = tstart[j] if j < n else tend[n-1]
                dur = np.maximum(t_end - tstart[i], 0.3)
                tot = dp[k-1, i] + (cum[k-1, j] - cum[k-1, i]) - 12 * np.log(dur / exp) ** 2
                a = int(np.argmax(tot)); dp[k, j] = tot[a]; bp[k, j] = i[a]
        j = int(np.argmax(dp[K, :])); bnd = [j]
        for k in range(K, 0, -1): j = int(bp[k, j]); bnd.append(j)
        return bnd[::-1]      # b[0] = first verse start word, bnd[k] = end of verse k (exclusive)
    spl = 0.19
    for _ in range(2):
        bnd = segdp(spl)
        ratios = []
        for k in range(1, K+1):
            seg = list(range(bnd[k-1], bnd[k]))
            if len(seg) >= 3 and sum(sc[k-1, i] > 0 for i in seg) / len(seg) > 0.6:
                ratios.append((tend[bnd[k]-1] - tstart[bnd[k-1]] - 0.5) / max(letters0[ns[k-1]], 20))
        if ratios: spl = float(np.median(ratios))
    bnd = segdp(spl)
    if bnd[K] < n and (W[bnd[K]].endswith('ل') or W[bnd[K]].endswith('لا')) and tstart[bnd[K]] - tend[bnd[K]-1] < 1.0:
        bnd[K] += 1     # every verse of the poem rhymes in -lā: a rhyme word left after the last verse belongs to it
    lab = [0] * n
    for k in range(1, K+1):
        for i in range(bnd[k-1], bnd[k]): lab[i] = k
    for i in range(bnd[K], n): lab[i] = K + 1
    idx = {k: [i for i in range(n) if lab[i] == k] for k in range(K+2)}
    missing = [ns[k-1] for k in range(1, K+1) if not idx[k]]
    db, floor = frames(nn); sil = silences(db, floor); dur = len(db)/100
    def gap(prev_end, next_start):   # silence between two words
        lo, hi = prev_end - 0.8, next_start + 1.5
        c = [(s, e) for s, e in sil if e > lo and s < hi and e > prev_end - 0.8]
        if not c: return None
        return max(c, key=lambda r: (r[1]-r[0]) - 0.05*abs((r[0]+r[1])/2 - (prev_end+next_start)/2))
    res = []; first_i = {k: idx[k][0] for k in range(1, K+1) if idx[k]}; last_i = {k: idx[k][-1] for k in range(1, K+1) if idx[k]}
    present = [k for k in range(1, K+1) if idx[k]]
    bounds = {}
    for j, k in enumerate(present):
        pe = ws[last_i[present[j-1]]][1] if j else (ws[first_i[k]-1][1] if first_i[k] > 0 else 0)
        ns_ = ws[first_i[k]][0]
        g = gap(pe, ns_)
        bounds[k] = g
    for j, k in enumerate(present):
        v = ns[k-1]; g = bounds[k]; flags = []
        if g: start = g[1]
        else:
            start = ws[first_i[k]][0] + 0.3; flags.append('nopause_start')
        if j+1 < len(present):
            g2 = bounds[present[j+1]]
            end = g2[0] if g2 else ws[last_i[k]][1]
            if not g2: flags.append('nopause_end')
        else:
            tail = [s for s, e in sil if s >= ws[last_i[k]][1] - 0.3 and e - s >= 0.22]
            end = tail[0] if tail else dur
        res.append(dict(n=v, k=k, start=round(start, 2), end=round(end, 2), gs=g, flags=flags))
    # confidence pieces
    letters = dict(letters0)
    spl = np.median([(r['end']-r['start'])/max(letters[r['n']], 1) for r in res]) if res else 0.2
    def mscore(widx, v):
        got = {W[i] for i in widx if matches(W[i], sets[v])}
        cov = sum(1 for t in sets[v] if t in {W[i] for i in widx} or any(similar(t, W[i]) for i in widx))
        m1 = sum(1 for i in widx if matches(W[i], sets[v])) / max(len(widx), 1)
        m2 = cov / max(len(sets[v]), 1)
        return (m1 + m2) / 2
    for r in res:
        v = r['n']; k = r['k']
        inside = [i for i in range(n) if ws[i][0] >= r['start']-0.15 and ws[i][1] <= r['end']+0.15 and lab[i] != 0 and lab[i] != K+1] or idx[k]
        m = mscore(inside, v); r['match'] = round(m, 2)
        nb = [mscore(inside, ns[q-1]) for q in (k-1, k+1) if 1 <= q <= K]
        if nb and max(nb) > m: r['flags'].append('neighbour')
        f0 = ws[first_i[k]][0]; l1 = ws[last_i[k]][1]
        if r['start'] - f0 > 1.2 or r['start'] - f0 < -0.8 or l1 - r['end'] > 1.2 or l1 - r['end'] < -1.2: r['flags'].append('shifted')
        d = r['end']-r['start']; ratio = max(d, 0.01)/max(letters[v]*spl, 0.01); lf = max(0, 1-abs(math.log(ratio))*1.5)
        pc = lambda g: 0.3 if not g else min(1, (g[1]-g[0])/0.5)
        pj = r['k']; pst = pc(r['gs']); nxt = bounds.get(present[present.index(k)+1]) if present.index(k)+1 < len(present) else None
        mid = [s for s, e in sil if r['start']+.35*d < s < r['start']+.65*d and e-s >= .2]
        r['len'] = round(lf, 2)
        r['conf'] = round(min(1, 0.5*min(1, m/0.7) + 0.2*lf + 0.2*(pst+pc(nxt))/2 + 0.1*(1 if mid else .3)), 2)
        r.pop('gs')
    info = dict(file=nn, section=sid, range=[a, b], words=n, missing=missing, spl=round(float(spl), 3), dur=round(dur, 2),
                first_word_start=ws[first_i[present[0]]][0] if present else None, title_words=len(idx[0]), title_end=te, after_words=len(idx[K+1]))
    json.dump(dict(info=info, verses=res), open(f'{OUT}/{nn}.align.json', 'w'), ensure_ascii=False, default=lambda o: o.item())
    lows = sum(1 for r in res if r['conf'] < 0.8); fl = sum(1 for r in res if r['flags'])
    print(nn, f's{sid} v{a}-{b}', f'miss={missing}', f'title={len(idx[0])}w after={len(idx[K+1])}w', f'conf<.8={lows} flagged={fl} mean={np.mean([r["conf"] for r in res]):.2f}')
os.makedirs(OUT, exist_ok=True)
for nn in (sys.argv[4:] or sorted(SEC)): run(nn)
