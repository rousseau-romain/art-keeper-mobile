import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkHero } from "@/pages/app/artwork/components/artwork-hero/ArtworkHero";
import { ArtworkLocationBand } from "@/pages/app/artwork/components/artwork-location-band/ArtworkLocationBand";
import { ArtworkMeta } from "@/pages/app/artwork/components/artwork-meta/ArtworkMeta";
import { MoreByArtist } from "@/pages/app/artwork/components/more-by-artist/MoreByArtist";
import { NearbyPanel } from "@/pages/app/artwork/components/nearby-panel/NearbyPanel";
import { SplitRow } from "@/shared/ui/split-row/SplitRow";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

export type ArtworkDetailProps = {
  artwork: Artwork;
  artist?: Artist;
  /** Pieces near this one, already self-excluded. */
  nearby: Artwork[];
  /** Radius (metres) the `nearby` lookup used — interpolated into its copy. */
  nearbyRadius: number;
  /** Other pieces by the same artist, already self-excluded. */
  moreByArtist: Artwork[];
};

/**
 * The artwork detail's layout — purely presentational. Every artwork it renders
 * comes in as a prop, so it works identically for the screen's SSR-seeded first
 * render and its live, cache-driven ones.
 *
 * `NearbyPanel` and `MoreByArtist` each render nothing on an empty list, so the
 * lists are passed unconditionally (they're `[]` while their query resolves).
 */
export const ArtworkDetail = ({
  artwork,
  artist,
  nearby,
  nearbyRadius,
  moreByArtist,
}: ArtworkDetailProps) => {
  const { wide } = useBreakpoint();

  return (
    <WrapperScrollView>
      <SplitRow>
        <ArtworkHero imageUrl={artwork.imageUrl} wide={wide} />
        <ArtworkMeta artwork={artwork} artist={artist} wide={wide} />
      </SplitRow>

      <SplitRow>
        <ArtworkLocationBand artwork={artwork} wide={wide} />
        <NearbyPanel artworks={nearby} radius={nearbyRadius} />
      </SplitRow>

      {artist && <MoreByArtist artist={artist} artworks={moreByArtist} />}
    </WrapperScrollView>
  );
};
