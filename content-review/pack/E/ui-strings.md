# Track E — Arabic UI Strings in `src/*.tsx` (and `src/*.ts` with Arabic text)

Check spelling, grammar, and religious/educational wording only (not code style).

Total lines with Arabic across `src/`: 651

## `src/App.tsx` (31 lines)
- `src/App.tsx:47`: `| 'look' // the «أ» appearance panel`
- `src/App.tsx:48`: `| 'index' // الفهرس, over the reader`
- `src/App.tsx:54`: `// The tab bar. «أ» (المظهر) sits between the first two: it opens a panel over the reader, not a screen.`
- `src/App.tsx:56`: `['read', 'القراءة', BookOpen],`
- `src/App.tsx:57`: `['plan', 'الحفظ', GraduationCap],`
- `src/App.tsx:58`: `['settings', 'الإعدادات', SettingsIcon],`
- `src/App.tsx:123`: `const SCOPE_LABEL: Record<RepeatSettings['scope'], string> = { verse: 'تكرار البيت', range: 'تكرار النطاق', section: 'تكرار الباب', all: 'تكرار المتن' }`
- `src/App.tsx:179`: `// Where the reader was before a jump, for the «رجوع» pill.`
- `src/App.tsx:342`: `/** Go to verse n. `keepBack` leaves an existing «رجوع» place alone (stepping through search matches). */`
- `src/App.tsx:355`: `// The «رجوع» place is dropped once the reader has moved well away from where the jump landed.`
- `src/App.tsx:451`: `if (error) return <div className="center-msg">تعذّر تحميل البيانات: {error}</div>`
- `src/App.tsx:452`: `if (!manifest || !edition) return <div className="center-msg">جارٍ التحميل…</div>`
- `src/App.tsx:461`: `/** «أتقنته» / «لم أتقنه» for a verse, from memorization mode or a test. */`
- `src/App.tsx:469`: `// «لم أتقنه» marks the verse as weak, for the memorization map and the review list.`
- `src/App.tsx:575`: `? { verse: 'قراءة البيت', range: 'قراءة النطاق', section: 'قراءة الباب', all: 'قراءة المتن' }[repeat.scope]`
- `src/App.tsx:578`: `? `تكرار تراكمي · المرحلة ${toArabicDigits(play.stage + 1)} من ${toArabicDigits(play.stages)}``
- `src/App.tsx:581`: `? 'قراءة البيت'`
- `src/App.tsx:582`: `: `تكرار البيت ×${times(play.verseTimes)}``
- `src/App.tsx:584`: `? 'قراءة متصلة'`
- `src/App.tsx:585`: `: `${toArabicDigits(play.total)} أبيات · كل بيت ×${times(play.verseTimes)}${play.rangeTimes !== 1 ? ` · الدورة ×${times(play.rangeTimes)}` : ''}``
- `src/App.tsx:593`: `<Drawer label="الفهرس" onClose={close}>`
- `src/App.tsx:767`: `<button className="icon-btn" onClick={openFind} aria-label="البحث">`
- `src/App.tsx:786`: `aria-label={curtainOn ? 'إظهار الأشطر' : 'ستارة التسميع'}`
- `src/App.tsx:791`: `<button className="icon-btn" onClick={() => setPanel('index')} aria-label="الفهرس">`
- `src/App.tsx:842`: `<Undo2 size={15} /> رجوع إلى البيت {toArabicDigits(back)}`
- `src/App.tsx:844`: `<button className="x" onClick={() => setBack(null)} aria-label="إخفاء">`
- `src/App.tsx:968`: `<LocateFixed size={16} /> العودة إلى البيت المقروء`
- `src/App.tsx:987`: `<div className="no-audio">لا توجد قراءة مسجّلة لهذه النسخة بعد.</div>`
- `src/App.tsx:997`: `<button className={panel === 'look' ? 'on' : ''} onClick={openLook} aria-label="المظهر والخط">`
- `src/App.tsx:999`: `أ`
- `src/App.tsx:1001`: `<span>المظهر</span>`

## `src/AppIconGroup.tsx` (5 lines)
- `src/AppIconGroup.tsx:6`: `* الإعدادات ← أيقونة التطبيق: pick the home-screen icon. Shown only in the iOS app.`
- `src/AppIconGroup.tsx:35`: `<h2 className="group-title">أيقونة التطبيق</h2>`
- `src/AppIconGroup.tsx:36`: `<div className="group icon-picker" role="radiogroup" aria-label="أيقونة التطبيق">`
- `src/AppIconGroup.tsx:42`: `<span>تلقائي</span>`
- `src/AppIconGroup.tsx:56`: `{error ? 'تعذّر تغيير الأيقونة، حاول مرة أخرى.' : '«تلقائي» أخضر على عاجي في الوضع الفاتح، وذهبي على أخضر في الوضع الداكن.'}`

## `src/BackupGroup.tsx` (27 lines)
- `src/BackupGroup.tsx:14`: `/** «٣ ملاحظات»-style count lines for what a backup holds. */`
- `src/BackupGroup.tsx:19`: `n(s.notes, 'الملاحظات'),`
- `src/BackupGroup.tsx:20`: `n(s.bookmarks, 'العلامات'),`
- `src/BackupGroup.tsx:21`: `n(s.mastered, 'الأبيات المتقَنة'),`
- `src/BackupGroup.tsx:22`: `n(s.weak, 'الأبيات الضعيفة'),`
- `src/BackupGroup.tsx:23`: `n(s.sessions, 'جلسات التسميع'),`
- `src/BackupGroup.tsx:24`: `n(s.sketches, 'الرسوم'),`
- `src/BackupGroup.tsx:25`: `n(s.highlights, 'تظليلات الشرح'),`
- `src/BackupGroup.tsx:26`: `s.plan ? 'خطة الحفظ وسجلّها' : null,`
- `src/BackupGroup.tsx:27`: `s.settings ? 'الإعدادات' : null,`
- `src/BackupGroup.tsx:31`: `/** الإعدادات ← النسخ الاحتياطي: save everything to a file, and bring a file back (replace or merge). */`
- `src/BackupGroup.tsx:46`: `setErr(`تعذّر حفظ النسخة: ${e instanceof Error ? e.message : e}`)`
- `src/BackupGroup.tsx:67`: `setErr(`تعذّرت الاستعادة: ${e instanceof Error ? e.message : e}`)`
- `src/BackupGroup.tsx:75`: `<h2 className="group-title">النسخ الاحتياطي</h2>`
- `src/BackupGroup.tsx:78`: `<p>ملاحظاتك وعلاماتك وتقدّمك في الحفظ وخطتك محفوظة على هذا الجهاز فقط. احفظ نسخة منها في ملف لتستعيدها إن حُذفت أو لتنقلها إلى جهاز آخر.</p>`
- `src/BackupGroup.tsx:80`: `{info.at ? `آخر نسخة: ${formatDate(info.at)}` : 'لم تُحفظ نسخة بعد.'}`
- `src/BackupGroup.tsx:81`: `{overdue && info.at > 0 && ` · مضى أكثر من ${toArabicDigits(REMIND_DAYS)} يومًا`}`
- `src/BackupGroup.tsx:85`: `<Download size={18} /> حفظ نسخة`
- `src/BackupGroup.tsx:88`: `<Upload size={18} /> استعادة`
- `src/BackupGroup.tsx:105`: `<div className="backup-info" role="group" aria-label="استعادة النسخة">`
- `src/BackupGroup.tsx:107`: `<strong>{picked.at ? `نسخة ${formatDate(picked.at)}` : 'نسخة احتياطية'}</strong>`
- `src/BackupGroup.tsx:116`: `<p className="muted">هذه النسخة فارغة.</p>`
- `src/BackupGroup.tsx:119`: `«دمج» يضيف ما في النسخة إلى ما على هذا الجهاز ولا يحذف شيئًا، وتبقى خطتك وإعداداتك الحالية. «استبدال» يحذف ما على هذا الجهاز ويضع`
- `src/BackupGroup.tsx:120`: `النسخة مكانه.`
- `src/BackupGroup.tsx:124`: `دمج`
- `src/BackupGroup.tsx:127`: `استبدال`
- `src/BackupGroup.tsx:130`: `إلغاء`

## `src/ErrorBoundary.tsx` (4 lines)
- `src/ErrorBoundary.tsx:16`: `<h1>حدث خطأ غير متوقع</h1>`
- `src/ErrorBoundary.tsx:17`: `<p className="muted">ملاحظاتك وعلاماتك محفوظة على الجهاز. أعد فتح التطبيق للمتابعة.</p>`
- `src/ErrorBoundary.tsx:20`: `إعادة التحميل`
- `src/ErrorBoundary.tsx:23`: `المحاولة مرة أخرى`

