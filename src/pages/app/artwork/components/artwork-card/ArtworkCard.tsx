import { type Href, Link } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkCardProps = {
  artwork: Artwork;
  href: Href;
};

// `Link asChild` clones `href` + `role="link"` onto the Pressable, so on web
// react-native-web renders a real `<a href>` (crawlable, right-click-openable —
// SEO) while native keeps the normal Pressable/View layout and navigation.
export const ArtworkCard = ({ artwork, href }: ArtworkCardProps) => {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.card}>
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text
              font="display"
              size="lg"
              style={styles.cardTitle}
              numberOfLines={2}
            >
              {artwork.title}
            </Text>
            <ArtworkLikeButton artwork={artwork} />
          </View>
          {artwork.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {artwork.tags.slice(0, 4).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>
          ) : null}
          <Text font="mono" size="xs">
            {artwork.latitude.toFixed(3)}, {artwork.longitude.toFixed(3)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RadiusEnum.sm,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: ColorEnum.surface,
    borderColor: ColorEnum.borderSoft,
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: ColorEnum.surface2,
  },
  cardBody: { padding: SpacingEnum.lg, gap: SpacingEnum.md },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SpacingEnum.md,
  },
  cardTitle: { flex: 1, textTransform: "uppercase" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
