import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  type Artwork,
  type ArtworkFilters,
  useBrowseArtworks,
} from "@/lib/api/artworks";
import { ErrorState } from "@/pages/app/artwork/components/error-state/ErrorState";
import { GridView } from "@/pages/app/artwork/components/grid-view/GridView";
import { LoadingState } from "@/pages/app/artwork/components/loading-state/LoadingState";
import { MapView } from "@/pages/app/artwork/components/map-view/MapView";
import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useArtworkFiltersUrlSync } from "@/pages/app/artwork/hooks/useArtworkFiltersUrlSync";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Seo } from "@/shared/ui/seo/Seo";
import type { Palette } from "@/theme/enums/color.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type IndexScreenProps = {
  initialQuery?: string;
  initialScope?: string;
  initialTags?: string | string[];
};

export const IndexScreen = ({
  initialQuery,
  initialScope,
  initialTags,
}: IndexScreenProps) => {
  const { t: tr } = useTranslation();
  const haptic = useHaptics();
  const router = useRouter();
  const styles = useThemeStyles(createStyles);
  useArtworkFiltersUrlSync({ initialQuery, initialScope, initialTags });
  const {
    selectedTags,
    search,
    searchScope,
    count: filterCount,
  } = useArtworkFilters();

  const [view, setView] = useState<ArtworkView>("map");
  const [selectedId, setSelectedId] = useState<string | undefined>();

  // Tag chips are the base list filters; the free-text search (over title
  // and/or artist) is applied by `useBrowseArtworks`. Empty = "all".
  const filters = useMemo<ArtworkFilters>(
    () => (selectedTags.length ? { tag: selectedTags } : {}),
    [selectedTags],
  );

  const {
    artworks,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBrowseArtworks(filters, search, searchScope);

  const onOpenFilters = useCallback(() => {
    haptic("light");
    router.push("/(tabs)/artworks/filters");
  }, [haptic, router]);

  const onSelectArtwork = useCallback(
    (artwork: Artwork) => {
      haptic("selection");
      setSelectedId(artwork.id);
    },
    [haptic],
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
      <Seo title={tr("artwork.title.index")} />
      {body()}
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
  });
