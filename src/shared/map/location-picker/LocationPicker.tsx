import {
  Camera,
  type CameraRef,
  Map as MapView,
  Marker,
  type PressEvent,
  type PressEventWithFeatures,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef } from "react";
import { type NativeSyntheticEvent, StyleSheet, View } from "react-native";

import { OSM_STYLE } from "@/shared/map/osm-style.constant";
import type { Palette } from "@/theme/enums/color.enums";
import { IconSizeEnum, RadiusEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

// Paris fallback when no pin is set yet. MapLibre coords are [lng, lat] — the
// reverse of react-native-maps / the form's { latitude, longitude }.
const FALLBACK: [number, number] = [2.3522, 48.8566];
const ZOOM = 15;

export type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  /** Called with the new coordinate on every map tap (fill it into your form). */
  onPick: (latitude: number, longitude: number) => void;
};

/**
 * Interactive OpenStreetMap pin picker — tap the map to place/move the pin. The
 * form-agnostic, shared counterpart to the read-only `LocationMap`: it takes the
 * current coordinate and reports taps via `onPick`, owning no form state. Reused
 * by the create-artwork `LocationStep` and the edit-location form sheet. Native
 * (MapLibre); Metro resolves LocationPicker.web.tsx on web.
 */
export const LocationPicker = ({
  latitude,
  longitude,
  onPick,
}: LocationPickerProps) => {
  const cameraRef = useRef<CameraRef>(null);
  const styles = useThemeStyles(createStyles);
  const hasPin = latitude != null && longitude != null;
  // Inline the null checks (not `hasPin`) so TS narrows to a [number, number].
  const center: [number, number] =
    latitude != null && longitude != null ? [longitude, latitude] : FALLBACK;

  // Recenter the map whenever the pin moves (EXIF auto-pin, "use my location").
  useEffect(() => {
    if (latitude != null && longitude != null) {
      cameraRef.current?.easeTo({
        center: [longitude, latitude],
        duration: 350,
      });
    }
  }, [latitude, longitude]);

  const onMapPress = (
    e: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>,
  ) => {
    const [lng, lat] = e.nativeEvent.lngLat;
    onPick(lat, lng);
  };

  return (
    <MapView style={styles.map} mapStyle={OSM_STYLE} onPress={onMapPress}>
      <Camera ref={cameraRef} initialViewState={{ center, zoom: ZOOM }} />
      {hasPin && (
        <Marker lngLat={center}>
          <View style={styles.pin} />
        </Marker>
      )}
    </MapView>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    map: { flex: 1 },
    pin: {
      width: IconSizeEnum.sm,
      height: IconSizeEnum.sm,
      borderRadius: RadiusEnum.full,
      backgroundColor: c.primary,
      borderWidth: 2,
      borderColor: c.text,
    },
  });
