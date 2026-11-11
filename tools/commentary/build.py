#!/usr/bin/env python3
"""Split a Turath commentary on the Shatibiyyah into verse-group blocks (EXPLANATION-PLAN.md step 1).
Usage: python3 tools/commentary/build.py [bookId=wafi]
Reads the page cache made by tools/extract/fetch_turath.py, writes
  data/commentaries/<id>/book.json, s<sectionId>.json, _report.md, _parts/in/s<sectionId>.json
No model is involved: the book lists numbered verse lines, then their explanation."""
import difflib, json, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'extract'))
from common import AR_DIG, skel

BOOKS = {
    'wafi': dict(name='الوافي في شرح الشاطبية', author='عبد الفتاح القاضي', turath=38075,
                 source='مكتبة السوادي، ط ٤، ١٤١٢ هـ (نص تراث)', first=1, last=394),
}
EDITION = 'qasim'
VERSE = re.compile(r'^\s*([٠-٩]+)\s*-\s*(.*)$')
TITLE = re.compile(r'<span data-type="title"[^>]*>(.*?)</span>')
NOTE = re.compile(r'^\(([٠-٩]+)\)\s*(.*)$')
END = '.:؟!»'


def load_pages(cache, first, last):
    """[(printed page, body lines, footnote lines)]"""
    out = []
    for pg in range(first, last + 1):
        d = json.load(open(os.path.join(cache, f'p{pg:04d}.json')))
        text = re.sub(r'[ \t]*\[تصوير\][ \t]*\n?', ' ', d['text'])
        body, _, foot = text.partition('\n_________')
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        notes = [l.strip() for l in foot.split('\n') if l.strip(' _')]
        out.append((json.loads(d['meta'])['page'], lines, notes))
    return out


def overlap(part, whole):
    """share of `part` found, in order, inside `whole` (both skeletons)"""
    if not part: return 0.0
    m = difflib.SequenceMatcher(None, part, whole, autojunk=False)
    return sum(b.size for b in m.get_matching_blocks()) / len(part)


def sentences(paragraphs):
    text, breaks = [], []
    for p in paragraphs:
        # a source line that stops mid-sentence (it ends in a letter) is not a paragraph end
        if text and not text[-1][-1].isalpha(): breaks.append(len(text))
        for s in re.split(r'(?<=[.؟!])\s+', p):
            if s: text += clauses(s)
    return text, breaks


def clauses(s, long=160, short=60):
    """A long sentence is cut at its commas into pieces of at least `short` characters, so a
    piece can be tied to one verse. Joining the pieces with a space gives the sentence back."""
    if len(s) <= long: return [s]
    out, cur = [], ''
    for part in re.split(r'(?<=[،؛])\s+', s):
        cur = f'{cur} {part}' if cur else part
        if len(cur) >= short: out.append(cur); cur = ''
    if cur:
        if out and len(cur) < short: out[-1] += ' ' + cur
        else: out.append(cur)
    return out


