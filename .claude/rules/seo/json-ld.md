# Rule: JSON-LD structured data is a server-rendered `<script>` in the tree — never in `generateMetadata`

A page's Schema.org structured data (rich results, Knowledge Graph, AI/LLM
citations) is emitted as a **`<script type="application/ld+json">` rendered by a
web-only component in the React tree**, server-side. It does **not** live in the
route's `generateMetadata` and it does **not** live in the `loader`. Reference:
`src/pages/app/artwork/components/artwork-json-ld/ArtworkJsonLd.web.tsx` (mounted
by `ArtworkDetail`).

## JSON-LD is not Open Graph — they are two different layers

The single confusion to clear first: a page carries **both**, and they describe
the same entity, but they are not interchangeable.

| | **Open Graph** (`generateMetadata` `openGraph`) | **JSON-LD** (this rule) |
| --- | --- | --- |
| Format | `<meta property="og:…">` tags | a `<script type="application/ld+json">` block |
| Vocabulary | Open Graph protocol (`og:title`, `og:image`) | Schema.org (`VisualArtwork`, `Person`, `Place`) |
| Shape | flat key/value pairs | a graph of linked entities |
| Consumed by | **social** crawlers → share previews (Slack, iMessage, X) | **search** engines → rich results / Knowledge Graph, + LLMs |

The overlap in *content* (title, description, image, author, tags appear in both)
is not redundancy to factor out — it's two audiences. Keep the `openGraph` block
in `generateMetadata` ([open-graph](open-graph.md)) **and** the JSON-LD in
the component. Neither replaces the other.

## Why not `generateMetadata`, and why not the `loader`

Both are the intuitive place and both are **incapable** of it — this is confirmed
by Expo's own docs, not a convention we chose:

- **`generateMetadata`** returns a typed `Metadata` object that maps to
  `<meta>` / `<link>` / `<title>` only (`title`, `description`, `openGraph`,
  `twitter`, `robots`, `alternates`). There is **no** `script` / `jsonLd` /
  `structuredData` field — expo's `resolveOpenGraph` emits only the tags it knows.
- **The `loader`** must return JSON-serializable **data** and may set **response
  headers** (the Runtime API — that's how the hero `Link: preload` and
  `Cache-Control` are set). It has no mechanism to emit a head element or a
  `<script>`. Returning markup is not a loader capability.

So under `web.output: "server"` the only path that puts JSON-LD into the initial
HTML is a `<script>` **in the rendered tree**: the per-request `render.js` runs
the component and serializes it into the document. Verified — the `ld+json` block
appears in the export's HTML source (see the verify step below).

## Do **not** use the client `<Head>` (`expo-router/head`)

Expo's static-rendering docs mention `expo-router/head` for head elements, and it
*can* hold a JSON-LD `<script>` — but it's a **client-side** head manager, so the
tag depends on the JS a crawler never runs. That is the exact reason this app
moved off `<Seo>` to `generateMetadata` ([generate-metadata](generate-metadata.md)).
Structured data must be in the **server-rendered** source, so it's a tree
`<script>`, never `<Head>`.

## The component

A platform-split component, exactly like `ArtworkHero`:

- **`<Name>JsonLd.web.tsx`** builds the Schema.org object and returns
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.
  (`dangerouslySetInnerHTML` is the only way to emit a raw `<script>` body; the
  content is our own serialized data, no user HTML — suppress the biome
  `noDangerouslySetInnerHtml` lint on that line with a reason.)
- **`<Name>JsonLd.tsx`** (native) is a **no-op** returning `null` — there is no
  crawlable document on native. Both files export the same
  `type {Name}JsonLdProps` ([types-not-interface](../types-not-interface.md)).

Mount it, gated on the entity's own indexability:

```tsx
// verified only: an unverified piece is noindex with no share preview, so it
// gets no indexable structured data either — the policy stated, not inferred.
{artwork.verified && <ArtworkJsonLd artwork={artwork} artist={artist} />}
```

This mirrors the `generateMetadata` branch that returns `noindex` for an
unverified artwork ([generate-metadata](generate-metadata.md)): the two
must agree on what is a public document.

## The origin must be hydration-safe

The JSON-LD `url` (= the canonical) and any nested URL (`creator.url`) are
absolute, built from the request origin. But this `<script>` renders **on the
server and again on the client's first render**, and the two must serialize
byte-identically or React throws a hydration mismatch (#418) on the script.
`requestOrigin()` (`@/lib/seo/request-origin`) is **server-only** (it throws
outside a request), so read it only on the server and fall back to
`window.location.origin` in the browser — same host, same string:

```ts
const origin =
  typeof window === "undefined" ? requestOrigin() : window.location.origin;
```

`JSON.stringify` preserves insertion order, so the same seeded entity produces
identical JSON on both renders. Importing `@/lib/seo/request-origin` (which pulls
`expo-server`) in a `.web.tsx` is client-safe — its functions just aren't called
in the browser ([web-ssr-hydration](../web-ssr-hydration.md)).

## Building the object

- Pick the most specific Schema.org type (`VisualArtwork` for an artwork, not a
  bare `CreativeWork`). Type nested entities too (`Person`, `Place`,
  `GeoCoordinates`, `WebSite`).
- **Omit a field rather than emit an empty/placeholder one** — spread it in
  conditionally (`...(artwork.description ? { description } : {})`). Don't feed a
  marketing fallback into structured data; a missing field is cleaner than a fake
  one.
- Content pulled from the API (title, description, tags) is passed through as-is;
  no `serverT` here (unlike `generateMetadata`) — JSON-LD carries data, not UI
  copy. `keywords` is the tags joined with `", "`.
- Dates are the entity's ISO timestamps (`createdAt` → `dateCreated`,
  `updatedAt` → `dateModified`), matching the `article:*` times in `openGraph`.

## Adding JSON-LD to a new public route

1. Create `<Name>JsonLd.web.tsx` (+ the native `.tsx` no-op) building the right
   Schema.org type; resolve the origin with the server/client split above.
2. Mount it in the page's presentational component, gated on the entity's
   indexability (the same condition `generateMetadata` uses to allow indexing).
3. It's a **complement** to `openGraph` / `twitter`, not a replacement — the
   route keeps its `generateMetadata` ([generate-metadata](generate-metadata.md),
   [open-graph](open-graph.md)).
4. **Verify on the prod export**, never the dev server
   ([web-prod-export](../web-prod-export.md)) — and on a **free port**, since a stale
   `expo serve` already holding `:8081` will answer `curl` with old HTML and hide
   the change:

   ```sh
   bun run export:web && bun expo serve dist --port 8099
   curl -s http://localhost:8099/<route> | grep ld+json   # the block must be present
   ```

   Then validate the payload with Google's Rich Results Test.
