// Build-time content loader.
//
// With CLOUDIA_URL and CLOUDIA_READ_KEY set, content comes from the CloudIA native API
// (/api/public/v1/sites/:site/...). Without them, or when the CMS can't be reached and
// CLOUDIA_STRICT is not set, the seed in src/data/seed.js is used so the site still builds.
// The read key never reaches the browser: Astro runs this at build time only.
import * as seed from '../data/seed.js'

// Container variables come through process.env; .env files through import.meta.env.
const env = { ...(globalThis.process?.env ?? {}), ...import.meta.env }
const BASE = (env.CLOUDIA_URL || '').replace(/\/$/, '')
const SITE = env.CLOUDIA_SITE || 'surasang'
const KEY = env.CLOUDIA_READ_KEY
const STRICT = env.CLOUDIA_STRICT === '1'

async function get(path) {
  const res = await fetch(`${BASE}/api/public/v1/sites/${encodeURIComponent(SITE)}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${KEY}` },
  })
  if (!res.ok) throw new Error(`CloudIA ${res.status} for ${path}`)
  return res.json()
}

const flatten = (entry) => ({ slug: entry.slug, ...entry.data })
const list = async (collection, sort = 'order') =>
  (await get(`/collections/${collection}?limit=0&sort=${sort}`)).items.map(flatten)

async function fromCms() {
  const [settings, sections, items, branches, reviews] = await Promise.all([
    get('/collections/site-settings/single').then((r) => (r.item ?? r).data),
    list('menu-sections'),
    list('menu-items'),
    list('branches'),
    list('reviews'),
  ])
  return { settings, sections, items, branches, reviews, source: 'cms' }
}

// A build reads the CMS once. The dev server reads it on every page load, so edits show on refresh.
let cached
export async function loadContent() {
  if (cached && import.meta.env.PROD) return cached
  let content
  if (BASE && KEY) {
    try {
      content = await fromCms()
    } catch (error) {
      if (STRICT) throw error
      console.warn(`[cms] ${error.message}. Building from src/data/seed.js instead.`)
    }
  }
  content ??= { ...seed, source: 'seed' }
  if (import.meta.env.PROD) console.log(`[cms] content from ${content.source === 'cms' ? `CloudIA (${BASE}, site ${SITE})` : 'src/data/seed.js'}`)
  cached = shape(content)
  return cached
}

// Groups items under their sections and drops anything switched off.
function shape({ settings, sections, items, branches, reviews, source }) {
  const live = items.filter((i) => i.available !== false).sort((a, b) => a.order - b.order)
  const chapters = [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const own = live.filter((i) => i.section === section.slug)
      const groups = []
      for (const i of own) {
        const name = i.group || ''
        let g = groups.find((x) => x.name === name)
        if (!g) groups.push((g = { name, items: [] }))
        g.items.push(i)
      }
      return { ...section, items: own, groups }
    })
    .filter((c) => c.items.length)
  return {
    settings,
    chapters,
    branches: [...branches].sort((a, b) => a.order - b.order),
    reviews: [...reviews].sort((a, b) => a.order - b.order),
    source,
  }
}

export const formatPrice = (item) => {
  if (item.priceLabel) return item.priceLabel
  if (item.price == null) return ''
  return item.price === 0 ? 'Included' : `R${item.price}`
}
