# Rule: web production export — deploy env + the async-chunk CSS gotcha

The web app is shipped by **exporting** the bundle (`bun expo export -p web`,
`web.output: "server"`) and serving `dist/` with `bunx expo serve`. Staging
(`artkeeper.staging.web-rows.com`) builds this in the root **`Dockerfile`** (no
EAS Hosting, no `eas.json`). Two things behave differently in this production
export than in `expo start --web`, and both have bitten us — read this before
touching the `Dockerfile`, `src/app/+html.tsx`, or upgrading the Expo SDK.

## Deploy: build-time bundler flags must reach `expo export`

`EXPO_PUBLIC_*` vars are inlined into the JS at export time; **non-public**
bundler switches (e.g. `EXPO_UNSTABLE_WEB_MODAL`) are read by Metro at export
time too. They live in `.env`, but **`.env` is dockerignored**, so they are
absent from the Docker build unless declared in the `Dockerfile`. Both kinds are
passed as `ARG` in the `build` stage, just before `RUN bun expo export -p web`:

```dockerfile
ARG EXPO_PUBLIC_WEB_ORIGIN
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_AUTH_ORIGIN
# Enables expo-router's web modal rendering (formSheet/modal as overlays).
ARG EXPO_UNSTABLE_WEB_MODAL=1
RUN bun expo export -p web
```

- An `ARG` is exposed as an env var to the following `RUN`, so `expo export`
  sees it. In Dokploy, set overrides under **Build-time Arguments** (not runtime
  env) — the `runtime` stage (`expo serve`) needs none of these.
- Without `EXPO_UNSTABLE_WEB_MODAL`, `presentation: "formSheet" | "modal"` routes
  (the `filters` sheet) fall back to `BaseStack` and render as a **full page** on
  web (see [router-navigation-paths](router-navigation-paths.md)).

### Dokploy setup (staging)

- **Source**: this repo, branch `master`. **Build Type: Dockerfile** — the
  multi-stage `Dockerfile` does `bun expo export -p web` then `bunx expo serve`.
- **Domain**: `artkeeper.staging.web-rows.com`, **container port `8081`**
  (`expo serve` in the `runtime` stage), HTTPS on.
- **Build-time Arguments** (the values below, *not* runtime env):

  | Arg | Staging value |
  | --- | --- |
  | `EXPO_PUBLIC_API_URL` | `https://api.artkeeper.staging.web-rows.com` |
  | `EXPO_PUBLIC_WEB_ORIGIN` | `https://artkeeper.staging.web-rows.com` |
  | `EXPO_UNSTABLE_WEB_MODAL` | `1` |

