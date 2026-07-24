import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { CARTO_ATTRIBUTION_HTML, cartoTileUrl } from "@/shared/map/basemap";
import { mapDotIcon } from "@/shared/map/pin-icon";
import { useLeafletAutosize } from "@/shared/map/useLeafletAutosize";
import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";

// Paris fallback when no pin has been set yet — mirrors LocationPicker (native).
const FALLBACK = { latitude: 48.8566, longitude: 2.3522 };
const ZOOM = 15;

type LocationWebMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  /** Accent colour for the pin (ColorEnum.primary). */
  accent: string;
  /** Resolved theme — picks the CARTO tile skin (dark/light). */
  scheme: ThemeScheme;
  /** Page background (ColorEnum.bg) shown under the tiles when over-panned. */
  background: string;
  onPick: (latitude: number, longitude: number) => void;
};

// Recenters the map when the pin moves (EXIF auto-pin, "use my location").
const MapController = ({
  latitude,
  longitude,
}: {
  latitude?: number | null;
  longitude?: number | null;
}) => {
  const map = useMap();
  useLeafletAutosize(map);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [map, latitude, longitude]);

  return null;
};

// Tap anywhere to drop/move the pin.
const ClickToPick = ({ onPick }: { onPick: LocationWebMapProps["onPick"] }) => {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

/**
 * Web-only interactive picker map (react-leaflet + OpenStreetMap tiles). Loaded
 * lazily from LocationPicker.web.tsx so `leaflet` only evaluates in the browser,
 * never during Expo's static (Node) prerender. The native app uses MapLibre.
 */
const LocationWebMap = ({
  latitude,
  longitude,
  accent,
  scheme,
  background,
  onPick,
}: LocationWebMapProps) => {
  const hasPin = latitude != null && longitude != null;
  const center: [number, number] = hasPin
    ? [latitude, longitude]
    : [FALLBACK.latitude, FALLBACK.longitude];

  return (
    <MapContainer
      center={center}
      zoom={ZOOM}
      style={{ height: "100%", width: "100%", background }}
    >
      <TileLayer
        key={scheme}
        attribution={CARTO_ATTRIBUTION_HTML}
        url={cartoTileUrl(scheme)}
      />
      <ClickToPick onPick={onPick} />
      <MapController latitude={latitude} longitude={longitude} />
      {hasPin && (
        <Marker
          position={[latitude, longitude]}
          icon={mapDotIcon(accent)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onPick(lat, lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
};

export default LocationWebMap;
