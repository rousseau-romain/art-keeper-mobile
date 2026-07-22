import { useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { SpacingEnum } from "@/theme/enums/scale.enums";

// Minimum card width that decides how many columns fit (mirrors `GridView`).
const MIN_CARD_WIDTH = 360;

export type ArtworkGridProps = {
  artworks: Artwork[];
};

/**
 * A responsive multi-column grid of `ArtworkCard`s — the same column behaviour as
 * the browse `GridView`, but as a plain flex-wrap `<View>` for use *inside* a
 * scroll view (the artist profile), where a nested vertical `FlatList` would be an
 * anti-pattern. The set is bounded and already fetched, so no virtualization.
 *
 * The column count comes from the measured container width (`onLayout`), not the
 * window, so it's correct regardless of the surrounding padding / max-width. Width
 * is `0` on the web SSR render and the client's first render (onLayout fires only
 * after mount), so both produce a single full-width column — hydration-safe
 * (#418); the real columns apply post-layout (an accepted reflow, as in
 * `GridView`).
 */
export const ArtworkGrid = ({ artworks }: ArtworkGridProps) => {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const numColumns =
    width > 0 ? Math.max(1, Math.floor(width / MIN_CARD_WIDTH)) : 1;
  // Explicit pixel width per cell so a lone card on an odd last row keeps its
  // width instead of stretching. A single column takes the full row.
  const itemWidth =
    numColumns > 1
      ? (width - SpacingEnum.lg * (numColumns - 1)) / numColumns
      : undefined;

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {artworks.map((artwork) => (
        <View
          key={artwork.id}
          style={numColumns > 1 ? { width: itemWidth } : styles.fullCell}
        >
          <ArtworkCard artwork={artwork} href={`/artworks/${artwork.slug}`} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.lg },
  fullCell: { width: "100%" },
});
