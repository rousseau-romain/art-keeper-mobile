import { latLngBounds } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import type { Artwork } from "@/lib/api/artworks";
import {
  OSM_TILE_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/shared/map/osm-style.constant";
import { mapDotIcon } from "@/shared/map/pin-icon";
import { useLeafletAutosize } from "@/shared/map/useLeafletAutosize";

// Zoom used when there's a single point to show (bounds would be degenerate).
const SINGLE_ZOOM = 15;
const FIT_PADDING: [number, number] = [48, 48];

type TerritoryWebMapProps = {
  artworks: Artwork[];
  /** Accent colour for the pins (ColorEnum.primary). */
  accent: string;
};

// Frames the map to every pin (`fitBounds`) once the container is measured, or
// centers on the single piece. Re-fits when the artwork set changes (the map
// instance is reused across profile → profile navigation).
const MapController = ({ artworks }: Pick<TerritoryWebMapProps, "artworks">) => {
  const map = useMap();
  useLeafletAutosize(map);
  useEffect(() => {
    if (artworks.length === 0) return;
    if (artworks.length === 1) {
      map.setView([artworks[0].latitude, artworks[0].longitude], SINGLE_ZOOM);
      return;
    }
    map.fitBounds(
      latLngBounds(artworks.map((a) => [a.latitude, a.longitude])),
      { padding: FIT_PADDING },
    );
  }, [map, artworks]);
  return null;
};

/**
 * Web-only read-only territory map (react-leaflet + OpenStreetMap tiles). Loaded
 * lazily from `TerritoryMap.web.tsx` so `leaflet` only evaluates in the browser,
 * never during Expo's static (Node) prerender. One accent pin per piece, framed
 * to fit them all.
 */
const TerritoryWebMap = ({ artworks, accent }: TerritoryWebMapProps) => {
  const first = artworks[0];
  return (
    <MapContainer
      center={first ? [first.latitude, first.longitude] : [0, 0]}
      zoom={SINGLE_ZOOM}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
      <MapController artworks={artworks} />
      {artworks.map((artwork) => (
        <Marker
          key={artwork.id}
          position={[artwork.latitude, artwork.longitude]}
          icon={mapDotIcon(accent)}
        />
      ))}
    </MapContainer>
  );
};

export default TerritoryWebMap;
