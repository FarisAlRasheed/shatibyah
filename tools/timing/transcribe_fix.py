#!/usr/bin/env python3
"""Usage: python3 tools/timing/transcribe_fix.py <wh_dir> [NN ...]
After tools/timing/whisper_all.sh has written <wh_dir>/NN.json (+ wav/NN.wav), build <wh_dir>/NN.words.json
= list of [t0, t1, text]. whisper skips stretches (seen: 27 s lost after a title) and can loop, so:
  * holes: >=4 s of speech with no word in it  -> re-transcribe that clip alone with --max-context 0
  * loops: a 3-word group repeated 3+ times      -> re-transcribe that window alone with --max-context 0
Repeats up to 4 rounds. Prints one summary line per file."""
import sys, os, json, re, subprocess, wave, numpy as np
D = sys.argv[1]; MODEL = os.path.expanduser('~/.cache/whisper/ggml-large-v3-turbo.bin')
def load_json(p):
    d = json.load(open(p)); out = []
    for s in d['transcription']:
        t = s['text'].strip()
        if not t or t.startswith('['): continue
        out.append([s['offsets']['from']/1000, s['offsets']['to']/1000, t])
    return out
def energy(nn):
    w = wave.open(f'{D}/wav/{nn}.wav'); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)
    n = len(x)//160; db = 10*np.log10((x[:n*160].reshape(n,160)**2).mean(1)+1)
    floor = np.percentile(db, 5); return db > floor+10, n/100
def rerun(nn, t0, t1):
    clip = f'{D}/clip.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t0:.2f}','-t',f'{t1-t0:.2f}','-i',f'{D}/wav/{nn}.wav',clip], check=True)
    subprocess.run(['whisper-cli','-m',MODEL,'-f',clip,'-l','ar','-mc','0','-ml','1','-sow','-ojf','-of',f'{D}/clip'],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    return [[a+t0,b+t0,t] for a,b,t in load_json(f'{D}/clip.json')]
def norm(t): return re.sub(r'[ً-ٰٟـ]','',t)
def holes(words, sp, dur):
    hs=[]; cov=np.zeros(int(dur)+2, bool)
    for a,b,_ in words: cov[int(a):int(b)+1]=True
    sec = [sp[i*100:(i+1)*100].mean() if i*100 < len(sp) else 0 for i in range(int(dur)+1)]
    i=0
    while i < len(sec):
        if not cov[i] and sec[i] > .5:
            j=i
            while j < len(sec) and not cov[j]: j+=1
            if j-i >= 4: hs.append((i, j))
            i=j
        else: i+=1
    return hs
def loops(words):
    """windows of 12 consecutive words with <=5 distinct words = whisper repeating itself"""
    ws=[norm(w[2]) for w in words]; bad=np.zeros(len(ws), bool)
    for i in range(0, max(len(ws)-11, 0)):
        if len(set(ws[i:i+12])) <= 5: bad[i:i+12] = True
    out=[]; i=0
    while i < len(ws):
        if bad[i]:
            j=i
            while j < len(ws) and bad[j]: j+=1
            out.append((words[max(i-2,0)][0], words[min(j+1,len(words)-1)][1])); i=j
        else: i+=1
    return out
nns = sys.argv[2:] or sorted(f[:2] for f in os.listdir(D) if re.fullmatch(r'\d\d\.json', f))
for nn in nns:
    words = load_json(f'{D}/{nn}.json'); sp, dur = energy(nn); log=[]
    for rnd in range(4):
        todo = [('hole',a-.5,b+.5) for a,b in holes(words, sp, dur)] + [('loop',a,b) for a,b in loops(words)]
        if not todo: break
        for kind,a,b in todo:
            a=max(a,0); b=min(b,dur)
            new = rerun(nn, a, b)
            words = [w for w in words if not (w[0] >= a-.01 and w[1] <= b+.01)] + new
            words.sort(key=lambda w:(w[0],w[1])); log.append(f'{kind}{a:.0f}-{b:.0f}:{len(new)}w')
    json.dump(words, open(f'{D}/{nn}.words.json','w'), ensure_ascii=False)
    print(nn, f'{dur:.0f}s', len(words), 'words', ' '.join(log))
