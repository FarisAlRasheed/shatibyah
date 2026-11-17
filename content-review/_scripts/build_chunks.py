#!/usr/bin/env python3
"""Build content-review/chunks.json using the 12-chunk section-boundary partition."""
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EDITION_PATH = ROOT / 'data/editions/qasim/edition.json'
VP_PATH = ROOT / 'content-review/_ref/verse-pages.json'
RECITER_PATH = ROOT / 'data/reciters/mahmud-haleem/reciter.json'
OUT_PATH = ROOT / 'content-review/chunks.json'

CHUNK_DEFS = [
    ('c01', 1, 94, [5]),
    ('c02', 95, 182, list(range(6, 13))),
    ('c03', 183, 276, list(range(13, 24))),
    ('c04', 277, 364, list(range(24, 30))),
    ('c05', 365, 444, list(range(30, 34))),
    ('c06', 445, 545, [34, 35]),
    ('c07', 546, 631, [36, 37, 38]),
    ('c08', 632, 737, [39, 40, 41, 42]),
    ('c09', 738, 829, list(range(43, 51))),
    ('c10', 830, 944, list(range(51, 61))),
    ('c11', 945, 1058, list(range(61, 75))),
    ('c12', 1059, 1173, list(range(75, 84))),
]


def main():
    ed = json.loads(EDITION_PATH.read_text(encoding='utf-8'))
    sec_by_id = {s['id']: s for s in ed['sections']}
    vp = json.loads(VP_PATH.read_text(encoding='utf-8'))['verses']
    rec = json.loads(RECITER_PATH.read_text(encoding='utf-8'))
    v2file = {v['n']: v['file'] for v in rec['verses']}
    wafi = {}
    for p in glob.glob(str(ROOT / 'data/commentaries/wafi/s*.json')):
        d = json.loads(Path(p).read_text(encoding='utf-8'))
        wafi[d['section']] = d['blocks']

    chunks = []
    for cid, v_start, v_end, sids in CHUNK_DEFS:
        pdfs = sorted({vp[str(n)]['pdf'] for n in range(v_start, v_end + 1)})
        audio_files = []
        for n in range(v_start, v_end + 1):
            fid = v2file[n]
            if not audio_files or audio_files[-1] != fid:
                audio_files.append(fid)
        blocks = [b for sid in sids for b in wafi.get(sid, [])]
        chunks.append({
            'id': cid,
            'start': v_start,
            'end': v_end,
            'verseCount': v_end - v_start + 1,
            'sections': [
                {
                    'id': sid,
                    'title': sec_by_id[sid]['title'],
                    'kind': sec_by_id[sid]['kind'],
                    'parent': sec_by_id[sid]['parent'],
                    'start': sec_by_id[sid]['start'],
                    'end': sec_by_id[sid]['end'],
                }
                for sid in sids
            ],
            'pdfPages': pdfs,
            'pdfRange': [pdfs[0], pdfs[-1]],
            'audioFiles': audio_files,
            'wafiBlockCount': len(blocks),
        })

    OUT_PATH.write_text(json.dumps({'chunks': chunks}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wrote {OUT_PATH}: {len(chunks)} chunks covering {sum(c["verseCount"] for c in chunks)} verses, {sum(c["wafiBlockCount"] for c in chunks)} blocks.')


if __name__ == '__main__':
    main()
