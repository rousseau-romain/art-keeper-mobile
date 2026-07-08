import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { NearbyThumb } from "@/pages/app/artwork/components/nearby-thumb/NearbyThumb";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/** How many nearby thumbnails the panel shows. */
const MAX_THUMBS = 3;

export type NearbyPanelProps = {
  artworks: Artwork[];
  /** Search radius (metres) — interpolated into the count copy. */
  radius: number;
};

/**
 * "Nearby" panel: a count line plus up to three thumbnails of pieces near the
 * current artwork. Renders nothing when there are no neighbours.
 */
export const NearbyPanel = ({ artworks, radius }: NearbyPanelProps) => {
  const { t: tr } = useTranslation();
  if (artworks.length === 0) return null;
  return (
    <View style={styles.panel}>
      <Text font="mono" size="xs" color="textMuted" style={styles.eyebrow}>
        {tr("artwork.detail.nearbyTitle")}
      </Text>
      <Text font="body" size="sm" color="textSoft">
        {tr("artwork.detail.nearbyCount", { count: artworks.length, radius })}
      </Text>
      <View style={styles.thumbs}>
        {artworks.slice(0, MAX_THUMBS).map((artwork) => (
          <NearbyThumb key={artwork.id} artwork={artwork} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { gap: SpacingEnum.sm },
  eyebrow: { textTransform: "uppercase", letterSpacing: 1 },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
