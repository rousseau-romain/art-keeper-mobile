import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import type { DataArtworkPageLoaded } from "@/app/(tabs)/artworks/[slug]";
import { useArtist } from "@/lib/api/artists";
import {
  excludeArtwork,
  useArtworkBySlug,
  useArtworksByArtist,
  useNearbyArtworks,
} from "@/lib/api/artworks";
import { ArtworkDetail } from "@/pages/app/artwork/components/artwork-detail/ArtworkDetail";
import { ArtworkNotFound } from "@/pages/app/artwork/components/artwork-not-found/ArtworkNotFound";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type DetailScreenProps = {
  slug: string;
  /** What the route's server `loader` resolved — web SSR only, `undefined` on native. */
  initial?: DataArtworkPageLoaded;
};

/**
 * The artwork detail. Every piece of data it renders is read from the React
 * Query cache, **seeded** from the route's server `loader` on web — never
 * rendered from the loader payload directly.
 *
 * That indirection is the whole point: `useLoaderData` hands back a value frozen
 * for the life of the page, so a screen fed from it can't react to a cache write.
 * Liking from the hero (or from any nearby / more-by card) patches the query
 * cache — the button only flips because this screen is subscribed to it. Reading
 * the loader payload directly is what left the like needing an F5 to show.
 *
 * The seed keeps the SSR win intact (the hero ships in the HTML, no client fetch
 * in front of it) and is backdated, so a background refetch on mount reconciles
 * it with the server. Native has no loader: `initial` is `undefined` there, and
 * the same hooks just fetch client-side.
 */
export const DetailScreen = ({ slug, initial }: DetailScreenProps) => {
  const { t: tr } = useTranslation();
  const hydrated = useIsHydrated();

  const { data: artwork, isLoading } = useArtworkBySlug(slug, initial?.artwork);
  const { data: artist } = useArtist(artwork?.artistId, initial?.artist);
  const { nearby, radius } = useNearbyArtworks(artwork, initial?.nearbyPage);
  const { artworks: byArtist } = useArtworksByArtist(
    artwork?.artistId ?? "",
    initial?.moreByArtistPage
  );

  // Mirrors the three render branches below, computed before them (hooks can't
  // sit after a return). `undefined` while loading leaves the SSR <title> alone;
  // once resolved it matches what `generateMetadata` served on the initial
  // document, so an arrival rewrites the title with its own value (a no-op) and
  // only a client-side navigation actually changes it.
  useDocumentTitle(
    artwork?.title ??
      (!hydrated || isLoading ? undefined : tr("artwork.notFound"))
  );

  // Data first, and deliberately before the `hydrated` gate: with a loader seed
  // the artwork is there on the server render AND on the client's first render
  // (same payload, same query key), so both produce this tree — the SSR hero
  // survives hydration. Gating on `hydrated` here instead would blank it.
  if (artwork) {
    return (
      <ArtworkDetail
        artwork={artwork}
        artist={artist}
        nearby={nearby}
        nearbyRadius={radius}
        moreByArtist={excludeArtwork(byArtist, artwork.id)}
      />
    );
  }

  // No seed: native, or a loader that came back empty. `hydrated` is false during
  // the server render AND the client's first render, so both sides show the
  // spinner — the tree matches (no #418) and the author never reads "not found"
  // about a piece that is about to appear on their own authenticated fetch.
  if (!hydrated || isLoading) return <ScreenFallback />;
  return <ArtworkNotFound />;
};
