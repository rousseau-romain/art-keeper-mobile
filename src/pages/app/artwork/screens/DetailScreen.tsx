import type { DataArtworkPageLoaded } from "@/app/(tabs)/artworks/[slug]";
import { ArtworkHero } from "@/pages/app/artwork/components/artwork-hero/ArtworkHero";
import { ArtworkLocationBand } from "@/pages/app/artwork/components/artwork-location-band/ArtworkLocationBand";
import { ArtworkMeta } from "@/pages/app/artwork/components/artwork-meta/ArtworkMeta";
import { MoreByArtist } from "@/pages/app/artwork/components/more-by-artist/MoreByArtist";
import { NearbyPanel } from "@/pages/app/artwork/components/nearby-panel/NearbyPanel";
import { SplitRow } from "@/shared/ui/split-row/SplitRow";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

type RequiredNonNullableKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

export type DetailScreenProps = RequiredNonNullableKeys<
  DataArtworkPageLoaded,
  "artwork"
>;

export const DetailScreen = ({
  artist,
  artwork,
  moreArtworkByArtist,
  nearbyArtwortk,
}: DetailScreenProps) => {
  const { wide } = useBreakpoint();

  return (
    <WrapperScrollView>
      <SplitRow>
        <ArtworkHero imageUrl={artwork.imageUrl} wide={wide} />
        <ArtworkMeta artwork={artwork} artist={artist} wide={wide} />
      </SplitRow>

      <SplitRow>
        <ArtworkLocationBand artwork={artwork} wide={wide} />
        {nearbyArtwortk && (
          <NearbyPanel
            artworks={nearbyArtwortk.artwork}
            radius={nearbyArtwortk.radius}
          />
        )}
      </SplitRow>

      {artist && moreArtworkByArtist && (
        <MoreByArtist artist={artist} artworks={moreArtworkByArtist} />
      )}
    </WrapperScrollView>
  );
};
