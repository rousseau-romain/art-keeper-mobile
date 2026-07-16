import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { EmptyState } from "@/pages/app/artwork/components/empty-state/EmptyState";
import { FilterPill } from "@/pages/app/artwork/components/filter-pill/FilterPill";
import {
  type ArtworkView,
  ViewToggle,
} from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

// Minimum card width that decides how many columns fit on a wide screen
// (Fold unfolded ≈ 2, tablet landscape ≈ 3, phone = 1).
const MIN_CARD_WIDTH = 360;

export type GridViewProps = {
  artworks: Artwork[];
  view: ArtworkView;
  onChangeView: (view: ArtworkView) => void;
  filterCount: number;
  onOpenFilters: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

export const GridView = ({
  artworks,
  view,
  onChangeView,
  filterCount,
  onOpenFilters,
  refreshing,
  onRefresh,
  onEndReached,
  isFetchingNextPage,
}: GridViewProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const hydrated = useIsHydrated();
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
  const numColumns = hydrated
    ? Math.max(1, Math.floor(width / MIN_CARD_WIDTH))
    : 1;
  const itemWidth =
    numColumns > 1
      ? (width - SpacingEnum.lg * 2 - SpacingEnum.lg * (numColumns - 1)) /
        numColumns
      : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.gridControls}>
        <FilterPill count={filterCount} onPress={onOpenFilters} />
        <ViewToggle view={view} onChange={onChangeView} />
      </View>
      <FlatList
        data={artworks}
        keyExtractor={(item) => item.id}
        // numColumns is fixed at mount, so the list must remount when the
        // column count changes (fold/unfold, rotate) — hence the key.
        key={`grid-${numColumns}`}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SpacingEnum.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <ArtworkCard artwork={item} href={`/artworks/${item.slug}`} />
          </View>
        )}
        // --- Empty: loaded successfully but no rows ---
        ListEmptyComponent={<EmptyState />}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SpacingEnum.sm,
    position: "absolute",
    zIndex: 1,
    width: "100%",
  },
  listContent: { padding: SpacingEnum.lg, gap: SpacingEnum.lg, flexGrow: 1 },
  columnWrapper: { gap: SpacingEnum.lg },
  footerSpinner: { marginVertical: SpacingEnum.md },
});
