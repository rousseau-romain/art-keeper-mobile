import { Image, Pressable, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkCardProps = {
  artwork: Artwork;
  onPress: () => void;
};

export const ArtworkCard = ({ artwork, onPress }: ArtworkCardProps) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RadiusEnum.sm,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: ColorEnum.surface,
    borderColor: ColorEnum.hair,
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
