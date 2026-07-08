import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkFlagButton } from "@/pages/app/artwork/components/artwork-flag-button/ArtworkFlagButton";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { ArtworkShareButton } from "@/pages/app/artwork/components/artwork-share-button/ArtworkShareButton";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkActionsProps = {
  artwork: Artwork;
};

/** The detail rail's action row: like · share · flag. */
export const ArtworkActions = ({ artwork }: ArtworkActionsProps) => (
  <View style={styles.row}>
    <ArtworkLikeButton artwork={artwork} />
    <View style={styles.group}>
      <ArtworkShareButton artwork={artwork} />
      <ArtworkFlagButton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: SpacingEnum.sm,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
  },
});
