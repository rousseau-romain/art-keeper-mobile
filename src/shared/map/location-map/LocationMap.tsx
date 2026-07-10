import {
  Camera,
  type CameraRef,
  Map as MapView,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { OSM_STYLE } from "@/shared/map/osm-style.constant";
import type { Palette } from "@/theme/enums/color.enums";
import { IconSizeEnum, RadiusEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

const ZOOM = 15;

export type LocationMapProps = {
  latitude: number;
  longitude: number;
};

/**
 * Read-only OpenStreetMap preview centered on a single coordinate, with an accent
 * pin. Shared single-location map — used by the artwork detail location band and
 * the moderation location form sheet. Native (MapLibre); Metro resolves
 * LocationMap.web.tsx on web.
 */
export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const styles = useThemeStyles(createStyles);
  const cameraRef = useRef<CameraRef>(null);
  // MapLibre coords are [lng, lat] — the reverse of { latitude, longitude }.
  const center: [number, number] = [longitude, latitude];

  // `initialViewState` only positions the camera on mount. When the same map
  // instance is reused for a new coordinate (navigating detail → detail keeps
  // the screen mounted, only the pin moves), ease the camera to the new center.
  useEffect(() => {
    cameraRef.current?.easeTo({ center: [longitude, latitude], zoom: ZOOM });
  }, [longitude, latitude]);

  return (
    <MapView style={styles.map} mapStyle={OSM_STYLE}>
      <Camera ref={cameraRef} initialViewState={{ center, zoom: ZOOM }} />
      <Marker lngLat={center}>
        <View style={styles.pin} />
      </Marker>
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
