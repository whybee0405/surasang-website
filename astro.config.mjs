import { defineConfig } from 'astro/config'

// In dev, /api/* and /admin* go to the CMS so the contact form, tracker and dashboard work on the
// same address as the site, the way Caddy routes them in production.
const cms = process.env.CMS_PROXY_TARGET
const proxy = cms
  ? Object.fromEntries(['/api', '/admin'].map((path) => [path, { target: cms, changeOrigin: false, ws: true }]))
  : undefined

export default defineConfig({
  site: 'https://surasang.co.za',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  server: { port: 4321 },
  // The toolbar sits where the phone layout's bottom bar is.
  devToolbar: { enabled: false },
  vite: {
    server: {
      proxy,
      // File events don't cross a Windows/macOS bind mount into the container, so poll there.
      watch: process.env.WATCH_POLLING === '1' ? { usePolling: true, interval: 300 } : undefined,
    },
  },
})
