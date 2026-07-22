import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import { FlagButton } from "@/shared/ui/flag-button/FlagButton";
import { ShareButton } from "@/shared/ui/share-button/ShareButton";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtistActionsProps = {
  artist: Artist;
};

/** The profile rail's action row: share · flag. */
export const ArtistActions = ({ artist }: ArtistActionsProps) => {
  const { t: tr } = useTranslation();
  return (
    <View style={styles.row}>
      <ShareButton
        title={artist.name}
        path={`/artists/${artist.slug}`}
        accessibilityLabel={tr("a11y.shareArtist")}
      />
      <FlagButton accessibilityLabel={tr("a11y.flagArtist")} />
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
});
