import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { NearbyThumb } from "@/pages/app/artwork/components/nearby-thumb/NearbyThumb";
import { Aside } from "@/shared/ui/seo/aside/Aside";
import { H2 } from "@/shared/ui/seo/h2/H2";
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
 *
 * On web it's a complementary `<aside>` (see `src/shared/ui/seo/README.md`) —
 * nearby pieces are tangential to the main artwork — with its eyebrow label as an
 * `<h2>` and `aria-label` naming the region.
 */
export const NearbyPanel = ({ artworks, radius }: NearbyPanelProps) => {
  const { t: tr } = useTranslation();
  if (artworks.length === 0) return null;
  const title = tr("artwork.detail.nearbyTitle");
  return (
    <Aside style={styles.panel} aria-label={title}>
      <H2 font="mono" size="xs" color="textMuted" style={styles.eyebrow}>
        {title}
      </H2>
      <Text font="body" size="sm" color="textSoft">
        {tr("artwork.detail.nearbyCount", { count: artworks.length, radius })}
      </Text>
      <View style={styles.thumbs}>
        {artworks.slice(0, MAX_THUMBS).map((artwork) => (
          <NearbyThumb key={artwork.id} artwork={artwork} />
        ))}
      </View>
    </Aside>
  );
};

const styles = StyleSheet.create({
  panel: { gap: SpacingEnum.sm, paddingHorizontal: SpacingEnum.lg },
  eyebrow: { textTransform: "uppercase", letterSpacing: 1 },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
