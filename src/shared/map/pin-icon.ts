import L from "leaflet";

/**
 * A simple accent dot marker for react-leaflet maps — a bare `divIcon` instead of
 * Leaflet's default PNG marker, which dodges the well-known bundler issue with
 * leaflet's image assets and matches the app's native pin. Shared by the
 * create-flow location picker (`WebMap`) and the moderation location preview
 * (`LocationWebMap`).
 *
 * Only imported by lazy, client-gated web map modules, so `leaflet` never
 * evaluates during Expo's static (Node) prerender.
 */
export const mapDotIcon = (accent: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${accent};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
