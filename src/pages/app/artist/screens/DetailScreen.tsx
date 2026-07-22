import { useTranslation } from "react-i18next";
import type { DataArtistPageLoaded } from "@/app/(tabs)/artists/[slug]";
import { useArtistBySlug } from "@/lib/api/artists";
import { useArtworksByArtist } from "@/lib/api/artworks";
import { ArtistDetail } from "@/pages/app/artist/components/artist-detail/ArtistDetail";
import { ArtistNotFound } from "@/pages/app/artist/components/artist-not-found/ArtistNotFound";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

export type DetailScreenProps = {
  slug: string;
  /** What the route's server `loader` resolved — web SSR only, `undefined` on native. */
  initial?: DataArtistPageLoaded;
};

/**
 * The artist profile. Every piece of data it renders is read from the React Query
 * cache, **seeded** from the route's server `loader` on web — never rendered from
 * the loader payload directly, so a follow mutation that patches the cache
 * re-renders the screen (mirrors the artwork `DetailScreen`).
 *
 * The seed keeps the SSR win intact and is backdated, so a background refetch on
 * mount reconciles it with the server. Native has no loader: `initial` is
 * `undefined`, and the same hooks just fetch client-side.
 */
export const DetailScreen = ({ slug, initial }: DetailScreenProps) => {
  const { t: tr } = useTranslation();
  const isHydrated = useIsHydrated();

  const { data: artist, isLoading } = useArtistBySlug(slug, initial?.artist);
  const { artworks } = useArtworksByArtist(
    artist?.id ?? "",
    initial?.artworksPage
  );

  // Mirrors the render branches below. `undefined` while loading leaves the SSR
  // <title> alone; once resolved it matches what `generateMetadata` served.
  useDocumentTitle(
    artist?.name ??
      (!isHydrated || isLoading ? undefined : tr("artist.notFound"))
  );

  // Data first, before the `isHydrated` gate: with a loader seed the artist is
  // there on both the server render and the client's first render (same payload,
  // same query key), so both produce this tree — SSR survives hydration.
  if (artist) {
    return <ArtistDetail artist={artist} artworks={artworks} />;
  }

  // No seed: native, or a loader that came back empty. `isHydrated` is false on
  // the server render AND the client's first render, so both show the spinner.
  if (!isHydrated || isLoading) return <ScreenFallback />;
  return <ArtistNotFound />;
};
