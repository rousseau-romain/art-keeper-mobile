import { StyleSheet } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtistActions } from "@/pages/app/artist/components/artist-actions/ArtistActions";
import { ArtistHeader } from "@/pages/app/artist/components/artist-header/ArtistHeader";
import { ArtistJsonLd } from "@/pages/app/artist/components/artist-json-ld/ArtistJsonLd";
import { ArtistSocialLinks } from "@/pages/app/artist/components/artist-social-links/ArtistSocialLinks";
import { ArtistTerritory } from "@/pages/app/artist/components/artist-territory/ArtistTerritory";
import { useSafeHeight } from "@/shared/hooks/useSafeHeight";
import { Article } from "@/shared/ui/seo/article/Article";
import { TagList } from "@/shared/ui/tag-list/TagList";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtistDetailProps = {
  artist: Artist;
  /** The artist's pieces (already fetched) — plotted on the territory map / grid. */
  artworks: Artwork[];
};

/**
 * The artist profile's layout — purely presentational. Every value comes in as a
 * prop, so it works identically for the screen's SSR-seeded first render and its
 * live, cache-driven ones (mirrors `ArtworkDetail`).
 *
 * The profile block (header + links + tags + actions) is the `<article>`; the
 * territory (map/grid of pieces) sits below it under `<main>`. `Main` (via
 * `WrapperScrollView isMain`) carries the inter-section `gap`.
 *
 * The header floats over the content (`headerTransparent`, see `Stack`), so
 * `contentPadding` (header height + tab bar) clears it — same as `ArtworkDetail`;
 * a fixed `paddingVertical` would tuck the profile header under the nav bar.
 */
export const ArtistDetail = ({ artist, artworks }: ArtistDetailProps) => {
  const { contentPadding } = useSafeHeight();
  return (
    <WrapperScrollView
      isMain
      contentContainerStyle={[
        styles.main,
        { paddingTop: contentPadding.paddingTop },
      ]}
    >
      <Article style={styles.article}>
        {/* Verified only: an unverified artist is noindex, so it gets no indexable
            structured data either (web-only; no-op on native). */}
        {artist.verified && <ArtistJsonLd artist={artist} />}
        <ArtistHeader artist={artist} />
        <ArtistSocialLinks socialLinks={artist.socialLinks} />
        <TagList tags={artist.tags} />
        <ArtistActions artist={artist} />
      </Article>

      <ArtistTerritory artworks={artworks} artistName={artist.name} />
    </WrapperScrollView>
  );
};

const styles = StyleSheet.create({
  // `flexGrow` : le contenu occupe au moins toute la hauteur du viewport, pour que
  // la carte territoire (dernier bloc, en `flex: 1`) s'étire jusqu'en bas.
  main: { gap: SpacingEnum.lg, flexGrow: 1 },
  article: { paddingHorizontal: SpacingEnum.lg, gap: SpacingEnum.md },
});
