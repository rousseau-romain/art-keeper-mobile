import type { StyleSpecification } from "@maplibre/maplibre-react-native";

/**
 * Key-free OpenStreetMap raster style for MapLibre (no API key / billing, unlike
 * Google Maps). Shared by every native map — the create-flow location picker
 * (`LocationStep`) and the moderation location preview (`LocationMap`) — so they
 * render identical OSM tiles. Web maps use react-leaflet with the same tiles.
 */
export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

/**
 * OpenStreetMap raster tiles for react-leaflet `<TileLayer>` (web) — the same
 * OSM tiles the native `OSM_STYLE` uses, with leaflet's `{s}` subdomain
 * placeholder. Shared by the create-flow picker (`WebMap`) and the moderation
 * preview (`LocationWebMap`).
 */
export const OSM_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const OSM_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
