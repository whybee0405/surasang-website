import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch {} },
}
window.__motion = true

/* ---------- smooth scroll ---------- */
let lenis = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToEl = (el, offset = 0) => {
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ block: 'start' })
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href').slice(1)
  const target = id === 'top' ? document.body : document.getElementById(id)
  if (!target) return
  e.preventDefault()
  closeSheet()
  scrollToEl(target, id === 'top' ? 0 : -8)
  history.replaceState(null, '', `#${id}`)
})

/* ---------- announcement ---------- */
const notice = $('[data-notice]')
if (notice) {
  const key = 'surasang-notice:' + notice.textContent.trim().slice(0, 40)
  if (store.get(key)) notice.hidden = true
  $('[data-notice-close]', notice)?.addEventListener('click', () => {
    notice.hidden = true
    store.set(key, '1')
    nav.style.setProperty('--notice-offset', '0px')
    ScrollTrigger.refresh()
  })
}

/* ---------- nav ---------- */
const nav = $('[data-nav]')
const hero = $('[data-hero]')
// The nav sits under the announcement until the announcement scrolls away.
const noticeHeight = () => (notice && !notice.hidden ? notice.offsetHeight : 0)
const placeNav = (y) => nav.style.setProperty('--notice-offset', `${Math.max(0, noticeHeight() - y)}px`)
placeNav(scrollY)
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate(self) {
    const y = self.scroll()
    placeNav(y)
    const pastHero = y > (hero?.offsetHeight ?? 600) * 0.6
    nav.classList.toggle('is-solid', y > 40)
    const hide = pastHero && self.direction === 1 && !sheet?.classList.contains('is-open')
    nav.classList.toggle('is-hidden', hide)
    document.body.classList.toggle('nav-shown', !hide && pastHero)
  },
})
$$('[data-navlink]').forEach((link) => {
  const section = document.getElementById(link.dataset.navlink)
  if (!section) return
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle: ({ isActive }) => link.setAttribute('aria-current', String(isActive)),
  })
})

/* ---------- mobile sheet ---------- */
const sheet = $('#sheet')
const sheetBtn = $('[data-sheet-toggle]')
function closeSheet() {
  if (!sheet?.classList.contains('is-open')) return
  sheet.classList.remove('is-open')
  document.body.classList.remove('sheet-open')
  sheetBtn.setAttribute('aria-expanded', 'false')
  lenis?.start()
}
sheetBtn?.addEventListener('click', () => {
  const open = !sheet.classList.contains('is-open')
  sheet.classList.toggle('is-open', open)
  document.body.classList.toggle('sheet-open', open)
  sheetBtn.setAttribute('aria-expanded', String(open))
  open ? lenis?.stop() : lenis?.start()
})

