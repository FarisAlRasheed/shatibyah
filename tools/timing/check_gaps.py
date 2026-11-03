#!/usr/bin/env python3
"""Check every verse cut against the pauses in its audio file.
Usage: python3 tools/timing/check_gaps.py <reciter.json> [out.json]
A pause = a run of 20 ms frames >= 0.12 s below (noise floor + 10 dB). A good cut starts at the end of a pause
and ends at the start of one, and the verse has a pause near its middle (between the two halves).
Prints the verses whose start or end is not on a pause edge (tolerance 0.15 s), or that have no middle pause."""
import json, os, subprocess, sys
import numpy as np

rec_path = sys.argv[1]
rec = json.load(open(rec_path))
base = os.path.dirname(rec_path)
TOL, MIN = 0.15, 0.12


def pauses(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, stdin=subprocess.DEVNULL).stdout
    x = np.frombuffer(raw, np.int16).astype(float)
    n = 320
    fr = x[:len(x) // n * n].reshape(-1, n)
    db = 10 * np.log10((fr ** 2).mean(1) + 1e-9)
    q = db < np.percentile(db, 5) + 10
    out, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if (j - i) * 0.02 >= MIN: out.append((i * 0.02, j * 0.02))
            i = j
        else:
            i += 1
    return out, len(q) * 0.02


def near_end_of_pause(t, P, dur):
    # a start: inside a pause, or within TOL after one ends (or at the file start)
    return t <= TOL + 0.5 or any(a - TOL <= t <= b + TOL for a, b in P)


def near_start_of_pause(t, P, dur):
    return t >= dur - TOL - 0.5 or any(a - TOL <= t <= b + TOL for a, b in P)


flags = []
for f in rec['files']:
    P, dur = pauses(os.path.join(base, f['path']))
    for v in [v for v in rec['verses'] if v['file'] == f['id']]:
        why = []
        if not near_end_of_pause(v['start'], P, dur): why.append('start')
        if not near_start_of_pause(v['end'], P, dur): why.append('end')
        mid = (v['start'] + v['end']) / 2
        if not any(a < mid + 0.25 * (v['end'] - v['start']) and b > mid - 0.25 * (v['end'] - v['start'])
                   and a > v['start'] + 0.5 and b < v['end'] - 0.5 for a, b in P):
            why.append('no-middle')
        if why:
            flags.append({'n': v['n'], 'file': f['id'], 'start': v['start'], 'end': v['end'],
                          'conf': v['confidence'], 'checked': v.get('checked', False), 'why': why,
                          'pauses': [(round(a, 2), round(b, 2)) for a, b in P if v['start'] - 3 < b and a < v['end'] + 3]})
for x in flags:
    print(x['n'], x['file'], x['start'], x['end'], x['conf'], 'checked' if x['checked'] else '', ','.join(x['why']))
print(len(flags), 'flagged of', len(rec['verses']))
if len(sys.argv) > 2: json.dump(flags, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
