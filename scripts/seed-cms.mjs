// Loads src/data/seed.js into a running CloudIA install and publishes it.
//
//   CLOUDIA_ADMIN_EMAIL=you@example.com CLOUDIA_ADMIN_PASSWORD=... \
//   node scripts/seed-cms.mjs --url http://localhost:8787 [--asset-base https://surasang.co.za] [--read-key] [--webhook <url>]
//
// The models must already exist: an install creates them from cloudia/cloudia.config.ts on boot.
// Images in the seed are site paths (/img/...); they're stored as absolute URLs on --asset-base
// so the CMS returns usable URLs. Re-running is safe: entries are upserted by slug.
// --read-key also creates a read API key and prints it, for CLOUDIA_READ_KEY.
// --webhook sets the site's webhook URL (in Docker: http://builder:8790) and prints CLOUDIA_WEBHOOK_SECRET.
import * as seed from '../src/data/seed.js'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return fallback
  const next = args[i + 1]
  return next && !next.startsWith('--') ? next : true
}
const url = String(flag('url', process.env.CLOUDIA_URL || 'http://localhost:8787')).replace(/\/$/, '')
const assetBase = String(flag('asset-base', process.env.SEED_ASSET_BASE || 'https://surasang.co.za')).replace(/\/$/, '')
const siteSlug = String(flag('site', process.env.CLOUDIA_SITE || 'surasang'))
const { CLOUDIA_ADMIN_EMAIL: email, CLOUDIA_ADMIN_PASSWORD: password } = process.env
if (!email || !password) {
  console.error('Set CLOUDIA_ADMIN_EMAIL and CLOUDIA_ADMIN_PASSWORD.')
  process.exit(1)
}

let cookie = ''
async function api(path, init = {}) {
  const res = await fetch(url + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Origin: url, ...(cookie && { Cookie: cookie }), ...init.headers },
  })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path}: ${res.status} ${body.error ?? ''}`)
  return body
}

// Drop empty values (the CMS fills defaults) and turn site paths (/img/..., /menu.pdf) into absolute URLs.
const clean = (data) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([k, v]) => v !== null && v !== undefined && k !== 'slug')
      .map(([k, v]) => [k, typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? assetBase + v : v]),
  )

await api('/admin/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
const { sites } = await api('/admin/api/sites')
const site = sites.find((s) => s.slug === siteSlug)
if (!site) throw new Error(`No site "${siteSlug}". Is CLOUDIA_CONFIG pointing at cloudia/cloudia.config.ts?`)
const { collections } = await api(`/admin/api/sites/${site.id}/collections`)
const bySlug = Object.fromEntries(collections.map((c) => [c.slug, c]))

const batches = {
  'site-settings': [{ slug: 'site-settings', ...seed.settings }],
  'menu-sections': seed.sections,
  'menu-items': seed.items,
  branches: seed.branches,
  reviews: seed.reviews,
}
for (const [slug, entries] of Object.entries(batches)) {
  const collection = bySlug[slug]
  if (!collection) throw new Error(`Model "${slug}" is missing from the install`)
  const result = await api(`/admin/api/collections/${collection.id}/import`, {
    method: 'POST',
    body: JSON.stringify({ mode: 'upsert', entries: entries.map((e) => ({ slug: e.slug, data: clean(e), publish: true })) }),
  })
  console.log(`${slug.padEnd(14)} ${result.created} created, ${result.updated} updated, ${result.published} published, ${result.failed} failed`)
  if (result.errors?.length) console.log(JSON.stringify(result.errors, null, 2))
}

// --webhook <url> points the site's webhook at the rebuild service and prints the signing secret.
const hook = flag('webhook', false)
if (hook) {
  const { site: updated } = await api(`/admin/api/sites/${site.id}`, { method: 'PATCH', body: JSON.stringify({ webhookUrl: hook }) })
  console.log(`\nWebhook -> ${hook}\nCLOUDIA_WEBHOOK_SECRET=${updated.webhookSecret ?? updated.webhook_secret ?? '(see Integrations in the dashboard)'}`)
}

if (flag('read-key', false)) {
  const { key } = await api(`/admin/api/sites/${site.id}/keys`, { method: 'POST', body: JSON.stringify({ name: 'Website build', scope: 'read' }) })
  console.log(`\nCLOUDIA_READ_KEY=${typeof key === 'string' ? key : key.token ?? JSON.stringify(key)}`)
}
