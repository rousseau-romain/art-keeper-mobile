import { useRouter } from "expo-router";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { EditProposalValues } from "@/pages/app/artwork/form/ProposeEditForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { LocationPicker } from "@/shared/map/location-picker/LocationPicker";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Text } from "@/shared/ui/text/Text";
import { WrapperFormSheet } from "@/shared/ui/wrapper/wrapper-form-sheet/WrapperFormSheet";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/**
 * The edit-location form sheet: an interactive map pin picker over the proposed
 * coordinate. It lives in the edit stack's shared `FormProvider`, so moving the
 * pin (tap or "use my location") writes `latitude`/`longitude`/`address` straight
 * into the proposal form — the big form's single submit sends the change.
 */
export const EditLocationSheetScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { control } = useFormContext<EditProposalValues>();
  const { setPin, useMyLocation, isLocating } = useDeviceLocation();
  const haptic = useHaptics();
  const styles = useThemeStyles(createStyles);

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const address = useWatch({ control, name: "address" });

  const placePin = (lat: number, lng: number) => {
    haptic("light");
    setPin(lat, lng);
  };

  const coords =
    address ||
    (latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : "—");

  return (
    <WrapperFormSheet>
      <Text font="display" size="xl" style={styles.title}>
        {tr("artwork.edit.locationTitle")}
      </Text>

      <View style={styles.mapWrap}>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onPick={placePin}
        />
      </View>

      <View style={styles.coords}>
        <Icon name="MapPin" size="xs" color="textSoft" />
        <Text font="mono" size="sm" color="textSoft">
          {coords}
        </Text>
      </View>

      <Button
        label={tr("artwork.new.location.useMyLocation")}
        variant="ghost"
        isLoading={isLocating}
        iconBefore={{ name: "Globe" }}
        onPress={useMyLocation}
      />
      <Button
        label={tr("artwork.edit.locationDone")}
        variant="primary"
        onPress={() => router.back()}
      />
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