/* ---------- hero ---------- */
if (!reduce) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.from('[data-hero-media] img', { scale: 1.12, filter: 'brightness(0.3)', duration: 2.2 }, 0)
    .from('[data-hero-title] .wd > span', { yPercent: 110, duration: 1.3, stagger: 0.06 }, 0.25)
    .from('[data-hero-fade]', { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, 0.7)
    .from('.hero__seal', { opacity: 0, y: -20, duration: 1.4 }, 0.5)

  // Leaning over the grill: the photo pushes in and darkens as the page leaves it.
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to('[data-hero-media] img', { scale: 1.14, yPercent: 8, ease: 'none' }, 0)
    .to('.hero__body', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
    .to('.hero__seal', { yPercent: -40, ease: 'none' }, 0)
}

// Sparks off the coals. Only runs while the hero is on screen.
const canvas = $('[data-embers]')
if (canvas && !reduce) {
  const ctx = canvas.getContext('2d')
  let w, h, dpr, sparks = [], running = false
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2)
    w = canvas.clientWidth; h = canvas.clientHeight
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  const spawn = () => ({
    x: w * (0.3 + Math.random() * 0.36), y: h * (0.5 + Math.random() * 0.3),
    vx: (Math.random() - 0.5) * 0.35, vy: -(0.35 + Math.random() * 0.9),
    r: 0.6 + Math.random() * 1.6, life: 0, max: 140 + Math.random() * 200,
    hue: 22 + Math.random() * 22,
  })
  const count = () => (w < 700 ? 26 : 54)
  const frame = () => {
    if (!running) return
    ctx.clearRect(0, 0, w, h)
    while (sparks.length < count()) sparks.push(spawn())
    for (const p of sparks) {
      p.life++
      p.vx += (Math.random() - 0.5) * 0.04
      p.x += p.vx; p.y += p.vy
      const t = p.life / p.max
      const a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
      ctx.beginPath()
      ctx.fillStyle = `hsla(${p.hue}, 95%, ${60 + Math.random() * 10}%, ${Math.max(a, 0) * 0.85})`
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    sparks = sparks.filter((p) => p.life < p.max && p.y > -10)
    requestAnimationFrame(frame)
  }
  size()
  addEventListener('resize', size)
  new IntersectionObserver(([e]) => {
    const was = running
    running = e.isIntersecting && !document.hidden
    if (running && !was) requestAnimationFrame(frame)
  }).observe(canvas)
}

/* ---------- reveals ---------- */
if (!reduce) {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07, overwrite: true }),
  })
  $$('[data-clip]').forEach((el) => {
    gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
  })
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
  $$('[data-glyph]').forEach((g) => {
    gsap.fromTo(g, { yPercent: 25 }, { yPercent: -35, ease: 'none', scrollTrigger: { trigger: g.closest('.chapter'), start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  // Price leaders draw in as each list arrives, like a pen across the page.
  ScrollTrigger.batch('.dish', {
    start: 'top 92%', once: true,
    onEnter: (els) => {
      gsap.from(els, { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out', stagger: 0.035 })
      gsap.from(els.map((e) => $('.dish__leader', e)).filter(Boolean), { scaleX: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.1 })
    },
  })
  ScrollTrigger.batch('[data-slip]', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.from(els, { y: 80, rotate: (i) => (i % 2 ? 8 : -8), opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }),
  })
  $$('[data-float]').forEach((el, i) => {
    gsap.to(el, { y: -10, rotate: i % 2 ? 4 : -4, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  })
  const word = $('[data-footer-word]')
  if (word) gsap.from(word.children, { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: word, start: 'top 95%', once: true } })
}

/* ---------- story: words light up as you read ---------- */
const words = $('[data-words]')
if (words && !reduce) {
  words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ')
  const spans = $$('.w', words)
  ScrollTrigger.create({
    trigger: words, start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: ({ progress }) => {
      const n = Math.round(progress * spans.length)
      spans.forEach((s, i) => s.classList.toggle('is-lit', i < n))
    },
  })
}
// Hotspots: hover on desktop, tap on touch. One open at a time.
const spots = $$('.spot')
spots.forEach((spot) => {
  spot.addEventListener('click', () => {
    const open = spot.getAttribute('aria-expanded') !== 'true'
    spots.forEach((s) => s.setAttribute('aria-expanded', 'false'))
    spot.setAttribute('aria-expanded', String(open))
  })
})
document.addEventListener('click', (e) => { if (!e.target.closest('.spot')) spots.forEach((s) => s.setAttribute('aria-expanded', 'false')) })
if (!reduce && spots.length) {
  gsap.from(spots, { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.05, scrollTrigger: { trigger: '.table', start: 'top 55%', once: true } })
}

/* ---------- menu index ---------- */
const menu = $('[data-menu]')
const rail = $('[data-rail]')
const mark = $('[data-rail-mark]')
const chapters = $$('[data-chapter]')
const railLinks = $$('[data-rail] [data-chapter-link]')
const tabLinks = $$('[data-menubar-tabs] [data-chapter-link]')

ScrollTrigger.create({
  trigger: menu, start: 'top 60%', end: 'bottom 40%',
  onToggle: ({ isActive }) => rail?.classList.toggle('is-on', isActive),
})
function setActive(slug) {
  for (const a of [...railLinks, ...tabLinks]) a.setAttribute('aria-current', String(a.dataset.chapterLink === slug))
  const link = railLinks.find((a) => a.dataset.chapterLink === slug)
  if (link && mark) {
    mark.style.transform = `translateY(${link.parentElement.offsetTop}px)`
    mark.style.height = `${link.offsetHeight}px`
  }
  const tab = tabLinks.find((a) => a.dataset.chapterLink === slug)
  if (tab) tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' })
}
chapters.forEach((ch) => {
  ScrollTrigger.create({
    trigger: ch, start: 'top 45%', end: 'bottom 45%',
    onToggle: ({ isActive }) => isActive && setActive(ch.dataset.chapter),
  })
})
const pochaEl = $('[data-pocha]')
if (pochaEl) {
  ScrollTrigger.create({
    trigger: pochaEl, start: 'top 40%', end: 'bottom 40%',
    onToggle: ({ isActive }) => document.body.classList.toggle('is-pocha', isActive),
  })
}

/* ---------- Pocha: the tent flaps open ---------- */
const tent = $('[data-tent]')
if (tent) ScrollTrigger.create({ trigger: tent, start: 'top 70%', end: 'bottom 30%', onToggle: ({ isActive }) => rail?.classList.toggle('is-muted', isActive) })
if (tent && !reduce) {
  gsap.timeline({ scrollTrigger: { trigger: tent, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1 } })
    .to('[data-flap="l"]', { xPercent: -100, ease: 'power2.inOut' }, 0)
    .to('[data-flap="r"]', { xPercent: 100, ease: 'power2.inOut' }, 0)
    .fromTo('.tent__img img', { scale: 1.25 }, { scale: 1, ease: 'power2.out' }, 0)
    .from('[data-tent-copy] > *', { y: 60, opacity: 0, stagger: 0.08, ease: 'power2.out' }, 0.35)
} else if (tent) {
  $$('[data-flap]').forEach((f) => (f.style.display = 'none'))
}

/* ---------- Pocha: pan through the sharing dishes ---------- */
const track = $('[data-share-track]')
const mm = gsap.matchMedia()
if (track) {
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth)
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: $('[data-share]'), start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      },
    })
    return () => tween.kill()
  })
  mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => {
    track.setAttribute('data-native', '')
    return () => track.removeAttribute('data-native')
  })
}

