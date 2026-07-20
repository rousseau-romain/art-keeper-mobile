import { lazy, Suspense, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

// react-native-maps / MapLibre have no web build, so Metro resolves this
// `.web.tsx` variant, which swaps the native map for a react-leaflet one. The map
// is lazy + client-gated so `leaflet` never evaluates during Expo's static
// (Node) prerender — mirrors the create-flow `LocationStep.web.tsx`.
const LocationWebMap = lazy(() => import("./LocationWebMap"));

export type LocationMapProps = {
  latitude: number;
  longitude: number;
};

/** Read-only location preview (web) — a Leaflet map with a single accent pin. */
export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const { colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <View style={styles.map}>
      {isMounted ? (
        <Suspense fallback={null}>
          <LocationWebMap
            latitude={latitude}
            longitude={longitude}
            accent={colors.primary}
          />
        </Suspense>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});
