import type { Artwork } from "@/lib/api/artworks";

export type ArtworkBreadcrumbJsonLdProps = {
  artwork: Artwork;
};

/** No structured data on native — there's no crawlable document to describe.
 *  Web-only; the real implementation lives in `ArtworkBreadcrumbJsonLd.web.tsx`. */
export const ArtworkBreadcrumbJsonLd = (_props: ArtworkBreadcrumbJsonLdProps) =>
  null;