## `src/Explain.tsx` (35 lines)
- `src/Explain.tsx:1`: `// The explanation (الشرح) panel, EXPLANATION-PLAN A: a bottom sheet with three heights on a phone that`
- `src/Explain.tsx:25`: `['ui', 'حديث', 'var(--ui-font)'],`
- `src/Explain.tsx:26`: `['naskh', 'نسخ', "'Noto Naskh Arabic', serif"],`
- `src/Explain.tsx:27`: `['amiri', 'أميري', "'Amiri', serif"],`
- `src/Explain.tsx:28`: `['scheherazade', 'شهرزاد', "'Scheherazade New', serif"],`
- `src/Explain.tsx:45`: `from === to ? `البيت ${toArabicDigits(from)}` : `الأبيات ${toArabicDigits(from)} – ${toArabicDigits(to)}``
- `src/Explain.tsx:46`: `/** «الوافي» from «الوافي في شرح الشاطبية». */`
- `src/Explain.tsx:47`: `const shortName = (name: string) => name.split(' في ')[0]`
- `src/Explain.tsx:159`: `<ChevronDown size={16} className={introOpen ? 'up' : ''} /> تمهيد الباب`
- `src/Explain.tsx:173`: `{group.blocks.length > 1 && <h4>شرح {verses(b.from, b.to)}</h4>}`
- `src/Explain.tsx:358`: `aria-label="تغيير ارتفاع الشرح"`
- `src/Explain.tsx:365`: `<div className="ex-chips" role="tablist" aria-label="كتب الشرح">`
- `src/Explain.tsx:379`: `<button className={`icon-btn ex-close${tools ? ' on' : ''}`} onClick={() => setTools((x) => !x)} aria-label="مظهر الشرح" aria-expanded={tools}>`
- `src/Explain.tsx:382`: `<button className="icon-btn ex-close" onClick={onClose} aria-label="إغلاق الشرح">`
- `src/Explain.tsx:386`: `<p className="ex-title">{group ? `شرح ${verses(group.from, group.to)}` : at ? `البيت ${toArabicDigits(target.n)}` : ' '}</p>`
- `src/Explain.tsx:390`: `<button onClick={() => size(-1)} disabled={p.look.size <= EX_SIZE.min} aria-label="تصغير الخط">`
- `src/Explain.tsx:391`: `أ−`
- `src/Explain.tsx:394`: `<button onClick={() => size(1)} disabled={p.look.size >= EX_SIZE.max} aria-label="تكبير الخط">`
- `src/Explain.tsx:395`: `أ+`
- `src/Explain.tsx:398`: `<button onClick={() => line(-0.15)} disabled={p.look.line <= EX_LINE.min} aria-label="تقريب الأسطر">`
- `src/Explain.tsx:401`: `<button onClick={() => line(0.15)} disabled={p.look.line >= EX_LINE.max} aria-label="تبعيد الأسطر">`
- `src/Explain.tsx:427`: `<p className="muted">تعذّر تحميل الشرح.</p>`
- `src/Explain.tsx:429`: `<p className="muted">جارٍ التحميل…</p>`
- `src/Explain.tsx:431`: `<p className="muted">لا يوجد شرح لهذا البيت في هذا الكتاب.</p>`
- `src/Explain.tsx:438`: `<span className="ex-hlbar-label">{opened ? 'التظليل' : 'تظليل'}</span>`
- `src/Explain.tsx:444`: `aria-label={`لون ${toArabicDigits(i + 1)}`}`
- `src/Explain.tsx:451`: `<button className={`ex-hl-btn${noting || opened.note ? ' on' : ''}`} onClick={() => setNoting((x) => !x)} aria-label="ملاحظة على التظليل" aria-expanded={noting}>`
- `src/Explain.tsx:456`: `aria-label="حذف التظليل"`
- `src/Explain.tsx:464`: `<button className="ex-hl-btn" aria-label="إغلاق" onClick={() => setOpenHl(null)}>`
- `src/Explain.tsx:472`: `placeholder="ملاحظة على هذا التظليل"`
- `src/Explain.tsx:483`: `<ChevronRight size={18} /> السابق`
- `src/Explain.tsx:485`: `<span className="ex-page">{pages.length ? `ص ${pages.map((x) => toArabicDigits(x)).join('، ')}` : ''}</span>`
- `src/Explain.tsx:487`: `التالي <ChevronLeft size={18} />`
- `src/Explain.tsx:495`: `<aside className="side-panel ex-side" aria-label="الشرح">`
- `src/Explain.tsx:502`: `aria-label="الشرح"`

## `src/Find.tsx` (10 lines)
- `src/Find.tsx:91`: `placeholder="كلمة، أو رقم بيت، أو اسم باب"`
- `src/Find.tsx:105`: `{p.find.at >= 0 ? `${toArabicDigits(p.find.at + 1)} من ${toArabicDigits(n)}` : toArabicDigits(n)}`
- `src/Find.tsx:109`: `<button className="icon-btn" onClick={() => p.onStep(-1)} disabled={!n} aria-label="النتيجة السابقة">`
- `src/Find.tsx:112`: `<button className="icon-btn" onClick={() => p.onStep(1)} disabled={!n} aria-label="النتيجة التالية">`
- `src/Find.tsx:115`: `<button className="icon-btn" onClick={p.onClose} aria-label="إغلاق البحث">`
- `src/Find.tsx:139`: `البيت {toArabicDigits(badNumber)} غير موجود في هذه النسخة{p.edition.partial ? ' التجريبية' : ''}.`
- `src/Find.tsx:142`: `{sections.length > 0 && <h2 className="group-title">الأبواب</h2>}`
- `src/Find.tsx:156`: `{verses.length > LIST_MAX ? ` · أول ${toArabicDigits(LIST_MAX)}` : ''}`
- `src/Find.tsx:164`: `{re && !sections.length && !verses.length && <Empty icon={<SearchX size={26} />}>لا نتائج لـ«{query}».</Empty>}`
- `src/Find.tsx:165`: `{!query && <Empty icon={<Search size={26} />}>ابحث دون تشكيل، مثل: وانجلى، أو اكتب رقم البيت.</Empty>}`

## `src/Listener.tsx` (44 lines)
- `src/Listener.tsx:26`: `const rangeLabel = (r: Range) => (r.from === r.to ? `البيت ${ar(r.from)}` : `الأبيات ${ar(r.from)}–${ar(r.to)}`)`
- `src/Listener.tsx:27`: `const slipsLabel = (n: number) => (n === 0 ? 'بلا أخطاء' : n === 1 ? 'خطأ واحد' : n === 2 ? 'خطآن' : n <= 10 ? `${ar(n)} أخطاء` : `${ar(n)} خطأً`)`
- `src/Listener.tsx:28`: `const versesWord = (n: number) => (n === 1 ? 'بيت واحد' : n === 2 ? 'بيتان' : n <= 10 ? `${ar(n)} أبيات` : `${ar(n)} بيتًا`)`
- `src/Listener.tsx:31`: `/** The row in الحفظ (inside the «الاختبار والتسميع» group). */`
- `src/Listener.tsx:37`: `التسميع على مستمع`
- `src/Listener.tsx:39`: `يمسك المستمع الجهاز ويلمس كل كلمة أخطأت فيها{sessions > 0 ? ` · ${sessions === 1 ? 'جلسة واحدة محفوظة' : `${ar(sessions)} جلسات محفوظة`}` : ''}`
- `src/Listener.tsx:86`: `/** The verse the reader is on: its باب is the range offered first. */`
- `src/Listener.tsx:133`: `<div className="listener run" role="dialog" aria-label="التسميع">`
- `src/Listener.tsx:140`: `<Check size={18} /> إنهاء`
- `src/Listener.tsx:148`: `<footer className="lis-types" role="radiogroup" aria-label="نوع الخطأ">`
- `src/Listener.tsx:169`: `<div className="listener" role="dialog" aria-label="تقرير التسميع">`
- `src/Listener.tsx:171`: `<button className="icon-btn" onClick={() => (stage.fresh ? p.onClose() : setStage({ at: 'setup' }))} aria-label="إغلاق">`
- `src/Listener.tsx:175`: `تقرير التسميع`
- `src/Listener.tsx:180`: `<button className="icon-btn" onClick={() => setConfirmDelete(s.id)} aria-label="حذف الجلسة">`
- `src/Listener.tsx:187`: `<span>حذف هذه الجلسة وعلاماتها من النص؟</span>`
- `src/Listener.tsx:189`: `حذف`
- `src/Listener.tsx:192`: `إلغاء`
- `src/Listener.tsx:199`: `{slipped.length === 0 ? `${versesWord(total)} دون خطأ` : `في ${slipped.length === 2 ? 'بيتين' : versesWord(slipped.length)} من أصل ${ar(total)}`}`
- `src/Listener.tsx:221`: `<Repeat size={18} /> تكرار أبيات الأخطاء`
- `src/Listener.tsx:225`: `تم`
- `src/Listener.tsx:245`: `<div className="listener" role="dialog" aria-label="التسميع على مستمع">`
- `src/Listener.tsx:247`: `<button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">`
- `src/Listener.tsx:250`: `<span className="lis-title">التسميع على مستمع</span>`
- `src/Listener.tsx:254`: `<p className="muted lis-hint">اختر الأبيات، ثم أعطِ الجهاز للمستمع. يلمس المستمع كل كلمة أخطأت فيها بعد أن يختار نوع الخطأ من أسفل الشاشة.</p>`
- `src/Listener.tsx:255`: `<h2 className="group-title">الأبيات</h2>`
- `src/Listener.tsx:258`: `{field('من البيت', from, setFrom)}`
- `src/Listener.tsx:259`: `{field('إلى البيت', to, setTo)}`
- `src/Listener.tsx:262`: `<span>الباب</span>`
- `src/Listener.tsx:280`: `<span className="list-main">ورد اليوم</span>`
- `src/Listener.tsx:287`: `اختر أبياتًا بين {ar(all.from)} و{ar(all.to)}، والبداية قبل النهاية.`
- `src/Listener.tsx:291`: `ابدأ التسميع{valid ? ` · ${versesWord(b - a + 1)}` : ''}`
- `src/Listener.tsx:296`: `<h2 className="group-title">الجلسات السابقة</h2>`
- `src/Listener.tsx:318`: `/** الإعدادات ← التسميع: marks in the reader, and the user's own slip types (name and colour). */`
- `src/Listener.tsx:332`: `p.setTypes([...types, { id: newTypeId(types), name: 'نوع جديد', color }])`
- `src/Listener.tsx:336`: `<h2 className="group-title">التسميع</h2>`
- `src/Listener.tsx:340`: `إظهار أخطاء التسميع في النص`
- `src/Listener.tsx:341`: `<small className="muted">تبقى الكلمات التي أخطأت فيها ملوّنة في صفحة القراءة</small>`
- `src/Listener.tsx:348`: `مسح علامات الأخطاء من النص`
- `src/Listener.tsx:349`: `<small className="muted">تبقى الجلسات وتقاريرها محفوظة في الحفظ</small>`
- `src/Listener.tsx:354`: `<h2 className="group-title">أنواع الأخطاء</h2>`
- `src/Listener.tsx:358`: `<input type="color" value={t.color} aria-label={`لون «${t.name}»`} onChange={(e) => edit(t.id, { color: e.target.value })} />`
- `src/Listener.tsx:359`: `<input type="text" value={t.name} maxLength={24} aria-label="اسم النوع" onChange={(e) => edit(t.id, { name: e.target.value })} />`
- `src/Listener.tsx:360`: `<button className="icon-btn" aria-label={`حذف «${t.name}»`} disabled={types.length <= 1} onClick={() => p.setTypes(types.filter((x) => x.id !== t.id))}>`
- `src/Listener.tsx:367`: `<span className="list-main">إضافة نوع</span>`

