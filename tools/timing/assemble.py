#!/usr/bin/env python3
"""Usage: python3 tools/timing/assemble.py <wh_dir> <al_dir> <orig_reciter.json>
Run from the project root, after align.py. Cuts/copies the 29 source files (one per section, ids 5..33) to
data/reciters/mahmud-haleem/audio/s<id>.mp3 with `ffmpeg -c copy` (only file 01 loses its credits lead-in),
merges verses 1-444 into reciter.json (445-1173 untouched, checked against <orig_reciter.json>), removes `partial`,
and writes timing-report-usul.md."""
import sys, os, json, re, subprocess, wave, numpy as np
WH, AL, ORIG = sys.argv[1:4]
R = 'data/reciters/mahmud-haleem'; SRC = f'{R}/_source'
srcs = {re.search(r'_(\d\d)_', f).group(1): f for f in os.listdir(SRC) if f.endswith('.mp3')}
urls = {re.search(r'_(\d\d)_', u).group(1): u.strip() for u in open(f'{SRC}/urls.txt') if u.strip()}
titles = {}
txt = open(f'{R}/timing-report.md').read()
for m in re.finditer(r'^(\d+)\. (.+)$', txt, re.M): titles[int(m.group(1))] = m.group(2).strip()
orig = json.load(open(ORIG)); cur = orig; base = orig   # always merge into the pre-run copy so a re-run is idempotent
def trim_for_01():
    w = json.load(open(f'{WH}/01.words.json')); t_bism = [x[0] for x in w if x[2].startswith('بسم') and x[0] > 40][0]
    x = wave.open(f'{WH}/wav/01.wav'); a = np.frombuffer(x.readframes(x.getnframes()), dtype=np.int16).astype(float)
    n = len(a)//160; db = np.convolve(10*np.log10((a[:n*160].reshape(n,160)**2).mean(1)+1), np.ones(5)/5, mode='same')
    thr = np.median(db) - 13; best = None
    for i in range(int((t_bism-3)*100), int((t_bism+1.0)*100)):      # last silence >=0.25 s ending before the basmala
        if db[i] < thr:
            j = i
            while j < n and db[j] < thr: j += 1
            if (j-i) >= 25 and (best is None or j > best[1]): best = (i/100, j/100)
            i = j
    return round(best[1] - 0.3, 2)
files, verses, rows, allv = [], [], [], []
os.makedirs(f'{R}/audio', exist_ok=True)
for nn in sorted(srcs):
    if nn == '30': continue
    a = json.load(open(f'{AL}/{nn}.align.json')); info = a['info']; sid = info['section']
    src = f'{SRC}/{srcs[nn]}'; dst = f'{R}/audio/s{sid}.mp3'
    dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]))
    t0 = trim_for_01() if nn == '01' else 0.0
    cmd = ['ffmpeg','-v','error','-y','-ss',f'{t0:.2f}','-i',src,'-c','copy',dst] if t0 else ['ffmpeg','-v','error','-y','-i',src,'-c','copy',dst]
    subprocess.run(cmd, check=True)
    files.append(dict(id=f's{sid}', path=f'audio/s{sid}.mp3', sectionIds=[sid], sourceUrl=urls[nn], sourceStart=t0, sourceEnd=round(dur, 2), bytes=os.path.getsize(dst)))
    pc = np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',dst,'-ar','16000','-ac','1','-f','s16le','-']), dtype=np.int16).astype(float)
    nf = len(pc)//160; dbf = 10*np.log10((pc[:nf*160].reshape(nf,160)**2).mean(1)+1)
    def edges(st, en):   # speech must rise at the start and fall after the end (dB steps >= 6)
        s_, e_ = int(st*100), int(en*100)
        pre = dbf[max(s_-12,0):max(s_-2,1)].mean(); on = dbf[s_+5:s_+25].mean(); off = dbf[max(e_-25,0):e_-5].mean(); post = dbf[e_+2:e_+12].mean() if e_+12 < nf else -99
        return on-pre >= 6 and (off-post >= 6 or post == -99)
    V = a['verses']; med = float(np.median([r['end']-r['start'] for r in V]))
    for r in V:
        fl = list(r['flags'])
        if abs((r['end']-r['start'])/med - 1) > 0.18: fl.append('duration')
        if not edges(r['start']-t0, r['end']-t0): fl.append('weakedge')
        verses.append(dict(n=r['n'], file=f's{sid}', start=round(r['start']-t0, 2), end=round(r['end']-t0, 2), confidence=r['conf']))
        allv.append(dict(n=r['n'], sid=sid, conf=r['conf'], match=r['match'], flags=fl, start=round(r['start']-t0, 2), end=round(r['end']-t0, 2)))
    rows.append((nn, sid, titles.get(sid, ''), srcs[nn], t0, round(dur, 2), info['range'], files[-1]['bytes'], info['title_words']))
