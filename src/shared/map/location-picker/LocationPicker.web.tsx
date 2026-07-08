import { lazy, Suspense, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

// MapLibre has no web build, so Metro resolves this `.web.tsx` variant, which
// swaps the native map for a react-leaflet one. The map is lazy + client-gated so
// `leaflet` never evaluates during Expo's static (Node) prerender — mirrors the
// read-only LocationMap.web.tsx.
const LocationWebMap = lazy(() => import("./LocationWebMap"));

export type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  /** Called with the new coordinate on every map tap/drag (fill it into your form). */
  onPick: (latitude: number, longitude: number) => void;
};

/** Interactive pin picker (web) — a Leaflet map; tap/drag to move the pin. */
export const LocationPicker = ({
  latitude,
  longitude,
  onPick,
}: LocationPickerProps) => {
  const { colors } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <View style={styles.map}>
      {mounted ? (
        <Suspense fallback={null}>
          <LocationWebMap
            latitude={latitude}
            longitude={longitude}
            accent={colors.primary}
            onPick={onPick}
          />
        </Suspense>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});
