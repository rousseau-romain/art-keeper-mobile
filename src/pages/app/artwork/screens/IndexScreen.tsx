import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type Artwork, useArtworks } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { ArtworkMap } from "@/pages/app/artwork/components/artwork-map/ArtworkMap";
import { FilterPill } from "@/pages/app/artwork/components/filter-pill/FilterPill";
import { MapCarousel } from "@/pages/app/artwork/components/map-carousel/MapCarousel";
import {
  type ArtworkView,
  ViewToggle,
} from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Centered } from "@/shared/ui/centered/Centered";
import { Icon } from "@/shared/ui/icon/Icon";
import { Seo } from "@/shared/ui/seo/Seo";
import { StatusDot } from "@/shared/ui/status-dot/StatusDot";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

// Minimum card width that decides how many columns fit on a wide screen
// (Fold unfolded ≈ 2, tablet landscape ≈ 3, phone = 1).
const MIN_CARD_WIDTH = 360;

export const IndexScreen = () => {
  const { t: tr } = useTranslation();
  const { language, toggleLanguage } = useLocale();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signOut } = useAuth();
  const haptic = useHaptics();
  const router = useRouter();
  const { selectedTags, count: filterCount } = useArtworkFilters();

  const [view, setView] = useState<ArtworkView>("map");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  // Strip height positions the floating tag bar just above the strip.
  const [stripHeight, setStripHeight] = useState(0);

  // Responsive grid: derive a column count from the window width, then size
  // each cell to an explicit pixel width so a lone card on an odd last row
  // keeps its width instead of stretching across the row. Computed against the
  // same padding/gap as `listContent` so the row fills edge-to-edge.
  const numColumns = Math.max(1, Math.floor(width / MIN_CARD_WIDTH));
  const itemWidth =
    (width - SpacingEnum.lg * 2 - SpacingEnum.lg * (numColumns - 1)) /
    numColumns;

  // Tag chips drive the list query; an empty selection means "all".
  const filters = useMemo(
    () => (selectedTags.length ? { tag: selectedTags } : {}),
    [selectedTags]
  );

  const {
    artworks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArtworks(filters);

  const onOpenFilters = useCallback(() => {
    haptic("light");
    router.push("/(tabs)/artworks/filters");
  }, [haptic, router]);

  const onSelectArtwork = useCallback(
    (artwork: Artwork) => {
      haptic("selection");
      setSelectedId(artwork.id);
    },
    [haptic]
  );

  const onStripLayout = useCallback((e: LayoutChangeEvent) => {
    setStripHeight(e.nativeEvent.layout.height);
  }, []);

  // RefreshControl must reflect ONLY a user-initiated pull, not the background
  // refetches that cache invalidation (e.g. after a like) triggers — otherwise
  // liking an artwork makes the pull-to-refresh spinner "wiggle". `isRefetching`
  // is true for any refetch-with-data in TanStack Query v5, so we track the
  // manual pull explicitly instead.
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setManualRefreshing(true);
    haptic("medium");
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch, haptic]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // A background refetch is in flight when we're fetching but not doing the
  // first load, a manual pull-to-refresh, or a "load more". This now covers
  // the like-invalidation refetch, which surfaces as the "updating" status dot
  // rather than the pull-to-refresh spinner.
  const backgroundRefetching =
    isFetching && !isLoading && !manualRefreshing && !isFetchingNextPage;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + SpacingEnum.xl }]}>
      <Seo title={tr("artwork.title.index")} />
      <View style={styles.headerRow}>
        <Text font="display" size="xxl" style={styles.title}>
          {tr("artwork.title.index")}
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggleLanguage}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={tr("a11y.language", { language })}
          >
            <Text font="mono" size="sm" style={styles.langLabel}>
              {language}
            </Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            hitSlop={8}
            accessibilityLabel={tr("artwork.signOut")}
          >
            <Icon name="LogOut" size="md" color="inkMute" />
          </Pressable>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text font="mono" size="sm">
          {tr("artwork.pieceCount", { count: artworks.length })}
          {hasNextPage ? "+" : ""} · {tr("artwork.location")}
        </Text>
        <StatusDot
          color={
            backgroundRefetching
              ? ColorEnum.accent
              : isStale
              ? ColorEnum.inkMute
              : ColorEnum.diffAdd
          }
          label={
            backgroundRefetching
              ? tr("artwork.statusUpdating")
              : isStale
              ? tr("artwork.statusStale")
              : tr("artwork.statusLive")
          }
        />
      </View>
    </View>
  );

  // --- Initial load: nothing cached yet -----------------------------------
  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <Centered>
          <ActivityIndicator color={ColorEnum.accent} />
          <Text font="mono" size="sm" style={styles.centerNote}>
            {tr("artwork.loading")}
          </Text>
        </Centered>
      </View>
    );
  }

  // --- Hard error with no data to show ------------------------------------
  if (isError && artworks.length === 0) {
    return (
      <View style={styles.screen}>
        {header}
        <Centered>
          <Icon name="RotateCw" size="xxl" color="inkMute" strokeWidth={1.6} />
          <Text
            font="body"
            size="base"
            color="inkSoft"
            style={[styles.centerText, styles.errorText]}
          >
            {error instanceof ApiError
              ? error.message
              : tr("artwork.loadError")}
          </Text>
          <Button
            label={tr("common.retry")}
            variant="primary"
            onPress={() => refetch()}
          />
        </Centered>
      </View>
    );
  }

  // --- Map view -----------------------------------------------------------
  if (view === "map") {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.mapWrap}>
          <ArtworkMap
            artworks={artworks}
            selectedId={selectedId}
            onSelect={onSelectArtwork}
          />
          <View style={styles.mapToggle} pointerEvents="box-none">
            <ViewToggle view={view} onChange={setView} />
          </View>
          <View
            style={[styles.mapFilter, { bottom: stripHeight + SpacingEnum.md }]}
            pointerEvents="box-none"
          >
            <FilterPill count={filterCount} onPress={onOpenFilters} />
          </View>
          <View
            onLayout={onStripLayout}
            style={[styles.stripWrap, { paddingBottom: insets.bottom }]}
          >
            <MapCarousel
              artworks={artworks}
              selectedId={selectedId}
              onSelect={onSelectArtwork}
            />
          </View>
        </View>
      </View>
    );
  }

  // --- Grid view ----------------------------------------------------------
  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.gridControls}>
        <FilterPill count={filterCount} onPress={onOpenFilters} />
        <ViewToggle view={view} onChange={setView} />
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
            refreshing={manualRefreshing}
            onRefresh={onRefresh}
            tintColor={ColorEnum.accent}
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
        ListEmptyComponent={
          <Centered>
            <Icon name="MapPin" size="xxxl" color="inkMute" strokeWidth={1.6} />
            <Text
              font="body"
              size="base"
              color="inkSoft"
              style={[styles.centerText, styles.emptyText]}
            >
              {tr("artwork.empty")}
            </Text>
          </Centered>
        }
        // --- Load-more spinner ---
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={ColorEnum.accent}
              style={styles.footerSpinner}
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg, gap: SpacingEnum.md },
  header: {
    gap: SpacingEnum.xs,
    borderBottomWidth: 1.5,
    backgroundColor: ColorEnum.bg,
    borderBottomColor: ColorEnum.hair,
    paddingBottom: SpacingEnum.md,
  },
  langLabel: { textTransform: "uppercase" },
  title: { textTransform: "uppercase" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SpacingEnum.xl,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.xl,
  },
  gridControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.xl,
  },
  mapWrap: { flex: 1 },
  // Toggle floats top-right; tags float along the bottom, above the strip.
  mapToggle: {
    position: "absolute",
    top: SpacingEnum.md,
    right: SpacingEnum.xl,
  },
  // Floating "Filters" pill, bottom-left above the strip — opens the filter sheet.
  mapFilter: { position: "absolute", left: SpacingEnum.xl },
  stripWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  centerNote: { marginTop: SpacingEnum.md },
  centerText: { textAlign: "center" },
  errorText: { marginVertical: SpacingEnum.md },
  emptyText: { marginTop: SpacingEnum.md },
  listContent: { padding: SpacingEnum.lg, gap: SpacingEnum.lg, flexGrow: 1 },
  columnWrapper: { gap: SpacingEnum.lg },
  footerSpinner: { marginVertical: SpacingEnum.md },
});
