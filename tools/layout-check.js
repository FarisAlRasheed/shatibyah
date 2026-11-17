// Layout check before a release (RENDER-PLAN.md §6): every half-line, every verse font, phone /
// tablet / desktop widths, at the default and the largest size. Run `npm run dev`, open the app,
// paste this file into the browser console, then read `__layout` when `__layoutDone` is true.
// Each row must say overflow=0 offscreen=0 sideScroll=0. `squeezed` counts halves the
// after-layout check had to squeeze (Reader.tsx fitHalves); once fonts are loaded it should be 0.
// The settings are put back as they were at the end.
;(async () => {
  const saved = localStorage['shatibiyyah:settings'] ?? '{}'
  window.__layout = []
  window.__layoutDone = false
  const run = async (w, font, size) => {
    const s = JSON.parse(saved)
    Object.assign(s, { font, fontSize: size })
    localStorage['shatibiyyah:settings'] = JSON.stringify(s)
    const f = document.createElement('iframe')
    f.style.cssText = `position:fixed;top:0;left:0;width:${w}px;height:900px;border:0;opacity:0.01;pointer-events:none;z-index:-1`
    f.src = '/?layout-check=' + Math.random()
    document.body.appendChild(f)
    await new Promise((r) => (f.onload = r))
    localStorage['shatibiyyah:settings'] = saved
    const d = f.contentDocument
    let m
    for (let i = 0; i < 150 && !(m = d.querySelector('main.reader[data-even="1"]')); i++) await new Promise((r) => setTimeout(r, 200))
    await d.fonts.ready
    await new Promise((r) => setTimeout(r, 5000))
    const W = d.documentElement.clientWidth
    const halves = [...d.querySelectorAll('main.reader .half')]
    const range = d.createRange()
    const over = halves.filter((h) => {
      range.selectNodeContents(h)
      return range.getBoundingClientRect().width > h.getBoundingClientRect().width + 0.5
    })
    const off = halves.filter((h) => {
      const r = h.getBoundingClientRect()
      return r.left < -1 || r.right > W + 1
    })
    const squeezed = halves.filter((h) => h.style.getPropertyValue('--fix')).length
    const row = `${font} ${w}px ${m?.style.getPropertyValue('--verse-size')} ${m?.dataset.layout}: halves=${halves.length} overflow=${over.length} offscreen=${off.length} squeezed=${squeezed} sideScroll=${d.documentElement.scrollWidth - W}`
    const ids = over.concat(off).slice(0, 5).map((h) => h.closest('.verse')?.id + h.classList[1])
    f.remove()
    return ids.length ? `${row}  e.g. ${ids.join(' ')}` : row
  }
  try {
    for (const font of ['amiri', 'scheherazade', 'naskh'])
      for (const w of [402, 628, 1000]) for (const size of [22, 56]) window.__layout.push(await run(w, font, size))
  } finally {
    localStorage['shatibiyyah:settings'] = saved
    window.__layoutDone = true
    console.log(window.__layout.join('\n'))
  }
})()
