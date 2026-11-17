# Surasang website. Three targets:
#   dev      Astro dev server with live reload (compose.dev.yml)
#   builder  builds the static site into a shared volume and rebuilds on CMS webhooks (compose.yml)
#   static   just the built files, for CI or a one-off build: docker build --target static -o out .
FROM node:22-bookworm-slim AS base
# Dependencies are locked with bun (bun.lock); node runs everything.
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
ENV ASTRO_TELEMETRY_DISABLED=1
EXPOSE 4321
CMD ["node", "node_modules/astro/bin/astro.mjs", "dev", "--host", "0.0.0.0", "--port", "4321"]

FROM base AS builder
ENV NODE_ENV=production ASTRO_TELEMETRY_DISABLED=1 SITE_ROOT=/srv/site/current BUILD_ON_START=1
COPY . .
RUN mkdir -p /srv/site && chown -R node:node /app /srv/site
USER node
EXPOSE 8790
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:8790/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "scripts/rebuild-hook.mjs"]

FROM base AS build-static
ENV ASTRO_TELEMETRY_DISABLED=1
COPY . .
RUN node node_modules/astro/bin/astro.mjs build

FROM scratch AS static
COPY --from=build-static /app/dist /
