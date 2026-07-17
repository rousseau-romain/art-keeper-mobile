import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";
import { LocationPicker } from "@/shared/map/location-picker/LocationPicker";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Step 2 (web) — confirm the pin on a Leaflet map; tap/drag to move it, or use device GPS. */
export const LocationStep = () => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<ArtworkValues>();
  const { setPin, useMyLocation, locating } = useDeviceLocation();
  const styles = useThemeStyles(createStyles);

  // useWatch so the React Compiler re-renders this component on each pin change.
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const address = useWatch({ control, name: "address" });

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.location.title")}
      </Text>
      <View style={styles.mapWrap}>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onPick={setPin}
        />
      </View>

      {address ? (
        <View style={styles.addr}>
          <Icon name="MapPin" size="xs" color="textSoft" />
          <Text font="mono" size="sm" color="textSoft">
            {address}
          </Text>
        </View>
      ) : null}

      <Button
        label={tr("artwork.new.location.useMyLocation")}
        variant="ghost"
        loading={locating}
        iconBefore={{ name: "Globe" }}
        onPress={useMyLocation}
      />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    step: { flex: 1, gap: SpacingEnum.md },
    title: { textTransform: "uppercase" },
    mapWrap: {
      flex: 1,
      minHeight: 240,
      borderWidth: 1.5,
      borderColor: c.primary,
      borderRadius: RadiusEnum.sm,
      overflow: "hidden",
    },
    addr: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
  });