## `src/Look.tsx` (18 lines)
- `src/Look.tsx:1`: `// The «أ» panel: every choice about how the verses look, with real verses above the controls`
- `src/Look.tsx:14`: `['auto', 'تلقائي'],`
- `src/Look.tsx:15`: `['side', 'متقابلان'],`
- `src/Look.tsx:16`: `['stack', 'متتابعان'],`
- `src/Look.tsx:19`: `['circle', 'دائرة'],`
- `src/Look.tsx:20`: `['plain', 'رقم فقط'],`
- `src/Look.tsx:24`: `/** What «استعادة الافتراضي» puts back (the look only; edition, reciter and extras are kept). */`
- `src/Look.tsx:56`: `title="المظهر"`
- `src/Look.tsx:77`: `<span>حجم الخط</span>`
- `src/Look.tsx:79`: `<button disabled={size <= limits.min} onClick={() => set({ fontSize: Math.max(limits.min, size - 1) })} aria-label="تصغير الخط">`
- `src/Look.tsx:83`: `<button disabled={size >= limits.max} onClick={() => set({ fontSize: Math.min(limits.max, size + 1) })} aria-label="تكبير الخط">`
- `src/Look.tsx:88`: `<p className="field-note">يمكنك أيضًا تكبير الأبيات وتصغيرها بإصبعين على الصفحة.</p>`
- `src/Look.tsx:90`: `<span>تباعد الأسطر</span>`
- `src/Look.tsx:106`: `<span>ترتيب الشطرين</span>`
- `src/Look.tsx:117`: `توحيد عرض الأشطر`
- `src/Look.tsx:118`: `<small className="muted">تُمدّ الأشطر القصيرة بالكشيدة لتستوي الحواف كما في المطبوع</small>`
- `src/Look.tsx:123`: `<span>رقم البيت</span>`
- `src/Look.tsx:141`: `<RotateCcw size={18} /> استعادة الافتراضي`

## `src/MemMap.tsx` (13 lines)
- `src/MemMap.tsx:15`: `mastered: 'متقَن',`
- `src/MemMap.tsx:16`: `progress: 'قيد الحفظ',`
- `src/MemMap.tsx:17`: `weak: 'ضعيف',`
- `src/MemMap.tsx:18`: `none: 'لم يُبدأ',`
- `src/MemMap.tsx:47`: `if (rest.length) chapters.push({ title: 'أبيات أخرى', from: rest[0], to: rest[rest.length - 1], verses: rest })`
- `src/MemMap.tsx:121`: `<strong>{ar(counts.mastered)}</strong> متقَن`
- `src/MemMap.tsx:124`: `<strong>{ar(counts.progress)}</strong> قيد الحفظ`
- `src/MemMap.tsx:127`: `<strong>{ar(counts.weak)}</strong> ضعيف`
- `src/MemMap.tsx:142`: `aria-label="خريطة الحفظ: المس مربعًا لترى بيته، أو استعمل الأسهم"`
- `src/MemMap.tsx:154`: `<button className="mm-close" onClick={() => select(null)} aria-label="إغلاق">`
- `src/MemMap.tsx:159`: `<span className="mm-nowrap">البيت {ar(sel)} ·</span>`
- `src/MemMap.tsx:164`: `انتقال <ChevronLeft size={16} />`
- `src/MemMap.tsx:181`: `الأبيات {ar(c.from)}–{ar(c.to)}`

## `src/Memorize.tsx` (29 lines)
- `src/Memorize.tsx:13`: `['none', 'إظهار الكل'],`
- `src/Memorize.tsx:14`: `['b', 'إخفاء العجز'],`
- `src/Memorize.tsx:15`: `['all', 'إخفاء البيت'],`
- `src/Memorize.tsx:37`: `/** Toggle «إخفاء تدريجي». */`
- `src/Memorize.tsx:40`: `/** Offer «البيت التالي»: a peek at the first word of the next verse (recitation curtain). */`
- `src/Memorize.tsx:78`: `// «إخفاء تدريجي»: with each repetition more of the verse is veiled; a tap shows it again.`
- `src/Memorize.tsx:86`: `<div className="memorize" role="dialog" aria-label="وضع الحفظ" ref={swipeRef}>`
- `src/Memorize.tsx:88`: `<button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">`
- `src/Memorize.tsx:91`: `<span>{testing ? 'اختبر نفسك' : 'وضع الحفظ'}</span>`
- `src/Memorize.tsx:95`: `aria-label={testing ? 'إظهار النص' : 'اختبر نفسك'}`
- `src/Memorize.tsx:112`: `{section?.title} · البيت {toArabicDigits(p.verse)}`
- `src/Memorize.tsx:121`: `{hideA ? <HiddenHalf label="اضغط لإظهار الصدر" /> : <p>{half('a')}</p>}`
- `src/Memorize.tsx:122`: `{hideB ? <HiddenHalf label={hideA ? 'والعجز' : 'اضغط لإظهار العجز'} /> : <p>{half('b')}</p>}`
- `src/Memorize.tsx:129`: `البيت التالي يبدأ بـ <span className="verse-text">«{next.a.trim().split(/\s+/)[0]} …»</span>`
- `src/Memorize.tsx:133`: `<Eye size={16} /> البيت التالي`
- `src/Memorize.tsx:148`: `<RotateCcw size={18} /> لم أتقنه`
- `src/Memorize.tsx:151`: `<Check size={18} /> أتقنته`
- `src/Memorize.tsx:161`: `<span>المرة</span>`
- `src/Memorize.tsx:169`: `<span>الدورة</span>`
- `src/Memorize.tsx:178`: `<span>البيت</span>`
- `src/Memorize.tsx:187`: `<span>المرحلة</span>`
- `src/Memorize.tsx:201`: `<button className="icon-btn" onClick={() => p.onStep(-1)} aria-label="البيت السابق">`
- `src/Memorize.tsx:204`: `<button className="play-big" onClick={p.onPlay} disabled={!p.canPlay} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>`
- `src/Memorize.tsx:207`: `<button className="icon-btn" onClick={() => p.onStep(1)} aria-label="البيت التالي">`
- `src/Memorize.tsx:215`: `<span>التكرار</span>`
- `src/Memorize.tsx:219`: `<span>السرعة</span>`
- `src/Memorize.tsx:223`: `<span>{p.repeat.echo ? 'مهلة البيت' : `مهلة ${toArabicDigits(p.repeat.pause)}ث`}</span>`
- `src/Memorize.tsx:227`: `<span>تدريجي</span>`
- `src/Memorize.tsx:231`: `<span>إيقاف</span>`

## `src/MiniPlayer.tsx` (7 lines)
- `src/MiniPlayer.tsx:12`: `/** Short label for the repeat chip, e.g. «×٣». */`
- `src/MiniPlayer.tsx:53`: `<button className="mini-main" onClick={p.onOpen} aria-label="فتح وضع الحفظ">`
- `src/MiniPlayer.tsx:56`: `<strong>{p.verse != null ? `البيت ${toArabicDigits(p.verse)}` : 'اختر بيتًا للاستماع'}</strong>`
- `src/MiniPlayer.tsx:58`: `{s.error ? <span className="err">{s.error}</span> : s.status === 'gap' ? 'مهلة…' : `${p.reciterName} · ${p.summary}`}`
- `src/MiniPlayer.tsx:62`: `<button className="repeat-chip" onClick={p.onRepeat} disabled={!p.ready} aria-label={`التكرار: ${p.summary}`}>`
- `src/MiniPlayer.tsx:66`: `<button className="icon-btn big" onClick={p.onPlay} disabled={!p.ready} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>`
- `src/MiniPlayer.tsx:70`: `<button className="icon-btn big" onClick={p.onStop} aria-label="إيقاف">`

