import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import {
  OSM_TILE_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/shared/map/osm-style.constant";
import { mapDotIcon } from "@/shared/map/pin-icon";
import { useLeafletAutosize } from "@/shared/map/useLeafletAutosize";

const ZOOM = 15;

type LocationWebMapProps = {
  latitude: number;
  longitude: number;
  /** Accent colour for the pin (ColorEnum.primary). */
  accent: string;
};

const MapController = () => {
  const map = useMap();
  useLeafletAutosize(map);
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
}: LocationWebMapProps) => (
  <MapContainer
    center={[latitude, longitude]}
    zoom={ZOOM}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
    <MapController />
    <Marker position={[latitude, longitude]} icon={mapDotIcon(accent)} />
  </MapContainer>
);

export default LocationWebMap;
