"""Give each coloured span its meaning and write data/editions/qasim/colors.json.

Usage: python3 -I tools/colors/annotate.py   (after extract.py)

Red spans are resolved from the رموز of the الشاطبية (CODES, WORDS, NAMES below).
Green spans take their Quran places from green.json (see green.py): found by script in
a Quran text where one place fits, otherwise decided by hand (the pilot from أبو شامة's
«إبراز المعاني», Turath book 5486). Usage: python3 tools/colors/annotate.py [edition.json]
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# --- Red: the رموز -------------------------------------------------------------
# label: who the code stands for; note: the imam a rawi reports from.
CODES = {
    'أ': ('نافع', None), 'ب': ('قالون', 'راوي نافع'), 'ج': ('ورش', 'راوي نافع'),
    'د': ('ابن كثير', None), 'ه': ('البزي', 'راوي ابن كثير'), 'ز': ('قنبل', 'راوي ابن كثير'),
    'ح': ('أبو عمرو', None), 'ط': ('الدوري', 'راوي أبي عمرو'), 'ي': ('السوسي', 'راوي أبي عمرو'),
    'ك': ('ابن عامر', None), 'ل': ('هشام', 'راوي ابن عامر'), 'م': ('ابن ذكوان', 'راوي ابن عامر'),
    'ن': ('عاصم', None), 'ص': ('شعبة', 'راوي عاصم'), 'ع': ('حفص', 'راوي عاصم'),
    'ف': ('حمزة', None), 'ض': ('خلف', 'راوي حمزة'), 'ق': ('خلاد', 'راوي حمزة'),
    'ر': ('الكسائي', None), 'س': ('أبو الحارث', 'راوي الكسائي'), 'ت': ('الدوري', 'راوي الكسائي'),
    'ث': ('الكوفيون', 'عاصم وحمزة والكسائي'),
    'خ': ('القراء السبعة إلا نافعًا', 'ابن كثير وأبو عمرو وابن عامر وعاصم وحمزة والكسائي'),
    'ذ': ('الكوفيون وابن عامر', 'عاصم وحمزة والكسائي وابن عامر'),
    'ظ': ('الكوفيون وابن كثير', 'عاصم وحمزة والكسائي وابن كثير'),
    'غ': ('الكوفيون وأبو عمرو', 'عاصم وحمزة والكسائي وأبو عمرو'),
    'ش': ('حمزة والكسائي', None),
}
GROUP_LETTERS = set('ثخذظغش')
WORDS = {
    'صحبة': ('حمزة والكسائي وشعبة', None),
    'صحاب': ('حمزة والكسائي وحفص', None),
    'عم': ('نافع وابن عامر', None),
    'سما': ('نافع وابن كثير وأبو عمرو', None),
    'حق': ('ابن كثير وأبو عمرو', None),
    'نفر': ('ابن كثير وأبو عمرو وابن عامر', None),
    'حرمي': ('نافع وابن كثير', None),
    'حصن': ('الكوفيون ونافع', 'عاصم وحمزة والكسائي ونافع'),
}
NAMES = {
    'نافع': ('نافع', None), 'ابنعامر': ('ابن عامر', None), 'حمزة': ('حمزة', None),
    'هشام': ('هشام', 'راوي ابن عامر'), 'شعبة': ('شعبة', 'راوي عاصم'), 'حفص': ('حفص', 'راوي عاصم'),
    'عثمان': ('ورش', 'عثمان بن سعيد، راوي نافع'),
    'شام': ('ابن عامر', 'الشامي'), 'الشامي': ('ابن عامر', 'الشامي'), 'شامي': ('ابن عامر', 'الشامي'),
    'المكي': ('ابن كثير', 'المكي'), 'لكوفي': ('الكوفيون', 'عاصم وحمزة والكسائي'),
    # Phase 1 (فرش الحروف): the names the verses spell out in full.
    'كوف': ('الكوفيون', 'عاصم وحمزة والكسائي'), 'كوفي': ('الكوفيون', 'عاصم وحمزة والكسائي'),
    'مكي': ('ابن كثير', 'المكي'), 'المكين': ('البزي وقنبل', 'راويا ابن كثير'),
    'بصري': ('أبو عمرو', 'البصري'), 'بصر': ('أبو عمرو', 'البصري'),
    'يحصبي': ('ابن عامر', 'اليحصبي'),
    'ابنذكوان': ('ابن ذكوان', 'راوي ابن عامر'),
    'ابنالعلا': ('أبو عمرو', 'ابن العلاء'), 'ابنالعل': ('أبو عمرو', 'ابن العلاء'),
    'ولدالعلا': ('أبو عمرو', 'ابن العلاء'), 'ولدالعل': ('أبو عمرو', 'ابن العلاء'),
    'عاصم': ('عاصم', None), 'كسائي': ('الكسائي', None),
    'قالون': ('قالون', 'راوي نافع'), 'ورش': ('ورش', 'راوي نافع'),
    'بزي': ('البزي', 'راوي ابن كثير'), 'أحمد': ('البزي', 'أحمد بن محمد، راوي ابن كثير'),
    'قنبل': ('قنبل', 'راوي ابن كثير'), 'دوري': ('الدوري', 'راوي أبي عمرو'),
    'خلاد': ('خلاد', 'راوي حمزة'), 'ليث': ('أبو الحارث', 'الليث بن خالد، راوي الكسائي'),
    'شيخه': ('ابن كثير', 'شيخ البزي'),
    # Phase 2: the names in مقدمة الناظم and الأصول.
    'عيسى': ('قالون', 'عيسى بن مينا، راوي نافع'), 'محمد': ('قنبل', 'محمد بن عبد الرحمن، راوي ابن كثير'),
    'ابنكثير': ('ابن كثير', None), 'مازني': ('أبو عمرو', 'المازني'),
    'أبوعمرو': ('أبو عمرو', None), 'أبيعمرو': ('أبو عمرو', None), 'أبوعمر': ('أبو عمرو', None),
    'فتىالعلا': ('أبو عمرو', 'ابن العلاء'),
    'صالح': ('السوسي', 'صالح بن زياد، راوي أبي عمرو'), 'سوسي': ('السوسي', 'راوي أبي عمرو'),
    'أبوشعيب': ('السوسي', 'أبو شعيب صالح بن زياد، راوي أبي عمرو'),
    'ذكوان': ('ابن ذكوان', 'راوي ابن عامر'),
    'أبوبكر': ('شعبة', 'أبو بكر بن عياش، راوي عاصم'), 'ابنعياش': ('شعبة', 'أبو بكر بن عياش، راوي عاصم'),
    'خلف': ('خلف', 'راوي حمزة'), 'علي': ('الكسائي', 'علي بن حمزة'),
    'أبوالحارث': ('أبو الحارث', 'الليث بن خالد، راوي الكسائي'),
    'دمشقي': ('هشام', 'الدمشقي، راوي ابن عامر'),
    'أبوعمرالدوري': ('الدوري', 'أبو عمر حفص بن عمر، راوي أبي عمرو'),
    'عبداللهابنكثير': ('ابن كثير', 'عبد الله بن كثير'),
    'عبداللهابنعامر': ('ابن عامر', 'عبد الله بن عامر'),
    'عبداللهابنذكوان': ('ابن ذكوان', 'عبد الله بن أحمد بن ذكوان، راوي ابن عامر'),
}
# «عبد الله» and «أبو عمر» name different readers in different verses: (verse, letters) -> key.
VERSE_NAMES = {(27, 'عبدالله'): 'عبداللهابنكثير', (32, 'عبدالله'): 'عبداللهابنعامر',
               (33, 'عبدالله'): 'عبداللهابنذكوان', (31, 'أبوعمر'): 'أبوعمرالدوري'}


def letters(s):
    return ''.join(c for c in s if unicodedata.category(c).startswith('L') and c != 'ـ')


def bare(k):
    """A name without its article or preposition («لِلْمَكِّيِّ», «الشَّامِ»), and ة as ت
    («صُحْبَتُ»)."""
    k = k.replace('ة', 'ت').replace('إ', 'أ')
    for p in ('لل', 'ال', 'ل'):
        if k.startswith(p) and len(k) - len(p) >= 3:
            return k[len(p):]
    return k


def word_key(s):
    k = letters(s)
    if len(k) > 2 and k[-1] == k[-2]:
        k = k[:-1]  # a shadda written out across the halves: «حَقْـ / ـقٍ»
    # Word codes are declined in the verse: «حَقّاً», «صُحْبَةٍ», «حِصْنٌ», «نَفَرٍ».
    for base in list(WORDS) + list(NAMES):
        if k == base or k == base + 'ا':
            return base
    for base in list(WORDS) + list(NAMES):
        b = bare(base)
        if bare(k) in (b, b + 'ا') or (len(b) >= 4 and bare(k) == b + 'ين' and base == 'مكي'):
            return base
    return None


def resolve_red(text):
    """(kind, key) for a red span: a word code, a name, or a code letter."""
    key = word_key(text)
    if key in WORDS:
        return 'word', key
    if key in NAMES:
        return 'name', key
    first = letters(text)[0]
    first = {'إ': 'أ', 'ا': 'أ', 'آ': 'أ'}.get(first, first)
    if first in CODES:
        return ('group' if first in GROUP_LETTERS else 'letter'), first
    raise ValueError(f'unknown code: {text}')


# --- Green: Quran places ---------------------------------------------------------
# tools/colors/green.json (kept by green.py): verse -> one entry per green span in reading
# order, {q: [[surah, ayah], ...], x: snippet, note?, by}. The first ref is the place in
# the verse's own surah when there is one.


MULTI = {'ابنعامر', 'ابنذكوان', 'ابنالعلا', 'ابنالعل', 'ولدالعلا', 'ولدالعل', 'ابنكثير',
         'أبوعمرو', 'أبيعمرو', 'أبوعمر', 'فتىالعلا', 'أبوشعيب', 'أبوبكر', 'ابنعياش',
         'أبوالحارث', 'عبدالله'}


def split_red(span, src):
    """A red run can cover two codes («عَمَّ نَـ»): split it at spaces, except for a name."""
    if letters(span['t']) in MULTI:
        return [span]
    return [{**span, 's': span['s'] + m.start(), 'e': span['s'] + m.end()}
            for m in re.finditer(r'\S+', src[span['s']:span['e']])]


def main():
    spans = json.loads((ROOT / 'tools/colors/_spans.json').read_text())
    green = json.loads((ROOT / 'tools/colors/green.json').read_text())
    ed_path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'data/editions/qasim/edition.json'
    edition = json.loads(ed_path.read_text())
    verses = {v['n']: v for v in edition['verses']}
    out, problems = {}, []
    for key, items in spans.items():
        n = int(key)
        reds, greens = [], []
        for sp in sorted(items, key=lambda x: (x['h'], x['s'])):
            src = verses[n][sp['h']]
            if sp['k'] == 'r':
                reds += split_red(sp, src)
            else:
                greens.append(sp)
        # A two-word name in two red runs («ابْنِ» «العَلاَ»): one mark.
        joined = []
        for sp in reds:
            prev = joined[-1] if joined else None
            src = verses[n][sp['h']]
            if prev and prev['h'] == sp['h'] and not src[prev['e']:sp['s']].strip() \
                    and letters(src[prev['s']:sp['e']]) in MULTI:
                prev['e'] = sp['e']
                continue
            joined.append(dict(sp))
        reds = joined
        marks = []
        for i, sp in enumerate(reds):
            text = verses[n][sp['h']][sp['s']:sp['e']]
            # A word broken across the halves («شُعْـ / بَةَ»): read the two pieces as one.
            a = verses[n]['a'].rstrip()
            nxt = reds[i + 1] if i + 1 < len(reds) else None
            prv = reds[i - 1] if i else None
            b = verses[n]['b']
            if sp['h'] == 'a' and sp['e'] >= len(a) and nxt and nxt['h'] == 'b' and not b[:nxt['s']].strip('ـ ') \
                    and (a.endswith('ـ') or letters(text + b[nxt['s']:nxt['e']]) in MULTI):
                text += b[nxt['s']:nxt['e']]
            elif sp['h'] == 'b' and not b[:sp['s']].strip('ـ ') and prv and prv['h'] == 'a' and prv['e'] >= len(a) \
                    and (a.endswith('ـ') or letters(a[prv['s']:prv['e']] + text) in MULTI):
                text = a[prv['s']:prv['e']] + text
            vk = VERSE_NAMES.get((n, letters(text)))
            try:
                kind, code = ('name', vk) if vk else resolve_red(text)
            except ValueError:
                problems.append(f'{n}: unknown red «{text}»')
                continue
            if kind in ('letter', 'group') and len(letters(text)) > 1 and letters(text) != 'لا':
                problems.append(f'{n}: whole word «{text}» is red; read as the letter {code}')
            marks.append({'h': sp['h'], 's': sp['s'], 'e': sp['e'], 'k': 'r', 'c': code})
        table = green.get(key, [])
        if len(table) != len(greens):
            problems.append(f'{n}: {len(greens)} green spans, table has {len(table)}')
        for sp, entry in zip(greens, table):
            if entry is None:
                problems.append(f'{n}: no place for «{sp["t"]}»')
                continue
            m = {'h': sp['h'], 's': sp['s'], 'e': sp['e'], 'k': 'g', 'q': entry['q'], 'x': entry['x']}
            if entry.get('note'):
                m['note'] = entry['note']
            marks.append(m)
        marks.sort(key=lambda x: (x['h'], x['s']))
        if marks:
            out[n] = marks

    codes = {}
    for k, (label, note) in CODES.items():
        codes[k] = {'kind': 'group' if k in GROUP_LETTERS else 'letter', 'label': label, **({'note': note} if note else {})}
    for k, (label, note) in WORDS.items():
        codes[k] = {'kind': 'word', 'label': label, **({'note': note} if note else {})}
    for k, (label, note) in NAMES.items():
        codes[k] = {'kind': 'name', 'label': label, **({'note': note} if note else {})}

    doc = {'edition': 'qasim', 'codes': codes, 'verses': out}
    (ROOT / 'data/editions/qasim/colors.json').write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print('verses', len(out), 'red', sum(m['k'] == 'r' for v in out.values() for m in v),
          'green', sum(m['k'] == 'g' for v in out.values() for m in v))
    for p in problems:
        print('!', p)


if __name__ == '__main__':
    sys.exit(main())
