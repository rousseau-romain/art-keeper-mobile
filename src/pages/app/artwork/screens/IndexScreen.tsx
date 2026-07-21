import { useIsFocused, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";
import {
  type Artwork,
  type ArtworkPage,
  paramsToBrowseFilters,
  type SearchScope,
  toTagArray,
  useBrowseArtworks,
} from "@/lib/api/artworks";
import { browseTitle } from "@/lib/seo/titles";
import { getInitialBrowseView } from "@/pages/app/artwork/browse-view-store";
import { ErrorState } from "@/pages/app/artwork/components/error-state/ErrorState";
import { GridView } from "@/pages/app/artwork/components/grid-view/GridView";
import { LoadingState } from "@/pages/app/artwork/components/loading-state/LoadingState";
import { MapView } from "@/pages/app/artwork/components/map-view/MapView";
import { SiteJsonLd } from "@/pages/app/artwork/components/site-json-ld/SiteJsonLd";
import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useArtworkFiltersUrlSync } from "@/pages/app/artwork/hooks/useArtworkFiltersUrlSync";
import { useDefaultBrowseView } from "@/pages/app/artwork/hooks/useDefaultBrowseView";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { Text } from "@/shared/ui/text/Text";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type IndexScreenProps = {
  /**
   * Web SSR: the first page the route `loader` prefetched (already filtered to the
   * URL params), handed down by the route. `undefined` on native and on a loader
   * miss — the list then just fetches client-side.
   */
  page?: ArtworkPage;
  initialQuery?: string;
  initialScope?: string;
  initialTags?: string | string[];
};

