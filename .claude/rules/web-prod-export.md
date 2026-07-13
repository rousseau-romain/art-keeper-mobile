# Rule: web production export — deploy env + the async-chunk CSS gotcha

The web app is shipped by **exporting** the bundle (`bun expo export -p web`,
`web.output: "server"`) and serving `dist/` with `bunx expo serve`. Staging
(`artkeeper-staging.web-rows.com`) builds this in the root **`Dockerfile`** (no
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

## The async-chunk CSS bug — hoist real CSS into `+html.tsx`

**Metro does not extract/inject CSS that is imported inside an async/lazy chunk**
in the production web export. The `.css` is emitted to `dist/.../css/*.css` and
listed in `routes.json` `assets.css`, but the SSR-rendered HTML never `<link>`s
it. It works in **dev** (Metro injects CSS modules at runtime), so the breakage
is **prod-only**: a feature that depends on a real `.css`/CSS-module import
renders **unstyled** on staging while looking fine locally.

The app has essentially two such CSS dependencies, both **hoisted into the web
shell `src/app/+html.tsx`** (a global `<link>` or an inline `<style>`), never
left to the lazy chunk:

- **Leaflet** — `leaflet.css` via an unpkg `<link>` (pinned to the installed
  version), instead of `import "leaflet/dist/leaflet.css"` in the map chunk.
- **expo-router web modal** — `expo-router/assets/modal.module.css` (positions the
  `vaul` drawer). Imported inside the lazy modal chunk, so in prod the sheet had
  `position: static` and rendered off-screen below the fold ("the filter modal
  doesn't open"). Fixed by inlining that CSS **verbatim** as a `<style>` in
  `+html.tsx` (the `modalCss` constant).

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
