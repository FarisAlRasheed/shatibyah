#!/usr/bin/env python3
"""Check Gemini's per-verse sentence tags and merge them into the block files (EXPLANATION-PLAN.md step 3).
Usage: python3 tools/commentary/parts.py [bookId=wafi]
Reads data/commentaries/<id>/_parts/out/s<sectionId>.json (answers to prompts/06-explanation-parts-gemini.md).
A block whose answer is malformed is skipped and reported; the app then shows its whole explanation.
Run again after tools/commentary/build.py, which rewrites the block files without `parts`."""
import glob, json, os, re, sys

bid = sys.argv[1] if len(sys.argv) > 1 else 'wafi'
root = f'data/commentaries/{bid}'
ok = bad = 0
for path in sorted(glob.glob(f'{root}/_parts/out/s*.json')):
    name = os.path.basename(path)
    raw = open(path).read().strip()
    raw = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw)  # a code fence, if Gemini added one
    try:
        ans = json.loads(raw)
    except ValueError as e:
        print(f'{name}: not JSON ({e}); skipped'); continue
    doc = json.load(open(f'{root}/{name}'))
    asked = {b['id'] for b in json.load(open(f'{root}/_parts/in/{name}'))['blocks']}
    for b in doc['blocks']:
        b.pop('parts', None)
        if b['id'] not in asked: continue
        got = ans.get(b['id'])
        if got is None:
            print(f'{name} {b["id"]}: no answer'); bad += 1; continue
        try:
            parts = {str(int(n)): sorted({int(i) for i in idx}) for n, idx in got.items() if idx}
            assert all(b['from'] <= int(n) <= b['to'] for n in parts), 'verse outside the block'
            assert all(0 <= i < len(b['text']) for idx in parts.values() for i in idx), 'sentence number out of range'
        except (AssertionError, TypeError, ValueError, AttributeError) as e:
            print(f'{name} {b["id"]}: {e or "malformed"}'); bad += 1; continue
        if parts: b['parts'] = parts
        ok += 1
    open(f'{root}/{name}', 'w').write(json.dumps(doc, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'merged {ok} blocks, skipped {bad}')
