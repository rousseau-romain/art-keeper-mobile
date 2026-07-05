import { StyleSheet, View, type ViewProps } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkMap } from "@/pages/app/artwork/components/artwork-map/ArtworkMap";
import { FilterPill } from "@/pages/app/artwork/components/filter-pill/FilterPill";
import { MapCarousel } from "@/pages/app/artwork/components/map-carousel/MapCarousel";
import {
  type ArtworkView,
  ViewToggle,
} from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type MapViewProps = ViewProps & {
  artworks: Artwork[];
  selectedId: string | undefined;
  onSelect: (artwork: Artwork) => void;
  view: ArtworkView;
  onChangeView: (view: ArtworkView) => void;
  filterCount: number;
  onOpenFilters: () => void;
};

export const MapView = ({
  artworks,
  selectedId,
  onSelect,
  view,
  onChangeView,
  filterCount,
  onOpenFilters,
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
      <View style={styles.gridControls}>
        <FilterPill count={filterCount} onPress={onOpenFilters} />
        <ViewToggle view={view} onChange={onChangeView} />
      </View>

      <View>
        <MapCarousel artworks={artworks} selectedId={selectedId} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: { flex: 1, position: "relative" },
  gridControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    padding: SpacingEnum.sm,
    zIndex: 1,
    width: "100%",
  },
});
