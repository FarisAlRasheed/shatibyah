"""Give each coloured span its meaning and write data/editions/qasim/colors.json.

Usage: python3 -I tools/colors/annotate.py   (after extract.py)

Red spans are resolved from the رموز of the الشاطبية (CODES, WORDS, NAMES below).
Green spans take their Quran places from GREEN, written by hand from أبو شامة's
«إبراز المعاني» (Turath book 5486) and checked against the Kufan ayah count.
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
}


def letters(s):
    return ''.join(c for c in s if unicodedata.category(c).startswith('L') and c != 'ـ')


def word_key(s):
    k = letters(s)
    # Word codes are declined in the verse: «حَقّاً», «صُحْبَةٍ», «حِصْنٌ», «نَفَرٍ».
    for base in list(WORDS) + list(NAMES):
        if k == base or k == base + 'ا':
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
# verse -> one entry per green span in reading order: (refs, snippet, note).
# refs: [(surah, ayah), ...]; the first is the place in this surah when there is one.
S = 'حيث وقع'
GREEN = {
    632: [([(6, 16)], 'من يصرف عنه يومئذ', None), ([(6, 23)], 'ثم لم تكن فتنتهم', None)],
    633: [([(6, 23)], 'ثم لم تكن فتنتهم', None), ([(6, 23)], 'والله ربنا ما كنا مشركين', None)],
    634: [([(6, 27)], 'ولا نكذب بآيات ربنا', None), ([(6, 27)], 'ونكون من المؤمنين', None)],
    635: [([(6, 32)], 'وللدار الآخرة خير', None), ([(6, 32)], 'وللدار الآخرة خير', None)],
    636: [([(6, 32), (7, 169), (12, 109)], 'أفلا تعقلون', 'هنا، وفي الأعراف تحتها، وفي يوسف')],
    637: [([(6, 33)], 'فإنهم لا يكذبونك', None)],
    638: [([(6, 40)], 'قل أرأيتكم', 'أرأيت وأرأيتم وأرأيتكم بعد همزة الاستفهام حيث وقعت')],
    639: [([(21, 96)], 'حتى إذا فتحت يأجوج ومأجوج', None),
          ([(21, 96)], 'حتى إذا فتحت يأجوج ومأجوج', None),
          ([(6, 44), (7, 96), (54, 11)], 'فتحنا عليهم أبواب كل شيء', 'هنا، وفي الأعراف «لفتحنا»، وفي القمر «ففتحنا»')],
    640: [([(6, 52), (18, 28)], 'بالغداة والعشي', 'هنا وفي الكهف')],
    641: [([(6, 54)], 'أنه من عمل منكم سوءا', 'والذي بعده: «فأنه غفور رحيم»'),
          ([(6, 55)], 'ولتستبين سبيل المجرمين', None)],
    642: [([(6, 55)], 'ولتستبين سبيل المجرمين', None), ([(6, 57)], 'يقص الحق', None)],
    643: [([(6, 61)], 'توفته رسلنا', None), ([(6, 71)], 'كالذي استهوته الشياطين', None)],
    644: [([(6, 63), (7, 55)], 'تضرعا وخفية', 'هنا وفي الأعراف'),
          ([(6, 63)], 'لئن أنجانا من هذه', None), ([(6, 63)], 'لئن أنجانا من هذه', None)],
    645: [([(6, 64)], 'قل الله ينجيكم منها', None), ([(6, 68)], 'وإما ينسينك الشيطان', None)],
    646: [([(6, 76)], 'رأى كوكبا', S)],
    649: [([(27, 44)], 'فلما رأته حسبته لجة', 'ونحوها'), ([(25, 41)], 'وإذا رأوك', 'ونحوها'),
          ([(6, 68)], 'وإذا رأيت الذين يخوضون', 'ونحوها')],
    650: [([(6, 80)], 'أتحاجوني في الله', None)],
    651: [([(6, 83), (12, 76)], 'نرفع درجات من نشاء', 'هنا وفي يوسف'),
          ([(6, 86), (38, 48)], 'واليسع', 'هنا وفي ص')],
    652: [([(6, 90)], 'فبهداهم اقتده', None)],
    654: [([(6, 91)], 'تبدونها وتخفون كثيرا', None), ([(6, 91)], 'تبدونها وتخفون كثيرا', None),
          ([(6, 91)], 'تجعلونه قراطيس', None), ([(6, 92)], 'ولتنذر أم القرى', None)],
    655: [([(6, 94)], 'لقد تقطع بينكم', None), ([(6, 96)], 'وجاعل الليل سكنا', None),
          ([(6, 96)], 'وجاعل الليل سكنا', None)],
    656: [([(6, 96)], 'وجاعل الليل سكنا', None), ([(6, 98)], 'فمستقر ومستودع', None),
          ([(6, 98)], 'فمستقر ومستودع', None), ([(6, 100)], 'وخرقوا له بنين وبنات', None)],
    657: [([(6, 99), (36, 35)], 'انظروا إلى ثمره', 'هنا وفي يس'), ([(6, 105)], 'وليقولوا درست', None)],
    658: [([(6, 109)], 'أنها إذا جاءت لا يؤمنون', None)],
    659: [([(6, 109)], 'أنها إذا جاءت لا يؤمنون', None)],
    660: [([(6, 111), (18, 55)], 'كل شيء قبلا', 'هنا وفي الكهف')],
    661: [([(6, 115), (10, 33), (40, 6)], 'وتمت كلمت ربك', 'هنا، وفي يونس، وفي غافر (الطَّوْل)')],
    662: [([(6, 114)], 'أنه منزل من ربك بالحق', None), ([(6, 119)], 'ما حرم عليكم', None)],
    663: [([(6, 119)], 'وقد فصل لكم', None), ([(6, 119)], 'وإن كثيرا ليضلون', None),
          ([(10, 88)], 'ربنا ليضلوا عن سبيلك', None)],
    664: [([(6, 124)], 'حيث يجعل رسالته', None), ([(6, 125), (25, 13)], 'ضيقا حرجا', 'هنا وفي الفرقان')],
    665: [([(6, 125)], 'ضيقا حرجا', None)],
    666: [([(6, 125)], 'كأنما يصعد في السماء', None)],
    667: [([(6, 128), (10, 45), (34, 40)], 'ويوم يحشرهم جميعا', 'هنا، والثاني في يونس، وفي سبأ'),
          ([(34, 40)], 'ثم يقول للملائكة', None)],
    668: [([(6, 132)], 'وما ربك بغافل عما يعملون', None),
          ([(6, 135), (28, 37)], 'من تكون له عاقبة الدار', 'هنا وفي القصص'),
          ([(6, 135), (28, 37)], 'من تكون له عاقبة الدار', 'هنا وفي القصص')],
    669: [([(6, 135)], 'اعملوا على مكانتكم', S), ([(6, 136), (6, 138)], 'بزعمهم', 'الموضعان')],
    670: [([(6, 137)], 'وكذلك زين لكثير من المشركين', None)] + [([(6, 137)], 'قتل أولادهم شركاؤهم', None)] * 3,
    671: [([(6, 137)], 'قتل أولادهم شركاؤهم', None)],
    675: [([(6, 139)], 'وإن يكن ميتة', None), ([(6, 139)], 'وإن يكن ميتة', None),
          ([(6, 141)], 'وآتوا حقه يوم حصاده', None)],
    676: [([(6, 143)], 'ومن المعز اثنين', None), ([(6, 145)], 'إلا أن يكون ميتة', None),
          ([(6, 145)], 'إلا أن يكون ميتة', None)],
    677: [([(6, 152)], 'لعلكم تذكرون', S), ([(6, 153)], 'وأن هذا صراطي مستقيما', None)],
    678: [([(6, 158), (16, 33)], 'إلا أن تأتيهم الملائكة', 'هنا وفي النحل'),
          ([(6, 159), (30, 32)], 'فرقوا دينهم', 'هنا وفي الروم')],
    679: [([(6, 161)], 'دينا قيما', None), ([(6, 79)], 'وجهت وجهي', 'ياء إضافة'),
          ([(6, 162)], 'ومحياي ومماتي', 'ياء إضافة')],
    680: [([(6, 161)], 'هداني ربي إلى صراط', 'ياء إضافة'), ([(6, 153)], 'وأن هذا صراطي مستقيما', 'ياء إضافة'),
          ([(6, 14), (6, 15), (6, 74)], 'إني أمرت · إني أخاف · إني أراك', 'ثلاث ياءات إضافة'),
          ([(6, 162)], 'ومحياي ومماتي', 'ياء إضافة')],
}


def split_red(span, src):
    """A red run can cover two codes («عَمَّ نَـ»): split it at spaces, except for a name."""
    if letters(span['t']) == 'ابنعامر':
        return [span]
    return [{**span, 's': span['s'] + m.start(), 'e': span['s'] + m.end()}
            for m in re.finditer(r'\S+', src[span['s']:span['e']])]


def main():
    spans = json.loads((ROOT / 'tools/colors/_spans.json').read_text())
    edition = json.loads((ROOT / 'data/editions/qasim/edition.json').read_text())
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
        marks = []
        for sp in reds:
            text = verses[n][sp['h']][sp['s']:sp['e']]
            kind, code = resolve_red(text)
            if kind in ('letter', 'group') and len(letters(text)) > 1:
                problems.append(f'{n}: whole word «{text}» is red; read as the letter {code}')
            marks.append({'h': sp['h'], 's': sp['s'], 'e': sp['e'], 'k': 'r', 'c': code})
        table = GREEN.get(n, [])
        if len(table) != len(greens):
            problems.append(f'{n}: {len(greens)} green spans, table has {len(table)}')
        for sp, (refs, snippet, note) in zip(greens, table):
            m = {'h': sp['h'], 's': sp['s'], 'e': sp['e'], 'k': 'g', 'q': [list(r) for r in refs], 'x': snippet}
            if note:
                m['note'] = note
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
