#!/usr/bin/env python3
"""Build content-review/_ref/verse-pages.json from PDFKit text layer (content-review/_ref/pdfkit-text.json)
and cross-check against data/editions/qasim/pages.json."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PDFKIT_PATH = ROOT / 'content-review/_ref/pdfkit-text.json'
EDITION_PATH = ROOT / 'data/editions/qasim/edition.json'
EXISTING_PAGES_PATH = ROOT / 'data/editions/qasim/pages.json'
OUT_PATH = ROOT / 'content-review/_ref/verse-pages.json'

AR_DIG = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')


def main():
    pk = json.loads(PDFKIT_PATH.read_text(encoding='utf-8'))
    edition = json.loads(EDITION_PATH.read_text(encoding='utf-8'))
    verses = {v['n']: v for v in edition['verses']}
    n_total = len(verses)

    pages = []
    verse_map = {}
    expect = 1
    for pdf_pg in range(17, 176):
        txt = pk[str(pdf_pg)].translate(AR_DIG)
        # Printed page number is pdf_pg - 2; verify it appears in the running header (top lines)
        top_lines = '\n'.join(txt.splitlines()[:45])
        expected_printed = pdf_pg - 2
        header_nums = [int(m.group(1)) for m in re.finditer(r'(?<!\d)(\d{1,3})(?!\d)', top_lines)]
        assert expected_printed in header_nums, f'Printed page {expected_printed} not in header of PDF {pdf_pg}: {header_nums}'

        # Locate sequential verse numbers (note: PDFKit sometimes doubles single-digit or verse numbers like 11 for 1)
        all_nums = {int(m.group(1)) for m in re.finditer(r'(?<!\d)(\d{1,4})(?!\d)', txt)}
        found = []
        while expect <= n_total and (expect in all_nums or int(f'{expect}{expect}') in all_nums):
            found.append(expect)
            expect += 1

        assert found, f'No verses matched on PDF page {pdf_pg} starting at {expect}'
        pages.append({'pdf': pdf_pg, 'printed': expected_printed, 'from': found[0], 'to': found[-1]})
        for n in found:
            verse_map[str(n)] = {'pdf': pdf_pg, 'printed': expected_printed}

    assert expect == n_total + 1, f'Stopped at {expect - 1} of {n_total}'
    assert len(verse_map) == n_total

    # Cross-check against data/editions/qasim/pages.json
    existing = json.loads(EXISTING_PAGES_PATH.read_text(encoding='utf-8'))['pages']
    assert len(existing) == len(pages)
    diffs = [
        (a, b) for a, b in zip(pages, existing)
        if a['pdf'] != b['pdf'] or a['printed'] != b['page'] or a['from'] != b['from'] or a['to'] != b['to']
    ]
    assert not diffs, f'Mismatch vs data/editions/qasim/pages.json: {diffs}'

    out = {'pages': pages, 'verses': verse_map}
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Wrote {OUT_PATH}: {len(pages)} pages (17..175), {len(verse_map)} verses, exact match with pages.json.')


if __name__ == '__main__':
    main()
