#!/usr/bin/env bun
/**
 * Copies the app icon (`assets/images/icon.png`) into `public/icon.png`, so the
 * web app can self-host it at a stable same-origin URL (`/icon.png`, like the
 * fonts in `public/fonts/` and the leaflet assets). It's referenced as the
 * `Organization.logo` in the site-level JSON-LD (`SiteJsonLd.web.tsx`): Google
 * does not accept the `.ico` favicon for a logo, so it needs this raster.
 *
 * Unlike the leaflet assets, the output is **git-ignored** (see `.gitignore`) —
 * it's a byte-for-byte copy of an already-committed asset, so committing it too
 * would just duplicate ~800 KB of binary. It's regenerated instead by the
 * `prestart` / `preweb` / `preserve:dist` hooks and `postinstall` (all via
 * `sync:web`), and by the Dockerfile before `expo export`.
 *
 * Run: `bun run sync:icon` (or `bun scripts/copy-web-icon.ts`).
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";

const SRC = "assets/images/icon.png";
const DEST = "public/icon.png";

if (!existsSync(SRC)) {
  console.error(`[copy-web-icon] ${SRC} not found — is the app icon present?`);
  process.exit(1);
}

mkdirSync("public", { recursive: true });
cpSync(SRC, DEST);

console.log(`[copy-web-icon] copied ${SRC} → ${DEST}`);
