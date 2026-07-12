# syntax=docker/dockerfile:1

# ---- build: install + export the web bundle (client + server) ----
FROM oven/bun:1.3.14 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# EXPO_PUBLIC_* are INLINED into the JS at export time, so they must be present
# during `expo export` — pass them as build args (set the values in Dokploy).
ARG EXPO_PUBLIC_WEB_ORIGIN
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_AUTH_ORIGIN
RUN bun expo export -p web

# ---- runtime: serve dist/ (SSR + API routes) with the Expo server ----
FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# `expo serve` (from the Expo CLI) hosts dist/server + dist/client — it needs the
# exported dist and node_modules (the CLI + @expo/server live there).
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 8081
CMD ["bunx", "expo", "serve", "--port", "8081"]
