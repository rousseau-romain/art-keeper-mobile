import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { LocationMap } from "@/pages/app/moderation/components/location-map/LocationMap";
import { Icon } from "@/shared/ui/icon/Icon";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Text } from "@/shared/ui/text/Text";
import { WrapperFormSheet } from "@/shared/ui/wrapper-form-sheet/WrapperFormSheet";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type LocationSheetScreenProps = {
  latitude: number;
  longitude: number;
};

/**
 * The moderation location form sheet: a read-only map with a pin at the
 * proposal's coordinate, opened by tapping a location diff row. Router-agnostic —
 * the route parses the lat/lng params and passes them in.
 */
export const LocationSheetScreen = ({
  latitude,
  longitude,
}: LocationSheetScreenProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const styles = useThemeStyles(createStyles);

  return (
    <WrapperFormSheet>
      <View style={styles.header}>
        <Text font="display" size="xl" style={styles.title}>
          {tr("moderation.title.location")}
        </Text>
        <IconButton
          name="X"
          onPress={() => router.back()}
          accessibilityLabel={tr("common.close")}
        />
      </View>

      <View style={styles.mapWrap}>
        <LocationMap latitude={latitude} longitude={longitude} />
      </View>

      <View style={styles.coords}>
        <Icon name="MapPin" size="xs" color="textSoft" />
        <Text font="mono" size="sm" color="textSoft">
          {`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </Text>
      </View>
    </WrapperFormSheet>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { textTransform: "uppercase" },
    mapWrap: {
      aspectRatio: 3 / 2,
      borderWidth: 1.5,
      borderColor: c.primary,
      borderRadius: RadiusEnum.sm,
      overflow: "hidden",
    },
    coords: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
  });
