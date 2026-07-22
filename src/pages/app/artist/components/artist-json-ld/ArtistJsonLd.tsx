import type { Artist } from "@/lib/api/artists";

export type ArtistJsonLdProps = {
  artist: Artist;
};

/**
 * Native no-op: there's no crawlable document on native, so no structured data.
 * The web variant (`ArtistJsonLd.web.tsx`) emits the `ProfilePage` JSON-LD.
 */
export const ArtistJsonLd = (_props: ArtistJsonLdProps) => null;
