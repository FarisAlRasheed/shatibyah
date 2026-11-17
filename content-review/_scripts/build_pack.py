#!/usr/bin/env python3
"""Build all content-review/pack/ files deterministically from the project data."""
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACK_DIR = ROOT / 'content-review/pack'
REF_DIR = ROOT / 'content-review/_ref'

SURAHS_STD = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس',
]


def load_quran(path: Path):
    ayat = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        parts = line.split('|', 2)
        if len(parts) == 3 and parts[0].isdigit():
            ayat[(int(parts[0]), int(parts[1]))] = parts[2]
    return ayat


def extract_src_surahs():
    txt = (ROOT / 'src/colors.tsx').read_text(encoding='utf-8')
    m = re.search(r'export const SURAHS\s*=\s*\[(.*?)\]', txt, re.S)
    assert m, 'Could not find SURAHS in src/colors.tsx'
    names = re.findall(r"'([^']+)'", m.group(1))
    assert len(names) == 114, f'Expected 114 surahs, got {len(names)}'
    return names


def word_around(text: str, s: int, e: int) -> str:
    ws = s
    while ws > 0 and not text[ws - 1].isspace():
        ws -= 1
    we = e
    while we < len(text) and not text[we].isspace():
        we += 1
    return text[ws:we]


def render_inline_b(text: str, half: str, indexed_spans: list, codes: dict) -> str:
    reds = sorted([(sp['s'], sp['e'], idx, sp) for idx, sp in indexed_spans if sp['h'] == half and sp['k'] == 'r'])
    out = []
    pos = 0
    for s, e, idx, sp in reds:
        assert s >= pos, f'Overlapping red spans in {half}: {s} < {pos}'
        out.append(text[pos:s])
        c = sp['c']
        info = codes[c]
        label = info['label']
        note = f" ({info['note']})" if info.get('note') else ''
        out.append(f"⟦R{idx} «{text[s:e]}» → {label}{note}⟧")
        pos = e
    out.append(text[pos:])
    return ''.join(out)


def render_inline_c(text: str, half: str, indexed_spans: list, surahs: list) -> str:
    greens = sorted([(sp['s'], sp['e'], idx, sp) for idx, sp in indexed_spans if sp['h'] == half and sp['k'] == 'g'])
    out = []
    pos = 0
    for s, e, idx, sp in greens:
        assert s >= pos, f'Overlapping green spans in {half}: {s} < {pos}'
        out.append(text[pos:s])
        q = sp.get('q', [])
        if q:
            s0, a0 = q[0]
            ref = f"{surahs[s0 - 1]} {s0}:{a0}"
            if len(q) > 1:
                more = ', '.join(f"{ss}:{aa}" for ss, aa in q[1:])
                ref += f" (+{len(q)-1}: {more})"
        else:
            ref = 'حرف'
        note = f" · {sp['note']}" if sp.get('note') else ''
        out.append(f"⦃G{idx} «{text[s:e]}» → {ref}{note}⦄")
        pos = e
    out.append(text[pos:])
    return ''.join(out)


