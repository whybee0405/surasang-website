// Builds the static site, then rebuilds it whenever CloudIA publishes, unpublishes or deletes content.
// Runs as the `builder` service in compose.yml; works the same directly on a host.
//
// CloudIA POSTs to the site's webhook URL (Dashboard > Integrations; inside Docker that's
// http://builder:8790) with X-Cloudia-Signature: sha256=<HMAC of the raw body with the site's
// signing secret>. A burst of edits makes one build. Output is swapped into SITE_ROOT by rename,
// so the web server never serves a half-copied folder. One build at a time; edits that arrive
// during a build queue exactly one more.
//
//   CLOUDIA_WEBHOOK_SECRET=... SITE_ROOT=/srv/site/current BUILD_ON_START=1 node scripts/rebuild-hook.mjs
//
// Without CLOUDIA_WEBHOOK_SECRET it still builds on start, and turns webhooks away until the secret is set.
import { createServer } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { spawn } from 'node:child_process'
import { cp, rm, rename } from 'node:fs/promises'

const SECRET = process.env.CLOUDIA_WEBHOOK_SECRET
const PORT = Number(process.env.HOOK_PORT || 8790)
const SITE_ROOT = process.env.SITE_ROOT || '/srv/site/current'
const SETTLE_MS = Number(process.env.SETTLE_MS || 8000)
const log = (...a) => console.log(new Date().toISOString(), ...a)

const valid = (raw, header = '') => {
  const expected = Buffer.from('sha256=' + createHmac('sha256', SECRET).update(raw).digest('hex'))
  const given = Buffer.from(header)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

const run = (cmd, args) =>
  new Promise((resolve, reject) =>
    spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
      .on('error', reject)
      .on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)))),
  )

let timer, building = false, again = false
async function build() {
  if (building) return void (again = true)
  building = true
  try {
    await run('node', ['node_modules/astro/bin/astro.mjs', 'build'])
    await rm(SITE_ROOT + '.next', { recursive: true, force: true })
    await cp('dist', SITE_ROOT + '.next', { recursive: true })
    await rm(SITE_ROOT + '.old', { recursive: true, force: true })
    await rename(SITE_ROOT, SITE_ROOT + '.old').catch(() => {})
    await rename(SITE_ROOT + '.next', SITE_ROOT)
    log('site rebuilt')
  } catch (error) {
    // The previous build stays live. With CLOUDIA_STRICT=1 a CMS outage fails the build instead of shipping seed content.
    log('rebuild failed:', error.message)
  } finally {
    building = false
    if (again) { again = false; schedule() }
  }
}
const schedule = (ms = SETTLE_MS) => { clearTimeout(timer); timer = setTimeout(build, ms) }

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') return res.writeHead(200).end('ok')
  if (req.method !== 'POST') return res.writeHead(405).end()
  if (!SECRET) return res.writeHead(503).end('Set CLOUDIA_WEBHOOK_SECRET to enable rebuilds')
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    const raw = Buffer.concat(chunks)
    if (!valid(raw, req.headers['x-cloudia-signature'])) return res.writeHead(401).end()
    const event = req.headers['x-cloudia-event']
    res.writeHead(202).end()
    log('webhook', event)
    if (event !== 'test') schedule()
  })
}).listen(PORT, () => {
  log(`rebuild hook on :${PORT}${SECRET ? '' : ' (webhooks off: no CLOUDIA_WEBHOOK_SECRET)'}`)
  if (process.env.BUILD_ON_START === '1') schedule(0)
})
