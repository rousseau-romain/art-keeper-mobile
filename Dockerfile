# syntax=docker/dockerfile:1

# ---- build: install + export the web bundle (client + server) ----
FROM oven/bun:1.3.14 AS build
WORKDIR /app

COPY package.json bun.lock ./
# BuildKit cache mount on bun's global install cache (~/.bun/install/cache): when
# the lockfile changes, packages aren't re-downloaded — only re-linked/extracted.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .

# EXPO_PUBLIC_* are INLINED into the JS at export time, so they must be present
# during `expo export` — pass them as build args (set the values in Dokploy).
ARG EXPO_PUBLIC_WEB_ORIGIN
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_AUTH_ORIGIN

# Set to 1 on every non-production deploy (staging, previews): emits a global
# `noindex, nofollow` in the HTML shell (+html.tsx), keeping the environment out
# of search results so it can't compete with production over the same content.
# Unset in production — absent means indexable.
ARG EXPO_PUBLIC_SEO_NOINDEX

# Build-only bundler switch (not an EXPO_PUBLIC_ var), read at export time by
# expo-router's Metro config: renders `presentation: "formSheet"` / "modal" routes
# as web overlays instead of full pages. It lives in `.env`, but `.env` is
# dockerignored, so it must be passed here or the web filter sheet renders
# full-screen. Defaults on; overridable as a Dokploy build arg.
ARG EXPO_UNSTABLE_WEB_MODAL=1
# Cache mounts on Metro's caches (the heaviest step). Metro's default FileStore is
# os.tmpdir()/metro-cache (/tmp/metro-cache); node_modules/.cache and .expo are
# mounted too for robustness across @expo/metro-config's cache stores. These only
# speed things up when the BuildKit cache persists between builds — neutral (no
# regression) otherwise.
RUN --mount=type=cache,target=/tmp/metro-cache \
    --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/app/.expo \
    bun expo export -p web

# ---- runtime: serve dist/ (SSR + API routes) with the Expo server ----
FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# `expo serve` (from the Expo CLI) hosts dist/server + dist/client — the CLI +
# @expo/server come from `expo` (a runtime dependency). Rather than copy the full
# 2.7 GB build node_modules (dev deps + Metro caches included), install prod-only
# deps here. The dist/server bundle is self-contained after export.
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

EXPOSE 8081
CMD ["bunx", "expo", "serve", "--port", "8081"]
