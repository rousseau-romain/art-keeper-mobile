import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/** Width of each card in the horizontal "more by" strip. */
const CARD_WIDTH = 260;

export type MoreByArtistProps = {
  artist: Artist;
  artworks: Artwork[];
};

/**
 * "More by @artist" strip: a heading with a link back to the artist's filtered
 * browse view, plus a horizontal row of their other pieces. Renders nothing when
 * the artist has no other pieces.
 */
export const MoreByArtist = ({ artist, artworks }: MoreByArtistProps) => {
  const { t: tr } = useTranslation();
  if (artworks.length === 0) return null;
  const handle = `@${artist.slug}`;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text font="display" size="lg" style={styles.heading}>
          {tr("artwork.detail.moreBy", { handle })}
        </Text>
        <Link
          href={{ pathname: "/artworks", params: { artist: artist.name } }}
          asChild
        >
          <Pressable accessibilityLabel={tr("a11y.viewProfile", { handle })}>
            <Text font="mono" size="sm" color="primary">
              {tr("artwork.detail.viewProfile")}
            </Text>
          </Pressable>
        </Link>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {artworks.map((artwork) => (
          <View key={artwork.id} style={styles.cardWrap}>
            <ArtworkCard
              artwork={artwork}
              href={{
                pathname: "/artworks/[slug]",
                params: { slug: artwork.slug },
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: SpacingEnum.md,
    marginHorizontal: -SpacingEnum.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.lg,
  },
  heading: { textTransform: "uppercase" },
  row: { gap: SpacingEnum.md, paddingHorizontal: SpacingEnum.lg },
  cardWrap: { width: CARD_WIDTH },
});