verses.sort(key=lambda v: v['n'])
assert [v['n'] for v in verses] == list(range(1, 445)), 'verse numbers 1..444 not complete'
assert all(v['start'] < v['end'] for v in verses)
new = dict(cur); new['files'] = files + base['files']; new['verses'] = verses + base['verses']; new.pop('partial', None)
assert [v['n'] for v in new['verses']] == list(range(1, 1174))
assert new['verses'][444:] == orig['verses'] and new['files'][len(files):] == orig['files']
note = ('2026-11-03 run 3: verses 1-444 (sections 5-33, source files 01-29, one file per section) added. Word-anchored alignment '
        '(whisper.cpp large-v3-turbo words -> verse-level DP on PDF word sets and letter lengths -> boundary snapped to the pause between the words), '
        'spoken titles and non-verse speech excluded first; times are speech edges. File 01 (مقدمة الناظم) starts with the book title and editor credits; '
        'its audio is trimmed to start just before the bismillah (sourceStart %.2f s). Several verses in the code-letter sections (ذكر ذال إذ ... ) have damaged PDF text, so their whisper match is low; see timing-report-usul.md.' % files[0]['sourceStart'])
new['notes'] = list(cur['notes']) + [note]
json.dump(new, open(f'{R}/reciter.json', 'w'), ensure_ascii=False, indent=2)
json.dump(allv, open(f'{AL}/all_verses.json', 'w'), ensure_ascii=False)
tot = sum(f['bytes'] for f in files)
lo6 = [v for v in allv if v['conf'] < 0.6]; lo8 = [v for v in allv if v['conf'] < 0.8]
nb = [v for v in allv if 'neighbour' in v['flags']]
oth = [v for v in allv if set(v['flags']) & {'shifted', 'nopause_start', 'nopause_end', 'duration', 'weakedge'}]
L = ['# Timing report, run 3: مقدمة الناظم and the أصول (verses 1-444)', '', '## Summary',
     f'- Verses timed: 444 (1-444); app files: {len(files)} (`audio/s5.mp3` ... `audio/s33.mp3`), total {tot/1e6:.2f} MB (source files copied with `-c copy`, no re-encode; file 01 only lost its credits lead-in).',
     f'- Confidence < 0.6: {len(lo6)}; < 0.8: {len(lo8)}; neighbour-test failures: {len(nb)}; other flags (shifted / nopause / duration / weakedge): {len(oth)}.',
     '- Merge: `reciter.json` now holds verses 1-1173 and 77 files; entries for 445-1173 and `audio/s35`-`s82` are unchanged (checked against the copy taken before this run); `partial` removed.',
     '- Tools (all in `tools/timing/`): `whisper_all.sh`, `transcribe_fix.py`, `pdf_verses.py`, `align.py`, `assemble.py`.', '',
     '## File to section mapping (one file per section; verified against the spoken titles)',
     '| site file | section id | heading | app file | source cut (s) | verses | bytes |', '|---|---|---|---|---|---|---|']
for nn, sid, t, sf, t0, dur, rg, by, tw in rows:
    L.append(f'| {sf} | {sid} | {t} | audio/s{sid}.mp3 | {t0}-{dur} | {rg[0]}-{rg[1]} ({rg[1]-rg[0]+1}) | {by} |')
L += ['', 'Sections 1-4 (front matter) and 34 (باب فرش الحروف, spoken at the start of s35) have no verses of their own.', '',
      '## Verses below 0.8 (listen to these in tools/cut-editor.html)', '| verse | file | start | end | conf | match | flags |', '|---|---|---|---|---|---|---|']
for v in sorted(lo8, key=lambda v: v['conf']): L.append(f"| {v['n']} | s{v['sid']} | {v['start']} | {v['end']} | {v['conf']} | {v['match']} | {','.join(v['flags'])} |")
L += ['', '## Neighbour-test failures', ', '.join(str(v['n']) for v in nb) or 'none', '',
      '## Other flagged verses (confidence >= 0.8 but check)', '`shifted` = the pause chosen is more than ~1 s from the whisper words assigned to the verse; `nopause_*` = no real silence found at that edge; `duration` = more than 18% away from the section median; `weakedge` = no clear rise/fall in loudness at the start/end (shallow pause).', '',
      ', '.join(f"{v['n']}({','.join(v['flags'])})" for v in oth if v['conf'] >= 0.8) or 'none']
open(f'{R}/timing-report-usul.md', 'w').write('\n'.join(L) + '\n')
print('files', len(files), 'MB', round(tot/1e6, 2), '<0.6', [v['n'] for v in lo6], '<0.8', len(lo8), 'nb', [v['n'] for v in nb], 'other', len(oth), 'trim01', files[0]['sourceStart'])
