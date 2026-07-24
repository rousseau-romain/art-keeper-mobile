import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { H2 } from "@/shared/ui/seo/h2/H2";
import { Section } from "@/shared/ui/seo/section/Section";
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
 *
 * On web it's a titled `<section>` (see `src/shared/ui/seo/README.md`): the
 * heading is an `<h2>` (the page's `<h1>` is the artwork title) and `aria-label`
 * names the region.
 */
export const MoreByArtist = ({ artist, artworks }: MoreByArtistProps) => {
  const { t: tr } = useTranslation();
  if (artworks.length === 0) return null;
  const handle = `@${artist.slug}`;
  const title = tr("artwork.detail.moreBy", { handle });
  return (
    <Section style={styles.section} aria-label={title}>
      <View style={styles.header}>
        <H2 size="lg" style={styles.heading}>
          {title}
        </H2>
        <Link
          href={{ pathname: "/artists/[slug]", params: { slug: artist.slug } }}
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
    </Section>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: SpacingEnum.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SpacingEnum.sm,
  },
  heading: { textTransform: "uppercase", paddingHorizontal: SpacingEnum.lg },
  row: { gap: SpacingEnum.md },
  cardWrap: { width: CARD_WIDTH },
});
