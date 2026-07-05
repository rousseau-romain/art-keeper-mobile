import L, { type Marker as LeafletMarker } from "leaflet";
import { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import { ColorEnum } from "@/theme/enums/color.enums";

export type ArtworkLeafletMarkerProps = {
  artwork: Artwork;
  /** This pin is the current selection (its marker scales up + popup opens). */
  selected: boolean;
  onSelect: (artwork: Artwork) => void;
};

// Accent teardrop pin (a bare divIcon dodges leaflet's broken default PNG asset,
// same trick as the create flow's WebMap). The active pin is larger + ringed.
const pinIcon = (active: boolean) => {
  const size = active ? 26 : 18;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${ColorEnum.accent};border:2px solid ${active ? "#fff" : ColorEnum.accentInk}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

/**
 * One artwork pin on the web (leaflet) browse map. When it becomes the
 * selection, its popup opens over the pin with a floating {@link MapThumb} that
 * links to the artwork detail — mirroring the native map's callout.
 */
export const ArtworkLeafletMarker = ({
  artwork,
  selected,
  onSelect,
}: ArtworkLeafletMarkerProps) => {
  const markerRef = useRef<LeafletMarker>(null);

  // Leaflet popups aren't declarative: open this pin's popup when it becomes the
  // selection, close it when another pin (or none) takes over.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (selected) marker.openPopup();
    else marker.closePopup();
  }, [selected]);

  return (
    <Marker
      ref={markerRef}
      position={[artwork.latitude, artwork.longitude]}
      icon={pinIcon(selected)}
      eventHandlers={{ click: () => onSelect(artwork) }}
    >
      <Popup closeButton={false} autoPan={false}>
        <MapThumb artwork={artwork} active />
      </Popup>
    </Marker>
  );
};
