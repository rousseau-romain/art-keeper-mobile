import type { StyleSpecification } from "@maplibre/maplibre-react-native";

import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";

/**
 * Key-free CARTO basemap, skinned per theme — dark tiles under the dark theme,
 * light tiles under the light one — so every map matches the surrounding UI
 * instead of always showing the standard (light) OpenStreetMap raster. Shared by
 * the browse map (`ArtworkMap`), the artist territory map, the location preview,
 * and the location picker. Web maps use the `cartoTileUrl` variant below with
 * react-leaflet's `{s}` subdomain placeholder; both hit the same CARTO tiles.
 */

/** Attribution required for the free CARTO tiles — native (plain text). */
export const CARTO_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";

/** Attribution required for the free CARTO tiles — web (leaflet HTML). */
export const CARTO_ATTRIBUTION_HTML =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * MapLibre style for the native maps. A `background` layer under the raster fills
 * the area exposed when the map is over-panned past the world edge (otherwise
 * MapLibre paints its default black).
 */
export const cartoBasemapStyle = (
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
      attribution: CARTO_ATTRIBUTION,
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": background } },
    { id: "carto", type: "raster", source: "carto" },
  ],
});

/** CARTO raster tile URL for react-leaflet `<TileLayer>` (web). */
export const cartoTileUrl = (scheme: ThemeScheme): string =>
  `https://{s}.basemaps.cartocdn.com/${scheme}_all/{z}/{x}/{y}.png`;