def build_legend(edition, colors, wafi_by_sec):
    verses = {v['n']: v for v in edition['verses']}
    lines = [
        '# Legend: 92 Reader Codes & Verses 45–66 (نظام الرموز والأضداد)',
        '',
        '## 1. Codes Table (`data/editions/qasim/colors.json` — 92 entries)',
        '',
        '| # | Key | Kind | Label | Note |',
        '|---|---|---|---|---|',
    ]
    for i, (key, info) in enumerate(colors['codes'].items(), 1):
        note = info.get('note', '—')
        lines.append(f"| {i} | `{key}` | `{info['kind']}` | {info['label']} | {note} |")

    lines += ['', '## 2. Poem Verses 45–66 (من مقدمة الناظم)', '']
    for n in range(45, 67):
        v = verses[n]
        lines.append(f"- **{n}**: {v['a']}  |  {v['b']}")

    lines += ['', '## 3. الوافي Explanation for Verses 45–66', '']
    for b in wafi_by_sec[5]:
        if not b.get('intro') and b['to'] >= 45 and b['from'] <= 66:
            lines.append(f"### Block `{b['id']}` (verses {b['from']}–{b['to']}, printed p.{b['page']})")
            for pi, p in enumerate(b['text']):
                lines.append(f"- P{pi}: {p}")
            lines.append('')

    (PACK_DIR / 'legend.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def build_track_abc(chunks, edition, colors, vp_verses, quran_uthmani, surahs):
    verses = {v['n']: v for v in edition['verses']}
    sec_of = {}
    for s in edition['sections']:
        for n in range(s['start'], s['end'] + 1):
            # Prefer innermost section (surah over bab 34)
            if n not in sec_of or s['parent'] is not None:
                sec_of[n] = s

    for ch in chunks:
        cid = ch['id']
        v0, v1 = ch['start'], ch['end']
        sec_summary = ', '.join(f"{s['id']}: {s['title']} ({s['start']}–{s['end']})" for s in ch['sections'])

        # Group verses in chunk by PDF page
        by_pdf = {}
        for n in range(v0, v1 + 1):
            pdf_pg = vp_verses[str(n)]['pdf']
            by_pdf.setdefault(pdf_pg, []).append(n)

        # --- Pack A ---
        a_lines = [
            f"# Track A — Chunk {cid} (Verses {v0}–{v1}, PDF pp. {ch['pdfRange'][0]}–{ch['pdfRange'][1]})",
            f"Sections: {sec_summary}",
            '',
        ]
        # --- Pack B ---
        r_count = sum(1 for n in range(v0, v1 + 1) for sp in colors['verses'].get(str(n), []) if sp['k'] == 'r')
        b_lines = [
            f"# Track B — Chunk {cid} (Verses {v0}–{v1}, PDF pp. {ch['pdfRange'][0]}–{ch['pdfRange'][1]}, {r_count} red spans)",
            f"Sections: {sec_summary}",
            f"Legend: `content-review/pack/legend.md` | Wafi: `content-review/pack/D/{cid}.md`",
            '',
        ]
        # --- Pack C ---
        g_count = sum(1 for n in range(v0, v1 + 1) for sp in colors['verses'].get(str(n), []) if sp['k'] == 'g')
        c_lines = [
            f"# Track C — Chunk {cid} (Verses {v0}–{v1}, PDF pp. {ch['pdfRange'][0]}–{ch['pdfRange'][1]}, {g_count} green spans)",
            f"Sections: {sec_summary}",
            f"Wafi: `content-review/pack/D/{cid}.md` | Mushaf text: `content-review/_ref/quran-uthmani.txt`",
            '',
        ]

        for pdf_pg in sorted(by_pdf):
            printed_pg = vp_verses[str(by_pdf[pdf_pg][0])]['printed']
            png_path = f"content-review/_ref/pages/p{pdf_pg:03d}.png"
            hdr = f"## PDF Page {pdf_pg} (Printed {printed_pg}) — `{png_path}`"
            a_lines += [hdr, '']
            b_lines += [hdr, '']
            c_lines += [hdr, '']

            for n in by_pdf[pdf_pg]:
                v = verses[n]
                sec = sec_of[n]
                spans = colors['verses'].get(str(n), [])
                indexed = list(enumerate(spans))

                # A
                a_lines.append(f"### Verse {n} (sec {sec['id']}: {sec['title']}, PDF p.{pdf_pg})")
                a_lines.append(f"- `a`: {v['a']}")
                a_lines.append(f"- `b`: {v['b']}")
                a_lines.append('')

                # B
                b_lines.append(f"### Verse {n} (sec {sec['id']}: {sec['title']}, PDF p.{pdf_pg})")
                b_lines.append(f"- `a`: {render_inline_b(v['a'], 'a', indexed, colors['codes'])}")
                b_lines.append(f"- `b`: {render_inline_b(v['b'], 'b', indexed, colors['codes'])}")
                red_items = [(idx, sp) for idx, sp in indexed if sp['k'] == 'r']
                if not red_items:
                    b_lines.append("- *(no red spans in colors.json)*")
                else:
                    for idx, sp in red_items:
                        h, s, e, c = sp['h'], sp['s'], sp['e'], sp['c']
                        sl = v[h][s:e]
                        fw = word_around(v[h], s, e)
                        info = colors['codes'][c]
                        note = f" ({info['note']})" if info.get('note') else ''
                        b_lines.append(
                            f"- `R{idx}` [half `{h}`, {s}:{e}, code=`{c}`, kind=`{info['kind']}`]: «{sl}» (word «{fw}») → {info['label']}{note}"
                        )
                b_lines.append('')

                # C
                c_lines.append(f"### Verse {n} (sec {sec['id']}: {sec['title']}, PDF p.{pdf_pg})")
                c_lines.append(f"- `a`: {render_inline_c(v['a'], 'a', indexed, surahs)}")
                c_lines.append(f"- `b`: {render_inline_c(v['b'], 'b', indexed, surahs)}")
                green_items = [(idx, sp) for idx, sp in indexed if sp['k'] == 'g']
                if not green_items:
                    c_lines.append("- *(no green spans in colors.json)*")
                else:
                    for idx, sp in green_items:
                        h, s, e = sp['h'], sp['s'], sp['e']
                        sl = v[h][s:e]
                        fw = word_around(v[h], s, e)
                        x_str = sp.get('x', '')
                        note_str = f" | note: «{sp['note']}»" if sp.get('note') else ''
                        w_str = f" | w: «{sp['w']}»" if sp.get('w') else ''
                        c_lines.append(
                            f"- `G{idx}` [half `{h}`, {s}:{e}]: «{sl}» (word «{fw}») | x: «{x_str}»{note_str}{w_str}"
                        )
                        q = sp.get('q', [])
                        if not q:
                            c_lines.append("  - `q`: `[]` *(no ayah; letter/bab mark)*")
                        else:
                            for ss, aa in q:
                                ayah_txt = quran_uthmani.get((ss, aa), 'MISSING!')
                                c_lines.append(f"  - Mushaf `{ss}:{aa}` ({surahs[ss - 1]}): {ayah_txt}")
                c_lines.append('')

        (PACK_DIR / f'A/{cid}.md').write_text('\n'.join(a_lines) + '\n', encoding='utf-8')
        (PACK_DIR / f'B/{cid}.md').write_text('\n'.join(b_lines) + '\n', encoding='utf-8')
        (PACK_DIR / f'C/{cid}.md').write_text('\n'.join(c_lines) + '\n', encoding='utf-8')


def build_track_d(chunks, edition):
    verses = {v['n']: v for v in edition['verses']}
    # Index all Turath 38075 pages by printed page number AND by page_id
    by_printed = {}
    by_pid = {}
    for p in sorted(glob.glob(str(ROOT / 'sources/turath-38075/p*.json'))):
        d = json.loads(Path(p).read_text(encoding='utf-8'))
        meta = json.loads(d['meta'])
        pid = int(meta['page_id'])
        pg = int(meta['page'])
        rec = (pid, Path(p).name, pg, d['text'])
        by_pid[pid] = rec
        by_printed[pg] = rec

    # Collect all blocks in sequential order to know the printed page of the next block
    wafi_by_sec = {}
    ordered_blocks = []
    for s in edition['sections']:
        f = ROOT / f'data/commentaries/wafi/s{s["id"]}.json'
        if f.exists():
            d = json.loads(f.read_text(encoding='utf-8'))
            wafi_by_sec[s['id']] = d['blocks']
            for b in d['blocks']:
                ordered_blocks.append((s['id'], b))
        else:
            wafi_by_sec[s['id']] = []

    next_page_by_key = {}
    for idx, (sid, b) in enumerate(ordered_blocks):
        if idx + 1 < len(ordered_blocks):
            next_page_by_key[(sid, b['id'])] = ordered_blocks[idx + 1][1]['page']
        else:
            next_page_by_key[(sid, b['id'])] = by_pid[max(by_pid)][2]

    for ch in chunks:
        cid = ch['id']
        lines = [
            f"# Track D — Chunk {cid} (Verses {ch['start']}–{ch['end']}, {ch['wafiBlockCount']} Wafi blocks)",
            '',
        ]
        for s in ch['sections']:
            sid = s['id']
            blocks = wafi_by_sec.get(sid, [])
            if not blocks:
                continue
            lines.append(f"## Section {sid}: {s['title']} (verses {s['start']}–{s['end']})")
            lines.append('')
            for b in blocks:
                bid = b['id']
                pg = b['page']
                pid, fname, _, _ = by_printed[pg]
                next_pg = next_page_by_key[(sid, bid)]
                next_pid = by_printed[next_pg][0]

                if b.get('intro'):
                    bef = b['before']
                    lines.append(f"### Block `{bid}` [INTRO] — before verse {bef} (printed p.{pg}, source `{fname}`)")
                    lines.append(f"- Title: `{b.get('title', '')}`")
                    lines.append(f"- Verse {bef}: `a`: {verses[bef]['a']} | `b`: {verses[bef]['b']}")
                else:
                    vfrom, vto = b['from'], b['to']
                    partial_str = f", partial={b['partial']}" if b.get('partial') else ''
                    lines.append(f"### Block `{bid}` — verses {vfrom}–{vto}{partial_str} (printed p.{pg}, source `{fname}`)")
                    for vn in range(vfrom, vto + 1):
                        lines.append(f"- Verse {vn} `a`: {verses[vn]['a']}")
                        lines.append(f"- Verse {vn} `b`: {verses[vn]['b']}")

                lines.append('')
                lines.append('#### Pieces (`text`, `breaks`, `parts`)')
                parts = b.get('parts')
                breaks = set(b.get('breaks', []))
                piece_to_vs = {}
                if parts:
                    for v_str, idxs in parts.items():
                        for pi in idxs:
                            piece_to_vs.setdefault(pi, []).append(int(v_str))

                for pi, ptxt in enumerate(b['text']):
                    brk = ' [BREAK]' if pi in breaks else ''
                    if b.get('intro'):
                        tag = 'INTRO'
                    elif parts is None:
                        tag = f'v{b["from"]}'
                    else:
                        vs = sorted(piece_to_vs.get(pi, []))
                        tag = ','.join(f'v{x}' for x in vs) if vs else 'UNASSIGNED'
                    lines.append(f"- `P{pi}` [{tag}]{brk}: {ptxt}")

                if b.get('notes'):
                    lines.append('')
                    lines.append('#### Footnotes (`notes`)')
                    for note in b['notes']:
                        lines.append(f"- ({note['mark']}) {note['text']}")

                lines.append('')
                # Include Turath page(s): from pid to max(pid, next_pid) (cap at pid+7 if huge)
                end_pid = min(max(pid, next_pid), pid + 7)
                # Always also include pid+1 if next_pid == pid? Wait: if next block is on same page, pid alone covers it.
                # Still, if next_pid > pid, include up to next_pid.
                lines.append(f"#### Raw Turath Page Text (printed p.{pg}..{by_pid[end_pid][2]}, `p{pid:04d}.json`..`p{end_pid:04d}.json`)")
                for cur_pid in range(pid, end_pid + 1):
                    if cur_pid in by_pid:
                        _, c_fname, c_pg, c_txt = by_pid[cur_pid]
                        lines.append(f"```text [source: sources/turath-38075/{c_fname}, printed p.{c_pg}]")
                        lines.append(c_txt.rstrip())
                        lines.append("```")
                lines.append('')

        (PACK_DIR / f'D/{cid}.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    return wafi_by_sec


def build_track_e(edition, vp_verses, src_surahs):
    pk = json.loads((REF_DIR / 'pdfkit-text.json').read_text(encoding='utf-8'))

    # 1. titles.md
    t_lines = [
        '# Track E — Section Titles & Verse Ranges (`data/editions/qasim/edition.json`)',
        '',
        'Check each section title and `start`/`end` against the rendered PDF page images (`content-review/_ref/pages/p<NNN>.png`) and TOC (`p177.png`, `p178.png`).',
        '',
        '| ID | Kind | Parent | Start | End | Count | Start PDF p. | End PDF p. | Title (`edition.json`) |',
        '|---|---|---|---|---|---|---|---|---|',
    ]
    for s in edition['sections']:
        p_start = vp_verses[str(s['start'])]['pdf']
        p_end = vp_verses[str(s['end'])]['pdf']
        par = str(s['parent']) if s['parent'] is not None else '—'
        cnt = s['end'] - s['start'] + 1
        t_lines.append(
            f"| {s['id']} | `{s['kind']}` | {par} | {s['start']} | {s['end']} | {cnt} | p.{p_start} (`p{p_start:03d}.png`) | p.{p_end} (`p{p_end:03d}.png`) | {s['title']} |"
        )
    t_lines += [
        '',
        '## PDF Table of Contents Text (PDF pages 177–178)',
        '```text',
        pk['177'].strip(),
        '---',
        pk['178'].strip(),
        '```',
        '',
        '## Contiguity Check Helper Info',
        f"- Total sections: {len(edition['sections'])}",
        f"- Non-parent (leaf) sections covering verses: {sum(1 for s in edition['sections'] if s['id'] != 34)}",
        '- Note: Section 34 (`بَابُ فَرْشِ الحُرُوفِ`) is a parent section spanning `445..1120`; sections 35..80 have `parent: 34`.',
    ]
    (PACK_DIR / 'E/titles.md').write_text('\n'.join(t_lines) + '\n', encoding='utf-8')

    # 2. surahs.md
    s_lines = [
        '# Track E — `SURAHS` Table (`src/colors.tsx` lines 7–20)',
        '',
        'Check all 114 surah names in order (1-based index 1..114) against standard Mushaf surah names.',
        '',
        '| Index (1-based) | Array Index (0-based) | `src/colors.tsx` `SURAHS` | Standard Mushaf Name | Exact Match? |',
        '|---|---|---|---|---|',
    ]
    for idx, (app_name, std_name) in enumerate(zip(src_surahs, SURAHS_STD), 1):
        eq = 'yes' if app_name == std_name else 'DIFF'
        s_lines.append(f"| {idx} | {idx - 1} | {app_name} | {std_name} | {eq} |")
    (PACK_DIR / 'E/surahs.md').write_text('\n'.join(s_lines) + '\n', encoding='utf-8')

    # 3. ui-strings.md
    u_lines = [
        '# Track E — Arabic UI Strings in `src/*.tsx` (and `src/*.ts` with Arabic text)',
        '',
        'Check spelling, grammar, and religious/educational wording only (not code style).',
        '',
    ]
    ar_re = re.compile(r'[\u0600-\u06FF]')
    src_files = sorted(list((ROOT / 'src').glob('*.tsx')) + list((ROOT / 'src').glob('*.ts')))
    total_lines = 0
    for fpath in src_files:
        rel = fpath.relative_to(ROOT)
        file_lines = fpath.read_text(encoding='utf-8').splitlines()
        hits = [(ln_no, ln.strip()) for ln_no, ln in enumerate(file_lines, 1) if ar_re.search(ln)]
        if not hits:
            continue
        u_lines.append(f"## `{rel}` ({len(hits)} lines)")
        for ln_no, ln in hits:
            u_lines.append(f"- `{rel}:{ln_no}`: `{ln}`")
            total_lines += 1
        u_lines.append('')
    u_lines.insert(4, f"Total lines with Arabic across `src/`: {total_lines}\n")
    (PACK_DIR / 'E/ui-strings.md').write_text('\n'.join(u_lines) + '\n', encoding='utf-8')


def build_track_f(chunks, edition):
    verses = {v['n']: v for v in edition['verses']}
    sec_by_id = {s['id']: s for s in edition['sections']}
    rec = json.loads((ROOT / 'data/reciters/mahmud-haleem/reciter.json').read_text(encoding='utf-8'))
    pauses_data = json.loads((REF_DIR / 'audio_pauses.json').read_text(encoding='utf-8'))

    by_file = {}
    for v in rec['verses']:
        by_file.setdefault(v['file'], []).append(v)

    file_md_cache = {}
    for f in rec['files']:
        fid = f['id']
        sids = f['sectionIds']
        sec_desc = ', '.join(f"{sid}: {sec_by_id[sid]['title']}" for sid in sids)
        dur = pauses_data['files'][fid]['duration']
        vlist = sorted(by_file[fid], key=lambda x: x['n'])

        lines = [
            f"## Audio File `{fid}` (`data/reciters/mahmud-haleem/{f['path']}`)",
            f"- Sections: {sec_desc}",
            f"- Duration: {dur}s | Verses: {vlist[0]['n']}–{vlist[-1]['n']} ({len(vlist)} verses)",
            '',
            '| Verse | Start | End | Dur | Conf | Pause Flags | Nearby Pauses (±3s) | Clip Path |',
            '|---|---|---|---|---|---|---|---|',
        ]
        for v in vlist:
            vn = v['n']
            diag = pauses_data['verses'][str(vn)]
            flags = ', '.join(diag['flags']) if diag['flags'] else 'ok'
            near = ', '.join(f"{a}–{b}" for a, b in diag['nearby_pauses'])
            vdur = round(v['end'] - v['start'], 2)
            cpath = f"content-review/_ref/clips/v{vn:04d}.mp3"
            lines.append(f"| {vn} | {v['start']} | {v['end']} | {vdur} | {v['confidence']} | {flags} | {near} | `{cpath}` |")
        lines.append('')
        lines.append('### Verse Texts')
        for v in vlist:
            vn = v['n']
            vt = verses[vn]
            lines.append(f"- **{vn}** [{v['start']}–{v['end']}s, conf={v['confidence']}, `v{vn:04d}.mp3`]: {vt['a']}  |  {vt['b']}")
        lines.append('')
        md = '\n'.join(lines)
        file_md_cache[fid] = md
        (PACK_DIR / f'F/{fid}.md').write_text(f"# Track F — Audio File `{fid}`\n\n" + md + '\n', encoding='utf-8')

    for ch in chunks:
        cid = ch['id']
        lines = [
            f"# Track F — Chunk {cid} (Verses {ch['start']}–{ch['end']}, Audio Files: {', '.join(ch['audioFiles'])})",
            '',
        ]
        for fid in ch['audioFiles']:
            lines.append(file_md_cache[fid])
        (PACK_DIR / f'F/{cid}.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def build_weak_spots(chunks, edition, colors):
    verses = {v['n']: v for v in edition['verses']}
    # Parse prior reports
    diff_usul = (ROOT / 'data/editions/qasim/diff-report-usul.md').read_text(encoding='utf-8')
    diff_farsh = (ROOT / 'data/editions/qasim/diff-report.md').read_text(encoding='utf-8')
    text_rev = json.loads((ROOT / 'tools/text-review/items.json').read_text(encoding='utf-8'))
    colors_rep = (ROOT / 'tools/colors/report.md').read_text(encoding='utf-8')
    wafi_rep = (ROOT / 'data/commentaries/wafi/_report.md').read_text(encoding='utf-8')
    gem_rep = (ROOT / 'data/commentaries/wafi/_parts/gemini-report.md').read_text(encoding='utf-8')
    tim_usul = (ROOT / 'data/reciters/mahmud-haleem/timing-report-usul.md').read_text(encoding='utf-8')
    tim_farsh = (ROOT / 'data/reciters/mahmud-haleem/timing-report.md').read_text(encoding='utf-8')

    def extract_sec3(md_text):
        m = re.search(r'## 3\. Uncertain\n(.*?)\n## 4\.', md_text, re.S)
        return [ln for ln in (m.group(1).splitlines() if m else []) if ln.startswith('|') and not ln.startswith(('| Verse', '|---'))]

    usul_unc = extract_sec3(diff_usul)
    farsh_unc = extract_sec3(diff_farsh)

    # Extract colors report bullet lines starting with "- <verse>"
    color_judgement = []
    in_sec = None
    for ln in colors_rep.splitlines():
        if ln.startswith('## '):
            in_sec = ln[3:].strip()
        elif in_sec in ('Spans not mapped exactly', 'Still uncertain', 'Places decided by hand or by a rule other than a single script hit'):
            if ln.strip().startswith('-'):
                color_judgement.append((in_sec, ln.strip()))

    # Extract wafi gemini report blocks
    wafi_flags = []
    for ln in gem_rep.splitlines():
        m = re.match(r'\|\s*`(s\d+\.json)`\s*\|\s*`(b\d+)`\s*\|\s*([0-9–-]+)\s*\|\s*(.*?)\s*\|$', ln)
        if m:
            wafi_flags.append((m.group(1), m.group(2), m.group(3), m.group(4)))

    # Programmatic anomalies detected during pack prep
    anomalies = []
    for n, v in verses.items():
        for h in ('a', 'b'):
            if 'ــ' in v[h]:
                anomalies.append((n, f"Text multi-tatweel in `{n}{h}`: `{v[h]}`"))
            if re.search(r'\S\.\S', v[h]):
                anomalies.append((n, f"Text mid-word dot in `{n}{h}`: `{v[h]}`"))
        if n == 530 and 'وَبَعْدَلَا' in v['b']:
            anomalies.append((n, f"Text missing space in `530b`: `{v['b']}`"))
    for n_str, sps in colors['verses'].items():
        n = int(n_str)
        for idx, sp in enumerate(sps):
            txt = verses[n][sp['h']]
            sl = txt[sp['s']:sp['e']]
            fw = word_around(txt, sp['s'], sp['e'])
            if sp['k'] == 'r' and colors['codes'][sp['c']]['kind'] in ('letter', 'group'):
                letters = [c for c in sl if c.isalpha() and c != 'ـ']
                if len(letters) != 1:
                    anomalies.append((n, f"Red `R{idx}` (`{sp['c']}`) covers `{sl}` (>1 letter) in `{fw}`"))
                if sp['s'] > 0 and not txt[sp['s'] - 1].isspace() and txt[sp['s'] - 1] not in '،.؛:«»-"ـ':
                    pref = txt[max(0, sp['s']-4):sp['s']]
                    if pref not in ('و', 'وَ', 'بِال', 'لِ', 'فَ'):
                        anomalies.append((n, f"Red `R{idx}` (`{sp['c']}`) starts mid-word `{sl}` inside `{fw}`"))
            if sp['k'] == 'g':
                if sp['e'] < len(txt) and not txt[sp['e']].isspace() and txt[sp['e']] not in '،.؛:«»-"ـ':
                    anomalies.append((n, f"Green `G{idx}` ends mid-word `{sl}` inside `{fw}`"))
                if n == 398 and idx == 10:
                    anomalies.append((n, f"Green `G{idx}` (`12:46`) placed on `{sl}` inside `{fw}` instead of `لَعَلِّى`"))
                if n == 1040 and idx == 6:
                    anomalies.append((n, f"Green `G{idx}` (`47:31`) placed on `{sl}` of code word `{fw}`"))

    pauses_data = json.loads((REF_DIR / 'audio_pauses.json').read_text(encoding='utf-8'))['verses']

    for ch in chunks:
        cid = ch['id']
        v0, v1 = ch['start'], ch['end']
        lines = [
            f"# Known Weak Spots — Chunk {cid} (Verses {v0}–{v1})",
            '',
            'Pay extra attention to every item listed below when reviewing this chunk across Tracks A–F.',
            '',
            '## 1. Text Extraction Uncertain / Review Items',
        ]
        found_t = False
        for ln in usul_unc + farsh_unc:
            m = re.match(r'\|\s*(\d+)\s*\|', ln)
            if m and v0 <= int(m.group(1)) <= v1:
                lines.append(f"- {ln}")
                found_t = True
        for item in text_rev:
            vn = item.get('n')
            if vn and v0 <= vn <= v1:
                lines.append(f"- `{item['id']}` (v.{vn}{item.get('half','')}, p.{item.get('page')}): {item['word']} — {item['issue']} (used: {item['used']})")
                found_t = True
        if not found_t:
            lines.append('- *(none in this range)*')

        lines += ['', '## 2. Colours Report Uncertain / Judgement-Call Items']
        found_c = False
        for sec_name, bullet in color_judgement:
            nums = [int(x) for x in re.findall(r'\b(\d{1,4})\b', bullet.split(':')[0])]
            # check if verse number appears near start of bullet
            m_lead = re.match(r'^-\s*(?:\*\*)?(\d{1,4})', bullet)
            if m_lead and v0 <= int(m_lead.group(1)) <= v1:
                lines.append(f"- [{sec_name}] {bullet}")
                found_c = True
            elif not m_lead and any(v0 <= x <= v1 for x in nums[:5]):
                lines.append(f"- [{sec_name}] {bullet}")
                found_c = True
        if not found_c:
            lines.append('- *(none in this range)*')

        lines += ['', '## 3. Wafi Commentary Flagged Blocks']
        found_w = False
        for fname, bid, vrange, desc in wafi_flags:
            bn = int(bid[1:])
            if v0 <= bn <= v1:
                lines.append(f"- `{fname}` `{bid}` (verses {vrange}): {desc}")
                found_w = True
        if v0 <= 897 <= v1:
            lines.append('- `_report.md`: verse 897 book line differs from edition: `معا منسكا بالكسر في الشّين شلشلا`')
            found_w = True
        if v0 <= 975 <= v1:
            lines.append('- `gemini-report.md` §5: `s64.json` `b975` sentence 2 OCR typo `عالم` instead of `علام`.')
            found_w = True
        if v0 <= 1118 <= v1:
            lines.append('- `gemini-report.md` §5: `s80.json` `b1118` verse 1119 text ends with `تَحَصَّلَ.ا`.')
            found_w = True
        if not found_w:
            lines.append('- *(none in this range)*')

        lines += ['', '## 4. Audio Timing Low-Confidence (<0.9) & Pause-Flagged Verses']
        found_f = False
        for vn in range(v0, v1 + 1):
            d = pauses_data[str(vn)]
            if d['confidence'] < 0.9 or d['flags']:
                lines.append(f"- Verse {vn} (`{d['file']}` {d['start']}–{d['end']}s): conf={d['confidence']}, flags={d['flags']}")
                found_f = True
        if not found_f:
            lines.append('- *(none in this range)*')

        lines += ['', '## 5. Programmatic Anomalies Detected During Pack Generation']
        found_a = False
        for vn, msg in anomalies:
            if v0 <= vn <= v1:
                lines.append(f"- Verse {vn}: {msg}")
                found_a = True
        if not found_a:
            lines.append('- *(none in this range)*')

        (PACK_DIR / f'weak-spots/{cid}.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main():
    chunks = json.loads((ROOT / 'content-review/chunks.json').read_text(encoding='utf-8'))['chunks']
    edition = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text(encoding='utf-8'))
    colors = json.loads((ROOT / 'data/editions/qasim/colors.json').read_text(encoding='utf-8'))
    vp_verses = json.loads((REF_DIR / 'verse-pages.json').read_text(encoding='utf-8'))['verses']
    quran_uthmani = load_quran(REF_DIR / 'quran-uthmani.txt')
    src_surahs = extract_src_surahs()

    wafi_by_sec = build_track_d(chunks, edition)
    build_legend(edition, colors, wafi_by_sec)
    build_track_abc(chunks, edition, colors, vp_verses, quran_uthmani, src_surahs)
    build_track_e(edition, vp_verses, src_surahs)
    build_track_f(chunks, edition)
    build_weak_spots(chunks, edition, colors)
    print('All pack files built successfully under content-review/pack/.')


if __name__ == '__main__':
    main()
