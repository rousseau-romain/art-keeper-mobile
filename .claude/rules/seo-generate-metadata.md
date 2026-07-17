# Rule: SEO tags come from a route's `generateMetadata` — never a client `<Head>`

A web-facing route's `<title>` / description / Open Graph / canonical is produced
by an exported **`generateMetadata`** in the `src/app/**` route file. It runs
**server-side at request time** (`unstable_useServerRendering`, see
`app.config.ts`), so the tags land in the initial HTML — the only place a social
or search crawler will read them, since crawlers don't run the client JS that
`expo-router/head` (the old `<Seo>` component) depended on.

Reference: `src/app/(tabs)/artworks/[slug]/index.tsx` (dynamic, fetches the
artwork) and `src/app/(tabs)/artworks/index.tsx` (static title).

## It only covers the *initial document* — the tab title needs `useDocumentTitle`

`generateMetadata` resolves the `<head>` **once, server-side, per document**.
Expo Router never replays it in the browser: the client bundle only *validates*
that the export is a function (`expo-router/build/getRoutesCore.js`), and
`@expo/router-server/build/server/metadata.js` is the sole caller. A client-side
navigation refetches the route's `loader` payload (`/_expo/loaders/…`) — the
content changes — and leaves the `<head>` untouched. Clicking from one artwork to
the next left the first one's title in the tab.

React Navigation's own fallback can't rescue it: expo-router hard-disables it
(`const documentTitle = { enabled: false }` in `expo-router/build/ExpoRoot.js`).
**Don't try to flip it** — it isn't a prop (patching `node_modules` is the only
way), its formatter is `options?.title ?? route?.name`, i.e. the *navigator's*
static label (« Œuvre »), not the artwork's, and its effect has no dependency
array, so it would overwrite every server-resolved title at hydration.

So each routable **page screen** publishes its own title via
**`useDocumentTitle`** (`src/shared/hooks/useDocumentTitle.ts`, a no-op on
native / `.web.ts` on web):

```ts
// src/pages/app/artwork/screens/DetailScreen.tsx
useDocumentTitle(
  artwork?.title ?? (!hydrated || isLoading ? undefined : tr("artwork.notFound")),
);
```

- **It's an effect, never a render** — it runs neither on the server nor on the
  client's first render, so it can't cause a hydration mismatch
  ([web-ssr-hydration](web-ssr-hydration.md)).
- **`undefined` leaves the title alone**, so the SSR title stands during a load
  instead of flashing a generic label.
- **It's gated on focus** (`useIsFocused`): a Stack keeps the previous screen
  mounted, so without the gate a background refetch under the current screen would
  rewrite its title. The gate also restores the title on a back navigation for
  free.
- **The two must agree.** A screen's title is the same copy its route's
  `generateMetadata` returns — where the rule is conditional, both sides call one
  helper (`browseTitle`, `src/lib/seo/titles.ts`, which takes a `t` so `serverT`
  and `useTranslation().t` both fit). Otherwise a client-side navigation
  contradicts the document the server would have served for that URL.
- **Not a `<Head>` in disguise.** The ban below still holds: this touches only
  `document.title`, after hydration, for humans. Crawlers don't run the JS, so
  the HTML source stays `generateMetadata`'s alone.
- A **form sheet** (`artworks/filters`, `admin/location`) gets no call — its URL
  renders its anchor behind it, and the anchor already owns the title.

## The shape

```ts
import type { GenerateMetadataFunction } from "expo-router/server";
import { origin } from "expo-server";
import { serverT } from "@/lib/i18n/server";

export const generateMetadata: GenerateMetadataFunction = async (
  request,
  params,
) => {
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = origin();

  return {
    title: t("artwork.title.index"),
    alternates: {
      canonical: `${baseUrl}/artworks`,
    },
  };
};
```

- **It's an exported `const` arrow** typed `GenerateMetadataFunction` — the
  `export default function Screen()` exception in
  [export-const-functions](export-const-functions.md) covers the route's
  component only, not its server exports.
- **`generateMetadata` is a route export, like `loader`** — it's one of the few
  things allowed in a `src/app/**` file beside the navigator config and the
  screen delegation ([app-route-page-screens](app-route-page-screens.md)). The
  page screen never renders SEO tags itself.
- **Web-only, server-only.** Native ignores it. It resolves **outside the React
  tree**, so it can't call hooks — no `useTranslation`, no `useQuery`. Fetch with
  the generated SDK and translate with `serverT`, exactly as a `loader` does
  ([data-fetching](data-fetching.md)).
- **`import "@/lib/api/client"`** at the top of any route whose
  `generateMetadata` hits the API — the client is configured by a module
  side-effect, and `_layout`'s import may not have run before metadata resolves.
- A dynamic route's `params` value can be `string | string[]` — normalize it
  (`Array.isArray(params.slug) ? params.slug[0] : params.slug`).

## Copy is translated, like everywhere else