/* ---------- find a dish ---------- */
const finder = $('[data-finder]')
const panel = $('[data-menubar-panel]')
const findBtn = $('[data-menubar-find]')
const findInput = $('[data-find]')
const count = $('[data-find-count]')
const empty = $('[data-empty]')
const allDishes = $$('[data-dish]')
const activeTags = new Set()
allDishes.forEach((d) => { const n = $('[data-name]', d); if (n) n.dataset.text = n.textContent })

// The one finder lives in the rail on desktop and in the menubar panel on small screens.
const desk = matchMedia('(min-width: 1100px)')
const placeFinder = () => {
  if (!finder) return
  if (desk.matches) $('[data-rail]').insertBefore(finder, $('.rail__foot'))
  else panel.appendChild(finder)
}
placeFinder()
desk.addEventListener('change', placeFinder)
findBtn?.addEventListener('click', () => {
  const open = panel.hidden
  panel.hidden = !open
  findBtn.setAttribute('aria-expanded', String(open))
  if (open) findInput.focus()
  ScrollTrigger.refresh()
})

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
function applyFilter() {
  const q = findInput.value.trim().toLowerCase()
  const filtering = q || activeTags.size
  let shown = 0
  for (const d of allDishes) {
    const tags = (d.dataset.tags || '').split(' ')
    const ok = (!q || d.dataset.search.includes(q)) && [...activeTags].every((t) => tags.includes(t))
    d.hidden = !ok
    if (ok) shown++
    const n = $('[data-name]', d)
    if (n) {
      const text = n.dataset.text
      const i = q ? text.toLowerCase().indexOf(q) : -1
      n.innerHTML = i < 0 ? escapeHtml(text) : `${escapeHtml(text.slice(0, i))}<mark>${escapeHtml(text.slice(i, i + q.length))}</mark>${escapeHtml(text.slice(i + q.length))}`
    }
  }
  $$('[data-group]').forEach((g) => { g.hidden = !$$('[data-dish]', g).some((d) => !d.hidden) })
  for (const ch of chapters) {
    const any = $$('[data-dish]', ch).some((d) => !d.hidden)
    ch.hidden = !any
    for (const a of [...railLinks, ...tabLinks]) if (a.dataset.chapterLink === ch.dataset.chapter) a.classList.toggle('is-empty', !any)
  }
  // Keep Pocha's tent when Pocha dishes match; hide it otherwise.
  if (tent) tent.hidden = filtering && !$$('[data-pocha] [data-dish]').some((d) => !d.hidden)
  empty.hidden = shown > 0
  count.textContent = filtering ? (shown === 1 ? '1 dish' : `${shown} dishes`) : ''
  ScrollTrigger.refresh()
}
let typing
findInput?.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(applyFilter, 120) })
findInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); const first = chapters.find((c) => !c.hidden); scrollToEl(first, -8) }
  if (e.key === 'Escape') { findInput.value = ''; applyFilter() }
})
$$('[data-tag]').forEach((chip) => chip.addEventListener('click', () => {
  const on = chip.getAttribute('aria-pressed') !== 'true'
  chip.setAttribute('aria-pressed', String(on))
  on ? activeTags.add(chip.dataset.tag) : activeTags.delete(chip.dataset.tag)
  applyFilter()
}))
$('[data-find-clear]')?.addEventListener('click', () => {
  findInput.value = ''
  activeTags.clear()
  $$('[data-tag]').forEach((c) => c.setAttribute('aria-pressed', 'false'))
  applyFilter()
})

