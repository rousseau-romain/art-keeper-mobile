import { useEffect, useRef, useState } from "react";
import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { MapThumb } from "@/pages/app/artwork/components/map-thumb/MapThumb";
import type { Palette } from "@/theme/enums/color.enums";
import { ControlHeightEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type MapCarouselProps = ScrollViewProps & {
  artworks: Artwork[];
  selectedId?: string;
};

// A thumb's on-screen stride: its width (MapThumb's frame) plus the strip gap.
// Fixed, so we can compute a thumb's x-offset without measuring each one.
const THUMB = ControlHeightEnum.lg;
const STRIDE = THUMB + SpacingEnum.md;

/** Horizontal carousel of artwork thumbnails shown over the map. */
export const MapCarousel = ({ artworks, selectedId }: MapCarouselProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const styles = useThemeStyles(createStyles);

  // Center the selected thumb when the selection changes — e.g. tapping its pin
  // on the map. Keyed by id, not the artwork object, so an unrelated re-render
  // (a new page flatMapping a fresh array) doesn't yank the strip back.
  // biome-ignore lint/correctness/useExhaustiveDependencies: center only on selection change.
  useEffect(() => {
    const index = artworks.findIndex((a) => a.id === selectedId);
    if (index < 0) return;
    const offset = SpacingEnum.sm + index * STRIDE;
    const x = Math.max(0, offset - (viewportWidth - THUMB) / 2);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedId]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
    >
      {artworks.map((artwork) => (
        <MapThumb
          key={artwork.id}
          artwork={artwork}
          isActive={artwork.id === selectedId}
        />
      ))}
    </ScrollView>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    strip: {
      backgroundColor: c.bg,
      borderTopWidth: 1.5,
      borderTopColor: c.borderSoft,
      gap: SpacingEnum.md,
      padding: SpacingEnum.sm,
    },
  });
