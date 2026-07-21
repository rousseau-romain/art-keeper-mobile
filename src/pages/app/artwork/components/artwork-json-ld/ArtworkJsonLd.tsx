import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";

export type ArtworkJsonLdProps = {
  artwork: Artwork;
  artist?: Artist;
};

/** No structured data on native — there's no crawlable document to describe.
 *  Web-only; the real implementation lives in `ArtworkJsonLd.web.tsx`. */
export const ArtworkJsonLd = (_props: ArtworkJsonLdProps) => null;
