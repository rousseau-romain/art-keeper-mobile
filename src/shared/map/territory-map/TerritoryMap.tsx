import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  type InitialViewState,
  Layer,
  Map as MapView,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import { cartoBasemapStyle } from "@/shared/map/basemap";
import { IconSizeEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

// Zoom used when there's a single point to show (bounds would be degenerate).
const ZOOM = 13;
const PAD = SpacingEnum.xxl;
const FIT_PADDING = { top: PAD, right: PAD, bottom: PAD, left: PAD };

/** [west, south, east, north] enclosing every artwork. */
const boundsOf = (artworks: Artwork[]): [number, number, number, number] => {
  const lats = artworks.map((a) => a.latitude);
  const lngs = artworks.map((a) => a.longitude);
  return [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats),
  ];
};

// The artwork id rides in `properties` so a press event can map the tapped
// feature back to its artwork (the top-level `id` isn't guaranteed to round-trip
// through the native press event).
const toFeatureCollection = (
  artworks: Artwork[],
): GeoJSON.FeatureCollection => ({
  type: "FeatureCollection",
  features: artworks.map((a) => ({
    type: "Feature",
    id: a.id,
    geometry: { type: "Point", coordinates: [a.longitude, a.latitude] },
    properties: { artworkId: a.id },
  })),
});

export type TerritoryMapProps = {
  /** The artist's pieces — one accent pin per piece. */
  artworks: Artwork[];
  /** The highlighted piece (its pin grows), driven from the parent. */
  selectedId?: string;
  /** Fired when a pin is tapped — the parent tracks the selection. */
  onSelect: (artwork: Artwork) => void;
};

/**
 * The artist's "territory" — a read-only OpenStreetMap with one accent pin per
 * piece, framed to fit them all (`bounds`) or centered when there's just one.
 * Native (MapLibre); Metro resolves `TerritoryMap.web.tsx` on web.
 *
 * Same interaction as the browse map (`ArtworkMap`): tapping a pin selects its
 * artwork (the parent floats a `MapCarousel` strip below, synced to the
 * selection) and the camera eases to it. The selection state lives in the parent
 * (`ArtistTerritory`), exactly like the browse `IndexScreen`.
 *
 * The pins are a **CircleLayer** (drawn on the map surface), not RN `Marker`
 * overlays: `Marker`'s Android MarkerView is positioned against the wrong origin
 * when the map sits below the top of a ScrollView (this map lives inside the
 * artist detail's scroll), so the pins floated *outside* the map. A style layer
 * is projected by the map engine and always clipped to it — immune to that bug.
 *
 * The camera also fits the pins imperatively via `fitBounds` after mount — not by
 * `initialViewState` bounds alone, which don't apply reliably on Android.
 */
export const TerritoryMap = ({
  artworks,
  selectedId,
  onSelect,
}: TerritoryMapProps) => {
  const { scheme, colors } = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const selected = artworks.find((a) => a.id === selectedId);

  // Stable id signature so the fit effect runs when the *set* of pins changes,
  // not on an unrelated re-render (the artworks array is a fresh reference each
  // render).
  const signature = artworks.map((a) => a.id).join("|");

  // Mount-once initial camera: bounds for a spread, a single center for one pin
  // (a zero-area box would over-zoom). Kept alongside the `fitBounds` effect,
  // which is what actually frames a multi-pin set on Android.
  const [initialViewState] = useState<InitialViewState>(() =>
    artworks.length > 1
      ? { bounds: boundsOf(artworks), padding: FIT_PADDING }
      : {
          center: [artworks[0]?.longitude ?? 0, artworks[0]?.latitude ?? 0],
          zoom: ZOOM,
        },
  );

  // Fit all pins on mount / when the set changes (keyed by signature, not the
  // array). This is what reliably frames the pins on Android.
  // biome-ignore lint/correctness/useExhaustiveDependencies: signature stands in for `artworks`.
  useEffect(() => {
    if (artworks.length > 1) {
      cameraRef.current?.fitBounds(boundsOf(artworks), {
        padding: FIT_PADDING,
        duration: 500,
      });
    }
  }, [signature]);

  // Ease to a pin when it's selected (a pin tap, or centering from the strip) —
  // mirrors the browse map. Keyed by id, not the object.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ease only on selection change.
  useEffect(() => {
    const selected = artworks.find((a) => a.id === selectedId);
    if (selected) {
      cameraRef.current?.easeTo({
        center: [selected.longitude, selected.latitude],
        duration: 350,
      });
    }
  }, [selectedId]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle={cartoBasemapStyle(scheme, colors.bg)}
      >
        <Camera ref={cameraRef} initialViewState={initialViewState} />
        <GeoJSONSource
          id="territory-pins"
          data={toFeatureCollection(artworks)}
          onPress={(event) => {
            const id = event.nativeEvent.features[0]?.properties?.artworkId;
            const artwork =
              typeof id === "string"
                ? artworks.find((a) => a.id === id)
                : undefined;
            if (artwork) onSelect(artwork);
          }}
        >
          <Layer
            id="territory-pins-circles"
            type="circle"
            source="territory-pins"
            paint={{
              // The selected pin grows, like the browse map's active marker.
              "circle-radius": [
                "case",
                ["==", ["get", "artworkId"], selectedId ?? ""],
                IconSizeEnum.md / 2,
                IconSizeEnum.sm / 2,
              ],
              "circle-color": colors.primary,
              "circle-stroke-width": 2,
              "circle-stroke-color": colors.text,
            }}
          />
        </GeoJSONSource>
      </MapView>

      {/* Popup card above the selected pin. `easeTo` (above) centers that pin, so
          the card sits just above the map's center — a plain RN overlay, never a
          projected `Marker` (whose Android MarkerView mispositions in a scroll). */}
      {selected ? (
        <View style={styles.callout} pointerEvents="box-none">
          <MapThumb artwork={selected} isActive />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  // Spans the top half; its content sits at the bottom (the map's vertical
  // center), lifted a step above the centered pin.
  callout: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: "50%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: SpacingEnum.lg,
  },
});
