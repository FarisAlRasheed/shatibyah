// Search normalisation only. Displayed text is never changed.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g

export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .replace(MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي\s0-9]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export const toArabicDigits = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d])

export const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
