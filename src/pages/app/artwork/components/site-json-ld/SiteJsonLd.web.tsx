import { requestOrigin } from "@/lib/seo/request-origin";

export type SiteJsonLdProps = Record<string, never>;

// Emit the site-level Schema.org identity — `Organization` + `WebSite` — as a
// server-rendered `<script type="application/ld+json">`. It establishes the brand
// entity ("ArtKeeper", logo) and, via `WebSite.potentialAction` → `SearchAction`,
// makes the site eligible for the Google Sitelinks Searchbox. `@id` links the two
// nodes (the WebSite's publisher IS the Organization).
//
// Mounted once, on the *focused* browse listing — the app's real entry document
// (`/` is a bare `<Redirect>` to `/artworks`). Not on the seeded background anchor
// (see `IndexScreen`'s focus gate): an occluded anchor would inject this site
// identity into a deep-linked sibling's document, whose canonical is the artwork,
// not the site.
//
// Same hydration contract as `ArtworkJsonLd`: the origin must be identical on the
// server render and the client's first render or the <script> mismatches on
// hydration (#418). `requestOrigin()` is server-only (throws outside a request),
// so the browser reads `window.location.origin` — same host, same string. The
// brand name is a literal ("ArtKeeper"), not translated — like `og:site_name` and
// the `isPartOf` node in `ArtworkJsonLd`.
export const SiteJsonLd = (_props: SiteJsonLdProps) => {
  const origin =
    typeof window === "undefined" ? requestOrigin() : window.location.origin;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#org`,
        name: "ArtKeeper",
        url: origin,
        // Self-hosted at a stable public URL (like the fonts / leaflet assets),
        // so it survives Metro's asset hashing — a 1024×1024 raster (Google does
        // not accept the .ico favicon for Organization logo).
        logo: `${origin}/icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: "ArtKeeper",
        publisher: { "@id": `${origin}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          // The browse listing IS the search results page; `q` is the free-text
          // param it filters by (see `IndexScreen` / the route loader).
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/artworks?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    // JSON.stringify preserves insertion order, so this serializes byte-identically
    // on both renders — hydration-safe.
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own serialized JSON-LD (no user HTML) — the only way to emit a raw <script> body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
