import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { type Artwork, useArtworks } from "@/lib/api/artworks";
import { ErrorState } from "@/pages/app/artwork/components/error-state/ErrorState";
import { GridView } from "@/pages/app/artwork/components/grid-view/GridView";
import { IndexHeader } from "@/pages/app/artwork/components/index-header/IndexHeader";
import { LoadingState } from "@/pages/app/artwork/components/loading-state/LoadingState";
import { MapView } from "@/pages/app/artwork/components/map-view/MapView";
import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { ColorEnum } from "@/theme/enums/color.enums";

export const IndexScreen = () => {
  const haptic = useHaptics();
  const router = useRouter();
  const { selectedTags, count: filterCount } = useArtworkFilters();

  const [view, setView] = useState<ArtworkView>("map");
  const [selectedId, setSelectedId] = useState<string | undefined>();

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
    <IndexHeader
      count={artworks.length}
      hasNextPage={hasNextPage}
      backgroundRefetching={backgroundRefetching}
      isStale={isStale}
    />
  );

  const body = () => {
    // Initial load: nothing cached yet.
    if (isLoading) return <LoadingState />;

    // Hard error with no data to show.
    if (isError && artworks.length === 0)
      return <ErrorState error={error} onRetry={refetch} />;

    // Map view.
    if (view === "map")
      return (
        <MapView
          artworks={artworks}
          selectedId={selectedId}
          onSelect={onSelectArtwork}
          view={view}
          onChangeView={setView}
          filterCount={filterCount}
          onOpenFilters={onOpenFilters}
        />
      );

    // Grid view.
    return (
      <GridView
        artworks={artworks}
        view={view}
        onChangeView={setView}
        filterCount={filterCount}
        onOpenFilters={onOpenFilters}
        refreshing={manualRefreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        isFetchingNextPage={isFetchingNextPage}
      />
    );
  };

  return (
    <View style={styles.screen}>
      {header}
      {body()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
});
