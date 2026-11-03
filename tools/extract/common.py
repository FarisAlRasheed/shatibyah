"""Shared helpers for the text extraction scripts in tools/extract/ (imported, not run).
Arabic normalisation, Zu'bi (Turath 7754) parsing, pypdf positioned pieces."""
import json, re, unicodedata, os

MARKS = set(range(0x064B, 0x0660)) | {0x0670} | set(range(0x06D6, 0x06EE)) - {0x06DD, 0x06DE, 0x06E9}
KASH = 'ـ'
AR_DIG = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')

def is_mark(c): return ord(c) in MARKS

def letters(s):
    """base letters only (no marks, kashida, spaces, punctuation)"""
    return ''.join(c for c in s if ('\u0621' <= c <= '\u064A' and c != KASH) or '\u0671' <= c <= '\u06D3')

SK = str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي', 'ة': 'ه', 'ء': ''})
def skel(s):
    """loose skeleton for matching: letters, hamza seats folded, alifs dropped (lam-alif glyphs lose one letter)"""
    return letters(s).translate(SK).replace('ا', '')

def zubi_parse(cache, first_pg, last_pg, vmin, vmax):
    """returns verses {n:{a,b,sep}} and headings [(title, firstVerseAfter)] in order"""
    verses, heads = {}, []
    for pg in range(first_pg, last_pg + 1):
        t = json.load(open(os.path.join(cache, f'p{pg:04d}.json')))['text']
        for ln in t.split('\n'):
            m = re.search(r'<span data-type="title"[^>]*>(.*?)</span>', ln)
            if m:
                heads.append([m.group(1).strip(), None]); continue
            m = re.match(r'^([٠-٩]+) - (.*)$', ln)
            if not m: continue
            n = int(m.group(1).translate(AR_DIG))
            if not (vmin <= n <= vmax): continue
            body = m.group(2).strip()
            parts = [p.strip() for p in body.split('...') if p.strip()]
            verses[n] = {'a': parts[0], 'b': ' '.join(parts[1:]) if len(parts) > 1 else '', 'sep': len(parts) > 1}
            for h in heads:
                if h[1] is None: h[1] = n
    return verses, heads

def pypdf_pieces(page):
    out = []
    def v(text, cm, tm, fd, fs):
        if text.strip():
            x = tm[4] * cm[0] + tm[5] * cm[2] + cm[4]; y = tm[4] * cm[1] + tm[5] * cm[3] + cm[5]
            out.append((y, x, text))
    page.extract_text(visitor_text=v)
    return out

def nfc(s): return unicodedata.normalize('NFC', s)


def pypdf_pieces_font(page):
    """like pypdf_pieces, plus the font's BaseFont name: (y, x, text, font)"""
    out = []
    def v(text, cm, tm, fd, fs):
        if text.strip():
            x = tm[4] * cm[0] + tm[5] * cm[2] + cm[4]; y = tm[4] * cm[1] + tm[5] * cm[3] + cm[5]
            out.append((y, x, text, str(fd.get('/BaseFont')) if fd else ''))
    page.extract_text(visitor_text=v)
    return out
