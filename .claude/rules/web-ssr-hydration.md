# Rule: web SSR renders public content — keep the first render deterministic

On web (`web.output: "server"`, `unstable_useServerRendering`) the app **server-renders
the public artwork pages** so the LCP hero `<img>` ships in the initial HTML (paired
with the loader's `Link: rel=preload` header — see [web-prod-export](web-prod-export.md)).
For that to work, **the server render and the client's *first* render must produce the
same tree**, or React throws a hydration error (#418) and regenerates the tree on the
client — defeating the SSR win. Everything below exists to hold that invariant. Native
is unaffected (no SSR); the split is always by `Platform.OS` / a `.web.ts` file.

The reference commit wired: `_layout.tsx` (gate), `AuthProvider`/`token-store` (`hydrated`),
`lib/query.ts` (per-request client), `artworks/[slug]/index.tsx` + `useLoaderArtwork`
(loader seeding), `i18n/resolve-i18n*` + `i18n/server.ts` (server language), and
`theme-mode-store*` + `ThemeProvider` + `+html.tsx` (server theme).

## The gate: `hydrated`, never `status` (`src/app/_layout.tsx`)

`RootNavigator` renders the app once **fonts + the token are hydrated** — *not* once the
auth `status` is known:

```ts
const { status, hydrated, locked } = useAuth();
const ready = (fontsLoaded || !!fontError) && hydrated;
if (!ready) return <View style={styles.screen} />;
if (locked) return <LockScreen />;   // biometric gate (native-only; web is never locked)
return <Stack> … </Stack>;
```

- **Never gate on `status !== "loading"`.** `status` stays `"loading"` through the
  `get-session` **network** round-trip, so gating on it blocks the first paint (and all
  SSR content) behind a request. `hydrated` is synchronous on web and a fast keychain read
  on native. The session resolves in the background and personalizes afterwards.
- `locked` is decided at hydration (stored token + opt-in + biometrics), so check `locked`
  alone — not `status === "authenticated" && locked`.

## `hydrated` is synchronous on web (`token-store.ts` + `AuthProvider`)

The web token mirror is seeded from `localStorage` **at module load** (localStorage is
sync; the server has none → `null`), so `getToken()` is valid on the first render and
`AuthProvider` starts `hydrated = Platform.OS === "web"`. Native keeps the async keychain
read (`hydrated` starts `false`, set in an effect). **Don't** make web `hydrated` depend on
an effect — that would blank the SSR content on the client's first render (mismatch).

## Per-request QueryClient (`src/lib/query.ts`)

Use `getQueryClient()` — a **fresh client per server request**, a memoized singleton in the
browser and on native:

```ts
const isServerRender = Platform.OS === "web" && typeof window === "undefined";
export const getQueryClient = () =>
  isServerRender ? makeQueryClient() : (clientSingleton ??= makeQueryClient());
```

A module-singleton client on the server shares its cache across concurrent requests and
leaks one visitor's data into another's response. **Never** export a bare `new QueryClient()`
singleton. (Detect the server by `Platform.OS === "web" && !window` — `typeof window` alone
is also `undefined` on native, which must keep a stable singleton.)

## Every provider's *first render* must be deterministic

The client's first render runs before any effect, so anything a provider reads
asynchronously (AsyncStorage) or from a client-only source (localStorage, `navigator`,
window size) must **not** change the first render, or it won't match the server. Pattern:
render a deterministic value first, apply the real one in an effect (post-hydration) — or
feed the real one from the request (next section).

- **Theme** (`ThemeProvider`): `mode` starts from `getInitialThemeMode()` (default `dark`).
  `"auto"` resolves against the device scheme **only after mount** (`mounted && device === "light"`),
  so `auto` is deterministic-`dark` on the first render both sides. Explicit light/dark are
  immediate (and come from the cookie — below), so they render with **no flash**.
- **Breakpoint** (`useBreakpoint` → `useWindowDimensions`): the browser reports the real width
  **synchronously on the first client render**, but the server rendered with width `0` (→ narrow).
  So a desktop client's first render would compute `wide === true` while the server sent `wide ===
  false` — a mismatch on **every** `wide`-driven output. React patches a same-element className /
  style diff silently (`SplitRow`'s `flexDirection`, the hero's sizing → a warning + reflow), but a
  **structural** branch on `wide` — swapping a component or toggling `headerShown`, i.e. a
  *different element type* server vs client — **throws** #418 and regenerates the whole tree.
  Rather than gate each call site, **`useBreakpoint` itself is hydration-safe**: it forces
  `width = 0` (→ narrow) until mounted (via `useIsHydrated()`, `src/shared/hooks/useIsHydrated.ts`),
  so the client's first render always matches the SSR HTML — **no** hydration warning **or** #418,
  for style *and* structural consumers alike. The real width applies post-mount (a reflow — the
  accepted desktop CLS, since there's no reliable server viewport; `Sec-CH-Viewport-Width` is
  flaky). Native starts mounted, reading the real width immediately. So call sites just use `wide`
  directly — `const webHeader = Platform.OS === "web" && wide` (`(tabs)/_layout.tsx`, and the
  `headerShown: !webHeader` toggles in `(tabs)/artworks/_layout.tsx` / `(tabs)/admin/_layout.tsx`).
  Reach for `useIsHydrated()` *directly* only for a client-only first-render read that **isn't**
  the breakpoint.
- **Token**: covered above (web sync, native async).

## Feed real config from the request (cookie / `Accept-Language`)

To render the user's actual theme/language on the server (no flash, no mismatch) the server
reads the **request**, since the client's first render already uses the device value:

- **Language** (`i18n/resolve-i18n.web.ts` + `i18n/server.ts`): the web SSR render backs
  `<I18nextProvider>` with `serverI18n(requestHeaders().get("accept-language"))` — a
  per-locale instance (created via `createInstance().use(initReactI18next)`, reused across
  requests, safe because a locale never mutates). The browser uses the device-locale
  singleton; both agree on the first render. A persisted override is applied post-hydration
  by `I18nProvider` (flash, not mismatch). The client (device locale) and server
  (`Accept-Language`) normally agree, so there's no flash for most users.
- **Theme** (`theme-mode-store.web.ts` + `THEME_MODE_COOKIE`): the mode is persisted in a
  **cookie** (not just localStorage) so `getInitialThemeMode()` can read it on the server
  (`requestHeaders().get("cookie")`) and in the browser (`document.cookie`) — both sync,
  both agree. `persistThemeMode` writes the cookie and mirrors `data-theme` for the
  `+html.tsx` blocking script (which also reads the cookie now). Native keeps AsyncStorage.

`requestHeaders()` (from `expo-server`) is callable during the SSR render, not just in
loaders. Importing `expo-server` in a `.web.ts` module is client-safe (its functions just
aren't called there).

## Loader → `initialData` + `<Suspense>` (the detail hero)

The route's server `loader` returns the artwork; seed it into React Query so the hero paints
from SSR data:

- `useArtworkBySlug(slug, initialData)` passes it as `initialData` (no `initialDataUpdatedAt`
  → treated as stale → a background client refetch personalizes `likedByMe`, which is neutral
  server-side with no user token).
- `useLoaderArtwork` is split: `.web.ts` reads `useLoaderData`, native returns `undefined`.
- **`useLoaderData` suspends on client-side navigation** (not on the initial load — the data
  is in the HTML). So the route's `Screen` wraps the page in `<Suspense fallback={<ScreenFallback/>}>`.

See [data-fetching](data-fetching.md) for the query-layer conventions this builds on.

## Protected routes: tolerate the `loading` window

Because the app now renders while `get-session` is in flight, a guard must **not** eject an
authenticated user who refreshes a protected route during that window. Gate on "definitely
signed out", not "confirmed authenticated":

- `Stack.Protected` / `Tabs.Protected`: `guard={status !== "unauthenticated"}` (not
  `=== "authenticated"`) — see `artworks/_layout.tsx`, `(tabs)/_layout.tsx`.
- Imperative redirects: hold on loading first — `if (status === "loading") return null;`
  before the `<Redirect>` (see `admin/_layout.tsx`).
- A pure forward (`app/index.tsx` → `/artworks`) redirects **unconditionally** (target is
  auth-independent — don't re-add a `status` wait). See [protected-routes](protected-routes.md).

## Verifying a change here

Render the prod export locally and drive it with headless Chrome (per
[web-prod-export](web-prod-export.md)): confirm the hero `<img src>` is in the SSR HTML, and
that the console shows **zero React hydration errors (#418/#4xx)** across `Accept-Language`
`fr`/`en`, mobile/desktop viewports, and a `theme-mode=light` cookie. A new provider or a
new server-rendered screen is the usual thing that reintroduces a mismatch.
