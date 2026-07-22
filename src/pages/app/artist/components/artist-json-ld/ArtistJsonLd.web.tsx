import type { Artist, SocialLinks } from "@/lib/api/artists";
import { requestOrigin } from "@/lib/seo/request-origin";

export type ArtistJsonLdProps = {
  artist: Artist;
};

// Collect the artist's social entries as `sameAs` URLs. The API stores each as a
// full URL already, which is exactly what Schema.org wants — no expansion needed.
const sameAsUrls = (socialLinks: SocialLinks): string[] =>
  (Object.keys(socialLinks) as (keyof SocialLinks)[])
    .filter((platform) => !!socialLinks[platform]?.trim())
    .map((platform) => socialLinks[platform] as string);

// Emit Schema.org `ProfilePage` structured data (with a `Person` main entity) as
// a server-rendered `<script type="application/ld+json">`. `generateMetadata` can
// only produce meta/link tags, so the JSON-LD rides the React tree instead — Google
// reads it anywhere in the document. Only ever mounted for a *verified* (public,
// indexable) artist — see `ArtistDetail`. Mirrors `ArtworkJsonLd`.
//
// The origin must be identical on the server render and the client's first render
// or the <script> mismatches on hydration (#418). `requestOrigin()` is server-only
// (it throws outside a request), so the browser reads `window.location.origin`
// instead — same host, same string, both sides agree.
export const ArtistJsonLd = ({ artist }: ArtistJsonLdProps) => {
  const origin =
    typeof window === "undefined" ? requestOrigin() : window.location.origin;
  const url = `${origin}/artists/${artist.slug}`;
  const sameAs = sameAsUrls(artist.socialLinks);

  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: artist.createdAt,
    dateModified: artist.updatedAt,
    mainEntity: {
      "@type": "Person",
      name: artist.name,
      alternateName: `@${artist.slug}`,
      url,
      ...(artist.avatarUrl ? { image: artist.avatarUrl } : {}),
      ...(artist.description ? { description: artist.description } : {}),
      ...(artist.tags.length ? { keywords: artist.tags.join(", ") } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    isPartOf: { "@type": "WebSite", name: "ArtKeeper", url: origin },
  };

  return (
    // JSON.stringify preserves insertion order, so the same seeded artist
    // serializes byte-identically on both renders — hydration-safe.
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: our own serialized JSON-LD (no user HTML) — the only way to emit a raw <script> body.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
