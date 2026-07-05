import {
  Camera,
  type CameraRef,
  type InitialViewState,
  Map as MapView,
  Marker,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { Fragment, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import type { MapViewProps } from "@/pages/app/artwork/components/map-view/MapView";
import { Icon } from "@/shared/ui/icon/Icon";
import { IconSizeEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type ArtworkMapProps = {
  artworks: Artwork[];
  /** The highlighted artwork (its marker scales up). */
  selectedId?: string;
  onSelect: (artwork: Artwork) => void;
  style?: MapViewProps["style"];
};

// Key-free CARTO basemap, skinned per theme — dark tiles under the dark theme,
// light tiles under the light one, so the browse map never clashes with the UI.
// A `background` layer under the raster fills the area exposed when the map is
// over-panned past the world edge (otherwise MapLibre paints its default black).
const basemapStyle = (
  scheme: ThemeScheme,
  background: string,
): StyleSpecification => ({
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: ["a", "b", "c"].map(
        (s) =>
          `https://${s}.basemaps.cartocdn.com/${scheme}_all/{z}/{x}/{y}.png`,
      ),
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": background } },
    { id: "carto", type: "raster", source: "carto" },
  ],
});

// MapLibre coords are [lng, lat] — the reverse of the artwork's { lat, lng }.
const FALLBACK: [number, number] = [2.3522, 48.8566]; // Paris
const FALLBACK_ZOOM = 11;
// Keep pins clear of the header chips and the bottom strip.
const FIT_PADDING = { top: 80, right: 60, bottom: 220, left: 60 };

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

/**
 * Browse map (native MapLibre). One marker per artwork at its real coordinates;
 * the camera fits all pins on load and whenever the filtered set changes, and
 * eases to a pin when it's selected from the strip below.
 */
export const ArtworkMap = ({
  artworks,
  selectedId,
  onSelect,
  style,
}: ArtworkMapProps) => {
  const cameraRef = useRef<CameraRef>(null);
  const { scheme, colors } = useTheme();

  // `useArtworks` flatMaps a fresh array each render, so we key the camera
  // effects off a stable id signature — fitting only when the *set* of pins
  // actually changes (tag filter, new page), never on an unrelated re-render
  // (a strip selection), which would otherwise yank the camera back mid-pan.
  const signature = artworks.map((a) => a.id).join("|");

  // Mount-once initial camera: bounds when there's a spread, a single center
  // when there's one pin (a zero-area box would over-zoom), else Paris.
  const [initialViewState] = useState<InitialViewState>(() => {
    if (artworks.length > 1)
      return { bounds: boundsOf(artworks), padding: FIT_PADDING };
    if (artworks.length === 1) {
      return {
        center: [artworks[0].longitude, artworks[0].latitude],
        zoom: FALLBACK_ZOOM,
      };
    }
    return { center: FALLBACK, zoom: FALLBACK_ZOOM };
  });

  // Re-fit when the filtered set changes (keyed by signature, not the array).
  // biome-ignore lint/correctness/useExhaustiveDependencies: signature stands in for `artworks`.
  useEffect(() => {
    if (artworks.length > 1) {
      cameraRef.current?.fitBounds(boundsOf(artworks), {
        padding: FIT_PADDING,
        duration: 500,
      });
    }
  }, [signature]);

  // Ease to a pin when it's picked from the strip (keyed by id, not the object).
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
    <MapView style={[styles.map, style]} mapStyle={basemapStyle(scheme, colors.bg)}>
      <Camera ref={cameraRef} initialViewState={initialViewState} />
      {artworks.map((artwork) => {
        const active = artwork.id === selectedId;
        return (
          <Fragment key={artwork.id}>
            <Marker
              lngLat={[artwork.longitude, artwork.latitude]}
              anchor="bottom"
              onPress={() => onSelect(artwork)}
            >
              <View style={styles.pin}>
                <Icon
                  name="MapPin"
                  size={active ? "xxl" : "lg"}
                  color="primary"
                  fill={colors.primary}
                  strokeWidth={1.5}
                />
              </View>
            </Marker>
            {/* Floating thumbnail above the selected pin — its own marker (no
                `onPress`) so the inner `MapThumb` link handles the tap; the
                `box-none` wrapper lets touches through its empty top gap. */}
            {active ? (
              <Marker
                lngLat={[artwork.longitude, artwork.latitude]}
                anchor="bottom"
              >
                <View style={styles.callout} pointerEvents="box-none">
                  <MapThumb artwork={artwork} active />
                </View>
              </Marker>
            ) : null}
          </Fragment>
        );
      })}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  // A little padding so the marker has a comfortable touch target.
  pin: { padding: SpacingEnum.xs },
  // Lift the floating thumb above the (bottom-anchored) selected pin: the
  // paddingBottom clears the active pin's height, and it centers over the pin.
  callout: {
    alignItems: "center",
    paddingBottom: IconSizeEnum.xxl + SpacingEnum.md,
  },
});
