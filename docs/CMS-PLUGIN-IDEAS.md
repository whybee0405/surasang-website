# Making CloudIA drop into the next site faster

Notes from wiring Surasang to CloudIA 1.8.0. Each item names what slowed this build down and what would remove it. Ordered by how much time it would save on the next project.

## 1. Ship the static-site pieces in the SDK

Every static site needs the same three things I wrote by hand here:

- **A build-time loader** (`src/lib/cms.js`): read with a key, fall back to local seed content when the CMS isn't configured, and refuse to fall back in production (`CLOUDIA_STRICT`).
- **A rebuild hook** (`scripts/rebuild-hook.mjs`): verify `X-Cloudia-Signature`, debounce bursts of edits, build, swap the output folder by rename.
- **A form helper**: post to `/api/<form>`, attach `enquiryHeaders()`, map 400/403/429 to messages a visitor understands.

Suggested shape: `@cloudia/sdk/static` exporting `createStaticLoader({ collections, fallback, strict })` and `submitForm(slug, data)`, plus `cloudia hook --build "npm run build" --out dist --root /srv/site` in the CLI. `cloudia-cms create --kind static` could then write a site that publishes-and-rebuilds on day one instead of a README telling the developer to build it.

## 2. Seed content as code, imported by the CLI

`scripts/seed-cms.mjs` exists because the content has to live somewhere before the CMS is up, and the site has to build from it offline. A `seed` export next to the config would make this standard:

```ts
// cloudia/seed.ts
export default {
  'site-settings': { name: 'Surasang', ... },
  'menu-items': [{ slug: 'bbq-rib-eye', name: 'Rib eye', price: 229, ... }],
}
```

`cloudia-cms seed --publish --asset-base https://site` would upsert by slug, turn site-relative paths (`/img/x.webp`) into absolute URLs or upload them to the media library, and print a read key on first run. The same file would be the site's fallback content, so there's one source.

## 3. Model presets for the kinds of sites the agency builds

The six models here (settings, sections, items, branches, reviews, contact form) will be close to identical for the next restaurant. `cloudia-cms create --preset restaurant` should write them, with sensible help text and the honeypot form already configured. Other presets worth having from past work: dealership/parts branches, clinic (practitioners, services, bookings), hospitality (rooms, rates), and a plain marketing site (pages, posts, team, FAQ).

## 4. Small fixes found along the way

- **`scripts/import-json.ts` calls `/api/admin/...`**, but the routes are now `/admin/api/...`, so it fails against 1.8.0. The seed script here uses the current paths.
- **Singleton responses are shaped differently** (`{ item: { data } }` from `/single`, `{ items: [...] }` from lists). The SDK's `single()` hides this, but anyone reading the raw API trips on it; I did. Worth a line in INTEGRATION.md, or return the same shape as `one()`.
- **Image and URL fields reject site-relative paths.** Allowing `/img/hero.webp` (resolved against `PUBLIC_URL`) would let a site keep shipping its own images while editors still swap them in the dashboard.
- **A "booking widget" field type.** Every hospitality client has Dineplan, OpenTable or similar. A field that stores provider plus key, and a matching `bookingUrl()` helper, beats a free-text `dineplanKey`.

## 5. Preview before publish, for static sites

Editors on a static site can't see a draft until it's published and rebuilt. Two ways to fix it: a preview token that lets the site's dev server (or a `/preview` route built with drafts) read unpublished entries, or a "Preview" button that runs the rebuild hook into a separate folder served at `preview.<domain>`. The second needs no site changes if the hook in point 1 supports an `--out` per target.

## 6. Typed content in Astro

`cloudia types` already generates TypeScript from `/schema`. A section in INTEGRATION.md showing it feeding an Astro (or any Vite) site, with the loader from point 1, would make content typing the default rather than `any`.

## What worked without changes

`cloudia-cms check` on the config, the form collection's honeypot, rate limit and privacy (submissions 404 on the public API), `limit=0` for full lists, `sortField` on models, and `data-cloudia-event` attributes on buttons instead of click handlers.