## `src/PlanScreen.tsx` (85 lines)
- `src/PlanScreen.tsx:1`: `// الحفظ tab: memorization plan builder, today's wird and progress. Track D owns this file (see SWEEP-PLAN.md).`
- `src/PlanScreen.tsx:31`: `/** Verses marked «لم أتقنه» (for the memorization map). */`
- `src/PlanScreen.tsx:55`: `const WEEKDAY_SHORT = WEEKDAYS.map((w) => w.replace(/^ال/, ''))`
- `src/PlanScreen.tsx:63`: `const daysWord = (n: number) => counted(n, 'يوم واحد', 'يومان', 'أيام', 'يومًا')`
- `src/PlanScreen.tsx:64`: `const versesWord = (n: number) => counted(n, 'بيت واحد', 'بيتان', 'أبيات', 'بيتًا')`
- `src/PlanScreen.tsx:65`: `const lateWord = (n: number) => (n === 1 ? 'متأخر بيوم' : n === 2 ? 'متأخر بيومين' : `متأخر ${daysWord(n)}`)`
- `src/PlanScreen.tsx:67`: `const rangeLabel = (r: Range) => (r.from === r.to ? `البيت ${ar(r.from)}` : `الأبيات ${ar(r.from)}–${ar(r.to)}`)`
- `src/PlanScreen.tsx:112`: `<h1 className="large-title">الحفظ</h1>`
- `src/PlanScreen.tsx:144`: `<GraduationCap size={20} /> جلسة حفظ حرة`
- `src/PlanScreen.tsx:175`: `<small>عن الجدول الأصلي</small>`
- `src/PlanScreen.tsx:178`: `<RotateCcw size={16} /> إعادة الجدولة`
- `src/PlanScreen.tsx:183`: `<h2 className="group-title">التقدّم</h2>`
- `src/PlanScreen.tsx:186`: `{ar(done)} <small>من {versesWord(total)}</small>`
- `src/PlanScreen.tsx:195`: `<small>{streak === 1 ? 'يوم متتالٍ' : 'أيام متتالية'}</small>`
- `src/PlanScreen.tsx:200`: `<small>{P.isFinished(plan) ? 'تاريخ الختم' : 'الختم المتوقع'}</small>`
- `src/PlanScreen.tsx:205`: `<small>{plan.perDay === 1 ? 'بيت في اليوم' : 'أبيات في اليوم'}</small>`
- `src/PlanScreen.tsx:216`: `<h2 className="group-title">الأوراد القادمة</h2>`
- `src/PlanScreen.tsx:225`: `<small className={late ? 'err' : ''}>{late ? 'متأخر' : date === today ? 'اليوم' : date === P.addDays(today, 1) ? 'غدًا' : dayShort(date)}</small>`
- `src/PlanScreen.tsx:234`: `<h2 className="group-title">الخطة</h2>`
- `src/PlanScreen.tsx:237`: `<span>النطاق</span>`
- `src/PlanScreen.tsx:241`: `<span>أيام الراحة</span>`
- `src/PlanScreen.tsx:242`: `<small className="muted">{plan.daysOff.length ? plan.daysOff.map((d) => WEEKDAYS[d]).join('، ') : 'لا يوجد'}</small>`
- `src/PlanScreen.tsx:245`: `<span>المراجعة</span>`
- `src/PlanScreen.tsx:246`: `<small className="muted">{plan.review ? `آخر ${daysWord(plan.review)}` : 'بلا مراجعة'}</small>`
- `src/PlanScreen.tsx:250`: `<Pencil size={18} /> تعديل الخطة`
- `src/PlanScreen.tsx:256`: `<span>حذف الخطة وسجلّها؟</span>`
- `src/PlanScreen.tsx:259`: `إلغاء`
- `src/PlanScreen.tsx:262`: `احذف`
- `src/PlanScreen.tsx:269`: `<Trash2 size={18} /> حذف الخطة`
- `src/PlanScreen.tsx:280`: `if (s.kind === 'all') return edition.partial ? 'كل المتاح' : 'المتن كاملًا'`
- `src/PlanScreen.tsx:283`: `return titles.length > 2 ? `${ar(titles.length)} أبواب` : titles.join('، ')`
- `src/PlanScreen.tsx:299`: `<strong>ختمت الخطة، بارك الله فيك</strong>`
- `src/PlanScreen.tsx:300`: `<span className="muted">أنهيت {versesWord(P.totalVerses(plan.segments))}. عدّل الخطة لتضيف أبياتًا جديدة.</span>`
- `src/PlanScreen.tsx:309`: `<Check size={16} /> أنهيت ورد اليوم`
- `src/PlanScreen.tsx:316`: `<RotateCcw size={16} /> مراجعة {ar(state.review.from)}–{ar(state.review.to)}`
- `src/PlanScreen.tsx:321`: `<Play size={16} /> الورد التالي`
- `src/PlanScreen.tsx:327`: `أنهيت الورد التالي أيضًا ({rangeLabel(state.next)})`
- `src/PlanScreen.tsx:331`: `<Undo2 size={14} /> تراجع`
- `src/PlanScreen.tsx:342`: `<CalendarCheck size={16} /> تبدأ الخطة {dayLong(plan.start)}`
- `src/PlanScreen.tsx:346`: `<Coffee size={16} /> اليوم يوم راحة، والورد التالي ينتظرك`
- `src/PlanScreen.tsx:349`: `<span className="today-kicker">ورد اليوم</span>`
- `src/PlanScreen.tsx:357`: `<RotateCcw size={14} /> المراجعة: {rangeLabel(review)}`
- `src/PlanScreen.tsx:362`: `<Play size={18} /> {offDay || notStarted ? 'احفظه الآن' : 'ابدأ ورد اليوم'}`
- `src/PlanScreen.tsx:366`: `<RotateCcw size={16} /> مراجعة`
- `src/PlanScreen.tsx:371`: `<Check size={20} /> {offDay || notStarted ? 'أنهيت هذا الورد' : 'أنهيت ورد اليوم'}`
- `src/PlanScreen.tsx:378`: `done: 'أُنجز',`
- `src/PlanScreen.tsx:379`: `missed: 'فات',`
- `src/PlanScreen.tsx:380`: `off: 'راحة',`
- `src/PlanScreen.tsx:381`: `today: 'اليوم',`
- `src/PlanScreen.tsx:382`: `future: 'قادم',`
- `src/PlanScreen.tsx:396`: `<h2 className="group-title">آخر الأسابيع</h2>`
- `src/PlanScreen.tsx:415`: `<i className="hm-day done" /> أُنجز`
- `src/PlanScreen.tsx:418`: `<i className="hm-day missed" /> فات`
- `src/PlanScreen.tsx:421`: `<i className="hm-day off" /> راحة`
- `src/PlanScreen.tsx:432`: `/** Collapsible «خريطة الحفظ» card; open or closed is remembered on the device. */`
- `src/PlanScreen.tsx:437`: `<h2 className="group-title">خريطة الحفظ</h2>`
- `src/PlanScreen.tsx:441`: `<Grid3x3 size={18} /> {ui.open ? 'إخفاء الخريطة' : 'عرض الخريطة'}`
- `src/PlanScreen.tsx:495`: `{plan ? 'عدّل خطتك. ما أنهيته يبقى محفوظًا، ويُعاد حساب الجدول من اليوم.' : 'ضع خطة حفظ بورد يومي، وتابع تقدّمك يومًا بيوم.'}`
- `src/PlanScreen.tsx:498`: `<h2 className="group-title">ماذا تحفظ</h2>`
- `src/PlanScreen.tsx:504`: `['all', edition.partial ? 'كل المتاح' : 'المتن كاملًا'],`
- `src/PlanScreen.tsx:505`: `['sections', 'أبواب مختارة'],`
- `src/PlanScreen.tsx:506`: `['range', 'من بيت إلى بيت'],`
- `src/PlanScreen.tsx:516`: `الأبيات {ar(avail.from)}–{ar(avail.to)}`
- `src/PlanScreen.tsx:517`: `{edition.partial ? ' (المتاح في النسخة التجريبية)' : ''}`
- `src/PlanScreen.tsx:543`: `من`
- `src/PlanScreen.tsx:547`: `إلى`
- `src/PlanScreen.tsx:554`: `<h2 className="group-title">الوتيرة</h2>`
- `src/PlanScreen.tsx:559`: `عدد أبيات في اليوم`
- `src/PlanScreen.tsx:562`: `تاريخ الختم`
- `src/PlanScreen.tsx:568`: `<span>أبيات كل يوم</span>`
- `src/PlanScreen.tsx:573`: `<span>أختم يوم</span>`
- `src/PlanScreen.tsx:578`: `<span>تاريخ البدء</span>`
- `src/PlanScreen.tsx:583`: `<h2 className="group-title">أيام الراحة</h2>`
- `src/PlanScreen.tsx:597`: `<small className="muted">{daysOff.length ? 'لا ورد جديد في هذه الأيام.' : 'ورد كل يوم دون راحة.'}</small>`
- `src/PlanScreen.tsx:601`: `<h2 className="group-title">المراجعة اليومية</h2>`
- `src/PlanScreen.tsx:604`: `<span>{review ? `راجع أوراد آخر ${daysWord(review)}` : 'بلا مراجعة'}</span>`
- `src/PlanScreen.tsx:614`: `<small>{pv.perDay === 1 ? 'بيت يوميًا' : 'أبيات يوميًا'}</small>`
- `src/PlanScreen.tsx:618`: `<small>{pv.days === 1 ? 'يوم حفظ' : 'أيام حفظ'}</small>`
- `src/PlanScreen.tsx:628`: `? 'اختر أبياتًا للحفظ.'`
- `src/PlanScreen.tsx:630`: `? 'اترك يومًا واحدًا على الأقل للحفظ.'`
- `src/PlanScreen.tsx:631`: `: 'تاريخ الختم قبل تاريخ البدء.'}`
- `src/PlanScreen.tsx:637`: `<Check size={20} /> {plan ? 'احفظ التعديل' : 'ابدأ الخطة'}`
- `src/PlanScreen.tsx:641`: `إلغاء`
- `src/PlanScreen.tsx:651`: `<button onClick={() => p.onChange(Math.max(p.min, p.value - 1))} disabled={p.value <= p.min} aria-label="أنقص">`
- `src/PlanScreen.tsx:655`: `<button onClick={() => p.onChange(Math.min(p.max, p.value + 1))} disabled={p.value >= p.max} aria-label="زد">`

