import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkLeafletMarker } from "@/pages/app/artwork/components/artwork-map/ArtworkLeafletMarker";
import { useTheme } from "@/theme/ThemeProvider";

type ArtworkMapLeafletProps = {
  artworks: Artwork[];
  selectedId?: string;
  onSelect: (artwork: Artwork) => void;
};

const FALLBACK: [number, number] = [48.8566, 2.3522]; // Paris [lat, lng]
const FALLBACK_ZOOM = 11;

// Fit all pins on mount / when the set changes, and re-measure (leaflet's
// 0-height-in-flex race). Ease to the selected pin when one is picked.
const MapController = ({
  artworks,
  selectedId,
}: {
  artworks: Artwork[];
  selectedId?: string;
}) => {
  const map = useMap();
  // Stable signature so the fit runs on set changes, not every render
  // (react-leaflet re-renders, and the artworks array identity is unstable).
  const signature = artworks.map((a) => a.id).join("|");

  // Keep the tiles filling the viewport: re-measure (leaflet's 0-height-in-flex
  // race) and pin the min zoom to "the whole world fits inside the view", so
  // globally-scattered pins can't zoom out past the point where dark bands
  // appear above/below the Mercator world. Lock panning to the world too.
  useEffect(() => {
    const WORLD = L.latLngBounds([-85, -180], [85, 180]);
    map.options.maxBoundsViscosity = 1;
    const apply = () => {
      map.invalidateSize();
      // inside=true → the lowest zoom at which the view fits *inside* the world.
      map.setMinZoom(map.getBoundsZoom(WORLD, true));
      map.setMaxBounds(WORLD);
    };
    apply();
    const t = setTimeout(apply, 200);
    const ro = new ResizeObserver(apply);
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [map]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: signature stands in for `artworks`.
  useEffect(() => {
    if (artworks.length > 1) {
      const bounds = L.latLngBounds(
        artworks.map((a) => [a.latitude, a.longitude]),
      );
      map.fitBounds(bounds, { padding: [48, 48] });
    } else if (artworks.length === 1) {
      map.setView([artworks[0].latitude, artworks[0].longitude], 15);
    }
  }, [map, signature]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ease only on selection change.
  useEffect(() => {
    const selected = artworks.find((a) => a.id === selectedId);
    if (selected) {
      map.setView([selected.latitude, selected.longitude], map.getZoom(), {
        animate: true,
      });
    }
  }, [map, selectedId]);

  return null;
};

/**
 * Web browse map (react-leaflet + CARTO tiles, skinned per theme). Loaded lazily
 * from ArtworkMap.web.tsx so `leaflet` only evaluates in the browser, never during
 * Expo's static (Node) prerender. The native app uses MapLibre (ArtworkMap.tsx).
 */
const ArtworkMapLeaflet = ({
  artworks,
  selectedId,
  onSelect,
}: ArtworkMapLeafletProps) => {
  const { scheme, colors } = useTheme();
  return (
    <MapContainer
      center={FALLBACK}
      zoom={FALLBACK_ZOOM}
      style={{ height: "100%", width: "100%", background: colors.bg }}
    >
      <TileLayer
        key={scheme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/${scheme}_all/{z}/{x}/{y}.png`}
      />
      <MapController artworks={artworks} selectedId={selectedId} />
      {artworks.map((artwork) => (
        <ArtworkLeafletMarker
          key={artwork.id}
          artwork={artwork}
          selected={artwork.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </MapContainer>
  );
};

export default ArtworkMapLeaflet;
