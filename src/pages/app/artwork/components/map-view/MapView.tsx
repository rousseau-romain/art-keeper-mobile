import { StyleSheet, View, type ViewProps } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkMap } from "@/pages/app/artwork/components/artwork-map/ArtworkMap";

export type MapViewProps = ViewProps & {
  artworks: Artwork[];
  selectedId: string | undefined;
  onSelect: (artwork: Artwork) => void;
};

export const MapView = ({
  artworks,
  selectedId,
  onSelect,
  style,
  ...rest
}: MapViewProps) => {
  return (
    <View style={[styles.mapWrap, style]} {...rest}>
      <ArtworkMap
        artworks={artworks}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: { flex: 1, position: "relative" },
});
