import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { LocationMap } from "@/shared/map/location-map/LocationMap";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Height of the map/nearby band. */
const BAND_HEIGHT = 250;

export type ArtworkLocationBandProps = {
  artwork: Artwork;
  /** Wide layout: the band shares the row with the nearby panel via `flex`. */
  isWide?: boolean;
};

/**
 * The location context band: a read-only map of the piece with its coordinates
 * overlaid. On isWide screens the "nearby" panel sits to the right of the map; on
 * mobile the panel is rendered separately above and this shows only the map.
 */
export const ArtworkLocationBand = ({
  artwork,
  isWide,
}: ArtworkLocationBandProps) => {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={[styles.band, isWide && styles.bandWide]}>
      <View style={styles.mapWrap}>
        <LocationMap
          latitude={artwork.latitude}
          longitude={artwork.longitude}
        />
        <View style={styles.coordBadge} pointerEvents="none">
          <Text font="mono" size="xs" color="textSoft">
            {artwork.latitude.toFixed(3)}, {artwork.longitude.toFixed(3)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    band: {
      flexDirection: "row",
      gap: SpacingEnum.lg,
      height: BAND_HEIGHT,
    },
    bandWide: { flex: 1 },
    mapWrap: {
      flex: 1,
      borderWidth: 1.5,
      backgroundColor: c.surface2,
      borderColor: c.borderSoft,
    },
    coordBadge: {
      position: "absolute",
      right: SpacingEnum.sm,
      bottom: SpacingEnum.sm,
      padding: SpacingEnum.xs,
      borderWidth: 1.5,
      backgroundColor: c.surface,
      borderColor: c.borderSoft,
    },
  });