/* ---------- hot pot builder ---------- */
const pot = $('[data-pot]')
if (pot) {
  const setPrice = Number(pot.dataset.setPrice)
  const total = $('[data-pot-total]', pot)
  let shownTotal = setPrice * 2
  const recalc = () => {
    const people = Number($('[data-qty="people"]', pot).textContent)
    const broth = Number($('input[name="broth"]:checked', pot)?.value || 0)
    const extras = $$('output[data-qty]', pot)
      .filter((o) => o.dataset.qty !== 'people')
      .reduce((sum, o) => sum + Number(o.textContent) * Number(o.dataset.price), 0)
    const next = people * setPrice + broth + extras
    const counter = { v: shownTotal }
    gsap.to(counter, {
      v: next, duration: reduce ? 0 : 0.5, ease: 'expo.out',
      onUpdate: () => (total.textContent = `R${Math.round(counter.v).toLocaleString('en-ZA')}`),
    })
    shownTotal = next
  }
  $$('[data-stepper]', pot).forEach((st) => {
    const out = $('output', st)
    const [minus, plus] = $$('button', st)
    const min = Number(st.dataset.min), max = Number(st.dataset.max)
    const sync = (v) => { out.textContent = v; minus.disabled = v <= min; plus.disabled = v >= max }
    sync(Number(out.textContent))
    st.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]')
      if (!b) return
      sync(Math.min(max, Math.max(min, Number(out.textContent) + Number(b.dataset.step))))
      recalc()
    })
  })
  pot.addEventListener('change', recalc)
}

/* ---------- branch photo that follows the cursor ---------- */
const peek = $('[data-peek]')
if (peek && finePointer && !reduce) {
  const img = $('img', peek)
  const xTo = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'expo.out' })
  const yTo = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'expo.out' })
  $$('[data-branch]').forEach((row) => {
    row.addEventListener('pointerenter', () => { if (row.dataset.image) { img.src = row.dataset.image; peek.classList.add('is-on') } })
    row.addEventListener('pointerleave', () => peek.classList.remove('is-on'))
    row.addEventListener('pointermove', (e) => { xTo(e.clientX + 24); yTo(e.clientY - 120) })
  })
}

/* ---------- floating dock ---------- */
const dock = $('[data-dock]')
if (dock) {
  // The cover has its own Reserve button, so the dock waits until the cover is mostly gone.
  ScrollTrigger.create({
    trigger: hero, start: 'bottom 60%', end: 'max',
    onToggle: ({ isActive }) => { dock.classList.toggle('is-on', isActive); if (!isActive) closePops() },
  })
  const toggles = $$('[data-dock-toggle]', dock)
  function closePops(except) {
    for (const t of toggles) {
      if (t === except) continue
      t.setAttribute('aria-expanded', 'false')
      document.getElementById(t.getAttribute('aria-controls')).hidden = true
    }
  }
  toggles.forEach((t) => t.addEventListener('click', () => {
    const pop = document.getElementById(t.getAttribute('aria-controls'))
    const open = pop.hidden
    closePops(t)
    pop.hidden = !open
    t.setAttribute('aria-expanded', String(open))
    if (open) requestAnimationFrame(() => $('a', pop)?.focus({ preventScroll: true }))
  }))
  document.addEventListener('click', (e) => { if (!e.target.closest('.dock__item')) closePops() })
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    const open = toggles.find((t) => t.getAttribute('aria-expanded') === 'true')
    if (open) { closePops(); open.focus() }
  })
  dock.addEventListener('click', (e) => { if (e.target.closest('[data-pop] a')) closePops() })
}