## `src/Quiz.tsx` (52 lines)
- `src/Quiz.tsx:12`: `const versesWord = (n: number) => (n === 1 ? 'بيت واحد' : n === 2 ? 'بيتان' : n <= 10 ? `${ar(n)} أبيات` : `${ar(n)} بيتًا`)`
- `src/Quiz.tsx:17`: `['b', 'إخفاء العجز', 'يظهر الشطر الأول وتُكمل الثاني'],`
- `src/Quiz.tsx:18`: `['all', 'إخفاء البيت', 'يظهر رقم البيت وبابه فقط'],`
- `src/Quiz.tsx:19`: `['next', 'ما البيت التالي؟', 'يظهر البيت السابق وتأتي بما بعده'],`
- `src/Quiz.tsx:20`: `['twins', 'المتشابهات', 'الأبيات التي تنتهي بالكلمة نفسها، مع عرض أشباهها بعد الجواب'],`
- `src/Quiz.tsx:23`: `/** The group in الحفظ that holds the test and the listener rows. */`
- `src/Quiz.tsx:27`: `<h2 className="group-title">الاختبار والتسميع</h2>`
- `src/Quiz.tsx:38`: `اختبر نفسك`
- `src/Quiz.tsx:39`: `<small className="muted">اختر الأبيات ونوع السؤال{due > 0 ? ` · مراجعة اليوم: ${versesWord(due)}` : ''}</small>`
- `src/Quiz.tsx:53`: `/** The verse the reader is on: its باب is the range offered first. */`
- `src/Quiz.tsx:56`: `/** Open on «مراجعة اليوم». */`
- `src/Quiz.tsx:84`: `// «ما البيت التالي؟» needs a verse before it; the drill needs a twin.`
- `src/Quiz.tsx:107`: `<div className="listener quiz" role="dialog" aria-label="اختبر نفسك">`
- `src/Quiz.tsx:109`: `<button className="icon-btn" onClick={() => setStage({ at: 'done', total: stage.i, missed: stage.missed, kind: k })} aria-label="إنهاء الاختبار">`
- `src/Quiz.tsx:115`: `{ar(stage.i + 1)} من {ar(stage.list.length)}`
- `src/Quiz.tsx:126`: `<p className="quiz-kicker">ما البيت الذي بعد هذا؟</p>`
- `src/Quiz.tsx:134`: `{section?.title} · البيت {ar(n)}`
- `src/Quiz.tsx:138`: `{k === 'b' || k === 'twins' || stage.shown ? <p>{v.a}</p> : <p className="hidden-half">الصدر</p>}`
- `src/Quiz.tsx:139`: `{stage.shown ? <p>{v.b}</p> : <p className="hidden-half">{k === 'b' || k === 'twins' ? 'اضغط لإظهار العجز' : 'اضغط لإظهار البيت'}</p>}`
- `src/Quiz.tsx:143`: `{section?.title} · البيت {ar(n)}`
- `src/Quiz.tsx:148`: `<span className="muted">يشبهه في الخاتمة:</span>`
- `src/Quiz.tsx:154`: `{twins.length > 6 && <small className="muted">و{versesWord(twins.length - 6)} أخرى</small>}`
- `src/Quiz.tsx:162`: `<RotateCcw size={18} /> لم أتقنه`
- `src/Quiz.tsx:165`: `<Check size={18} /> أتقنته`
- `src/Quiz.tsx:170`: `<Eye size={18} /> أظهر الجواب`
- `src/Quiz.tsx:182`: `<div className="listener quiz" role="dialog" aria-label="نتيجة الاختبار">`
- `src/Quiz.tsx:184`: `<button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">`
- `src/Quiz.tsx:187`: `<span className="lis-title">نتيجة الاختبار</span>`
- `src/Quiz.tsx:193`: `{ar(right)} من {ar(stage.total)}`
- `src/Quiz.tsx:195`: `<span>{stage.total === 0 ? 'لم تُجب عن أي بيت.' : stage.missed.length === 0 ? 'أتقنت كل الأبيات، بارك الله فيك.' : `لم تتقن ${stage.missed.length === 1 ? 'بيتًا واحدًا' : stage.missed.length === 2 ? 'بيتين' : versesWord(stage.missed.length)}`}</span>`
- `src/Quiz.tsx:213`: `البيت {ar(n)} · {sectionOf(edition, n)?.title}`
- `src/Quiz.tsx:227`: `<RotateCcw size={18} /> أعد ما لم أتقنه`
- `src/Quiz.tsx:231`: `اختبار جديد`
- `src/Quiz.tsx:251`: `['range', 'أبيات أختارها', null],`
- `src/Quiz.tsx:252`: `['review', 'مراجعة اليوم', dueList.length],`
- `src/Quiz.tsx:253`: `['weak', 'الأبيات الضعيفة', weakList.length],`
- `src/Quiz.tsx:256`: `<div className="listener quiz" role="dialog" aria-label="اختبر نفسك">`
- `src/Quiz.tsx:258`: `<button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">`
- `src/Quiz.tsx:261`: `<span className="lis-title">اختبر نفسك</span>`
- `src/Quiz.tsx:265`: `<h2 className="group-title">الأبيات</h2>`
- `src/Quiz.tsx:271`: `{id === 'review' && <small className="muted">الضعيف أولًا، ثم أقدم ما أتقنته</small>}`
- `src/Quiz.tsx:273`: `{count != null && <small>{count === 0 ? 'لا شيء' : versesWord(count)}</small>}`
- `src/Quiz.tsx:281`: `{field('من البيت', from, setFrom)}`
- `src/Quiz.tsx:282`: `{field('إلى البيت', to, setTo)}`
- `src/Quiz.tsx:285`: `<span>الباب</span>`
- `src/Quiz.tsx:303`: `<span className="list-main">ورد اليوم</span>`
- `src/Quiz.tsx:313`: `اختر أبياتًا بين {ar(all.from)} و{ar(all.to)}، والبداية قبل النهاية.`
- `src/Quiz.tsx:317`: `<h2 className="group-title">نوع السؤال</h2>`
- `src/Quiz.tsx:330`: `<h2 className="group-title">الترتيب</h2>`
- `src/Quiz.tsx:333`: `{source === 'range' ? 'بالترتيب' : 'الأَولى أولًا'}`
- `src/Quiz.tsx:336`: `عشوائي`
- `src/Quiz.tsx:341`: `{list.length ? `ابدأ الاختبار · ${versesWord(list.length)}` : kind === 'twins' && base.length ? 'لا متشابهات في هذه الأبيات' : 'ابدأ الاختبار'}`

## `src/RangePick.tsx` (8 lines)
- `src/RangePick.tsx:22`: `/** «اختر بيت البداية / النهاية», at the top while an end is still open. */`
- `src/RangePick.tsx:27`: `{pick.anchor == null ? 'اختر بيت البداية' : `من البيت ${toArabicDigits(pick.anchor)} · اختر بيت النهاية`}`
- `src/RangePick.tsx:30`: `<X size={15} /> إلغاء`
- `src/RangePick.tsx:36`: `/** «الأبيات ٢–٦ · ٥ أبيات» with ابدأ and تعديل, once both ends are chosen. */`
- `src/RangePick.tsx:42`: `<span>{count === 1 ? `البيت ${toArabicDigits(p.from)}` : `الأبيات ${toArabicDigits(p.from)}–${toArabicDigits(p.to)}`}</span>`
- `src/RangePick.tsx:47`: `<Play size={16} /> ابدأ`
- `src/RangePick.tsx:51`: `<Pencil size={15} /> تعديل`
- `src/RangePick.tsx:53`: `<button className="x" onClick={p.onCancel} aria-label="إلغاء">`

## `src/Reader.tsx` (8 lines)
- `src/Reader.tsx:38`: `/** «إخفاء تدريجي»: the verse being repeated and the share of its words to hide now. */`
- `src/Reader.tsx:238`: `<span>صفحة {toArabicDigits(p.pageStarts.get(v.n)!)}</span>`
- `src/Reader.tsx:362`: `/** The verse number; while the verse repeats, its count «٢/٣» with a ring (a bar in the plain style). */`
- `src/Reader.tsx:368`: `<span className="vnum counting" style={{ '--share': share } as CSSProperties} aria-label={`البيت ${toArabicDigits(n)}، المرة ${label}`}>`
- `src/Reader.tsx:383`: `{p.hasBookmark && <Bookmark size={12} aria-label="علامة" />}`
- `src/Reader.tsx:384`: `{p.hasNote && <Pencil size={12} aria-label="ملاحظة" />}`
- `src/Reader.tsx:385`: `{p.sketch && <PenLine size={12} aria-label="رسم" />}`
- `src/Reader.tsx:386`: `{p.isMastered && <Check size={12} aria-label="متقَن" />}`

## `src/SidePanel.tsx` (9 lines)
- `src/SidePanel.tsx:47`: `<aside className="side-panel" aria-label="تفاصيل البيت">`
- `src/SidePanel.tsx:49`: `البيت {toArabicDigits(p.n)} · {sectionOf(p.edition, p.n)?.title}`
- `src/SidePanel.tsx:59`: `<h4>الرموز</h4>`
- `src/SidePanel.tsx:76`: `<h4>الكلمات القرآنية</h4>`
- `src/SidePanel.tsx:82`: `{m.q!.map(([s, a]) => `${SURAHS[s - 1]} ${toArabicDigits(a)}`).join('، ')}`
- `src/SidePanel.tsx:90`: `{!codes.length && !words.length && p.colors && <p className="muted">لا رموز ولا كلمات قرآنية ملوّنة في هذا البيت.</p>}`
- `src/SidePanel.tsx:93`: `<h4>ملاحظتك</h4>`
- `src/SidePanel.tsx:96`: `<Pencil size={14} /> {p.note.trim() ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}`
- `src/SidePanel.tsx:102`: `<h4>أبيات تنتهي بالكلمة نفسها ({toArabicDigits(p.twins.length)})</h4>`

## `src/Sketch.tsx` (8 lines)
- `src/Sketch.tsx:138`: `aria-label="لوحة الرسم على البيت"`
- `src/Sketch.tsx:146`: `<div className="sketch-tools" role="toolbar" aria-label="أدوات الرسم">`
- `src/Sketch.tsx:152`: `aria-label={c === 'ink' ? 'قلم بلون النص' : 'لون القلم'}`
- `src/Sketch.tsx:164`: `<button key={s} className={`sk-size${size === s ? ' on' : ''}`} aria-label={s === PEN_SIZES[0] ? 'خط رفيع' : 'خط عريض'} aria-pressed={size === s} onClick={() => setSize(s)}>`
- `src/Sketch.tsx:169`: `<button className={erasing ? 'on' : ''} aria-label="ممحاة" aria-pressed={erasing} onClick={() => setErasing((x) => !x)}>`
- `src/Sketch.tsx:172`: `<button aria-label="تراجع" disabled={!strokes.length} onClick={() => setStrokes((all) => all.slice(0, -1))}>`
- `src/Sketch.tsx:175`: `<button aria-label="مسح الكل" disabled={!strokes.length} onClick={() => setStrokes([])}>`
- `src/Sketch.tsx:179`: `<Check size={18} /> تم`

## `src/TwinsSheet.tsx` (2 lines)
- `src/TwinsSheet.tsx:27`: `<Sheet title={`أبيات تنتهي بـ«${word}»`} onClose={p.onClose}>`
- `src/TwinsSheet.tsx:29`: `{rows.length ? `${plural(rows.length, VERSES)} غير البيت ${toArabicDigits(p.n)}` : 'لا أبيات أخرى تنتهي بهذه الكلمة.'}`

## `src/VerseBar.tsx` (14 lines)
- `src/VerseBar.tsx:1`: `// The small action bar under a tapped verse (UX-PLAN 3.1). «المزيد» opens the full verse sheet.`
- `src/VerseBar.tsx:77`: `<div ref={ref} className={`verse-bar mark-pick${above ? ' above' : ''}`} role="toolbar" aria-label="لون العلامة">`
- `src/VerseBar.tsx:78`: `<button onClick={() => setPicking(false)} aria-label="رجوع">`
- `src/VerseBar.tsx:80`: `<span>رجوع</span>`
- `src/VerseBar.tsx:104`: `<span>إزالة</span>`
- `src/VerseBar.tsx:111`: `<div ref={ref} className={`verse-bar${above ? ' above' : ''}`} role="toolbar" aria-label={`البيت ${toArabicDigits(p.n)}`}>`
- `src/VerseBar.tsx:116`: `<span>تشغيل من هنا</span>`
- `src/VerseBar.tsx:120`: `<span>تكرار من هنا</span>`
- `src/VerseBar.tsx:127`: `<span>الشرح</span>`
- `src/VerseBar.tsx:132`: `<span>{p.mark != null ? markName(p.markNames, p.mark) : 'علامة'}</span>`
- `src/VerseBar.tsx:136`: `<span>ملاحظة</span>`
- `src/VerseBar.tsx:140`: `<span>رسم</span>`
- `src/VerseBar.tsx:145`: `<span>متشابهات ({toArabicDigits(p.twins)})</span>`
- `src/VerseBar.tsx:150`: `<span>المزيد</span>`

