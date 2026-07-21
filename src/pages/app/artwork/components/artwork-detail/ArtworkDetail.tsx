import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkHero } from "@/pages/app/artwork/components/artwork-hero/ArtworkHero";
import { ArtworkJsonLd } from "@/pages/app/artwork/components/artwork-json-ld/ArtworkJsonLd";
import { ArtworkLocationBand } from "@/pages/app/artwork/components/artwork-location-band/ArtworkLocationBand";
import { ArtworkMeta } from "@/pages/app/artwork/components/artwork-meta/ArtworkMeta";
import { MoreByArtist } from "@/pages/app/artwork/components/more-by-artist/MoreByArtist";
import { NearbyPanel } from "@/pages/app/artwork/components/nearby-panel/NearbyPanel";
import { Article } from "@/shared/ui/seo/article/Article";
import { SplitRow } from "@/shared/ui/split-row/SplitRow";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { SpacingEnum } from "@/theme/enums/scale.enums";
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
 *
 * On web the tree is wrapped in the semantic `<main>` / `<article>` landmarks
 * (see `src/shared/ui/seo/README.md`): the primary block (hero + title + meta) is
 * the `<article>`, the related panels sit beside it under `<main>`. `Main` carries
 * the inter-section `gap` since it's the single child of the scroll content.
 */
export const ArtworkDetail = ({
  artwork,
  artist,
  nearby,
  nearbyRadius,
  moreByArtist,
}: ArtworkDetailProps) => {
  const { t: tr } = useTranslation();
  const { wide } = useBreakpoint();

  // Descriptive alt for the hero — the artwork *is* the page's content, so an
  // empty alt would drop it from screen readers and Google Images. Names the
  // artist when known.
  const heroAlt = artist
    ? tr("a11y.heroAltBy", { title: artwork.title, artist: artist.name })
    : tr("a11y.heroAlt", { title: artwork.title });

  return (
    <WrapperScrollView isMain contentContainerStyle={styles.main}>
      <Article>
        {/* Verified only: an unverified piece is noindex, so it gets no
            indexable structured data either (web-only; no-op on native). */}
        {artwork.verified && <ArtworkJsonLd artwork={artwork} artist={artist} />}
        <SplitRow style={styles.splitRow}>
          <ArtworkHero imageUrl={artwork.imageUrl} alt={heroAlt} isWide={wide} />
          <ArtworkMeta artwork={artwork} artist={artist} isWide={wide} />
        </SplitRow>
      </Article>

      <SplitRow style={styles.splitRow}>
        <ArtworkLocationBand artwork={artwork} isWide={wide} />
        <NearbyPanel artworks={nearby} radius={nearbyRadius} />
      </SplitRow>

      {artist && <MoreByArtist artist={artist} artworks={moreByArtist} />}
    </WrapperScrollView>
  );
};

const styles = StyleSheet.create({
  main: { gap: SpacingEnum.lg },
  splitRow: { paddingHorizontal: SpacingEnum.lg, gap: SpacingEnum.lg },
});
