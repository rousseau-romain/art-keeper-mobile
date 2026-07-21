import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { requestOrigin } from "@/lib/seo/request-origin";

export type ArtworkJsonLdProps = {
  artwork: Artwork;
  artist?: Artist;
};

// Emit Schema.org `VisualArtwork` structured data as a server-rendered
// `<script type="application/ld+json">`. `generateMetadata` can only produce
// meta/link tags (expo renders no <script> from it), so the JSON-LD rides the
// React tree instead — Google reads it anywhere in the document, head or body.
//
// Only ever mounted for a *verified* (public, indexable) artwork — see
// `ArtworkDetail`. An unverified piece is `noindex` with no share preview, so it
// gets no structured data either (the policy stated by the route, not inferred).
//
// The origin must be identical on the server render and the client's first
// render or the <script> mismatches on hydration (#418). `requestOrigin()` is
// server-only (it throws outside a request), so the browser reads
// `window.location.origin` instead — same host, same string, both sides agree.
export const ArtworkJsonLd = ({ artwork, artist }: ArtworkJsonLdProps) => {
  const origin =
    typeof window === "undefined" ? requestOrigin() : window.location.origin;
  const url = `${origin}/artworks/${artwork.slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    url,
    image: artwork.imageUrl,
    ...(artwork.description ? { description: artwork.description } : {}),
    ...(artwork.tags.length ? { keywords: artwork.tags.join(", ") } : {}),
    dateCreated: artwork.createdAt,
    dateModified: artwork.updatedAt,
    ...(artist
      ? {
          creator: {
            "@type": "Person",
            name: artist.name,
            url: `${origin}/artists/${artist.slug}`,
          },
        }
      : {}),
    contentLocation: {
      "@type": "Place",
      geo: {
        "@type": "GeoCoordinates",
        latitude: artwork.latitude,
        longitude: artwork.longitude,
      },
    },
    isPartOf: { "@type": "WebSite", name: "ArtKeeper", url: origin },
  };

  return (
    // JSON.stringify preserves insertion order, so the same seeded artwork
    // serializes byte-identically on both renders — hydration-safe.
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own serialized JSON-LD (no user HTML) — the only way to emit a raw <script> body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
