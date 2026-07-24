import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  type FlatListProps,
  type ListRenderItem,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { EmptyState } from "@/pages/app/artwork/components/empty-state/EmptyState";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

// Minimum card width that decides how many columns fit on a wide screen
// (Fold unfolded ≈ 2, tablet landscape ≈ 3, phone = 1).
const MIN_CARD_WIDTH = 360;

export type GridViewProps = {
  artworks: Artwork[];
  filterCount: number;
  onResetFilters: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  contentContainerStyle?: FlatListProps<Artwork>["contentContainerStyle"];
};

export const GridView = ({
  artworks,
  filterCount,
  onResetFilters,
  isRefreshing,
  onRefresh,
  onEndReached,
  isFetchingNextPage,
  contentContainerStyle,
}: GridViewProps) => {
  const { width } = useWindowDimensions();
  const isHydrated = useIsHydrated();
  const { colors } = useTheme();

  // Responsive grid: derive a column count from the window width, then size each
  // cell to an explicit pixel width so a lone card on an odd last row keeps its
  // width instead of stretching across the row. Computed against the same
  // padding/gap as `listContent` so the row fills edge-to-edge.
  //
  // Until hydrated (web SSR + the client's first render) force a single column:
  // the server has no viewport (width 0), and the FlatList `key` is derived from
  // `numColumns`, so a server/client mismatch would remount the list — a
  // structural hydration error (#418). The real column count applies post-mount
  // (an accepted reflow, since there's no reliable server viewport). A single
  // column takes the full available width (no explicit itemWidth), which is also
  // the deterministic SSR render.
  const numColumns = isHydrated
    ? Math.max(1, Math.floor(width / MIN_CARD_WIDTH))
    : 1;
  const itemWidth =
    numColumns > 1
      ? (width - SpacingEnum.lg * 2 - SpacingEnum.lg * (numColumns - 1)) /
        numColumns
      : undefined;

  // Stable renderItem so a re-render around navigation doesn't re-create each
  // card — that would tear down and re-register its Link.AppleZoom source view
  // under a new id, orphaning the id the push carried and dropping the zoom
  // transition to a plain push ("No source view found for identifier …").
  const renderItem = useCallback<ListRenderItem<Artwork>>(
    ({ item }) => (
      <View style={{ width: itemWidth }}>
        <ArtworkCard
          artwork={item}
          href={`/artworks/${item.slug}`}
          hideHorizontalBorder={numColumns === 1}
        />
      </View>
    ),
    [itemWidth, numColumns]
  );

  return (
    <FlatList
      data={artworks}
      keyExtractor={(item) => item.id}
      // numColumns is fixed at mount, so the list must remount when the
      // column count changes (fold/unfold, rotate) — hence the key.
      key={`grid-${numColumns}`}
      numColumns={numColumns}
      // Native detaches clipped subviews by default (Android), which tears down
      // the Link.AppleZoom source view — so at push time expo-router logs "No
      // source view found for identifier …" and falls back to a plain push. Keep
      // the source views attached so the zoom transition can measure them.
      removeClippedSubviews={false}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={renderItem}
      // --- Empty: loaded successfully but no rows ---
      ListEmptyComponent={
        <EmptyState
          isFiltered={filterCount > 0}
          onResetFilters={onResetFilters}
        />
      }
      // --- Load-more spinner ---
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator
            color={colors.primary}
            style={styles.footerSpinner}
          />
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: SpacingEnum.lg,
    flexGrow: 1,
  },
  columnWrapper: { gap: SpacingEnum.lg, justifyContent: "space-between" },
  footerSpinner: { marginVertical: SpacingEnum.md },
});