export const IndexScreen = ({
  page: initialPage,
  initialQuery,
  initialScope,
  initialTags,
}: IndexScreenProps) => {
  const { t: tr } = useTranslation();
  const haptic = useHaptics();
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const isFocused = useIsFocused();
  useArtworkFiltersUrlSync({ initialQuery, initialScope, initialTags });
  const {
    selectedTags,
    search,
    searchScope,
    count: storeCount,
    clear,
  } = useArtworkFilters();

  // Same helper the route's `generateMetadata` builds the initial <title> from,
  // so filtering in-screen (or arriving by a client-side navigation) keeps the tab
  // consistent with what the server would have served for that URL.
  useDocumentTitle(browseTitle(tr, selectedTags, search));

  // Initial view = the persisted default-view preference. On web it's read
  // synchronously from the cookie (deterministic server + first client render, so
  // the SSR HTML matches). The reactive `defaultView` then applies it post-mount
  // on native (AsyncStorage resolves late) and reflects a live Settings change —
  // but only until the user picks a view in-screen, after which the toggle wins.
  const { view: defaultView } = useDefaultBrowseView();
  const [view, setView] = useState<ArtworkView>(getInitialBrowseView);
  const viewTouched = useRef(false);
  useEffect(() => {
    if (!viewTouched.current) setView(defaultView);
  }, [defaultView]);
  const onChangeView = useCallback((next: ArtworkView) => {
    viewTouched.current = true;
    setView(next);
  }, []);

  const [selectedId, setSelectedId] = useState<string | undefined>();

  // First render (server + client hydration) derives the list filters from the
  // URL params — deterministic and per-request-safe (the module filter-store must
  // NEVER be seeded server-side; it would leak across concurrent requests). After
  // hydration the reactive store (fed by the filter sheet) takes over; it's seeded
  // from the same URL by `useArtworkFiltersUrlSync`, so the values converge.
  const urlFilters = useMemo(
    () => paramsToBrowseFilters(initialQuery, initialScope, initialTags),
    [initialQuery, initialScope, initialTags],
  );
  const storeFilters = useMemo(
    () => paramsToBrowseFilters(search, searchScope, selectedTags),
    [search, searchScope, selectedTags],
  );
  const filters = isHydrated ? storeFilters : urlFilters;

  // Filter-pill badge follows the same URL→store hand-off so it matches the SSR
  // HTML on the first render.
  const urlCount = useMemo(
    () =>
      toTagArray(initialTags).length + ((initialQuery ?? "").trim() ? 1 : 0),
    [initialTags, initialQuery],
  );
  const filterCount = isHydrated ? storeCount : urlCount;

  // The page's own H1. Follows the same URL→store hand-off as `filters` above, so
  // the heading in the SSR HTML is what the client's first render produces too,
  // and it's built by the same helper as the <title> — the outline and the tab
  // agree on what this page is.
  const heading = isHydrated
    ? browseTitle(tr, selectedTags, search)
    : browseTitle(tr, toTagArray(initialTags), initialQuery);

  const {
    artworks,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    // `filters` is already the fully-merged query shape, so pass it verbatim (no
    // extra search/scope). Seed only on the first render, where `filters` equals
    // the params the loader prefetched — after hydration the cache already holds it.
  } = useBrowseArtworks(
    filters,
    "",
    "all",
    isHydrated ? undefined : initialPage,
  );

  const onOpenFilters = useCallback(() => {
    haptic("light");
    router.push("/(tabs)/artworks/filters");
  }, [haptic, router]);

  // Reset from the empty state: drop the store filters (the list re-fetches
  // unfiltered) and, on web, strip the URL query so the address bar matches —
  // `setParams` (History replaceState), no reload. Native has no address bar.
  const onResetFilters = useCallback(() => {
    haptic("light");
    clear();
    if (Platform.OS === "web") {
      (
        router.setParams as unknown as (p: {
          q?: string;
          scope?: SearchScope;
          tag?: string[];
        }) => void
      )({ q: undefined, scope: undefined, tag: undefined });
    }
  }, [clear, haptic, router]);

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
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    haptic("medium");
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
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
          onChangeView={onChangeView}
          filterCount={filterCount}
          onOpenFilters={onOpenFilters}
        />
      );

    // Grid view.
    return (
      <GridView
        artworks={artworks}
        view={view}
        onChangeView={onChangeView}
        filterCount={filterCount}
        onOpenFilters={onOpenFilters}
        onResetFilters={onResetFilters}
        isRefreshing={isManualRefreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        isFetchingNextPage={isFetchingNextPage}
      />
    );
  };

  return (
    <WrapperView isMain>
      {/* Site-level Organization + WebSite structured data (web-only; no-op on
          native). Only on the focused browse — the app's real entry document —
          never on the seeded background anchor behind a deep-linked sibling, whose
          canonical is the artwork, not the site. `useIsFocused` derives from the
          URL, so the branch is hydration-safe. */}
      {isFocused && <SiteJsonLd />}
      {/* The listing's page title, above the grid.

          Web + grid only. Native already shows the title in its navigator header,
          so rendering it again here would just duplicate it; the map is full-bleed
          and a title bar above it would only eat viewport. Neither branch costs
          anything in SEO: a crawler carries no `browse-view` cookie, so it always
          lands on the `grid` default (see `browse-view-store.web.ts`) — the H1 is
          in the crawled HTML every time.

          It carries the *heading semantics* only when this screen is the focused
          route: the same screen is also seeded behind a deep-linked sibling
          (`ssr-loader-anchor.md`), and an unfocused anchor's <h1> would land in
          that document's outline ahead of the real one — putting "Browse" above
          the artwork's own title. The text renders either way, so the title never
          blinks out from under the `filters` sheet (a formsheet overlays the
          listing, which stays visible); only its role changes, and that URL is not
          an indexed document anyway.

          Every condition is deterministic on the server and the client's first
          render — `Platform` is a constant, `view` is cookie-seeded, and
          `useIsFocused` derives from the URL — so the branch is hydration-safe. */}
      {Platform.OS === "web" &&
        view === "grid" &&
        (isFocused ? (
          <H1 style={styles.title}>{heading}</H1>
        ) : (
          <Text font="display" size="xxl" style={styles.title}>
            {heading}
          </Text>
        ))}
      {body()}
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  // Uppercase to match the detail page's H1 (`ArtworkMeta`). The bottom padding is
  // the smaller step because `GridView`/`MapView` overlay their controls row at
  // the top of their own container, right under this.
  title: {
    textTransform: "uppercase",
    paddingHorizontal: SpacingEnum.lg,
    paddingTop: SpacingEnum.lg,
    paddingBottom: SpacingEnum.sm,
  },
});
