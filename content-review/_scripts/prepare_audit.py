#!/usr/bin/env python3
"""Prepare Phase 3 5% audit packs for Tracks A-F from verses/blocks/items marked ✓."""
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHUNKS = json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']
EDITION = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text(encoding='utf-8'))
COLORS = json.loads((ROOT / 'data/editions/qasim/colors.json').read_text(encoding='utf-8'))
VP = json.loads((ROOT / 'content-review/_ref/verse-pages.json').read_text(encoding='utf-8'))['verses']
OUT_ROOT = ROOT / 'content-review/out'
PACK_ROOT = ROOT / 'content-review/pack'
AUDIT_PACK = PACK_ROOT / 'audit'


def parse_checks(cov_path: Path):
    ok, flagged = [], []
    if not cov_path.exists():
        return ok, flagged
    for l in cov_path.read_text(encoding='utf-8').splitlines():
        l = l.strip()
        m_ok = re.match(r'^(\S+)\s+[✓✔]$', l)
        m_no = re.match(r'^(\S+)\s+[✗✘]', l)
        if m_ok:
            ok.append(m_ok.group(1))
        elif m_no:
            flagged.append(m_no.group(1))
    return ok, flagged


def pick_even(items: list, k: int) -> list:
    if not items or k <= 0:
        return []
    if len(items) <= k:
        return list(items)
    step = len(items) / k
    return [items[int(i * step + step / 2)] for i in range(k)]


def extract_verse_section_from_pack(pack_text: str, v_str: str) -> str:
    m = re.search(rf'^### Verse {re.escape(v_str)}\b.*?(?=^### Verse |\n## PDF Page |\Z)', pack_text, re.M | re.S)
    return m.group(0).strip() if m else f'Verse {v_str} (missing from pack!)'


def extract_block_section_from_pack(pack_text: str, bid: str) -> str:
    m = re.search(rf'^### Block `{re.escape(bid)}`.*?(?=^### Block |^## Section |\Z)', pack_text, re.M | re.S)
    return m.group(0).strip() if m else f'Block {bid} (missing from pack!)'


def main():
    AUDIT_PACK.mkdir(parents=True, exist_ok=True)
    manifest = {}

    # Tracks A, B, C, F (~5% = ~5 verses per chunk = ~60 per track)
    for track in ('A', 'B', 'C', 'F'):
        lines = [f'# Phase 3 Audit Pack — Track {track} (5% sample of ✓ verses across all 12 chunks)', '']
        picked_all = []
        for ch in CHUNKS:
            cid = ch['id']
            if track in ('B', 'C'):
                ok1, _ = parse_checks(OUT_ROOT / track / cid / 'run1/coverage.md')
                ok2, _ = parse_checks(OUT_ROOT / track / cid / 'run2/coverage.md')
                ok2_set = set(ok2)
                ok = [x for x in ok1 if x in ok2_set]
            else:
                ok, _ = parse_checks(OUT_ROOT / track / cid / 'run1/coverage.md')
            # Pick ~5% of chunk verses (min 4, rounded)
            k = max(4, round(ch['verseCount'] * 0.05))
            chosen = pick_even(ok, k)
            picked_all.extend([(cid, x) for x in chosen])
            lines.append(f"## Chunk `{cid}` ({len(chosen)} of {len(ok)} ✓ verses)")
            if track in ('A', 'B', 'C'):
                pack_txt = (PACK_ROOT / track / f'{cid}.md').read_text(encoding='utf-8')
                d_txt = (PACK_ROOT / f'D/{cid}.md').read_text(encoding='utf-8') if track in ('B', 'C') else ''
                for v_str in chosen:
                    pdf_pg = VP[v_str]['pdf']
                    lines.append(f"- PDF Page Image: `content-review/_ref/pages/p{pdf_pg:03d}.png`")
                    lines.append(extract_verse_section_from_pack(pack_txt, v_str))
                    lines.append('')
                if track in ('B', 'C'):
                    lines.append(f"- Consult Wafi in `content-review/pack/D/{cid}.md` and `content-review/pack/legend.md` if needed.")
                    lines.append('')
            else:  # Track F
                f_txt = (PACK_ROOT / f'F/{cid}.md').read_text(encoding='utf-8')
                for v_str in chosen:
                    vn = int(v_str)
                    m_row = re.search(rf'^\| {vn} \|.*$', f_txt, re.M)
                    m_txt = re.search(rf'^- \*\*{vn}\*\* .*$', f_txt, re.M)
                    if m_row:
                        lines.append(m_row.group(0))
                    if m_txt:
                        lines.append(m_txt.group(0))
                    lines.append(f"- Listen to clip: `content-review/_ref/clips/v{vn:04d}.mp3`")
                    lines.append('')
        (AUDIT_PACK / f'{track}.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
        manifest[track] = [{'chunk': cid, 'item': x} for cid, x in picked_all]

    # Track D (~5% of ✓ blocks across all chunks)
    d_lines = ['# Phase 3 Audit Pack — Track D (5% sample of ✓ blocks across all 12 chunks)', '']
    d_picked = []
    for ch in CHUNKS:
        cid = ch['id']
        ok, _ = parse_checks(OUT_ROOT / 'D' / cid / 'run1/coverage.md')
        k = max(2, round(len(ok) * 0.05))
        chosen = pick_even(ok, k)
        d_picked.extend([(cid, x) for x in chosen])
        pack_txt = (PACK_ROOT / f'D/{cid}.md').read_text(encoding='utf-8')
        d_lines.append(f"## Chunk `{cid}` ({len(chosen)} of {len(ok)} ✓ blocks)")
        for bid in chosen:
            d_lines.append(extract_block_section_from_pack(pack_txt, bid))
            d_lines.append('')
    (AUDIT_PACK / 'D.md').write_text('\n'.join(d_lines) + '\n', encoding='utf-8')
    manifest['D'] = [{'chunk': cid, 'item': x} for cid, x in d_picked]

    # Track E (~5% of ✓ items)
    ok_e, _ = parse_checks(OUT_ROOT / 'E/all/run1/coverage.md')
    secs = [x for x in ok_e if x.startswith('sec')]
    legs = [x for x in ok_e if x.startswith('legend')]
    surs = [x for x in ok_e if x.startswith('surah')]
    uis = [x for x in ok_e if x.startswith('ui')]
    chosen_e = pick_even(secs, max(4, round(len(secs) * 0.05))) + \
               pick_even(legs, max(5, round(len(legs) * 0.05))) + \
               pick_even(surs, max(6, round(len(surs) * 0.05))) + \
               pick_even(uis, max(2, round(len(uis) * 0.05)))
    if not chosen_e:
        chosen_e = ['sec8', 'sec26', 'sec44', 'sec73', 'legend-خ', 'surah-17', 'surah-78', 'ui-App.tsx']
    e_lines = [
        '# Phase 3 Audit Pack — Track E (~5% sample of ✓ items)',
        '',
        'Re-check the following items independently against `pack/E/titles.md`, `pack/E/surahs.md`, `pack/E/ui-strings.md`, `pack/legend.md`, and the corresponding PDF page PNGs:',
        '',
    ]
    for item in chosen_e:
        e_lines.append(f'- `{item}`')
    (AUDIT_PACK / 'E.md').write_text('\n'.join(e_lines) + '\n', encoding='utf-8')
    manifest['E'] = [{'chunk': 'all', 'item': x} for x in chosen_e]

    (AUDIT_PACK / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    for tr, lst in manifest.items():
        print(f'Audit Track {tr}: {len(lst)} items selected.')


if __name__ == '__main__':
    main()
