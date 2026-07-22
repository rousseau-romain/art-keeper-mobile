import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { FlagButton } from "@/shared/ui/flag-button/FlagButton";
import { ShareButton } from "@/shared/ui/share-button/ShareButton";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkActionsProps = {
  artwork: Artwork;
};

/** The detail rail's action row: like · share · flag. */
export const ArtworkActions = ({ artwork }: ArtworkActionsProps) => {
  const { t: tr } = useTranslation();
  return (
    <View style={styles.row}>
      <ArtworkLikeButton artwork={artwork} />
      <View style={styles.group}>
        <ShareButton
          title={artwork.title}
          path={`/artworks/${artwork.slug}`}
          accessibilityLabel={tr("a11y.share")}
        />
        <FlagButton accessibilityLabel={tr("a11y.flag")} />
      </View>
    </View>
  );
};

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
