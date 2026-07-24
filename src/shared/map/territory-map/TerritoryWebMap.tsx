import { latLngBounds } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import { CARTO_ATTRIBUTION_HTML, cartoTileUrl } from "@/shared/map/basemap";
import { mapDotIcon } from "@/shared/map/pin-icon";
import { useLeafletAutosize } from "@/shared/map/useLeafletAutosize";
import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";

// Zoom used when there's a single point to show (bounds would be degenerate).
const SINGLE_ZOOM = 15;
const FIT_PADDING: [number, number] = [48, 48];

type TerritoryWebMapProps = {
  artworks: Artwork[];
  /** Accent colour for the pins (ColorEnum.primary). */
  accent: string;
  /** Resolved theme — picks the CARTO tile skin (dark/light). */
  scheme: ThemeScheme;
  /** Page background (ColorEnum.bg) shown under the tiles when over-panned. */
  background: string;
  /** The highlighted piece (drives the strip below and the thumb accent). */
  selectedId?: string;
  /** Fired when a pin is clicked — the parent tracks the selection. */
  onSelect: (artwork: Artwork) => void;
};

// Frames the map to every pin (`fitBounds`) once the container is measured, or
// centers on the single piece. Re-fits when the artwork set changes (the map
// instance is reused across profile → profile navigation).
const MapController = ({
  artworks,
}: Pick<TerritoryWebMapProps, "artworks">) => {
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
const TerritoryWebMap = ({
  artworks,
  accent,
  scheme,
  background,
  selectedId,
  onSelect,
}: TerritoryWebMapProps) => {
  const first = artworks[0];
  return (
    <MapContainer
      center={first ? [first.latitude, first.longitude] : [0, 0]}
      zoom={SINGLE_ZOOM}
      style={{ height: "100%", width: "100%", background }}
    >
      <TileLayer
        key={scheme}
        attribution={CARTO_ATTRIBUTION_HTML}
        url={cartoTileUrl(scheme)}
      />
      <MapController artworks={artworks} />
      {artworks.map((artwork) => (
        <Marker
          key={artwork.id}
          position={[artwork.latitude, artwork.longitude]}
          icon={mapDotIcon(accent)}
          eventHandlers={{ click: () => onSelect(artwork) }}
        >
          {/* Click the pin → a popup card (photo + title) linking to the piece. */}
          <Popup closeButton={false}>
            <MapThumb artwork={artwork} isActive={artwork.id === selectedId} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TerritoryWebMap;
