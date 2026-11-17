# surasang.co.za

Website for Surasang Korean BBQ & Hot Pot, with Pocha's street-food menu folded in. Static Astro build; content comes from a CloudIA CMS install that runs beside it. Dev and production both run in Docker.

| | Command | Address |
| --- | --- | --- |
| Dev | `docker compose -f compose.dev.yml up --build` | site http://localhost:4321, dashboard http://localhost:4321/admin |
| Production | `docker compose up -d --build` | https://surasang.co.za, dashboard /admin |

Without Docker: `bun install && bun run dev` (npm runs out of memory on Vite's registry manifest on this machine; bun doesn't).

## How the page is put together

The whole site reads as one menu. After the cover and the story of the name (surasang was the Joseon king's table), every section is a chapter of the menu with its own layout, tracked by the index rail on the left (a tab bar on phones). Pocha's chapters sit behind a tent that opens on scroll and switch the page to Pocha orange; its sharing pans scroll sideways.

| Where | What |
| --- | --- |
| `src/pages/index.astro` | The page: cover, story, menu, reviews, branches, contact, footer, booking drawer |
| `src/components/Chapter.astro` | Per-chapter layouts. Known section slugs get a bespoke layout; a section added in the CMS falls back to a list (with its image when it has one) |
| `src/components/Dish.astro` | One menu line with dot leader, Korean name, tags and add-ons |
| `src/components/Dock.astro` | Floating actions after the cover: follow (Surasang and Pocha socials), WhatsApp (picks a restaurant), Reserve a table. A bar along the bottom on phones |
| `src/scripts/main.js` | Lenis + GSAP ScrollTrigger: cover, embers, scroll-lit story, chapter tracking, tent, horizontal pan, dish search, hot pot builder, booking drawer, form |
| `src/styles/global.css` | Tokens (OKLCH), type, every section. Square corners throughout; gold is the only accent until Pocha's orange takes over |
| `src/lib/cms.js` | Build-time loader: CloudIA when configured, the seed otherwise |
| `src/data/seed.js` | All content as first imported: both menus, branches, reviews, settings |
| `cloudia/cloudia.config.ts` | CMS models: site settings, menu sections, menu items, branches, reviews, messages (form) |

Fonts are self-hosted: Boska (display), Satoshi (text), Song Myung (Hangul) and Tanker (Pocha only). Icons are Phosphor, inlined at build. Everything that moves stops under `prefers-reduced-motion`.

## Content and the CMS

Editors work at `https://surasang.co.za/admin`. A dish has a price, optional printed price (`R155 / R255`), add-ons one per line, tags (spicy, share, signature) and an `available` switch for sold-out days. The hot pot builder reads its prices from the Hot pot section's `Broth` and `Add to the pot` groups, so changing a price there changes the calculator too.

### Dev with Docker

`compose.dev.yml` runs the CMS and the Astro dev server. The dev server forwards `/api` and `/admin` to the CMS, so the form, tracker and dashboard all work on http://localhost:4321, the same way Caddy routes them in production. Edit a file and the page reloads; edit content in the dashboard and it shows on the next refresh, no build needed. The CMS image builds from the sibling `../cloudia-cms` checkout (set `CLOUDIA_CMS_SRC` if it lives elsewhere), so dev needs no registry login.

First run only, to create an admin, load the menu and get a read key:

```bash
docker compose -f compose.dev.yml up -d --build
docker compose -f compose.dev.yml exec -e CLOUDIA_ADMIN_PASSWORD='<12+ chars, not containing your email>' cms cloudia-cms admin:create you@example.com
docker compose -f compose.dev.yml exec -e CLOUDIA_ADMIN_EMAIL=you@example.com -e CLOUDIA_ADMIN_PASSWORD='...'   site node scripts/seed-cms.mjs --url http://cms:8787 --asset-base http://localhost:4321 --read-key
```

Put the printed `CLOUDIA_READ_KEY` in `.env` and run `docker compose -f compose.dev.yml up -d site`. Until then the site shows the seed content. Data lives in the `surasang-dev_cms_data` volume; `down` keeps it, `down -v` wipes it.

### Production with Docker

`compose.yml` runs three services. **cms** is CloudIA from `ghcr.io/whybee0405/cloudia-cms` (version in `.env`, `CLOUDIA_CMS_VERSION`). **builder** builds the site on start and again on every publish, into a volume. **web** is Caddy: it serves the build, gets the HTTPS certificate for surasang.co.za, redirects www, and sends `/api/*` and `/admin*` to the CMS. Only Caddy is exposed to the internet.

```bash
docker login ghcr.io -u whybee0405                    # once per server, read:packages token
cp .env.example .env && cp cloudia/cms.env.example cloudia/cms.env   # fill in cms.env (PUBLIC_URL, FORM_SALT, Resend)
docker compose up -d --build                          # site is live from seed content at this point

docker compose exec -e CLOUDIA_ADMIN_PASSWORD='...' cms cloudia-cms admin:create you@example.com
docker compose exec -e CLOUDIA_ADMIN_EMAIL=you@example.com -e CLOUDIA_ADMIN_PASSWORD='...'   builder node scripts/seed-cms.mjs --url http://cms:8787 --asset-base https://surasang.co.za --read-key --webhook http://builder:8790
```

The seed command prints `CLOUDIA_READ_KEY` and `CLOUDIA_WEBHOOK_SECRET`. Put both in `.env` and run `docker compose up -d builder`. From then on, **publishing rebuilds the site**: the CMS calls the builder, which checks the signature, waits for a few seconds of quiet so a run of edits makes one build, and swaps the new build in by rename. A price change is live about 10 seconds after Publish. With a read key set the build is strict: if the CMS can't be reached the build fails and the live site stays exactly as it was.

Updates: change `CLOUDIA_CMS_VERSION` (and `cloudia/cms-version`) and `docker compose up -d cms`; for site code, `git pull && docker compose up -d --build builder`. Backups land in `./cms-backups` (see the CloudIA docs).

**Testing the production stack on your own machine** (port 80 is taken on Windows): put `SITE_ADDRESS=:80`, `HTTP_PORT=8080`, `HTTPS_PORT=8443`, `CLOUDIA_CMS_IMAGE=cloudia-cms:local` (built by the dev compose) and `CMS_NODE_ENV=development` in `.env`, set `PUBLIC_URL=http://localhost:8080` in `cloudia/cms.env`, and use `--asset-base http://localhost:8080` when seeding. `CMS_NODE_ENV=development` is what lets localhost post the contact form; production only accepts posts from surasang.co.za. Never set it on the server.

The contact form posts to `/api/messages` (a private form collection: honeypot, rate limit, never readable through the public API). Each message is also emailed through **Resend**: CloudIA sends form notifications over SMTP, and Resend's SMTP relay needs only settings, no code. Verify the domain in Resend, put the API key in `cloudia/cms.env` (`SMTP_*` lines are in `cms.env.example`), set `notify` on the messages form in `cloudia/cloudia.config.ts`, restart the CMS and press "Send test email" on the System page. If sending ever fails, the message is still saved in the dashboard.

The WhatsApp button lists every branch with a `whatsapp` number in the CMS and opens a chat with "Hi <branch>, " typed in. Empty the field to drop a branch from the list; with one number left it becomes a direct link. Reserve buttons open each branch's Dineplan frame in a drawer. With `PUBLIC_CLOUDIA_TRACKER=1` the CloudIA tracker loads from the same domain and records `reserve_open`, `whatsapp_click` (with the branch), `social_click` (with the network) and `delivery_click`, plus phone and email clicks automatically.

## Before launch

- **Form notification inbox.** `notify` on the messages form is commented out in `cloudia/cloudia.config.ts`. Until it's set, messages are saved in the dashboard but no email goes out.
- **WhatsApp numbers.** All three mobiles are set as WhatsApp numbers. Send a test message to each; any that isn't on WhatsApp should be emptied in the CMS.

- **Dainfern address.** The branch says "New address coming soon" and keeps the Sunninghill number and Dineplan key. Update both in the CMS when the move happens, and switch off the announcement in Site settings.
- **Surasang opening hours** weren't on the old site or menu, so none are shown. Add them to each branch in the CMS. Pocha's (Tue to Sun, 11:00 to 22:00) are in.
- **Guinness is R150 on the printed menu**, next to R32 to R45 for every other beer. Probably a typo; check before it goes live.
- **The royal table photo, the cover, the Pocha tent and the dak-galbi pan are AI-generated** (Higgsfield). The caption under the royal table says it was recreated for the page. Replace the others with real photos from the restaurants when you can; the slots and sizes are in `public/img/`.
- Some Pocha menu descriptions were tightened from the printed board. Korean names for a few Pocha dishes were added by us; worth a check by the owners.
