#!/usr/bin/env python3
"""Self-check every pack file under content-review/pack/ and write content-review/pack-check.md."""
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK_DIR = ROOT / 'content-review/pack'
REF_DIR = ROOT / 'content-review/_ref'
OUT_PATH = ROOT / 'content-review/pack-check.md'


def main():
    chunks = json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']
    edition = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text(encoding='utf-8'))
    colors = json.loads((ROOT / 'data/editions/qasim/colors.json').read_text(encoding='utf-8'))
    rec = json.loads((ROOT / 'data/reciters/mahmud-haleem/reciter.json').read_text(encoding='utf-8'))

    expected_verses = list(range(1, 1174))
    expected_red = sum(1 for v in colors['verses'].values() for sp in v if sp['k'] == 'r')
    expected_green = sum(1 for v in colors['verses'].values() for sp in v if sp['k'] == 'g')
    wafi_files = sorted(glob.glob(str(ROOT / 'data/commentaries/wafi/s*.json')))
    expected_blocks = [b for f in wafi_files for b in json.loads(Path(f).read_text(encoding='utf-8'))['blocks']]
    assert len(expected_verses) == 1173
    assert expected_red == 2187
    assert expected_green == 2175
    assert len(expected_blocks) == 769

    # Check PDF PNGs
    missing_pngs = [p for p in range(17, 179) if not (REF_DIR / f'pages/p{p:03d}.png').exists()]
    assert not missing_pngs, f'Missing PNGs: {missing_pngs}'

    # Check Quran ref files
    for qname in ('quran-uthmani.txt', 'quran-simple-clean.txt'):
        qcnt = sum(1 for l in (REF_DIR / qname).read_text(encoding='utf-8').splitlines() if '|' in l and l.split('|')[0].isdigit())
        assert qcnt == 6236, f'{qname} has {qcnt} lines'

    # Check audio clips
    missing_clips = [n for n in expected_verses if not (REF_DIR / f'clips/v{n:04d}.mp3').exists()]
    assert not missing_clips, f'Missing clips: {missing_clips[:10]}'

    # Check Packs A, B, C, D, F per chunk
    a_verses, b_verses, c_verses, f_verses = [], [], [], []
    b_red_inline, b_red_list = 0, 0
    c_green_inline, c_green_list = 0, 0
    d_blocks = []
    rows = []

    for ch in chunks:
        cid = ch['id']
        v_want = list(range(ch['start'], ch['end'] + 1))

        # Track A
        atxt = (PACK_DIR / f'A/{cid}.md').read_text(encoding='utf-8')
        av = [int(m.group(1)) for m in re.finditer(r'^### Verse (\d+)\b', atxt, re.M)]
        assert av == v_want, f'A/{cid} verse mismatch: {av[:5]}.. vs {v_want[:5]}..'
        a_verses.extend(av)

        # Track B
        btxt = (PACK_DIR / f'B/{cid}.md').read_text(encoding='utf-8')
        bv = [int(m.group(1)) for m in re.finditer(r'^### Verse (\d+)\b', btxt, re.M)]
        assert bv == v_want, f'B/{cid} verse mismatch'
        b_verses.extend(bv)
        ri_cnt = len(re.findall(r'⟦R\d+ «', btxt))
        rl_cnt = len(re.findall(r'^- `R\d+` \[half ', btxt, re.M))
        want_r = sum(1 for n in v_want for sp in colors['verses'].get(str(n), []) if sp['k'] == 'r')
        assert ri_cnt == want_r and rl_cnt == want_r, f'B/{cid} red mismatch: {ri_cnt}/{rl_cnt} vs {want_r}'
        b_red_inline += ri_cnt
        b_red_list += rl_cnt

        # Track C
        ctxt = (PACK_DIR / f'C/{cid}.md').read_text(encoding='utf-8')
        cv = [int(m.group(1)) for m in re.finditer(r'^### Verse (\d+)\b', ctxt, re.M)]
        assert cv == v_want, f'C/{cid} verse mismatch'
        c_verses.extend(cv)
        gi_cnt = len(re.findall(r'⦃G\d+ «', ctxt))
        gl_cnt = len(re.findall(r'^- `G\d+` \[half ', ctxt, re.M))
        want_g = sum(1 for n in v_want for sp in colors['verses'].get(str(n), []) if sp['k'] == 'g')
        assert gi_cnt == want_g and gl_cnt == want_g, f'C/{cid} green mismatch: {gi_cnt}/{gl_cnt} vs {want_g}'
        c_green_inline += gi_cnt
        c_green_list += gl_cnt

        # Track D
        dtxt = (PACK_DIR / f'D/{cid}.md').read_text(encoding='utf-8')
        db = re.findall(r'^### Block `([^`]+)`', dtxt, re.M)
        assert len(db) == ch['wafiBlockCount'], f'D/{cid} block mismatch: {len(db)} vs {ch["wafiBlockCount"]}'
        d_blocks.extend(db)

        # Track F
        ftxt = (PACK_DIR / f'F/{cid}.md').read_text(encoding='utf-8')
        fv = [int(m.group(1)) for m in re.finditer(r'^- \*\*(\d+)\*\* \[', ftxt, re.M)]
        assert fv == v_want, f'F/{cid} verse mismatch'
        f_verses.extend(fv)

        rows.append(f"| {cid} | {ch['start']}–{ch['end']} ({len(v_want)}) | {ch['pdfRange'][0]}–{ch['pdfRange'][1]} | {len(av)} | {ri_cnt} | {gi_cnt} | {len(db)} | {len(fv)} ({len(ch['audioFiles'])} files) |")

    assert a_verses == expected_verses
    assert b_verses == expected_verses
    assert c_verses == expected_verses
    assert f_verses == expected_verses
    assert b_red_inline == b_red_list == 2187
    assert c_green_inline == c_green_list == 2175
    assert len(d_blocks) == 769 and len(set(d_blocks)) == 769

    # Check legend.md & Track E
    leg = (PACK_DIR / 'legend.md').read_text(encoding='utf-8')
    leg_rows = re.findall(r'^\| (\d+) \| `([^`]+)` \|', leg, re.M)
    assert len(leg_rows) == 92, f'legend.md has {len(leg_rows)} codes'

    t_md = (PACK_DIR / 'E/titles.md').read_text(encoding='utf-8')
    t_rows = re.findall(r'^\| (\d+) \| `(?:bab|surah)` \|', t_md, re.M)
    assert len(t_rows) == 79, f'E/titles.md has {len(t_rows)} sections'

    s_md = (PACK_DIR / 'E/surahs.md').read_text(encoding='utf-8')
    s_rows = re.findall(r'^\| (\d+) \| \d+ \|', s_md, re.M)
    assert len(s_rows) == 114, f'E/surahs.md has {len(s_rows)} surahs'

    u_md = (PACK_DIR / 'E/ui-strings.md').read_text(encoding='utf-8')
    assert len(u_md) > 100

    # Check per-file F packs
    f_files = list((PACK_DIR / 'F').glob('s*.md'))
    assert len(f_files) == 77, f'Expected 77 s*.md files, got {len(f_files)}'

    report = [
        '# Review Pack Self-Check (`content-review/pack-check.md`)',
        '',
        '## Global Totals (Verified)',
        '',
        '| Item | Expected | Verified in Pack | Status |',
        '|---|---|---|---|',
        f'| Verses in Track A (`pack/A/`) | 1,173 | {len(a_verses)} (1..1173 contiguous, unique) | PASS |',
        f'| Verses in Track B (`pack/B/`) | 1,173 | {len(b_verses)} | PASS |',
        f'| Red spans in Track B (`pack/B/`) | 2,187 | {b_red_inline} inline / {b_red_list} listed | PASS |',
        f'| Verses in Track C (`pack/C/`) | 1,173 | {len(c_verses)} | PASS |',
        f'| Green spans in Track C (`pack/C/`) | 2,175 | {c_green_inline} inline / {c_green_list} listed | PASS |',
        f'| Wafi blocks in Track D (`pack/D/`) | 769 (761 + 8 intro) | {len(d_blocks)} unique blocks | PASS |',
        f'| Codes in `pack/legend.md` | 92 | {len(leg_rows)} | PASS |',
        f'| Sections in `pack/E/titles.md` | 79 | {len(t_rows)} | PASS |',
        f'| Surahs in `pack/E/surahs.md` | 114 | {len(s_rows)} | PASS |',
        f'| Audio files in `pack/F/` | 77 | {len(f_files)} per-file + 12 chunk files | PASS |',
        f'| Audio verse clips in `_ref/clips/` | 1,173 | {len(f_verses)} | PASS |',
        f'| Rendered PDF PNGs in `_ref/pages/` | 159 (pp.17–175) + 3 TOC (pp.176–178) | 162 PNGs | PASS |',
        '| Tanzil Qur\'an reference files | 6,236 ayahs × 2 | 6,236 Uthmani + 6,236 Simple-Clean | PASS |',
        '',
        '## Per-Chunk Breakdown',
        '',
        '| Chunk | Verses | PDF Pages | A Verses | B Red Spans | C Green Spans | D Blocks | F Verses (Files) |',
        '|---|---|---|---|---|---|---|---|',
        *rows,
        '',
    ]
    OUT_PATH.write_text('\n'.join(report), encoding='utf-8')
    print(f'Wrote {OUT_PATH}: ALL PACK CHECKS PASSED.')


if __name__ == '__main__':
    main()
