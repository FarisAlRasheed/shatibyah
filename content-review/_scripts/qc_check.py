#!/usr/bin/env python3
"""Phase 3 QC Step 1 & 2: verify coverage.md and validate every JSONL finding across all 85 Phase 2 runs."""
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TASKS = json.loads((ROOT / 'content-review/_ref/phase2_tasks.json').read_text(encoding='utf-8'))
CHUNKS = {c['id']: c for c in json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']}
EDITION = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text(encoding='utf-8'))
COLORS = json.loads((ROOT / 'data/editions/qasim/colors.json').read_text(encoding='utf-8'))

ALLOWED_CATS = {
    'A': {'letter', 'vowel', 'shadda', 'tanwin', 'word-missing', 'word-extra', 'word-order', 'half-split', 'numbering'},
    'B': {'missing-span', 'extra-span', 'span-extent', 'wrong-label', 'not-a-code', 'legend'},
    'C': {'missing-span', 'extra-span', 'span-extent', 'wrong-ayah', 'wrong-surah', 'ambiguous-ayah', 'wrong-note', 'missing-places', 'wrong-join'},
    'D': {'fidelity-ours', 'fidelity-source', 'wrong-block', 'wrong-intro', 'wrong-parts', 'garbage', 'contradiction-opinion'},
    'E': {'title', 'range', 'legend', 'surah-name', 'ui-text'},
    'F': {'wrong-verse', 'cut-start', 'cut-end', 'bleed-prev', 'bleed-next', 'includes-title', 'missing-audio'},
}
REQ_KEYS = {'id', 'track', 'chunk', 'run', 'verse', 'half', 'item', 'category', 'severity', 'confidence', 'current', 'proposed', 'evidence', 'reasoning'}


def load_wafi_blocks():
    blocks_by_sec = {}
    blocks_by_id = {}
    for p in sorted(glob.glob(str(ROOT / 'data/commentaries/wafi/s*.json'))):
        d = json.loads(Path(p).read_text(encoding='utf-8'))
        blocks_by_sec[d['section']] = d['blocks']
        for b in d['blocks']:
            blocks_by_id[b['id']] = b
    return blocks_by_sec, blocks_by_id


