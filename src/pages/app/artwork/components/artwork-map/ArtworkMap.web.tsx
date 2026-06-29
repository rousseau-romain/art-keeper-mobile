import { lazy, Suspense, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { ArtworkMapProps } from "./ArtworkMap";

// MapLibre's native component has no web build, so Metro resolves this `.web.tsx`
// variant on web. The leaflet map is lazy + client-gated so `leaflet` never
// evaluates during Expo's static (Node) prerender — same pattern as WebMap.
const ArtworkMapLeaflet = lazy(() => import("./ArtworkMapLeaflet"));

export const ArtworkMap = ({
  artworks,
  selectedId,
  onSelect,
}: ArtworkMapProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <View style={styles.map}>
      {mounted ? (
        <Suspense fallback={null}>
          <ArtworkMapLeaflet
            artworks={artworks}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </Suspense>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});
