import {
  Camera,
  type CameraRef,
  Map as MapView,
  Marker,
  type PressEvent,
  type PressEventWithFeatures,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { type NativeSyntheticEvent, StyleSheet, View } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { OSM_STYLE } from "@/shared/map/osm-style.constant";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  IconSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

// Paris fallback when no pin is set yet. MapLibre coords are [lng, lat] — the
// reverse of react-native-maps / the form's { latitude, longitude }.
const FALLBACK: [number, number] = [2.3522, 48.8566];
const ZOOM = 15;

/** Step 2 — confirm the pin on an OpenStreetMap map; tap to move it, or use device GPS. */
export const LocationStep = () => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<ArtworkValues>();
  const { setPin, useMyLocation, locating } = useDeviceLocation();
  const haptic = useHaptics();
  const cameraRef = useRef<CameraRef>(null);
  const styles = useThemeStyles(createStyles);

  // useWatch (not the watch() fn) so the React Compiler can't memoize the live
  // pin away — the component itself re-renders when these change.
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const address = useWatch({ control, name: "address" });
  const hasPin = latitude != null && longitude != null;

  // Recenter the map whenever the pin moves (EXIF auto-pin, "use my location").
  useEffect(() => {
    if (latitude != null && longitude != null) {
      cameraRef.current?.easeTo({
        center: [longitude, latitude],
        duration: 350,
      });
    }
  }, [latitude, longitude]);

  // Buzz on every manual pin change (map tap) — not the automatic moves (EXIF
  // auto-pin, "use my location"), which go through setPin directly without a haptic.
  const placePin = (lat: number, lng: number) => {
    haptic("light");
    setPin(lat, lng);
  };

  const onMapPress = (
    e: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>,
  ) => {
    const [lng, lat] = e.nativeEvent.lngLat;
    placePin(lat, lng);
  };

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.location.title")}
      </Text>
      <Text font="body" size="base" color="textSoft">
        {tr("artwork.new.location.subtitle")}
      </Text>

      <View style={styles.mapWrap}>
        <View style={styles.hint}>
          <Text font="mono" size="sm" color="primary">
            {tr("artwork.new.location.hint")}
          </Text>
        </View>
        <MapView style={styles.map} mapStyle={OSM_STYLE} onPress={onMapPress}>
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: hasPin ? [longitude, latitude] : FALLBACK,
              zoom: ZOOM,
            }}
          />
          {hasPin && (
            <Marker lngLat={[longitude, latitude]}>
              <View style={styles.pin} />
            </Marker>
          )}
        </MapView>
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
        block
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
      borderWidth: 1.5,
      borderColor: c.primary,
      borderRadius: RadiusEnum.sm,
      overflow: "hidden",
    },
    hint: {
      paddingHorizontal: SpacingEnum.md,
      paddingVertical: SpacingEnum.sm,
      borderBottomWidth: 1.5,
      borderBottomColor: c.primary,
      backgroundColor: c.surface,
    },
    map: { flex: 1 },
    pin: {
      width: IconSizeEnum.sm,
      height: IconSizeEnum.sm,
      borderRadius: RadiusEnum.full,
      backgroundColor: c.primary,
      borderWidth: 2,
      borderColor: c.text,
    },
    addr: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
  });
