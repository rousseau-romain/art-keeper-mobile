#!/usr/bin/env bun
/**
 * Copies Leaflet's stylesheet + its images from the installed npm package into
 * `public/leaflet/`, so the web app can self-host them (served same-origin at
 * `/leaflet/*`, like the fonts in `public/fonts/`) instead of loading them from a
 * third-party CDN. `src/app/+html.tsx` injects `/leaflet/leaflet.css` at runtime
 * (non-render-blocking) — see the `leafletCssLoader` note there and the
 * `web-prod-export.md` rule.
 *
 * The output is **committed** to git (works offline / in the runtime image) but is
 * kept in sync with the locked leaflet version by re-running this: the copy tracks
 * `node_modules/leaflet`, so a leaflet bump surfaces as a diff to commit. The
 * Dockerfile also runs it at build time (`bun run sync:leaflet`) so the deployed
 * bundle always matches `bun.lock`, even if a local copy went stale.
 *
 * Run: `bun run sync:leaflet` (or `bun scripts/copy-leaflet-assets.ts`).
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";

const SRC = "node_modules/leaflet/dist";
const DEST = "public/leaflet";

if (!existsSync(`${SRC}/leaflet.css`)) {
  console.error(
    `[copy-leaflet-assets] ${SRC}/leaflet.css not found — is leaflet installed?`,
  );
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });
cpSync(`${SRC}/leaflet.css`, `${DEST}/leaflet.css`);
cpSync(`${SRC}/images`, `${DEST}/images`, { recursive: true });

console.log(`[copy-leaflet-assets] copied leaflet.css + images/ → ${DEST}/`);
