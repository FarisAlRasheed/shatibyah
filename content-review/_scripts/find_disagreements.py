#!/usr/bin/env python3
"""Compare Track B and Track C run1 vs run2 findings item-by-item and build tie-break packs."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHUNKS = json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']
EDITION = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text(encoding='utf-8'))
VP = json.loads((ROOT / 'content-review/_ref/verse-pages.json').read_text(encoding='utf-8'))['verses']
OUT_ROOT = ROOT / 'content-review/out'
PACK_ROOT = ROOT / 'content-review/pack'
TB_PACK = PACK_ROOT / 'tiebreak'


def load_jsonl(p: Path):
    if not p.exists():
        return []
    out = []
    for raw in p.read_text(encoding='utf-8').splitlines():
        raw = raw.strip()
        if raw:
            out.append(json.loads(raw))
    return out


def item_key(obj: dict):
    v = obj.get('verse')
    h = obj.get('half', '-')
    it = str(obj.get('item', '-'))
    cat = obj.get('category', '')
    if it != '-' and (it.startswith(('R', 'G')) and it[1:].isdigit()):
        return f"{v}:{it}"
    if cat == 'legend':
        return f"legend:{it}"
    return f"{v}:{h}:{cat}:{it}"


def norm_val(s):
    return re.sub(r'\s+', ' ', str(s or '').strip())


def extract_verse_section(pack_text: str, vn: int) -> str:
    m = re.search(rf'^### Verse {vn}\b.*?(?=^### Verse |\n## PDF Page |\Z)', pack_text, re.M | re.S)
    return m.group(0).strip() if m else ''


def main():
    TB_PACK.mkdir(parents=True, exist_ok=True)
    summary = {'B': {'agreed': 0, 'disagreed': 0}, 'C': {'agreed': 0, 'disagreed': 0}}
    all_cases = []

    for track in ('B', 'C'):
        for ch in CHUNKS:
            cid = ch['id']
            f1 = load_jsonl(OUT_ROOT / track / cid / 'run1/findings.jsonl')
            f2 = load_jsonl(OUT_ROOT / track / cid / 'run2/findings.jsonl')
            m1, m2 = {}, {}
            for o in f1:
                m1.setdefault(item_key(o), []).append(o)
            for o in f2:
                m2.setdefault(item_key(o), []).append(o)

            keys = sorted(set(m1) | set(m2))
            disagreements = []
            for k in keys:
                l1 = m1.get(k, [])
                l2 = m2.get(k, [])
                if l1 and l2:
                    # Compatible if same category & proposed (or both single entries with same category & proposed)
                    c1 = {(o.get('category'), norm_val(o.get('proposed'))) for o in l1}
                    c2 = {(o.get('category'), norm_val(o.get('proposed'))) for o in l2}
                    if c1 == c2:
                        summary[track]['agreed'] += 1
                        continue
                summary[track]['disagreed'] += 1
                disagreements.append({'key': k, 'run1': l1, 'run2': l2})

            if disagreements:
                pack_txt = (PACK_ROOT / track / f'{cid}.md').read_text(encoding='utf-8')
                lines = [
                    f"# Tie-Break Pack — Track {track}, Chunk {cid} ({len(disagreements)} disagreements)",
                    '',
                    f"Legend: `content-review/pack/legend.md` | Wafi: `content-review/pack/D/{cid}.md`",
                    '',
                ]
                for idx, d in enumerate(disagreements, 1):
                    k = d['key']
                    v_part = k.split(':')[0]
                    vn = int(v_part) if v_part.isdigit() else None
                    lines.append(f"## Case {idx}: key=`{k}`")
                    if vn:
                        pdf_pg = VP[str(vn)]['pdf']
                        lines.append(f"- PDF Page Image: `content-review/_ref/pages/p{pdf_pg:03d}.png`")
                        lines.append(extract_verse_section(pack_txt, vn))
                    lines.append('')
                    lines.append('### Run 1 Finding(s)')
                    lines.append(json.dumps(d['run1'], ensure_ascii=False, indent=2) if d['run1'] else '*(none — run1 marked OK)*')
                    lines.append('### Run 2 Finding(s)')
                    lines.append(json.dumps(d['run2'], ensure_ascii=False, indent=2) if d['run2'] else '*(none — run2 marked OK)*')
                    lines.append('')
                (TB_PACK / f'{track}-{cid}.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
                all_cases.append({'track': track, 'chunk': cid, 'count': len(disagreements),
                                  'pack': str(TB_PACK / f'{track}-{cid}.md'), 'keys': [d['key'] for d in disagreements]})

    (TB_PACK / 'manifest.json').write_text(json.dumps({'summary': summary, 'batches': all_cases}, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Disagreement summary:', summary)
    print(f'Wrote {len(all_cases)} tie-break packs.')


if __name__ == '__main__':
    main()
