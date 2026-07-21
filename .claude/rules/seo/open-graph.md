# Rule: the share preview is declared tag by tag — expo infers nothing

A page's social preview (Slack, iMessage, WhatsApp, X, Facebook) comes from the
`openGraph` / `twitter` fields of the `Metadata` a route's **`generateMetadata`**
returns. Everything in [generate-metadata](generate-metadata.md) applies
unchanged — it's the same server-only export, resolving outside the React tree,
with copy from `serverT` and the origin from `origin()`. This rule covers only
what's specific to the preview.

Reference: `src/app/(tabs)/artworks/[slug]/index.tsx`.

## Nothing falls back — write every tag

The single most important fact, and the one that looks wrong until you check:
**expo emits only the fields you pass**. `resolveOpenGraph`
(`@expo/router-server/build/utils/metadata/resolve.js`) walks the object and
pushes one tag per present key. There is **no** default `og:type`, **no** `og:url`
derived from `request.url`, and `og:title` / `og:description` do **not** fall back
to the page's `title` / `description`.

So a page's title is written twice — once for the `<title>`, once for `og:title`.
That's not a redundancy to factor out; it's the API.

```ts
// No — reads like it inherits the title. It doesn't: og:title is simply absent,
// and the preview falls back to the URL.
return {
  title: artwork.title,
  openGraph: { images: artwork.imageUrl },
};
```

A **falsy** value drops its tag silently (`pushResolvedProperty` skips it), so an
empty string is the same as omitting the field — feed `og:description` the same
translated fallback the page description uses, never a raw nullable column.

## What a shareable page declares

Any page meant to be shared declares the full set — `type`, `url`, `siteName`,
`title`, `description`, `images`, plus `twitter`:

```ts
const url = `${baseUrl}/artworks/${artwork.slug}`;

return {
  title: artwork.title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "ArtKeeper",
    title: artwork.title,
    description,
    images: { url: artwork.imageUrl, alt: artwork.title },
  },
  twitter: {
    card: "summary_large_image",
    title: artwork.title,
    description,
    images: { url: artwork.imageUrl, alt: artwork.title },
  },
};
```

- **`og:url` is the canonical** — the same absolute URL, from the **same const**,
  never a second template literal that can drift. Build it from the resolved
  entity's slug like the canonical does.
- **Never `url: request.url`.** A shared link carries the query string that came
  with it (`?utm_source=…`), so `request.url` would mint a different `og:url` per
  share and scatter the engagement Facebook consolidates onto one URL. The
  documented Expo snippet uses `request.url`; we don't.
- **`siteName` is a brand, not copy** — the literal `"ArtKeeper"`, **not**
  translated. It's the explicit exception to
  [i18n-translation](../i18n-translation.md); `title` / `description` still go
  through `serverT`.

## Images: absolute URL, object form, always `alt`

Expo does **not** resolve relative paths — `resolveOpenGraph` pushes the string
verbatim. A relative `og:image` reaches the crawler relative and resolves to
nothing. Ours are already absolute (`artwork.imageUrl` is served by Garage/S3).

Use the **object** form so the image carries an `alt`. `width` / `height` are
omitted deliberately: the API's `Artwork` has no dimensions
(`generated/types.gen.ts`), and inventing them tells crawlers to reserve the
wrong box. Add them the day the API returns them.

`twitter.images` is a **different type** (`MetadataTwitterImage`): `url` + `alt`
only. Copying a `width`/`height` from `openGraph` there won't compile.

- **`card: "summary_large_image"`** whenever there's an image — the default card
  renders a small square thumbnail beside the text instead of the hero.

## `type: "article"` is what unlocks the `article:*` tags

`resolveOpenGraph` emits `article:published_time`, `article:modified_time`,
`article:section`, `article:tag` and `article:author` **only when
`type === "article"`**. Set any other type and those fields are dropped with no
error — you'd read the code and believe they ship.

```ts
openGraph: {
  type: "article",
  publishedTime: artwork.createdAt,
  modifiedTime: artwork.updatedAt,
  tags: artwork.tags,
  authors: artist ? [artist.name] : undefined,
},
```

Dated, attributed content (an artwork detail) is `article`. A listing or landing
page is `website` — and there, `publishedTime` / `tags` have no meaning anyway.

### An extra fetch for one tag: pay for it knowingly, and isolate it

Filling `authors` means resolving a **related** entity (the artist). Its id comes
from the main entity, so the call **can't be parallelized** — it's a second,
sequential round-trip in front of the document's first byte. That's the price of
`article:author`; decide it explicitly rather than reaching for the data because
it's there.

When you take it, the fetch carries its **own `catch` → `undefined`**:

```ts
const artist = artwork.artistId
  ? await getArtistsById({ path: { id: artwork.artistId } })
      .then((res) => res.data)
      .catch(() => undefined)
  : undefined;
```

Without the local catch it lands in `generateMetadata`'s enclosing `catch`, whose
whole job is to degrade the page to a static title + **`noindex`**
([generate-metadata](generate-metadata.md)). A failed artist lookup would
then deindex a perfectly good artwork. **An optional tag must never be able to
fail the page.**

## No `og:locale`, no `alternates.languages`

One URL serves both `fr` and `en` — the SSR render picks the language from the
request's `Accept-Language` ([web-ssr-hydration](../web-ssr-hydration.md)). An
`og:locale` would therefore describe the language of *one crawler's fetch*, not a
property of the URL, and `alternates.languages` would advertise per-language URLs
that don't exist. Both come back the day the app has `/fr/…` / `/en/…` routes.

## Where a preview doesn't belong

- **The not-found / error branches** — there's no entity to describe, and they're
  `noindex` already. Title only.
- **`noindex, nofollow` auth and account pages** (`/login`, `/settings`) — a
  sign-in form and a preferences panel aren't documents anyone shares. `title` +
  `description` is the whole story there.

## Verifying

Against the **prod export**, never the dev server (see
[web-prod-export](../web-prod-export.md)) — the tags must be in the HTML source,
since crawlers don't run the client JS:

```sh
bun expo export -p web && bunx expo serve dist
curl -s http://localhost:8081/artworks/<slug> | grep -E 'og:|twitter:|canonical'
```

Check that `og:url` and `link rel=canonical` are byte-identical, that `og:image`
is absolute, and that the `article:*` tags actually appear (their absence is the
symptom of a non-`article` `type`).
