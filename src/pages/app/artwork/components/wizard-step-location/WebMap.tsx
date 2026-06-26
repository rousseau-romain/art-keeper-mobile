import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Paris fallback when no pin has been set yet — mirrors LocationStep (native).
const FALLBACK = { latitude: 48.8566, longitude: 2.3522 };
const ZOOM = 15;

type WebMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  /** Accent colour for the pin (ColorEnum.accent). */
  accent: string;
  onPick: (latitude: number, longitude: number) => void;
};

// A simple accent dot instead of Leaflet's default PNG marker — avoids the
// well-known bundler issue with leaflet's image assets and matches the app pin.
const pinIcon = (accent: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${accent};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

// Recenters the map when the pin moves (EXIF auto-pin, "use my location") and
// fixes Leaflet's initial 0-height race inside a flex container.
const MapController = ({
  latitude,
  longitude,
}: {
  latitude?: number | null;
  longitude?: number | null;
}) => {
  const map = useMap();

  useEffect(() => {
    // Leaflet maps the click point against the container's measured size. Inside
    // a flex parent the map often mounts at 0-height, so without re-measuring,
    // clicks are ignored or land at the wrong lat/lng. Re-measure on mount, on a
    // couple of delayed ticks, and on every container resize.
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [map, latitude, longitude]);

  return null;
};

// Tap anywhere to drop/move the pin.
const ClickToPick = ({ onPick }: { onPick: WebMapProps["onPick"] }) => {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

/**
 * Web-only interactive map (react-leaflet + OpenStreetMap tiles). Loaded lazily
 * from LocationStep.web.tsx so `leaflet` only evaluates in the browser, never
 * during Expo's static (Node) prerender. The native app uses react-native-maps.
 */
const WebMap = ({ latitude, longitude, accent, onPick }: WebMapProps) => {
  const hasPin = latitude != null && longitude != null;
  const center: [number, number] = hasPin
    ? [latitude, longitude]
    : [FALLBACK.latitude, FALLBACK.longitude];

  return (
    <MapContainer
      center={center}
      zoom={ZOOM}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPick onPick={onPick} />
      <MapController latitude={latitude} longitude={longitude} />
      {hasPin && (
        <Marker
          position={[latitude, longitude]}
          icon={pinIcon(accent)}
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

export default WebMap;