## `src/WirdStrip.tsx` (4 lines)
- `src/WirdStrip.tsx:7`: `const what = wird.from === wird.to ? `البيت ${toArabicDigits(wird.from)}` : `الأبيات ${toArabicDigits(wird.from)}–${toArabicDigits(wird.to)}``
- `src/WirdStrip.tsx:10`: `<span>ورد اليوم: {what}</span>`
- `src/WirdStrip.tsx:12`: `<Play size={14} /> ابدأ`
- `src/WirdStrip.tsx:14`: `<button className="x" onClick={onHide} aria-label="إخفاء اليوم">`

## `src/appIcon.ts` (7 lines)
- `src/appIcon.ts:10`: `* The home-screen icons the user can pick in الإعدادات (iOS app only).`
- `src/appIcon.ts:15`: `{ name: 'AppIcon-GoldGreen', label: 'ذهبي على أخضر', preview: goldGreen },`
- `src/appIcon.ts:16`: `{ name: 'AppIcon-WhiteGreen', label: 'أبيض على أخضر', preview: whiteGreen },`
- `src/appIcon.ts:17`: `{ name: 'AppIcon-GreenCream', label: 'أخضر على عاجي', preview: greenCream },`
- `src/appIcon.ts:18`: `{ name: 'AppIcon-GoldBlack', label: 'ذهبي على أسود', preview: goldBlack },`
- `src/appIcon.ts:19`: `{ name: 'AppIcon-WhiteNavy', label: 'أبيض على كحلي', preview: whiteNavy },`
- `src/appIcon.ts:20`: `{ name: 'AppIcon-GreenWhite', label: 'أخضر على أبيض', preview: greenWhite },`

## `src/arabic.ts` (7 lines)
- `src/arabic.ts:2`: `const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g`
- `src/arabic.ts:8`: `.replace(/[أإآٱ]/g, 'ا')`
- `src/arabic.ts:9`: `.replace(/ى/g, 'ي')`
- `src/arabic.ts:10`: `.replace(/ة/g, 'ه')`
- `src/arabic.ts:11`: `.replace(/[^ء-ي\s0-9]/g, '')`
- `src/arabic.ts:16`: `const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'`
- `src/arabic.ts:22`: `s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))`

## `src/backup.ts` (4 lines)
- `src/backup.ts:1`: `// Backup and restore of everything the user creates on this device (الإعدادات ← النسخ الاحتياطي).`
- `src/backup.ts:60`: `throw new Error('الملف ليس نسخة احتياطية صالحة.')`
- `src/backup.ts:62`: `if (!isObject(raw) || raw.app !== 'shatibiyyah' || !isObject(raw.data)) throw new Error('الملف ليس نسخة احتياطية من هذا التطبيق.')`
- `src/backup.ts:63`: `if (raw.format !== 1) throw new Error('هذه النسخة من إصدار أحدث من التطبيق. حدّث التطبيق ثم أعد المحاولة.')`

## `src/colors.tsx` (25 lines)
- `src/colors.tsx:8`: `'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',`
- `src/colors.tsx:9`: `'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',`
- `src/colors.tsx:10`: `'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',`
- `src/colors.tsx:11`: `'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',`
- `src/colors.tsx:12`: `'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',`
- `src/colors.tsx:13`: `'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',`
- `src/colors.tsx:14`: `'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',`
- `src/colors.tsx:15`: `'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',`
- `src/colors.tsx:16`: `'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',`
- `src/colors.tsx:17`: `'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',`
- `src/colors.tsx:18`: `'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',`
- `src/colors.tsx:19`: `'المسد', 'الإخلاص', 'الفلق', 'الناس',`
- `src/colors.tsx:23`: `const HARAKAT = /[ً-ٰٟۖ-ۭ]/`
- `src/colors.tsx:25`: `/** Letters that join on both sides (ب ت ث ج ح خ س ش ص ض ط ظ ع غ ف ق ك ل م ن ه ي ى ئ and tatweel). */`
- `src/colors.tsx:26`: `const DUAL = /[ئبت-خس-غـ-هىيکگی]/`
- `src/colors.tsx:27`: `/** Letters that join only to the letter before them (ا أ إ آ ٱ ؤ ة د ذ ر ز و). */`
- `src/colors.tsx:28`: `const RIGHT = /[آ-إاةد-زوٱ]/`
- `src/colors.tsx:36`: `const KIND_LABEL ={ letter: 'رمز', group: 'رمز جماعي', word: 'رمز كلمة', name: 'اسم صريح' } as const`
- `src/colors.tsx:96`: `// stops joining the letters on either side of the cut (a red «ح» before «ُز» stood alone).`
- `src/colors.tsx:159`: `* How much of a verse to hide on this repetition when «إخفاء تدريجي» is on: nothing the first`
- `src/colors.tsx:208`: `// Green without a Quran place: letters of the باب (إدغام, مخارج الحروف), not a Quranic word.`
- `src/colors.tsx:209`: `const greenLabel = mark.q?.length ? 'كلمة قرآنية' : 'حرف'`
- `src/colors.tsx:215`: `aria-label={mark.k === 'r' ? 'رمز القارئ' : greenLabel}`
- `src/colors.tsx:221`: `{mark.k === 'g' ? greenLabel : code?.kind === 'letter' || code?.kind === 'group' ? `${KIND_LABEL[code.kind]} «${mark.c}»` : code ? KIND_LABEL[code.kind] : 'رمز'}`
- `src/colors.tsx:234`: `سورة {SURAHS[s - 1]} <span className="sep">·</span> الآية {toArabicDigits(a)}`

## `src/highlights.ts` (1 lines)
- `src/highlights.ts:21`: `/** The highlighted words, for the list in الفهرس. */`

## `src/kashida.ts` (15 lines)
- `src/kashida.ts:28`: `const TATWEEL = 'ـ'`
- `src/kashida.ts:29`: `const MARK = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]/`
- `src/kashida.ts:30`: `const DUAL = 'بتثجحخسشصضطظعغفقكلمنهيئ' // letters that join to the next letter`
- `src/kashida.ts:31`: `const LETTER = /[آ-غف-يٱ]/ // can be joined from the right (not ء, not ـ)`
- `src/kashida.ts:32`: `const ALEFS = 'اأإآٱ'`
- `src/kashida.ts:33`: `const GOD = /^[وفبتك]{0,2}[اٱ]?لله(?:م)?$/ // the word الله is never stretched`
- `src/kashida.ts:62`: `if (A === 'ل' && ALEFS.includes(B)) continue // لا is one shape`
- `src/kashida.ts:65`: `if ('سشصض'.includes(A)) score += 3`
- `src/kashida.ts:66`: `if ('ةهدذالكطظ'.includes(B)) score += 2`
- `src/kashida.ts:67`: `if (A === 'ل') score -= 4`
- `src/kashida.ts:68`: `if (A === 'ك') score -= 1`
- `src/kashida.ts:69`: `if ('رزو'.includes(B)) score -= 2`
- `src/kashida.ts:70`: `if ('يى'.includes(B)) score -= 1`
- `src/kashida.ts:71`: `if ('جحخ'.includes(B)) score -= 1`
- `src/kashida.ts:188`: `const tatweel = Math.max(0.05, measure('ب' + TATWEEL + 'ب') - measure('بب'))`

## `src/marks.ts` (1 lines)
- `src/marks.ts:5`: `export const DEFAULT_MARK_NAMES = ['مراجعة', 'مهم', 'سؤال', 'متشابه', 'علامة']`

## `src/offline.ts` (1 lines)
- `src/offline.ts:63`: `export const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} م.ب``

## `src/player.ts` (4 lines)
- `src/player.ts:79`: `private meta: (verse: number) => VerseMeta = () => ({ album: '', artist: 'متن الشاطبية' })`
- `src/player.ts:118`: `// The lead takes the larger share of the gap: a soft opening (a و) can begin before t.start.`
- `src/player.ts:249`: `reject(new Error(navigator.onLine ? 'تعذّر تحميل الملف الصوتي' : 'لا يوجد اتصال وهذه السورة غير منزّلة. نزّلها من زر ⤓'))`
- `src/player.ts:442`: `title: `البيت ${n.toLocaleString('ar-EG')}`,`

## `src/review.ts` (4 lines)
- `src/review.ts:1`: `// «مراجعة اليوم» and the test-yourself verse lists (IMPROVEMENTS-PLAN 3).`
- `src/review.ts:4`: `/** How many verses «مراجعة اليوم» offers. */`
- `src/review.ts:8`: `/** Verses marked «لم أتقنه» and not mastered since, the most missed first. */`
- `src/review.ts:18`: `* The app's own review list: the weak verses first, then the mastered verses whose last «أتقنته»`

