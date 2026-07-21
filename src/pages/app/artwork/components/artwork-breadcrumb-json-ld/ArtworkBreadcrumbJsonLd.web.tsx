import { useTranslation } from "react-i18next";
import type { Artwork } from "@/lib/api/artworks";
import { requestOrigin } from "@/lib/seo/request-origin";

export type ArtworkBreadcrumbJsonLdProps = {
  artwork: Artwork;
};

// Emit Schema.org `BreadcrumbList` structured data as a server-rendered
// `<script type="application/ld+json">`. Unlike `VisualArtwork`, the breadcrumb
// *is* eligible for a Google rich result (the crawl path shown under the SERP
// title), so it's a cheap, concrete win — hence its own <script> beside
// `ArtworkJsonLd` (see that file for why JSON-LD rides the tree rather than
// `generateMetadata`).
//
// Mounted only for a *verified* (public, indexable) artwork — see
// `ArtworkDetail`. An unverified piece is `noindex`, so it carries no indexable
// structured data.
//
// Same hydration contract as `ArtworkJsonLd`: the origin must be identical on
// the server render and the client's first render or the <script> mismatches on
// hydration (#418). `requestOrigin()` is server-only (throws outside a request),
// so the browser reads `window.location.origin` — same host, same string. The
// crumb labels come from i18n, whose first render is deterministic on both sides
// (a persisted locale override applies post-hydration as a flash, never a
// mismatch — like every other translated string on the page).
export const ArtworkBreadcrumbJsonLd = ({
  artwork,
}: ArtworkBreadcrumbJsonLdProps) => {
  const { t: tr } = useTranslation();
  const origin =
    typeof window === "undefined" ? requestOrigin() : window.location.origin;

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tr("artwork.meta.breadcrumb.home"),
        item: origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tr("artwork.meta.breadcrumb.list"),
        item: `${origin}/artworks`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: artwork.title,
        item: `${origin}/artworks/${artwork.slug}`,
      },
    ],
  };

  return (
    // JSON.stringify preserves insertion order, so the same artwork serializes
    // byte-identically on both renders — hydration-safe.
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own serialized JSON-LD (no user HTML) — the only way to emit a raw <script> body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
