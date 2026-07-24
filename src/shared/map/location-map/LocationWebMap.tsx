import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { CARTO_ATTRIBUTION_HTML, cartoTileUrl } from "@/shared/map/basemap";
import { mapDotIcon } from "@/shared/map/pin-icon";
import { useLeafletAutosize } from "@/shared/map/useLeafletAutosize";
import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";

const ZOOM = 15;

type LocationWebMapProps = {
  latitude: number;
  longitude: number;
  /** Accent colour for the pin (ColorEnum.primary). */
  accent: string;
  /** Resolved theme — picks the CARTO tile skin (dark/light). */
  scheme: ThemeScheme;
  /** Page background (ColorEnum.bg) shown under the tiles when over-panned. */
  background: string;
};

const MapController = ({
  latitude,
  longitude,
}: Pick<LocationWebMapProps, "latitude" | "longitude">) => {
  const map = useMap();
  useLeafletAutosize(map);
  // `center` only positions the map on mount; re-center when the coordinate
  // changes (the map instance is reused across detail → detail navigation).
  useEffect(() => {
    map.setView([latitude, longitude], ZOOM);
  }, [map, latitude, longitude]);
  return null;
};

/**
 * Web-only read-only map (react-leaflet + OpenStreetMap tiles). Loaded lazily
 * from LocationMap.web.tsx so `leaflet` only evaluates in the browser, never
 * during Expo's static (Node) prerender. The native app uses MapLibre.
 */
const LocationWebMap = ({
  latitude,
  longitude,
  accent,
  scheme,
  background,
}: LocationWebMapProps) => (
  <MapContainer
    center={[latitude, longitude]}
    zoom={ZOOM}
    style={{ height: "100%", width: "100%", background }}
  >
    <TileLayer
      key={scheme}
      attribution={CARTO_ATTRIBUTION_HTML}
      url={cartoTileUrl(scheme)}
    />
    <MapController latitude={latitude} longitude={longitude} />
    <Marker position={[latitude, longitude]} icon={mapDotIcon(accent)} />
  </MapContainer>
);

export default LocationWebMap;