Every literal in the metadata goes through i18next
([i18n-translation](i18n-translation.md)) — but via **`serverT(acceptLanguage)`**
(`src/lib/i18n/server.ts`), not the `t` from `useTranslation`. The request's
`Accept-Language` picks the locale, matching the language the SSR render itself
uses ([web-ssr-hydration](web-ssr-hydration.md)). Content pulled from the API
(an artwork's title/description) is already server copy — pass it through as-is.

## The canonical — `origin()` + a template literal

Every indexable page declares `alternates.canonical` as an **absolute** URL built
from the **request's own origin**, so a page served from staging, prod, or a
preview deploy canonicalizes to itself rather than to a hardcoded host. Take the
origin from **`origin()`** (`expo-server`) into a `baseUrl` const at the top of
the function, and build the URL inline:

```ts
const baseUrl = origin();
// …
alternates: {
  canonical: `${baseUrl}/artworks/${artwork.slug}`,
},
```

- **Keep it inline — no `canonicalUrl` helper.** This is the documented Expo
  pattern; a wrapper module around one template literal is indirection for
  nothing.
- **`origin()` is request-scoped** — it throws outside a request. Only call it
  *inside* `generateMetadata` / `loader`, **never** at module scope or in a
  component.
- **The path is a sitemap URL** — leading slash, route-group parens stripped
  ([router-navigation-paths](router-navigation-paths.md)): `/artworks/:slug`,
  never `/(tabs)/artworks/…`.
- **Build the path from the resolved entity, not the raw param**
  (`artwork.slug`), so an alternate/legacy slug points at the real URL.
- **No canonical on a page that isn't there** — the not-found branch returns a
  `title` only; there's nothing to consolidate onto.

## Query params: canonical, or `noindex` — decide per param

A canonical pointing at the bare page tells Google *"don't index this variant"*.
That's right for a param that doesn't produce a distinct page, and **wrong** for
one that does — it throws away a page that could rank. So don't blanket-strip the
query string; classify each param by what its URL actually is
(`(tabs)/artworks/index.tsx` is the worked example):

| The URL is | Policy |
| --- | --- |
| A **curated landing page** with its own server-rendered content (one `tag`) | **Self-canonical**, with the param — plus its own `title`/`description`, since indexable pages must not share one |
| An **internal search-results** page (`q`) | `robots: { index: false, follow: true }` — unbounded and thin; `follow` still walks through to the content it lists |
| A **combinatorial** variant (several `tag`s) | `noindex, follow` too |
| A param with **no effect on content** (`scope`, which only narrows `q`) | Never in a canonical — it'd mint a duplicate URL for one page |
| **No params** | Canonical to the bare page |

- **Normalize before building the canonical.** Reuse the same helper the screen
  filters by (`toTagArray` — trims, lowercases, dedupes) and **sort**, so
  `?tag=b&tag=a` and `?tag=A` can't become extra URLs for one page.
- `encodeURIComponent` the value.

## Fetch failures still return a title

`generateMetadata` runs on every request for the page, so a rejected fetch there
fails the **document**. Wrap the fetch and fall back to a static translated title
— the screen renders its own not-found / error branch:

```ts
try {
  const artwork = await fetchArtworkBySlug(slug);
  if (!artwork) return { title: t("artwork.notFound") };
  // …full tags…
} catch {
  return { title: t("artwork.title.detail") };
}
```

Both `generateMetadata` and the `loader` fetch the same entity on the same
request — that's accepted duplication (they're separate server phases and can't
share a value); keep the fetch in one helper (`fetchArtworkBySlug`) used by both.

Note the outage case is mostly theoretical: the `loader` rethrows the same
failure and the route **500s with no HTML** before the metadata is served, so the
`catch` branch is defence-in-depth (and a 500 is never indexed regardless). The
branch that genuinely ships is the **soft 404** — an unknown slug returns HTTP
200 with a rendered not-found page, which is exactly why it needs `noindex`.

## Adding SEO to a new public route

1. Export `generateMetadata` from the `src/app/**` route file, **and** call
   `useDocumentTitle` with the same title in its page screen (see above) — the
   route covers the initial document, the hook covers client-side navigation.
2. `title` + `description` via `serverT`, or from the fetched entity.
3. `alternates.canonical` via `canonicalUrl(<sitemap path>)`.
4. `openGraph` + `twitter` when the page is meant to be shared — every tag is
   declared explicitly (nothing falls back to `title` / `description`). See
   [seo-open-graph](seo-open-graph.md).
5. Verify against the **prod export**, not the dev server: `curl` the route and
   confirm the tags are in the HTML source (see
   [web-prod-export](web-prod-export.md)).

**Authenticated routes** (the create-artwork wizard, admin, `[slug]/edit`) get
**no** `generateMetadata` — there is no crawler-reachable document to describe.
Same for the `filters` formsheet (its URL just renders the listing behind it) and
the entry `index.tsx` (a pure `<Redirect>` — no document to describe).