def main():
    bid = sys.argv[1] if len(sys.argv) > 1 else 'wafi'
    cfg = BOOKS[bid]
    edition = json.load(open(f'data/editions/{EDITION}/edition.json'))
    verses = {v['n']: v for v in edition['verses']}
    vskel = {n: skel(v['a'] + v['b']) for n, v in verses.items()}
    last_verse = max(verses)

    def section_of(n):
        return min((s for s in edition['sections'] if s['start'] <= n <= s['end']), key=lambda s: s['end'] - s['start'])['id']

    blocks, issues = [], []
    cur = None       # block being filled
    expect = 1       # next verse number
    joined = False   # the previous page ended mid-sentence

    def is_verse(line):
        m = VERSE.match(line)
        if not m or '...' not in m.group(2): return None
        n = int(m.group(1).translate(AR_DIG))
        if n not in (expect, expect - 1) or n > last_verse: return None
        body = m.group(2)
        score = overlap(skel(body.replace('.', '')), vskel[n])
        if score < 0.6:
            issues.append(f'- line numbered {n} looks unlike verse {n} (match {score:.2f}), kept as explanation text: `{line[:80]}`')
            return None
        return n, body, score

    def new_block(page, **kw):
        nonlocal cur
        cur = dict(id='', page=page, verses=[], lines=[], paras=[], notes=[], **kw)
        blocks.append(cur)

    for page, lines, notes in load_pages(os.path.join('sources', f'turath-{cfg["turath"]}'), cfg['first'], cfg['last']):
        for i, line in enumerate(lines):
            t = TITLE.search(line)
            if t:
                new_block(page, intro=True, title=t.group(1).strip()); joined = False; continue
            v = is_verse(line)
            if v:
                n, body, score = v
                if cur is None or cur.get('intro') or cur['paras']: new_block(page)
                cur['verses'].append(n); cur['lines'].append(body)
                if body.lstrip().startswith('.') or n == expect - 1: cur['partial'] = True
                if score < 0.85: issues.append(f'- verse {n}: book line differs from the edition (match {score:.2f}): `{body[:80]}`')
                expect = n + 1; joined = False; continue
            if cur is None: new_block(page, intro=True, title='')
            if i == 0 and joined and cur['paras']: cur['paras'][-1] += ' ' + line
            else: cur['paras'].append(line)
            joined = False
        joined = bool(lines) and lines[-1][-1] not in END
        for nt in notes:
            m = NOTE.match(nt)
            if m and cur: cur['notes'].append({'mark': m.group(1), 'text': m.group(2)})
            elif cur and cur['notes']: cur['notes'][-1]['text'] += ' ' + nt

    # shape the blocks and place them in the edition's sections
    out, seen, pending = {}, {}, []
    for b in blocks:
        text, breaks = sentences(b['paras'])
        if b.get('intro'):
            if text: pending.append(dict(intro=True, title=b['title'], page=b['page'], text=text, breaks=breaks, notes=b['notes']))
            continue
        frm, to = b['verses'][0], b['verses'][-1]
        k = seen.get(frm, 0); seen[frm] = k + 1
        blk = dict(id=f'b{frm}' + ('abcdef'[k] if k else ''), **{'from': frm, 'to': to}, page=b['page'], text=text, breaks=breaks)
        if b.get('partial'): blk['partial'] = True
        if b['notes']: blk['notes'] = b['notes']
        blk['_lines'] = b['lines']
        sid = section_of(frm)
        if section_of(to) != sid: issues.append(f'- block {blk["id"]} ({frm}–{to}) crosses a section boundary')
        if not text: issues.append(f'- block {blk["id"]} ({frm}–{to}) has no explanation text')
        sec = out.setdefault(sid, [])
        for j, p in enumerate(pending):
            p['id'] = f'i{frm}' + ('abcdef'[j] if j else ''); p['before'] = frm
            if not p['notes']: del p['notes']
            sec.append(p)
        pending = []
        sec.append(blk)
    covered = {n for bs in out.values() for b in bs if not b.get('intro') for n in range(b['from'], b['to'] + 1)}
    missing = sorted(set(verses) - covered)
    if missing: issues.append(f'- verses with no block: {missing}')

    # write
    root = f'data/commentaries/{bid}'
    os.makedirs(f'{root}/_parts/in', exist_ok=True)
    dump = lambda p, o: open(p, 'w').write(json.dumps(o, ensure_ascii=False, separators=(',', ':')) + '\n')
    sizes, gem = [], 0
    for sid, bs in out.items():
        real = [b for b in bs if not b.get('intro')]
        sizes += [b['to'] - b['from'] + 1 for b in real]
        multi = [dict(id=b['id'],
                      verses=[dict(n=n, text=verses[n]['a'] + ' ' + verses[n]['b']) for n in range(b['from'], b['to'] + 1)],
                      sentences=b['text'])
                 for b in real if b['to'] > b['from'] and len(b['text']) > 1]
        if multi: dump(f'{root}/_parts/in/s{sid}.json', {'blocks': multi}); gem += len(multi)
        for b in bs: b.pop('_lines', None)
        dump(f'{root}/s{sid}.json', {'section': sid, 'blocks': bs})
    dump(f'{root}/book.json', dict(id=bid, name=cfg['name'], author=cfg['author'], source=cfg['source'],
                                   turathId=cfg['turath'], editionId=EDITION, sections=sorted(out)))
    n = len(sizes)
    hist = {k: sizes.count(k) for k in sorted(set(sizes))}
    chars = sum(len(s) for bs in out.values() for b in bs for s in b['text'])
    rep = [f'# {cfg["name"]}: split report', '',
           f'- blocks: {n} covering {len(covered)} of {len(verses)} verses, in {len(out)} section files',
           f'- verses per block: ' + ', '.join(f'{k} verse{"s" if k > 1 else ""} × {c}' for k, c in hist.items()),
           f'- blocks sent to Gemini (two or more verses and sentences): {gem}',
           f'- explanation text: {chars:,} characters', '', f'## To check ({len(issues)})', ''] + (issues or ['Nothing flagged.'])
    open(f'{root}/_report.md', 'w').write('\n'.join(rep) + '\n')
    print('\n'.join(rep[2:6]), f'\nflagged: {len(issues)}')


if __name__ == '__main__':
    main()
