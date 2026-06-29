import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type MapCarouselProps = ScrollViewProps & {
  artworks: Artwork[];
  selectedId?: string;
  onSelect: (artwork: Artwork) => void;
};

/** Horizontal carousel of artwork thumbnails shown over the map. */
export const MapCarousel = ({
  artworks,
  selectedId,
  onSelect,
}: MapCarouselProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {artworks.map((artwork) => (
        <MapThumb
          key={artwork.id}
          artwork={artwork}
          active={artwork.id === selectedId}
          onPress={() => onSelect(artwork)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  strip: {
    backgroundColor: ColorEnum.bg,
    borderTopWidth: 1.5,
    borderTopColor: ColorEnum.hair,
    gap: SpacingEnum.md,
    padding: SpacingEnum.sm,
  },
});