## `src/screens.tsx` (76 lines)
- `src/screens.tsx:30`: `نسخة تجريبية: الأبيات {toArabicDigits(edition.partial.from)}–{toArabicDigits(edition.partial.to)} فقط`
- `src/screens.tsx:37`: `/** الفهرس: chapters plus the user's bookmarks, notes and mastered verses. */`
- `src/screens.tsx:53`: `/** Printed pages, for «الانتقال إلى صفحة»; null hides it. */`
- `src/screens.tsx:63`: `['sections', 'الأبواب'],`
- `src/screens.tsx:64`: `['bookmarks', 'العلامات', counts.bookmarks],`
- `src/screens.tsx:65`: `['notes', 'الملاحظات', counts.notes],`
- `src/screens.tsx:66`: `...(p.highlights.length ? [['highlights', 'التظليل', p.highlights.length] as [IndexView, string, number]] : []),`
- `src/screens.tsx:67`: `['mastered', 'المتقَن', counts.mastered],`
- `src/screens.tsx:72`: `<Screen title="الفهرس">`
- `src/screens.tsx:79`: `<small>تابع من حيث توقفت</small>`
- `src/screens.tsx:82`: `<span className="resume-n"> · البيت {toArabicDigits(resume.n)}</span>`
- `src/screens.tsx:112`: `{isHere && <span className="here">أنت هنا</span>}`
- `src/screens.tsx:115`: `الأبيات {toArabicDigits(s.start)}–{toArabicDigits(s.end)}`
- `src/screens.tsx:116`: `{done > 0 && ` · أتقنت ${toArabicDigits(done)} من ${toArabicDigits(ns.length)}`}`
- `src/screens.tsx:134`: `/** «الانتقال إلى صفحة»: a page number of the printed edition, in either kind of digits. */`
- `src/screens.tsx:157`: `<FileText size={16} className="pj-icon" /> الانتقال إلى صفحة من المطبوع`
- `src/screens.tsx:160`: `{bad ? 'لا توجد صفحة بهذا الرقم' : `من ${toArabicDigits(first)} إلى ${toArabicDigits(last)}`}`
- `src/screens.tsx:169`: `aria-label="رقم الصفحة"`
- `src/screens.tsx:177`: `انتقل`
- `src/screens.tsx:190`: `<span className={`mini-ring${full ? ' full' : ''}`} aria-label={`أتقنت ${toArabicDigits(Math.round(value * 100))}٪`}>`
- `src/screens.tsx:283`: `placeholder="عنوان (اختياري)"`
- `src/screens.tsx:290`: `<Empty icon={<Bookmark size={26} />}>لا توجد علامات بعد. اضغط على بيت في القراءة ثم «علامة».</Empty>`
- `src/screens.tsx:298`: `{p.sketched.includes(+n) && <small className="muted">رسم على البيت</small>}`
- `src/screens.tsx:302`: `<Empty icon={<NotebookPen size={26} />}>لا توجد ملاحظات بعد. اضغط على بيت ثم «ملاحظة».</Empty>`
- `src/screens.tsx:314`: `{p.bookNames.find((b) => b.id === h.book)?.name.split(' في ')[0] ?? h.book} · شرح البيت {toArabicDigits(h.n)}`
- `src/screens.tsx:322`: `{toArabicDigits(doneHere)} <small>من {toArabicDigits(total)}</small>`
- `src/screens.tsx:327`: `<span className="muted">أبيات علّمتها «أتقنته» في وضع «اختبر نفسك»</span>`
- `src/screens.tsx:329`: `{!done.length && <Empty icon={<GraduationCap size={26} />}>لم تُتقن أبياتًا بعد. افتح «وضع الحفظ» ثم «اختبر نفسك».</Empty>}`
- `src/screens.tsx:342`: `['auto', 'تلقائي'],`
- `src/screens.tsx:343`: `['light', 'فاتح'],`
- `src/screens.tsx:344`: `['sepia', 'ورقي'],`
- `src/screens.tsx:345`: `['dark', 'داكن'],`
- `src/screens.tsx:348`: `['amiri', 'أميري'],`
- `src/screens.tsx:349`: `['scheherazade', 'شهرزاد'],`
- `src/screens.tsx:350`: `['naskh', 'نسخ'],`
- `src/screens.tsx:358`: `<span>المظهر</span>`
- `src/screens.tsx:373`: `<span>خط الأبيات</span>`
- `src/screens.tsx:397`: `if (!offlineSupported()) return <p className="muted">هذا المتصفح لا يدعم التخزين دون اتصال.</p>`
- `src/screens.tsx:407`: `setErr(`تعذّر التنزيل: ${e instanceof Error ? e.message : e}`)`
- `src/screens.tsx:422`: `const titles = f.sectionIds.map((id) => edition.sections.find((s) => s.id === id)?.title ?? id).join('، ')`
- `src/screens.tsx:433`: `aria-label="حذف التنزيل"`
- `src/screens.tsx:443`: `<button className="icon-btn" aria-label="تنزيل" onClick={() => get(f.id)}>`
- `src/screens.tsx:453`: `<Download size={18} /> تنزيل الكل ({formatMB(missing.reduce((s, f) => s + f.bytes, 0))})`
- `src/screens.tsx:461`: `/** [«نسخة القاسم», «مع القراءة»]: the editor's family name, and whether a recitation exists. */`
- `src/screens.tsx:463`: `const who = e.name.replace(/^متن الشاطبية\s*—\s*/, '').trim().split(/\s+/).pop()`
- `src/screens.tsx:465`: `return [`نسخة ${who}`, audio ? 'مع القراءة' : 'نص فقط'] as const`
- `src/screens.tsx:474`: `ألوان الرموز والكلمات القرآنية`
- `src/screens.tsx:475`: `<small className="muted">اضغط على الكلمة الملوّنة لمعرفة القارئ أو موضعها من القرآن</small>`
- `src/screens.tsx:480`: `<span>الألوان في وضع الحفظ</span>`
- `src/screens.tsx:488`: `* Optional extras the user can switch off (الإعدادات ← مزايا إضافية).`
- `src/screens.tsx:492`: `['sketches', 'إظهار الرسوم على الأبيات', 'ما رسمته بيدك على الأبيات يظهر فوقها في صفحة القراءة'],`
- `src/screens.tsx:493`: `['immersive', 'إخفاء الأشرطة أثناء القراءة', 'تختفي عند النزول في الصفحة وتعود عند الصعود أو اللمس'],`
- `src/screens.tsx:494`: `['rail', 'شريط التنقل السريع', 'اسحبه على حافة الصفحة للانتقال في المتن كله'],`
- `src/screens.tsx:495`: `['backPill', 'زر الرجوع بعد الانتقال', 'يعيدك إلى موضعك بعد الانتقال من البحث أو الفهرس'],`
- `src/screens.tsx:496`: `['curtain', 'ستارة التسميع', 'زر عين في الأعلى يخفي الشطر الثاني من كل بيت لتسمّعه من حفظك'],`
- `src/screens.tsx:497`: `['twins', 'الأبيات المتشابهة الخواتيم', 'زر «متشابهات» للأبيات التي تنتهي بالكلمة نفسها'],`
- `src/screens.tsx:498`: `['wirdStrip', 'شريط ورد اليوم', 'سطر أعلى القراءة بورد اليوم من خطة الحفظ، يبدؤه بلمسة'],`
- `src/screens.tsx:499`: `['pageMarks', 'أرقام صفحات المطبوع', 'خط خفيف حيث تبدأ كل صفحة من الطبعة الورقية، والانتقال إلى صفحة من الفهرس'],`
- `src/screens.tsx:500`: `['sidePanel', 'اللوحة الجانبية على الشاشات الواسعة', 'تفاصيل البيت المختار بجانب النص: الرموز والكلمات القرآنية والملاحظة'],`
- `src/screens.tsx:503`: `/** الإعدادات ← أسماء العلامات: the user's own name for each of the five mark colours. */`
- `src/screens.tsx:507`: `<h2 className="group-title">أسماء العلامات</h2>`
- `src/screens.tsx:517`: `aria-label={`اسم العلامة ${toArabicDigits(slot + 1)}`}`
- `src/screens.tsx:542`: `<Screen title="الإعدادات">`
- `src/screens.tsx:543`: `<h2 className="group-title">النص</h2>`
- `src/screens.tsx:560`: `<span>القارئ</span>`
- `src/screens.tsx:572`: `<h2 className="group-title">العرض</h2>`
- `src/screens.tsx:576`: `المظهر والخط`
- `src/screens.tsx:577`: `<small className="muted">الألوان، الخط وحجمه، تباعد الأسطر وترتيب الشطرين، مع معاينة مباشرة</small>`
- `src/screens.tsx:582`: `<span>متابعة البيت المقروء</span>`
- `src/screens.tsx:589`: `<h2 className="group-title">مزايا إضافية</h2>`
- `src/screens.tsx:606`: `<h2 className="group-title">الاستماع دون اتصال</h2>`
- `src/screens.tsx:608`: `<p className="muted">التلاوة كاملةً مضمّنة في التطبيق، وتعمل دون اتصال.</p>`
- `src/screens.tsx:617`: `<h2 className="group-title">عن التطبيق</h2>`
- `src/screens.tsx:622`: `القارئ: {p.reciter.name} —{' '}`
- `src/screens.tsx:624`: `المصدر`
- `src/screens.tsx:629`: `<p className="muted">الإصدار {APP_VERSION}. الملاحظات والعلامات تُحفظ على هذا الجهاز فقط؛ احفظ نسخة احتياطية منها من الأعلى.</p>`

## `src/search.ts` (9 lines)
- `src/search.ts:2`: `// Same folding as `normalize` in arabic.ts, plus a word-final ى and ا are one letter`
- `src/search.ts:3`: `// (Zu'bi writes وانجلا where Al-Qasim writes وانجلى).`
- `src/search.ts:28`: `if ('\u0623\u0625\u0622\u0671'.includes(c)) c = 'ا' // أ إ آ ٱ`
- `src/search.ts:29`: `else if (c === 'ة') c = 'ه'`
- `src/search.ts:38`: `// ى is ا at the end of a word, ي elsewhere.`
- `src/search.ts:40`: `if (out[i] === 'ى') out[i] = i + 1 === out.length || out[i + 1] === ' ' ? 'ا' : 'ي'`
- `src/search.ts:48`: `* A matcher for the query, or null for an empty query. A word-final ي typed in the query`
- `src/search.ts:49`: `* also matches ا, since many keyboards give ي for ى.`
- `src/search.ts:56`: `return w.length > 1 && (w.endsWith('ي') || w.endsWith('ا')) ? `${e.slice(0, -1)}[اي]` : e`

