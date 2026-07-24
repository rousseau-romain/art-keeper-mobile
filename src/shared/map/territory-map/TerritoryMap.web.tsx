import { lazy, Suspense, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { Artwork } from "@/lib/api/artworks";
import { useTheme } from "@/theme/ThemeProvider";

// react-native-maps / MapLibre have no web build, so Metro resolves this
// `.web.tsx` variant, which swaps the native map for a react-leaflet one. The map
// is lazy + client-gated so `leaflet` never evaluates during Expo's static (Node)
// prerender — mirrors `LocationMap.web.tsx`.
const TerritoryWebMap = lazy(() => import("./TerritoryWebMap"));

export type TerritoryMapProps = {
  /** The artist's pieces — one accent pin per piece. */
  artworks: Artwork[];
  /** The highlighted piece, driven from the parent (mirrors the native map). */
  selectedId?: string;
  /** Fired when a pin is clicked — the parent tracks the selection. */
  onSelect: (artwork: Artwork) => void;
};

/** Read-only territory preview (web) — a Leaflet map with one pin per piece. */
export const TerritoryMap = ({
  artworks,
  selectedId,
  onSelect,
}: TerritoryMapProps) => {
  const { colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <View style={styles.map}>
      {isMounted ? (
        <Suspense fallback={null}>
          <TerritoryWebMap
            artworks={artworks}
            accent={colors.primary}
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