`generateMetadata` **resolves as the caller**, exactly like the `loader` beside it
([web-ssr-hydration](web-ssr-hydration.md)) — it passes `forwardedCookie(request)`
to its fetch. **Both server phases of one request must agree about who is
asking.** They were once split (the loader authenticated, the metadata anonymous)
and the mismatch was visible: an author opened their own unverified artwork, the
page rendered in full, and the tab read *"Œuvre introuvable."* — the API had 404'd
the metadata's anonymous fetch while serving the loader's authenticated one.

This costs nothing extra: it's the same fetch, plus a cookie. And it stays safe
because **a crawler carries no cookie** — it gets the anonymous 404 and the
`notFound` title exactly as before, so the public SEO surface is unchanged.

What personalizing it does *not* license: **a private page must never declare
itself indexable.** An unverified artwork is readable by its author and admins
alone, so it returns its real `title` + `description` and then stops — `noindex,
follow`, no canonical, no `openGraph` (see [seo-open-graph](seo-open-graph.md)).
Branch on the entity's own visibility, not on whether a cookie was sent:

```ts
const artwork = await fetchArtworkBySlug(slug, forwardedCookie(request));
// …
if (!artwork.verified) {
  return { title: artwork.title, description, robots: { index: false, follow: true } };
}
```

The crawler can't reach that branch anyway (no cookie → 404 above), so the tag is
belt-and-braces — write it regardless: the policy should be stated by the route,
not inferred from an access rule two systems away.

Because the tags are now per-visitor, the document must not be cached and handed
to the next visitor — the `loader`'s `Cache-Control: private, no-store` already
covers this, and the CDN caveats in [web-ssr-hydration](web-ssr-hydration.md)
apply to the metadata for the same reason they apply to the loader.

## `robots` — always explicit, by kind of page

**Every** `generateMetadata` declares `robots`, including the indexable pages.
Technically `index, follow` is the crawler default and the tag is a no-op there —
we write it anyway so each route states its policy instead of leaving the reader
to infer it from an absent tag. The policy by kind of page:

| Kind of page | `robots` | Canonical |
| --- | --- | --- |
| Content — the browse listing, an artwork detail, a tag landing | `index: true, follow: true` | yes, self |
| Sign-in, private/account-scoped (`/settings`), admin | `index: false, follow: false` | **no** |
| Search results, multi-tag combos, pagination | `index: false, follow: true` | no |
| Soft 404 (an unknown slug still renders a page) | `index: false, follow: true` | no |
| A whole non-production environment (staging) | `index: false` — globally, see below | n/a |

- **`follow: true` on the search/error rows** deliberately: the page is worthless
  to index but its links lead to real artworks, so let crawlers walk through.
  Auth and account pages get `follow: false` — nothing to walk to.
- **Never pair `noindex` with a canonical.** A canonical means "index this URL
  instead"; alongside a `noindex` the two contradict. A noindexed page declares
  `title` (+ `description`, which still feeds the browser tab and link previews)
  and nothing else.
- `/login` is `noindex, nofollow` even though it's public and carries the hero's
  marketing copy: a sign-in form is an auth entry point, not content. `/artworks`
  is the app's real entry page.

## Non-production hosts are `noindex` — globally, from the shell

The canonical is built from the **request's own origin**, so staging declares
*itself* as the canonical version of content that also exists in production —
two hosts competing over one corpus. The environment therefore opts out of the
index wholesale: `EXPO_PUBLIC_SEO_NOINDEX=1` (a **build-time** Docker arg, see
[web-prod-export](web-prod-export.md)) makes `src/app/+html.tsx` emit
`<meta name="robots" content="noindex, nofollow">`. Unset in production.

It lives in the **shell**, not in the routes, for two reasons:

- **It must cover every page.** Routes with no `generateMetadata` of their own
  (the create-artwork wizard, admin) are still served to crawlers — their guards
  are client-side. Only the shell wraps all of them.
- **Nothing else can.** A `+middleware.ts` can't add a header to a route's
  response — `setResponseHeaders` doesn't apply from there (verified: the header
  never lands), and returning a `Response` replaces the render entirely.

When a route also declares its own `robots`, both tags are emitted; crawlers
apply the most restrictive, so the global `noindex` still wins. Don't try to
reconcile them.

## The public route set

| Route | Metadata |
| --- | --- |
| `(tabs)/artworks/index.tsx` | title + `index, follow` + canonical; per-param policy (see above) — one `tag` is self-canonical, `q` / multi-tag are `noindex, follow` |
| `(tabs)/artworks/[slug]/index.tsx` | title + description + `index, follow` + canonical + `openGraph` + `twitter` ([seo-open-graph](seo-open-graph.md)), from the fetched artwork; its not-found / outage branches are `noindex, follow` |
| `(auth)/login.tsx` | title + description (`auth.tagline`) + `noindex, nofollow` |
| `settings.tsx` | title + `noindex, nofollow` |
