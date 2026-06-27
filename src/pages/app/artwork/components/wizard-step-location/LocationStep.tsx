import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import MapView, {
  type MapPressEvent,
  Marker,
  type PoiClickEvent,
} from "react-native-maps";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

// Paris fallback when no pin has been set yet (no EXIF GPS, no manual pick).
const FALLBACK = { latitude: 48.8566, longitude: 2.3522 };
const DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

/** Step 2 — confirm the pin on a real map; tap/drag to move it, or use device GPS. */
export const LocationStep = () => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<ArtworkValues>();
  const { setPin, useMyLocation, locating } = useDeviceLocation();
  const haptic = useHaptics();
  const mapRef = useRef<MapView>(null);

  // useWatch (not the watch() fn) so the React Compiler can't memoize the live
  // pin away — the component itself re-renders when these change.
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const address = useWatch({ control, name: "address" });
  const hasPin = latitude != null && longitude != null;

  // Recenter the map whenever the pin moves (EXIF auto-pin, "use my location").
  useEffect(() => {
    if (latitude != null && longitude != null) {
      mapRef.current?.animateToRegion({ latitude, longitude, ...DELTA }, 350);
    }
  }, [latitude, longitude]);

  // Buzz on every manual pin change (tap, POI tap, marker drag) — not the
  // automatic moves (EXIF auto-pin, "use my location"), which go through setPin
  // directly without a haptic.
  const placePin = (lat: number, lng: number) => {
    haptic("light");
    setPin(lat, lng);
  };

  const onMapPress = (e: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    placePin(lat, lng);
  };

  // Tapping a labelled place fires onPoiClick, not onPress — handle it too so a
  // tap on a POI still drops the pin instead of doing nothing.
  const onPoiClick = (e: PoiClickEvent) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    placePin(lat, lng);
  };

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.location.title")}
      </Text>
      <Text font="body" size="base" color="inkSoft">
        {tr("artwork.new.location.subtitle")}
      </Text>

      <View style={styles.mapWrap}>
        <View style={styles.hint}>
          <Text font="mono" size="sm" color="accent">
            {tr("artwork.new.location.hint")}
          </Text>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            ...(hasPin ? { latitude, longitude } : FALLBACK),
            ...DELTA,
          }}
          onPress={onMapPress}
          onPoiClick={onPoiClick}
        >
          {hasPin && (
            <Marker
              draggable
              coordinate={{ latitude, longitude }}
              pinColor={ColorEnum.accent}
              onDragEnd={(e) =>
                placePin(
                  e.nativeEvent.coordinate.latitude,
                  e.nativeEvent.coordinate.longitude,
                )
              }
            />
          )}
        </MapView>
      </View>

      {address ? (
        <View style={styles.addr}>
          <Icon name="MapPin" size="xs" color="inkSoft" />
          <Text font="mono" size="sm" color="inkSoft">
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

const styles = StyleSheet.create({
  step: { flex: 1, gap: SpacingEnum.md },
  title: { textTransform: "uppercase" },
  mapWrap: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: ColorEnum.accent,
    borderRadius: RadiusEnum.sm,
    overflow: "hidden",
  },
  hint: {
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: ColorEnum.accent,
    backgroundColor: ColorEnum.surface,
  },
  map: { flex: 1 },
  addr: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
});