def check_run(t, blocks_by_sec, blocks_by_id):
    out_dir = Path(t['out_dir'])
    cov_path = out_dir / 'coverage.md'
    f_path = out_dir / 'findings.jsonl'
    track, chunk, run = t['track'], t['chunk'], t['run']

    cov_status = {'key': t['key'], 'track': track, 'chunk': chunk, 'run': run,
                  'exists': cov_path.exists() and f_path.exists(),
                  'complete': False, 'expected': 0, 'covered': 0, 'missing': [], 'reached': None}

    if not cov_path.exists():
        return cov_status, [], []

    cov_lines = [l.strip() for l in cov_path.read_text(encoding='utf-8').splitlines() if l.strip()]
    if cov_lines and cov_lines[-1].startswith('reached '):
        cov_status['reached'] = cov_lines[-1]

    # Parse covered item IDs
    covered_ids = set()
    for l in cov_lines:
        m = re.match(r'^(\S+)\s+[✓✗✔✘]', l)
        if m:
            covered_ids.add(m.group(1))

    if track in ('A', 'B', 'C', 'F'):
        expected_ids = [str(n) for n in range(t['start'], t['end'] + 1)]
        cov_status['expected'] = len(expected_ids)
        missing = [x for x in expected_ids if x not in covered_ids]
        cov_status['covered'] = len(expected_ids) - len(missing)
        cov_status['missing'] = missing
        cov_status['complete'] = (len(missing) == 0)
    elif track == 'D':
        sids = [s['id'] for s in CHUNKS[chunk]['sections']]
        expected_ids = [b['id'] for sid in sids for b in blocks_by_sec.get(sid, [])]
        cov_status['expected'] = len(expected_ids)
        missing = [x for x in expected_ids if x not in covered_ids]
        cov_status['covered'] = len(expected_ids) - len(missing)
        cov_status['missing'] = missing
        cov_status['complete'] = (len(missing) == 0)
    elif track == 'E':
        expected_ids = [f"sec{s['id']}" for s in EDITION['sections']]
        cov_status['expected'] = len(expected_ids)
        missing = [x for x in expected_ids if x not in covered_ids]
        has_end = cov_lines and cov_lines[-1] == 'reached E-all of E-all'
        cov_status['covered'] = len(expected_ids) - len(missing)
        cov_status['missing'] = missing
        cov_status['complete'] = (len(missing) == 0 and has_end)

    # Validate findings.jsonl
    valid_findings = []
    invalid_findings = []
    if f_path.exists():
        for ln_no, raw in enumerate(f_path.read_text(encoding='utf-8').splitlines(), 1):
            raw = raw.strip()
            if not raw:
                continue
            errs = []
            try:
                obj = json.loads(raw)
            except Exception as e:
                invalid_findings.append({'key': t['key'], 'line': ln_no, 'error': f'JSON parse error: {e}', 'raw': raw[:200]})
                continue
            if not isinstance(obj, dict):
                invalid_findings.append({'key': t['key'], 'line': ln_no, 'error': 'Not a JSON object', 'raw': raw[:200]})
                continue
            miss_keys = REQ_KEYS - set(obj.keys())
            if miss_keys:
                errs.append(f'missing keys: {sorted(miss_keys)}')
            if obj.get('category') not in ALLOWED_CATS[track]:
                errs.append(f'invalid category: {obj.get("category")}')
            if obj.get('severity') not in ('high', 'medium', 'low'):
                errs.append(f'invalid severity: {obj.get("severity")}')
            conf = obj.get('confidence')
            if not isinstance(conf, (int, float)) or not (0.0 <= float(conf) <= 1.0):
                errs.append(f'invalid confidence: {conf}')
            if not str(obj.get('evidence', '')).strip():
                errs.append('empty evidence')
            v = obj.get('verse')
            if track in ('A', 'B', 'C', 'F'):
                if not isinstance(v, int) or not (1 <= v <= 1173):
                    if not (track == 'B' and obj.get('category') == 'legend' and v == '-'):
                        errs.append(f'invalid verse: {v}')
            elif track == 'D':
                if v != '-' and (not isinstance(v, int) or not (1 <= v <= 1173)):
                    errs.append(f'invalid verse: {v}')

            item = str(obj.get('item', ''))
            if track == 'B' and item.startswith('R') and item[1:].isdigit() and isinstance(v, int):
                idx = int(item[1:])
                spans = COLORS['verses'].get(str(v), [])
                if idx >= len(spans) or spans[idx]['k'] != 'r':
                    errs.append(f'non-existent red span {item} on verse {v}')
            elif track == 'C' and item.startswith('G') and item[1:].isdigit() and isinstance(v, int):
                idx = int(item[1:])
                spans = COLORS['verses'].get(str(v), [])
                if idx >= len(spans) or spans[idx]['k'] != 'g':
                    errs.append(f'non-existent green span {item} on verse {v}')

            if errs:
                invalid_findings.append({'key': t['key'], 'line': ln_no, 'errors': errs, 'obj': obj})
            else:
                valid_findings.append(obj)

    return cov_status, valid_findings, invalid_findings


def main():
    blocks_by_sec, blocks_by_id = load_wafi_blocks()
    cov_all, invalid_all = [], []
    counts = {}
    for t in TASKS:
        cs, vf, inf = check_run(t, blocks_by_sec, blocks_by_id)
        cov_all.append(cs)
        invalid_all.extend(inf)
        counts.setdefault(t['track'], {'runs': 0, 'complete': 0, 'findings': 0, 'invalid': 0})
        counts[t['track']]['runs'] += 1
        if cs['complete']:
            counts[t['track']]['complete'] += 1
        counts[t['track']]['findings'] += len(vf)
        counts[t['track']]['invalid'] += len(inf)

    print('=== QC Summary by Track ===')
    for tr, st in sorted(counts.items()):
        print(f"Track {tr}: {st['complete']}/{st['runs']} runs complete | valid findings={st['findings']} | invalid={st['invalid']}")

    incomplete = [c for c in cov_all if c['exists'] and not c['complete']]
    not_run = [c for c in cov_all if not c['exists']]
    print(f"Not started yet: {len(not_run)} | Started but incomplete: {len(incomplete)}")
    for c in incomplete:
        print(f"  INCOMPLETE {c['key']}: {c['covered']}/{c['expected']}, missing sample={c['missing'][:8]}, reached={c['reached']}")
    if invalid_all:
        print(f"=== Invalid findings ({len(invalid_all)}) ===")
        for x in invalid_all[:30]:
            print(' ', x['key'], f"line {x['line']}", x.get('errors') or x.get('error'))

    qc_out = ROOT / 'content-review/out/qc_status.json'
    qc_out.write_text(json.dumps({'counts': counts, 'coverage': cov_all, 'invalid': invalid_all}, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
