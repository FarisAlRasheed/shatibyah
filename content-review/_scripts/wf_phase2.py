import json
from pathlib import Path

ROOT = Path(WORKSPACES[0])
TASKS = json.loads((ROOT / 'content-review/_ref/phase2_tasks.json').read_text(encoding='utf-8'))

tracks = set(args.get('tracks', []))
runs = set(args.get('runs', ['run1', 'run2']))
chunks_filter = set(args.get('chunks', []))
batch_size = int(args.get('batch_size', 6))
wave_name = args.get('name', 'wave')

selected = [
    t for t in TASKS
    if (not tracks or t['track'] in tracks)
    and (not runs or t['run'] in runs)
    and (not chunks_filter or t['chunk'] in chunks_filter)
]

# Skip tasks already verified complete (coverage.md exists and has expected end marker)
todo = []
for t in selected:
    cov = Path(t['out_dir']) / 'coverage.md'
    fjsonl = Path(t['out_dir']) / 'findings.jsonl'
    if cov.exists() and fjsonl.exists():
        lines = [l.strip() for l in cov.read_text(encoding='utf-8').splitlines() if l.strip()]
        if lines and lines[-1].startswith('reached '):
            parts = lines[-1].split()
            if len(parts) == 4 and parts[1] == parts[3]:
                log(f"Skipping already-done {t['key']}")
                continue
    todo.append(t)

phase(f"Phase 2: {wave_name} ({len(todo)} tasks, batch={batch_size})")

results = []

async def run_one(t):
    try:
        res = await agent(
            prompt=t['prompt'],
            schema={'type': 'string'},
            role=t['role'],
            type_name='reviewer',
            model='pro',
            workspace='inherit',
        )
        log(f"DONE {t['key']}: {str(res)[:160]}")
        return {'key': t['key'], 'status': 'ok', 'summary': str(res)}
    except Exception as e:
        log(f"ERR {t['key']}: {e}")
        return {'key': t['key'], 'status': 'error', 'error': str(e)}

for i in range(0, len(todo), batch_size):
    batch = todo[i:i + batch_size]
    log(f"Launching batch {i // batch_size + 1}: {[t['key'] for t in batch]}")
    batch_res = await parallel(batch, run_one)
    results.extend(batch_res)

out_log = ROOT / f"content-review/out/_wf_{wave_name}.json"
out_log.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
ok_cnt = sum(1 for r in results if r['status'] == 'ok')
err_cnt = sum(1 for r in results if r['status'] == 'error')
print(f"{wave_name}: ok={ok_cnt}, error={err_cnt}, total_run={len(results)}")
