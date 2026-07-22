import { Camera, Map as MapView, Marker } from "@maplibre/maplibre-react-native";
import { StyleSheet, View } from "react-native";

import type { Artwork } from "@/lib/api/artworks";
import { OSM_STYLE } from "@/shared/map/osm-style.constant";
import type { Palette } from "@/theme/enums/color.enums";
import {
  IconSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

// Zoom used when there's a single point to show (bounds would be degenerate).
const ZOOM = 13;
const PAD = SpacingEnum.xxl;

export type TerritoryMapProps = {
  /** The artist's pieces — one accent pin per piece. */
  artworks: Artwork[];
};

/**
 * The artist's "territory" — a read-only OpenStreetMap with one accent pin per
 * piece, framed to fit them all (`bounds`) or centered when there's just one.
 * Native (MapLibre); Metro resolves `TerritoryMap.web.tsx` on web. Mirrors the
 * single-pin `LocationMap`, but with a marker per artwork.
 */
export const TerritoryMap = ({ artworks }: TerritoryMapProps) => {
  const styles = useThemeStyles(createStyles);

  const lats = artworks.map((a) => a.latitude);
  const lngs = artworks.map((a) => a.longitude);

  // `initialViewState`: a bounding box that frames every pin, or a plain center
  // when there's a single piece (a box of one point can't be fit).
  const initialViewState =
    artworks.length > 1
      ? {
          bounds: [
            Math.min(...lngs),
            Math.min(...lats),
            Math.max(...lngs),
            Math.max(...lats),
          ] as [number, number, number, number],
          padding: { top: PAD, right: PAD, bottom: PAD, left: PAD },
        }
      : { center: [lngs[0] ?? 0, lats[0] ?? 0] as [number, number], zoom: ZOOM };

  return (
    <MapView style={styles.map} mapStyle={OSM_STYLE}>
      <Camera initialViewState={initialViewState} />
      {artworks.map((artwork) => (
        <Marker key={artwork.id} lngLat={[artwork.longitude, artwork.latitude]}>
          <View style={styles.pin} />
        </Marker>
      ))}
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