/* ---------- reservations drawer ---------- */
const drawer = $('[data-drawer]')
const frame = $('[data-dineplan]', drawer)
const tabs = $$('[data-tab]', drawer)
const phoneLink = $('[data-drawer-phone]', drawer)
let lastFocus = null
function selectTab(slug) {
  const tab = tabs.find((t) => t.dataset.tab === slug) || tabs[0]
  if (!tab) return
  tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)))
  const src = `https://account.dineplan.com/widgetframe/${tab.dataset.key}`
  if (frame.src !== src) frame.src = src
  phoneLink.textContent = tab.dataset.phone
  phoneLink.href = 'tel:' + tab.dataset.phone.replace(/[^+\d]/g, '')
}
function openDrawer(slug) {
  lastFocus = document.activeElement
  selectTab(slug)
  drawer.classList.add('is-open')
  drawer.setAttribute('aria-hidden', 'false')
  document.body.classList.add('drawer-open')
  lenis?.stop()
  setTimeout(() => $('.drawer__close', drawer).focus(), 50)
}
function closeDrawer() {
  if (!drawer.classList.contains('is-open')) return
  drawer.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('drawer-open')
  lenis?.start()
  lastFocus?.focus()
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-reserve]')
  if (btn) { closeSheet(); openDrawer(btn.dataset.reserve || '') }
  if (e.target.closest('[data-drawer-close]')) closeDrawer()
})
tabs.forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)))
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeDrawer(); closeSheet() }
  if (e.key === 'Tab' && drawer.classList.contains('is-open')) {
    const f = $$('button, a[href], iframe', $('.drawer__panel', drawer)).filter((el) => el.offsetParent)
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
})

/* ---------- contact form → CloudIA form collection ---------- */
const form = $('[data-form]')
if (form) {
  const status = $('[data-form-status]', form)
  const submit = $('button[type="submit"]', form)
  const say = (state, text) => { status.dataset.state = state; status.textContent = text }
  const rules = {
    name: (v) => (v.trim() ? '' : 'Please tell us your name.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'That email address doesn’t look right.'),
    message: (v) => (v.trim().length >= 5 ? '' : 'Please write a little more.'),
  }
  const check = (name) => {
    const field = form.elements[name]
    const msg = rules[name](field.value)
    field.setAttribute('aria-invalid', String(Boolean(msg)))
    $(`#e-${name}`, form).textContent = msg
    return !msg
  }
  Object.keys(rules).forEach((n) => form.elements[n].addEventListener('blur', () => form.elements[n].value && check(n)))
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const valid = Object.keys(rules).map(check).every(Boolean)
    if (!valid) { form.querySelector('[aria-invalid="true"]')?.focus(); return }
    const body = Object.fromEntries(new FormData(form))
    submit.setAttribute('aria-busy', 'true')
    say('sending', 'Sending…')
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(window.cloudia?.enquiryHeaders?.() ?? {}) },
        body: JSON.stringify(body),
      })
      if (res.status === 429) throw new Error('Too many messages from this connection. Try again in a few minutes.')
      if (!res.ok) throw new Error('We couldn’t send that. Please try again, or call the restaurant.')
      form.reset()
      say('sent', 'Thank you. Your message is with the team.')
    } catch (err) {
      say('error', err instanceof TypeError ? 'No connection. Check your internet and try again.' : err.message)
    } finally {
      submit.removeAttribute('aria-busy')
    }
  })
}

/* ---------- arrive at a #hash ---------- */
addEventListener('load', () => {
  ScrollTrigger.refresh()
  const id = location.hash.slice(1)
  if (id && document.getElementById(id)) setTimeout(() => scrollToEl(document.getElementById(id), -8), 100)
})