## `src/sheets.tsx` (73 lines)
- `src/sheets.tsx:32`: `<button className="icon-btn" onClick={onClose} aria-label="إغلاق">`
- `src/sheets.tsx:97`: `<button className="icon-btn drawer-close" onClick={onClose} aria-label="إغلاق">`
- `src/sheets.tsx:141`: `البيت {toArabicDigits(p.n)} · {section?.title}`
- `src/sheets.tsx:152`: `<span><Play size={22} /></span>تشغيل من هنا`
- `src/sheets.tsx:155`: `<span><Repeat size={22} /></span>تكرار مفصّل`
- `src/sheets.tsx:161`: `{p.bookmarked ? 'إزالة العلامة' : 'علامة'}`
- `src/sheets.tsx:164`: `<span><Pencil size={22} /></span>ملاحظة`
- `src/sheets.tsx:167`: `<span><GraduationCap size={22} /></span>وضع الحفظ`
- `src/sheets.tsx:171`: `<div className="presets" role="group" aria-label="تكرار البيت">`
- `src/sheets.tsx:172`: `<span>كرّر البيت</span>`
- `src/sheets.tsx:181`: `<Flag size={15} /> إبلاغ عن خطأ في النص أو التوقيت`
- `src/sheets.tsx:189`: `<Sheet title={`ملاحظة على البيت ${toArabicDigits(p.n)}`} onClose={p.onClose}>`
- `src/sheets.tsx:194`: `placeholder="اكتب ملاحظتك… تُحفظ على هذا الجهاز فقط."`
- `src/sheets.tsx:204`: `<p className="muted">تُحفظ تلقائيًا، وتظهر في كل النسخ لأنها مرتبطة برقم البيت.</p>`
- `src/sheets.tsx:209`: `const FLAG_TYPES = { timing: 'توقيت القراءة غير صحيح', text: 'النص يختلف عن المطبوع', other: 'مشكلة أخرى' }`
- `src/sheets.tsx:220`: `'بلاغ من تطبيق متن الشاطبية',`
- `src/sheets.tsx:221`: ``النوع: ${FLAG_TYPES[type]}`,`
- `src/sheets.tsx:222`: ``النسخة: ${p.edition.name}`,`
- `src/sheets.tsx:223`: ``القارئ: ${p.reciter?.name ?? '—'}`,`
- `src/sheets.tsx:224`: ``الباب: ${section?.title ?? '—'}`,`
- `src/sheets.tsx:225`: ``البيت: ${p.n}`,`
- `src/sheets.tsx:226`: ``النص: ${v?.a} ... ${v?.b}`,`
- `src/sheets.tsx:227`: `timing ? `التوقيت: ${timing.file} ${timing.start.toFixed(2)}–${timing.end.toFixed(2)}` : '',`
- `src/sheets.tsx:228`: `comment.trim() ? `الملاحظة: ${comment.trim()}` : '',`
- `src/sheets.tsx:229`: ``الإصدار: ${APP_VERSION}`,`
- `src/sheets.tsx:233`: `const subject = `بلاغ: البيت ${p.n} — ${FLAG_TYPES[type]}``
- `src/sheets.tsx:236`: `<Sheet title={`الإبلاغ عن مشكلة في البيت ${toArabicDigits(p.n)}`} onClose={p.onClose}>`
- `src/sheets.tsx:247`: `<textarea rows={3} placeholder="وصف المشكلة (اختياري)" value={comment} onChange={(e) => setComment(e.target.value)} />`
- `src/sheets.tsx:251`: `إرسال عبر واتساب`
- `src/sheets.tsx:256`: `إرسال بالبريد`
- `src/sheets.tsx:268`: `{copied ? 'نُسخ ✓' : 'نسخ نص البلاغ'}`
- `src/sheets.tsx:271`: `{!OWNER_WHATSAPP && !OWNER_EMAIL && <p className="muted">لم يُضبط رقم واتساب أو بريد المسؤول بعد؛ يمكنك نسخ البلاغ وإرساله يدويًا.</p>}`
- `src/sheets.tsx:277`: `export const VERSES: Forms = { one: 'بيت واحد', two: 'بيتان', few: 'أبيات', many: 'بيتًا', base: 'بيت' }`
- `src/sheets.tsx:278`: `const TIMES: Forms = { one: 'مرة واحدة', two: 'مرتان', few: 'مرات', many: 'مرة', base: 'مرة' }`
- `src/sheets.tsx:279`: `const ROUNDS: Forms = { one: 'جولة واحدة', two: 'جولتان', few: 'جولات', many: 'جولة', base: 'جولة' }`
- `src/sheets.tsx:280`: `const MINUTES: Forms = { one: 'دقيقة', two: 'دقيقتان', few: 'دقائق', many: 'دقيقة', base: 'دقيقة' }`
- `src/sheets.tsx:281`: `const HOURS: Forms = { one: 'ساعة', two: 'ساعتان', few: 'ساعات', many: 'ساعة', base: 'ساعة' }`
- `src/sheets.tsx:283`: `/** Arabic counted noun: «بيت واحد», «بيتان», «٥ أبيات», «١٥ بيتًا», «١٠٠ بيت». */`
- `src/sheets.tsx:295`: `if (sec < 50) return `${toArabicDigits(Math.max(5, Math.round(sec / 5) * 5))} ثانية``
- `src/sheets.tsx:301`: `return m ? `${hs} و${m <= 2 ? MINUTES[m === 1 ? 'one' : 'two'] : plural(m, MINUTES)}` : hs`
- `src/sheets.tsx:304`: `/** «٥ أبيات × ٣ = ١٥ مرة · نحو ٤ دقائق», mirroring how the player walks the queue. */`
- `src/sheets.tsx:307`: `if (!queue.length) return 'لا توجد قراءة لهذه الأبيات.'`
- `src/sheets.tsx:322`: `if (single) text = endless ? 'البيت' : `البيت ${plural(v, TIMES)}``
- `src/sheets.tsx:323`: `else if (cumulative) text = `${plural(queue.length, VERSES)} تراكميًّا = ${plural(plays, TIMES)}``
- `src/sheets.tsx:327`: `if (rounds !== 1) parts.push(rounds === 0 ? '∞ جولات' : plural(rounds, ROUNDS))`
- `src/sheets.tsx:331`: `if (endless) return `${text} · يتكرر حتى تُوقفه``
- `src/sheets.tsx:335`: `text += ` · نحو ${duration(r.echo ? heard * 2 : heard + (plays - 1) * r.pause)}``
- `src/sheets.tsx:347`: `<button disabled={endless || value <= 1} onClick={() => onChange(value - 1)} aria-label="أقل">−</button>`
- `src/sheets.tsx:349`: `<button disabled={endless} onClick={() => onChange(value + 1)} aria-label="أكثر">+</button>`
- `src/sheets.tsx:429`: `...(here ? ([['هذا الباب', here.start, here.end], ['من هنا إلى آخر الباب', anchor, here.end]] as [string, number, number][]) : []),`
- `src/sheets.tsx:430`: `...(p.wird ? ([['ورد اليوم', p.wird.from, p.wird.to]] as [string, number, number][]) : []),`
- `src/sheets.tsx:435`: `<Sheet title="التكرار" onClose={p.onClose}>`
- `src/sheets.tsx:439`: `['verse', `البيت ${toArabicDigits(anchor)}`],`
- `src/sheets.tsx:440`: `['range', 'نطاق'],`
- `src/sheets.tsx:441`: `['section', 'باب'],`
- `src/sheets.tsx:442`: `['all', 'الكل'],`
- `src/sheets.tsx:452`: `<div className="chips range-chips" role="group" aria-label="اختيارات سريعة">`
- `src/sheets.tsx:460`: `<VerseField label="من البيت" value={r.from} words={firstWords(p.edition, clamp(r.from))} onChange={(n) => set({ from: n })} onBlur={() => set({ from: clamp(r.from) })} />`
- `src/sheets.tsx:461`: `<VerseField label="إلى البيت" value={r.to} words={firstWords(p.edition, clamp(r.to))} onChange={(n) => set({ to: n })} onBlur={() => set({ to: clamp(r.to) })} />`
- `src/sheets.tsx:464`: `<TextSelect size={18} /> تحديد من النص`
- `src/sheets.tsx:483`: `تكرار تراكمي`
- `src/sheets.tsx:484`: `<small className="muted">البيت الأول، ثم الثاني، ثم الاثنان معًا، ثم الثالث، ثم الثلاثة معًا… وهكذا</small>`
- `src/sheets.tsx:491`: `<Count label={cumulative ? 'تكرار كل بيت جديد' : 'تكرار كل بيت'} value={r.verseTimes} onChange={(v) => set({ verseTimes: v })} finite={cumulative} />`
- `src/sheets.tsx:494`: `label={cumulative ? 'تكرار الأبيات مجتمعة' : 'تكرار النطاق كله'}`
- `src/sheets.tsx:503`: `<span>المهلة بعد كل مرة</span>`
- `src/sheets.tsx:506`: `ثوانٍ محدّدة`
- `src/sheets.tsx:509`: `بطول البيت`
- `src/sheets.tsx:514`: `<p className="field-note">بعد كل مرة يسكت القارئ مدّة البيت نفسه، لتردّده بصوتك.</p>`
- `src/sheets.tsx:517`: `<span>مدّة المهلة</span>`
- `src/sheets.tsx:520`: `<output>{toArabicDigits(r.pause)} ث</output>`
- `src/sheets.tsx:526`: `إخفاء تدريجي`
- `src/sheets.tsx:527`: `<small className="muted">يظهر البيت كاملًا أول مرة، ثم تختفي كلماته شيئًا فشيئًا مع التكرار</small>`
- `src/sheets.tsx:544`: `<Play size={18} /> ابدأ`

## `src/slips.ts` (6 lines)
- `src/slips.ts:1`: `// Listener mode (التسميع على مستمع): slip types, sessions, and the marks they leave on the text.`
- `src/slips.ts:27`: `/** Its marks are drawn in the reader («مسح العلامات» turns this off, the session stays in the history). */`
- `src/slips.ts:39`: `{ id: 'letter', name: 'خطأ حرفي', color: '#d64545' },`
- `src/slips.ts:40`: `{ id: 'vowel', name: 'خطأ تشكيل', color: '#e0a800' },`
- `src/slips.ts:41`: `{ id: 'stop', name: 'توقّف', color: '#3b82c4' },`
- `src/slips.ts:46`: `export const GONE_TYPE: SlipType = { id: '', name: 'نوع محذوف', color: '#8a8780' }`

## `src/store.ts` (3 lines)
- `src/store.ts:68`: `// Optional extras (الإعدادات ← مزايا إضافية)`
- `src/store.ts:71`: `backPill: boolean // «رجوع» after a jump`
- `src/store.ts:100`: `/** Verses the user marked «لم أتقنه»: how many times, and when last (ms since epoch). */`

## `src/twins.ts` (1 lines)
- `src/twins.ts:2`: `// Uses the search folding, so marks, tatweel and punctuation are ignored and a final ى is ا.`

## `src/types.ts` (1 lines)
- `src/types.ts:126`: `w?: string // green: the whole Quran word or phrase when the colour splits it («ٱلۡـ / ـقِتَالُ»)`

