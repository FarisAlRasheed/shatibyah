#!/usr/bin/env python3
"""Compute pause diagnostics for all 77 audio files and slice 1,173 per-verse MP3 clips."""
import array
import json
import math
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RECITER_PATH = ROOT / 'data/reciters/mahmud-haleem/reciter.json'
AUDIO_DIR = ROOT / 'data/reciters/mahmud-haleem'
CLIPS_DIR = ROOT / 'content-review/_ref/clips'
PAUSES_OUT = ROOT / 'content-review/_ref/audio_pauses.json'

TOL = 0.15
MIN_PAUSE = 0.12


def analyze_pauses(mp3_path: Path):
    cmd = ['ffmpeg', '-v', 'error', '-i', str(mp3_path), '-ac', '1', '-ar', '16000', '-f', 's16le', '-']
    raw = subprocess.run(cmd, capture_output=True, stdin=subprocess.DEVNULL, check=True).stdout
    samples = array.array('h')
    samples.frombytes(raw[:len(raw) - (len(raw) % 2)])
    n_frame = 320  # 20 ms at 16 kHz
    n_frames = len(samples) // n_frame
    dbs = []
    for i in range(n_frames):
        base = i * n_frame
        s2 = 0.0
        for j in range(base, base + n_frame):
            v = float(samples[j])
            s2 += v * v
        dbs.append(10.0 * math.log10(s2 / n_frame + 1e-9))
    if not dbs:
        return [], 0.0
    sorted_dbs = sorted(dbs)
    p5 = sorted_dbs[max(0, int(0.05 * (len(sorted_dbs) - 1)))]
    thresh = p5 + 10.0
    pauses = []
    i = 0
    while i < len(dbs):
        if dbs[i] < thresh:
            j = i
            while j < len(dbs) and dbs[j] < thresh:
                j += 1
            if (j - i) * 0.02 >= MIN_PAUSE:
                pauses.append((round(i * 0.02, 2), round(j * 0.02, 2)))
            i = j
        else:
            i += 1
    return pauses, round(len(dbs) * 0.02, 2)


def slice_one(v, src_path: Path, out_path: Path):
    start = float(v['start'])
    end = float(v['end'])
    dur = max(0.05, end - start)
    seek = max(0.0, start - 1.0)
    offset = start - seek
    cmd = [
        'ffmpeg', '-v', 'error', '-y',
        '-ss', f'{seek:.3f}',
        '-i', str(src_path),
        '-ss', f'{offset:.3f}',
        '-t', f'{dur:.3f}',
        '-sample_fmt', 's16p',
        '-c:a', 'libmp3lame', '-b:a', '64k',
        str(out_path),
    ]
    subprocess.run(cmd, capture_output=True, stdin=subprocess.DEVNULL, check=True)
    return v['n']


def main():
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    rec = json.loads(RECITER_PATH.read_text(encoding='utf-8'))
    files_by_id = {f['id']: AUDIO_DIR / f['path'] for f in rec['files']}

    # 1. Pause analysis per audio file (reuse if already complete)
    if not PAUSES_OUT.exists():
        file_pauses = {}
        with ThreadPoolExecutor(max_workers=8) as ex:
            futs = {ex.submit(analyze_pauses, p): fid for fid, p in files_by_id.items()}
            for fut in as_completed(futs):
                fid = futs[fut]
                pauses, dur = fut.result()
                file_pauses[fid] = {'duration': dur, 'pauses': pauses}

        verse_diag = {}
        for v in rec['verses']:
            fid = v['file']
            P = file_pauses[fid]['pauses']
            dur = file_pauses[fid]['duration']
            st, en = float(v['start']), float(v['end'])
            why = []
            near_start = st <= TOL + 0.5 or any(a - TOL <= st <= b + TOL for a, b in P)
            near_end = en >= dur - TOL - 0.5 or any(a - TOL <= en <= b + TOL for a, b in P)
            if not near_start:
                why.append('start-not-on-pause')
            if not near_end:
                why.append('end-not-on-pause')
            mid = (st + en) / 2.0
            has_mid = any(
                a < mid + 0.25 * (en - st) and b > mid - 0.25 * (en - st)
                and a > st + 0.5 and b < en - 0.5
                for a, b in P
            )
            if not has_mid:
                why.append('no-mid-pause')
            nearby = [(a, b) for a, b in P if st - 3.0 < b and a < en + 3.0]
            verse_diag[str(v['n'])] = {
                'file': fid,
                'start': st,
                'end': en,
                'confidence': v['confidence'],
                'flags': why,
                'nearby_pauses': nearby,
            }

        PAUSES_OUT.write_text(
            json.dumps({'files': file_pauses, 'verses': verse_diag}, ensure_ascii=False, indent=1),
            encoding='utf-8',
        )
        flagged = sum(1 for d in verse_diag.values() if d['flags'])
        print(f'Wrote {PAUSES_OUT}: {len(file_pauses)} files analyzed, {flagged} verses with pause flags.')
    else:
        print(f'Reusing {PAUSES_OUT}')

    # 2. Slice all 1,173 clips cleanly
    for old in CLIPS_DIR.glob('v*.mp3'):
        old.unlink()
    todo = [(v, files_by_id[v['file']], CLIPS_DIR / f'v{v["n"]:04d}.mp3') for v in rec['verses']]

    done = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(slice_one, v, sp, op) for v, sp, op in todo]
        for fut in as_completed(futs):
            fut.result()
            done += 1
    clips = list(CLIPS_DIR.glob('v*.mp3'))
    small = [c.name for c in clips if c.stat().st_size < 1000]
    print(f'Sliced {done} clips; total clips in {CLIPS_DIR}: {len(clips)}; small(<1KB): {small}')
    assert len(clips) == len(rec['verses']) and not small, f'Bad clips: {len(clips)}, small={small}'


if __name__ == '__main__':
    main()