- **`EXPO_PUBLIC_AUTH_ORIGIN` is not needed on web** — `AUTH_ORIGIN` in
  `src/lib/api/client.ts` is only attached to requests on native
  (`Platform.OS !== "web"`); the browser sets `Origin` itself. Leave it unset for
  the web deploy (it's still declared as an `ARG` for parity). It matters only
  for native builds pointing at a backend whose trusted origin differs from
  `EXPO_PUBLIC_API_URL`.

### Backend prerequisites (art-keeper-api)

The web app runs cross-origin (`artkeeper.staging.web-rows.com` → the
`api.` host), so the API must allow it or the browser/Better Auth block requests:

- **CORS**: allow origin `https://artkeeper.staging.web-rows.com`.
- **Better Auth `trustedOrigins`**: include `https://artkeeper.staging.web-rows.com`,
  or state-changing auth calls (sign-in/sign-up) are rejected by the CSRF guard.

## The async-chunk CSS bug — hoist real CSS into `+html.tsx`

**Metro does not extract/inject CSS that is imported inside an async/lazy chunk**
in the production web export. The `.css` is emitted to `dist/.../css/*.css` and
listed in `routes.json` `assets.css`, but the SSR-rendered HTML never `<link>`s
it. It works in **dev** (Metro injects CSS modules at runtime), so the breakage
is **prod-only**: a feature that depends on a real `.css`/CSS-module import
renders **unstyled** on staging while looking fine locally.

The app has essentially two such CSS dependencies, both **hoisted into the web
shell `src/app/+html.tsx`**, never left to the lazy chunk:

- **Leaflet** — `leaflet.css` **self-hosted** from the npm package in
  `public/leaflet/` (served same-origin at `/leaflet/leaflet.css`, like the fonts
  in `public/fonts/`), instead of `import "leaflet/dist/leaflet.css"` in the map
  chunk. It's injected **non-render-blocking** by the `leafletCssLoader` script (a
  JS-inserted stylesheet doesn't block render), preceded by a `<link
  rel="preload" as="style">` hint. It used to be a unpkg `<link>` — a third-party
  **render-blocking request** (Lighthouse) — then briefly an inline `<style>`.
  The file is committed **verbatim** with its `images/` beside it, so the
  `url(images/…)` resolve to `/leaflet/images/…` (never fetched by this app —
  markers use `L.divIcon`, no layers control). The files are **committed** but
  generated from the npm package by `bun run sync:leaflet`
  (`scripts/copy-leaflet-assets.ts`), run automatically by the **`postinstall`**
  hook (every `bun install`) and the **`prestart` / `preweb`** hooks (every
  `bun start` / `bun web`) — so a leaflet bump refreshes them (commit the diff).
  `postinstall` is guarded (`bun -e` no-ops if the script isn't present yet), so
  it's safe in the `Dockerfile` where `bun install` runs before `COPY . .`.
- **expo-router web modal** — `expo-router/assets/modal.module.css` (positions the
  `vaul` drawer). Imported inside the lazy modal chunk, so in prod the sheet had
  `position: static` and rendered off-screen below the fold ("the filter modal
  doesn't open"). Fixed by inlining that CSS **verbatim** as a `<style>` in
  `+html.tsx` (the `modalCss` constant).

## Web fonts — self-hosted `@font-face` in `+html.tsx`, not expo-font

On **native**, fonts load through expo-font (`useFonts(FONT_MAP)` in
`fonts.constant.ts`). On **web** they don't: `fonts.constant.web.ts` keeps
`FONT_MAP` empty and declares the `@font-face` rules statically in `+html.tsx`
(the `fontFacesCss` constant). Two reasons:

1. **Font-display + no CLS.** expo-font's generated `@font-face` can't set font
   metric overrides, so a `font-display: swap` there would shift layout when the
   real font swaps in. Instead each family ships **two** faces: the real
   self-hosted WOFF2 (`public/fonts/*.woff2`, served at `/fonts/*`) with
   `font-display: swap`, and a **metric-matched fallback** (`size-adjust` +
   `ascent/descent/line-gap-override`, generated by `@capsizecss/core`) over a
   local system font. `FONTS` (web variant) is a **stack** —
   `"<real>", "<… Fallback>", <system>` — so text paints in the adjusted fallback
   immediately and swaps with **zero CLS**.
2. **No render-gate block.** Empty web `FONT_MAP` ⇒ `useFonts({})` reports loaded
   at once, so `RootNavigator`'s gate never waits on fonts for the first web
   paint (real FCP win). react-native-web passes `fontFamily` through verbatim,
   so the comma stack works.

`public/fonts/` is copied to the export root by Expo (`public/` static dir), so
the `/fonts/*.woff2` URLs are stable and independent of Metro's asset hashing.
Display + body are `<link rel="preload" as="font">`-ed in `+html.tsx` (mono is
not — small labels only); font preloads need `crossOrigin` even same-origin.

**Re-generate the override percentages** (in `fontFacesCss`) only if a font file
is swapped — they're computed from these exact TTFs. Regen: unpack each font with
`@capsizecss/unpack` `fromBlob`, feed `[metrics, fallback]` to
`createFontStack({ fontFaceProperties: { fontDisplay: "swap" } })`, and re-convert
the TTF to WOFF2 (`ttf2woff2`).

## Upgrade checklist (expo / expo-router SDK bump)

After `bun expo export -p web`, **verify the web filter sheet actually renders**
(open `/artworks`, click **Filtres** — it must be a centered dialog on desktop /
a bottom sheet on mobile, not a full page and not blank). If it regresses:

1. **Full page** → the `EXPO_UNSTABLE_WEB_MODAL` build arg didn't reach `expo
   export` (Docker cache, or the flag dropped).
2. **Blank / off-screen** → the inlined modal CSS in `+html.tsx` is stale.
   `modalCss` is a verbatim copy of the exported
   `dist/.../css/modal.module-*.css`, whose class names carry a **CSS-module hash
   prefix** (`fApBhq_` at time of writing). The hash is **deterministic for a
   given expo-router version** (identical in the staging and local bundles), so it
   stays valid across builds — **but a new expo-router changes the file and the
   hash**, leaving the inlined copy pointing at dead class names. **Re-sync
   `modalCss`** from the freshly-exported `modal.module-*.css` (and confirm the
   new hash matches the class names in the entry bundle).

Diagnostic tip: render the prod `dist` locally (`bunx expo serve dist`) and drive
it with headless Chrome (`chrome-launcher` + raw CDP over Node's global
`WebSocket`, no puppeteer needed) — measure the modal's `getBoundingClientRect()`
and inject the CSS at runtime to confirm it repositions on-screen.
