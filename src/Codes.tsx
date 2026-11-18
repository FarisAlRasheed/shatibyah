import { CornerDownLeft } from 'lucide-react'
import { Sheet } from './sheets'
import './codes.css'

/**
 * جدول الرموز: the poem's reader codes as a legend. Names and death years follow the introduction
 * of «الوافي في شرح الشاطبية» (data/commentaries/wafi/s5.json), except al-Bazzi's lineage (see below).
 */
interface Person {
  code: string
  name: string
  full: string
  died: string
}
interface Qari extends Person {
  set: string // the three letters of his code group, e.g. «أبج»
  rawis: [Person, Person]
}

const QURRA: Qari[] = [
  {
    code: 'أ', set: 'أبج', name: 'نافع', full: 'نافع بن عبد الرحمن بن أبي نُعيم المدني', died: '١٦٩',
    rawis: [
      { code: 'ب', name: 'قالون', full: 'عيسى بن مينا المدني', died: '٢٢٠' },
      { code: 'ج', name: 'ورش', full: 'عثمان بن سعيد المصري', died: '١٩٧' },
    ],
  },
  {
    code: 'د', set: 'دهز', name: 'ابن كثير', full: 'عبد الله بن كثير المكي', died: '١٢٠',
    rawis: [
      // الوافي writes «أحمد بن عبد الله بن القاسم…», dropping «محمد» from the usual lineage.
      { code: 'هـ', name: 'البزّي', full: 'أحمد بن محمد بن عبد الله بن أبي بزّة المكي', died: '٢٥٠' },
      { code: 'ز', name: 'قنبل', full: 'محمد بن عبد الرحمن بن خالد المكي', died: '٢٩١' },
    ],
  },
  {
    code: 'ح', set: 'حطي', name: 'أبو عمرو', full: 'زبّان بن العلاء المازني البصري', died: '١٥٤',
    rawis: [
      { code: 'ط', name: 'الدوري', full: 'حفص بن عمر بن عبد العزيز الدوري', died: '٢٤٦' },
      { code: 'ي', name: 'السوسي', full: 'صالح بن زياد السوسي', died: '٢٦١' },
    ],
  },
  {
    code: 'ك', set: 'كلم', name: 'ابن عامر', full: 'عبد الله بن عامر اليحصبي الشامي', died: '١١٨',
    rawis: [
      { code: 'ل', name: 'هشام', full: 'هشام بن عمّار بن نصير الدمشقي', died: '٢٤٥' },
      { code: 'م', name: 'ابن ذكوان', full: 'عبد الله بن أحمد بن بشر بن ذكوان الدمشقي', died: '٢٤٢' },
    ],
  },
  {
    code: 'ن', set: 'نصع', name: 'عاصم', full: 'عاصم بن بهدلة أبي النَّجود الأسدي الكوفي', died: '١٢٧',
    rawis: [
      { code: 'ص', name: 'شعبة', full: 'أبو بكر شعبة بن عيّاش بن سالم الكوفي', died: '١٩٣' },
      { code: 'ع', name: 'حفص', full: 'حفص بن سليمان بن المغيرة الأسدي الكوفي', died: '١٨٠' },
    ],
  },
  {
    code: 'ف', set: 'فضق', name: 'حمزة', full: 'حمزة بن حبيب الزيّات الكوفي', died: '١٥٦',
    rawis: [
      { code: 'ض', name: 'خلف', full: 'خلف بن هشام البزّار البغدادي', died: '٢٢٩' },
      { code: 'ق', name: 'خلّاد', full: 'خلّاد بن خالد الشيباني الصيرفي الكوفي', died: '٢٢٠' },
    ],
  },
  {
    code: 'ر', set: 'رست', name: 'الكسائي', full: 'علي بن حمزة الأسدي الكسائي الكوفي', died: '١٨٩',
    rawis: [
      { code: 'س', name: 'أبو الحارث', full: 'الليث بن خالد البغدادي', died: '٢٤٠' },
      { code: 'ت', name: 'الدوري', full: 'حفص بن عمر الدوري', died: '٢٤٦' },
    ],
  },
]

const GROUP_LETTERS: [string, string, string?][] = [
  ['ث', 'الكوفيون', 'عاصم وحمزة والكسائي'],
  ['خ', 'السبعة إلا نافعًا'],
  ['ذ', 'الكوفيون وابن عامر'],
  ['ظ', 'الكوفيون وابن كثير'],
  ['غ', 'الكوفيون وأبو عمرو'],
  ['ش', 'حمزة والكسائي'],
]

const GROUP_WORDS: [string, string][] = [
  ['صحاب', 'حمزة والكسائي وحفص'],
  ['صحبة', 'حمزة والكسائي وشعبة'],
  ['عمّ', 'نافع وابن عامر'],
  ['سما', 'نافع وابن كثير وأبو عمرو'],
  ['حقّ', 'ابن كثير وأبو عمرو'],
  ['نفر', 'ابن كثير وأبو عمرو وابن عامر'],
  ['حِرمي', 'نافع وابن كثير'],
  ['حصن', 'الكوفيون ونافع'],
]

const died = (y: string) => `ت ${y}هـ`

export default function CodesSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="جدول الرموز" onClose={onClose}>
      <div className="codes">
        <h4>القرّاء السبعة ورواتهم</h4>
        {QURRA.map((q) => (
          <div key={q.code} className="cq">
            <div className="cq-name">
              <b className="code">{q.code}</b>
              <span>
                {q.name} (<span className="set">{q.set}</span>)
              </span>
            </div>
            <div className="full">
              {q.full} · {died(q.died)}
            </div>
            <div className="rawis">
              {q.rawis.map((r) => (
                <div key={r.code} className="rawi">
                  <CornerDownLeft size={14} aria-hidden="true" />
                  <b className="code">{r.code}</b>
                  <div>
                    <div className="rawi-name">{r.name}</div>
                    <div className="full">
                      {r.full} · {died(r.died)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <h4>الرموز الجماعية (الحرفية)</h4>
        {GROUP_LETTERS.map(([c, who, detail]) => (
          <div key={c} className="cg">
            <b className="code">{c}</b>
            <span>{who}</span>
            {detail && <span className="full">{detail}</span>}
          </div>
        ))}

        <h4>الرموز الكلمية</h4>
        {GROUP_WORDS.map(([c, who]) => (
          <div key={c} className="cg">
            <b className="code">{c}</b>
            <span>{who}</span>
          </div>
        ))}

        <h4>الألوان</h4>
        <div className="colors-key">
          <span>
            <i className="dot red" /> رمز قارئ
          </span>
          <span>
            <i className="dot green" /> كلمة قرآنية
          </span>
        </div>
      </div>
    </Sheet>
  )
}
