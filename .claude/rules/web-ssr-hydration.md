# Rule: web SSR renders the *caller's* page — keep the first render deterministic

On web (`web.output: "server"`, `unstable_useServerRendering`) the app **server-renders the
artwork pages** so the LCP hero `<img>` ships in the initial HTML (paired with the loader's
`Link: rel=preload` header — see [web-prod-export](web-prod-export.md)). The render is
**authenticated**: it runs as whoever holds the request's session cookie, so a signed-in
visitor's own unverified pieces and their `likedByMe` are in the HTML, not patched in later.

For that to work, **the server render and the client's *first* render must produce the same
tree**, or React throws a hydration error (#418) and regenerates the tree on the client —
defeating the SSR win. Everything below exists to hold that invariant. The whole trick is
that every per-visitor input is read from **one source both sides can read the same way at
the same moment**: the request's cookies. Native is unaffected (no SSR); the split is always
by `Platform.OS` / a `.web.ts` file.

Wired across: `_layout.tsx` (gate), `AuthProvider`/`token-store` (`hydrated`), `lib/query.ts`
(per-request client), `artworks/[slug]/index.tsx` + `useLoaderArtwork` (loader seeding),
`lib/api/ssr-auth.ts` + `lib/is-server-render.ts` (SSR auth), `lib/auth/session-cookie*`
(chrome), `i18n/resolve-i18n*` + `i18n/server.ts` (server language), and `theme-mode-store*`
+ `ThemeProvider` + `+html.tsx` (server theme).

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

- `useArtworkBySlug(slug, initialData)` / `useArtworks(…, initialData)` pass it as
  `initialData` **with `initialDataUpdatedAt: 0`** — see the next section; that backdate is
  what makes the seed refetch.
- `useLoaderArtwork` is split: `.web.ts` reads `useLoaderData`, native returns `undefined`.
- **`useLoaderData` suspends on client-side navigation** (not on the initial load — the data
  is in the HTML). So the route's `Screen` wraps the page in `<Suspense fallback={<ScreenFallback/>}>`.

See [data-fetching](data-fetching.md) for the query-layer conventions this builds on.

## The loader runs as the caller — forward the cookie, per call

The web SSR **is** authenticated: the app is served from the same origin as the API
(`/api/*`), so Better Auth's httpOnly session cookie — host-only, `Path=/`, `SameSite=Lax`
— rides the top-level document request. The loader forwards it to each SDK call, and the
API's `optionalAuth` does the rest: an author's own unverified artwork server-renders for
them instead of 404ing.

```ts
// src/app/(tabs)/artworks/[slug]/index.tsx
export const loader: LoaderFunction<DataArtworkPageLoaded> = async (request, params) => {
  const headers = forwardedCookie(request);          // { cookie } | undefined
  const artwork = await fetchArtworkBySlug(slug, headers);
  // …every call in the Promise.all takes the same `headers`
```

- **Per call — never `client.setConfig`.** The generated client is a module singleton the
  server shares across concurrent requests; a cookie set on it would sign the next
  visitor's fetch. Same leak the per-request QueryClient exists to prevent. `forwardedCookie`
  (`src/lib/api/ssr-auth.ts`) is the only way in.
- **Never send the bearer token instead.** It lives in `localStorage`, and `token-store`'s
  mirror is module scope — writing it server-side is the Alice-signs-Bob's-request bug.
  `client.ts` therefore mutes `setToken` under `isServerRender()`, and the mirror stays
  `null` on the server **by design** (see `@/lib/is-server-render`).
- **Personalizing a loader cannot cause #418.** Its payload is serialized into the HTML and
  `useLoaderData` hands the client's first render the identical object — server and client
  read one source. This is what makes SSR auth tractable at all; the *chrome* is the part
  that needs care (next section).
- **The HTML is now per-visitor**, so it must never be cached and handed to the next
  visitor. Two independent guards, and a new SSR-authenticated route needs **both**:
  1. **At the origin** — the loader emits `Cache-Control: private, no-store` whenever the
     request carries a cookie (set it *before* the entity lookup: the chrome is personalized
     even on a not-found). This travels with the response, so no dashboard has to be right.
     `setResponseHeaders` **accumulates** across calls, so this doesn't clobber the hero `Link`.
  2. **At Cloudflare** — the cache rule must never match **`/_expo/loaders/`**. That path is
     not a static asset: it's how a *client-side* navigation fetches the loader payload
     (`` `/_expo/loaders${pathname}` ``, see the client bundle), so it now returns the caller's
     private data — verified: anonymous `{}` (2 B) vs. 14 KB with the artwork when signed in.
     A rule scoped to `starts_with(http.request.uri.path, "/_expo/")` therefore caches one
     user's data and serves it to the next. **Scope it to `/_expo/static/`** — the immutable
     hashed bundle — and nothing else under `/_expo/`.

     This is the trap: that rule was *correct* while the loaders were anonymous. Turning on
     SSR auth is what made it a leak, silently, with no change to the rule. HTML documents
     themselves need no bypass rule (Cloudflare doesn't cache `text/html` by default) — the
     danger is entirely in over-broad asset rules.

     If a cache rule must overlap a personalized path anyway, its Edge TTL has to be *"Use
     cache-control header if present"*; **"Ignore cache-control"** discards guard (1) and the
     leak comes straight back. Note cache settings are a *non-terminating* action, so **the
     last matching rule wins** — an override goes **below** what it corrects, not above.
- `PrivateDetailScreen` stays: native has no loaders (`useLoaderArtwork.ts` returns
  `undefined`), and a genuinely unknown slug must still land on the not-found.
- **`generateMetadata` stays anonymous** — a crawler is anonymous anyway, so a private page
  keeps its `notFound` title + `robots: noindex, follow`
  ([generate-metadata](seo/generate-metadata.md)). Known cost: an author sees their
  artwork render fully under a "not found" `<title>`. Forward the cookie there too if that
  ever matters more than the extra round-trip.

## The chrome paints signed-in — from a profile cookie, read sync on both sides

The loader fixes the *content*; the *chrome* (tab bar, admin tab, like button) is driven by
`AuthProvider`, whose session query is `undefined` on the client's first render → `status:
"loading"`. Render the server as `"authenticated"` and every auth-driven branch throws #418.

The fix is the **same deal the theme makes**: put the value in a cookie so both sides read
it *synchronously* from one source.

```ts
// src/lib/auth/AuthProvider.tsx
const [initialProfile] = useState(readProfileCookie);   // server: Cookie header · browser: document.cookie
const session = useQuery({
  queryKey: SESSION_KEY,
  queryFn: getSession,
  enabled: hydrated,
  initialData: initialProfile ? ({ user: initialProfile } as SessionResponse) : undefined,
  initialDataUpdatedAt: initialProfile ? 0 : undefined,   // ← stale on arrival → mount refetch
});
```

- **`ak-profile` is not a credential** (`src/lib/auth/session-cookie.web.ts`). The httpOnly
  Better Auth cookie remains the only thing that authenticates; this one carries the minimum
  the UI branches on (`id`, `role` — no name, no email) and is readable by page JS. Forging it
  fakes some chrome and nothing else: the API still refuses, and the mount refetch corrects
  the display. Treat its contents as untrusted input — a malformed value must parse to `null`,
  never throw (on the server that would 500 the document).
- **The seed is backdated for the same reason loader seeds are** (next section). Undated it'd
  sit fresh for `staleTime`, leaving an expired session's chrome standing with nothing to
  correct it.
- **Don't try a React Query `dehydrate`/`HydrationBoundary` instead.** `+html.tsx` and the app
  tree render in one pass, so the `<head>`'s `<script>` is emitted before `dehydrate()` has
  anything to give; expo-router exposes no hook for it.
- **Accepted cost**: a profile cookie outliving its session paints signed-in, then flips on the
  refetch — a *flash*, not a mismatch. Same trade the language override already makes.

> **⚠️ Open issue — this seed has produced a real #418.** Reported against the dev server in
> `artworks/_layout.tsx`'s `headerRight`: the client rendered the `LogIn` button (`status !==
> "authenticated"`) over SSR HTML that omitted it, i.e. **the server read the profile cookie and
> the client's first render didn't**. `ak-profile` is the only thing that can make the two
> disagree on `status` — before it, both rendered `"loading"` and the branch was unreachable.
>
> Not reproduced yet: a fresh headless browser is clean across session×profile×dead-session and
> mobile/desktop viewports, on both the dev server and the prod export. The untested gap is a
> *real* browsing session (a `localStorage` token, a cookie written by the live sign-in flow, a
> Metro hot-reload mid-session) rather than injected cookies.
>
> Until the cause is known, treat this section as **unproven**. Dropping `initialData` /
> `initialDataUpdatedAt` from the session query reverts to the old `"loading"`-both-sides
> behaviour and is safe — the loader personalization above is independent of it and keeps working.

### A loader seed MUST be backdated — `initialDataUpdatedAt: 0`

The detail page is the loud version of the problem (a 404 → a whole page missing). The
**listing** is the quiet one: the loader's page is the *public* list, so a signed-in user's
own unverified pieces (and their `likedByMe`) are simply absent from the HTML. The client is
supposed to refetch and personalize it — and that only happens if the seed is **backdated**:

```ts
initialData: initialData ? { pages: [initialData], pageParams: [{} as never] } : undefined,
initialDataUpdatedAt: initialData ? 0 : undefined,   // ← without this, nothing refetches
```

`initialData` **without** `initialDataUpdatedAt` is stamped `Date.now()` (query-core:
`dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0`), so with this app's
`staleTime: 30_000` (`src/lib/query.ts`) the seed is **fresh**, the mount refetch is skipped
— and since React Query only refetches on an **event** (mount / focus / reconnect), and the
mount just passed, the anonymous list **stands**. Not for 30s: until something else triggers
a fetch. `0` makes it stale on arrival, so the mount refetch fires, in the **background**
(seeded rows stay on screen — no flash, no mismatch).

`0` works because query-core uses `??`, not `||` — a falsy `0` is honoured.

**A seed that is never revalidated is worse than no seed**: it looks right and silently
serves every visitor the anonymous view. Any new `loader` → `initialData` path repeats this
line, or it isn't wired.

### Why the *cookie*, and never the token

The SSR used to be anonymous on purpose. The objections that kept it that way were real —
they didn't disappear, they became this design's constraints. Keep them in view before
touching any of it:

- **The API client is a module singleton.** The request interceptor reads `getToken()`
  (`src/lib/api/client.ts`) off `token-store`'s module-level mirror, and the response
  interceptor *writes* it via `setToken`. On the server that mirror is shared by concurrent
  requests — Alice's token would sign Bob's SSR fetch. It's the same leak the per-request
  QueryClient exists to prevent (above). Hence: the mirror is muted server-side, and the
  cookie is threaded explicitly per call. **Never** re-arm the global.
- **The HTML is personalized while a CDN caches it** (Cloudflare, in prod). It only works
  because the cache is bypassed on the session cookie. Ship a new SSR-authenticated route
  and that bypass must cover it.
- **The token is *not* duplicated into a cookie.** That was the old objection, and it still
  stands — a JS-readable token is no better than localStorage. What we added is a *profile*
  cookie carrying `id` + `role` and nothing else. The credential stays the httpOnly Better
  Auth cookie, which JS never touches.

**Same-origin is what buys all of this.** The API is served from the web app's own origin
(`/api/*`) precisely so the session cookie stays *host-only*. The rejected alternative —
`crossSubDomainCookies` with `Domain=.artkeeper.web-rows.com` — would have shipped the
session token to **every** sibling subdomain, including the Garage image host, on every
image request. There is no tighter `Domain` that reaches both the web and API hosts. If the
API ever moves back off-origin, this whole scheme has to be re-argued from that fact.

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
that the console shows **zero React hydration errors (#418/#4xx)** — anonymous *and*
signed-in, across mobile/desktop viewports and a `theme-mode=light` cookie. A new provider
or a new server-rendered screen is the usual thing that reintroduces a mismatch.

Two harness traps that both manufacture a **fake #418 on untouched pages** — check for these
before believing a failure:

- **Cookies must go through CDP `Network.setCookie`, never `Network.setExtraHTTPHeaders`.**
  A `Cookie` *header* reaches the server but leaves `document.cookie` empty, so the SSR
  renders signed-in while the client's first render reads no cookie — the exact mismatch this
  rule is about, produced entirely by the test. (Set the session **and** profile cookies
  together: `ak-profile` alone is self-erasing by design — `get-session` resolves `null` and
  the sync effect clears it.)
- **Only test with `Accept-Language` == the OS locale.** Headless Chrome keeps
  `navigator.language` on the system locale despite `--lang`, so any other value mismatches
  the server's language pick.

And assert the page **actually rendered** (non-trivial `innerText`, the expected chrome) — a
scenario whose bundle failed to load throws no hydration error either, and passes silently.
For the auth path specifically, prove both directions: no cookie → no admin tab; session +
profile → admin tab. Otherwise both sides render "loading", agree, and test nothing.
