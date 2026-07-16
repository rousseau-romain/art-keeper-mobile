import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useRef } from "react";
import { Platform } from "react-native";

import {
  isSearchScope,
  type SearchScope,
  toTagArray,
} from "@/lib/api/artworks";
import {
  getSearch,
  getSearchScope,
  getSelectedTags,
  setFilters,
} from "@/pages/app/artwork/filter-store";

export type UseArtworkFiltersUrlSyncArgs = {
  initialQuery?: string;
  initialScope?: string;
  initialTags?: string | string[];
};

/** Serialize a filter selection into a stable key for change detection. */
const filterKey = (
  search: string,
  scope: SearchScope,
  tags: string[],
): string => JSON.stringify([search, scope, tags]);

/**
 * Two-way sync between the `/artworks` URL query string and the browse filter
 * store, resolved on **focus** with a "which side changed?" check so a single
 * focus event picks the right direction:
 *
 * - **URL → store (seed).** When the browse screen is focused with params that
 *   differ from the last ones we saw, the URL is the intent — a deep link
 *   (`artkeeper://artworks?q=monet`) or a tag link from a detail page
 *   (`/artworks?tag=stencil`). We replace the store with the URL's selection, so
 *   the already-mounted list re-filters even though the old once-on-mount seed
 *   would have no-oped. Runs on every platform (native has no address bar, but
 *   the params still arrive via navigation).
 * - **store → URL (reflect).** When focused with *unchanged* params, nothing
 *   navigated us here — we came back from the filter sheet (`/artworks/filters`),
 *   which edits the store while this screen is blurred and never touches the URL.
 *   We commit the store to the URL so the address bar stays a shareable link.
 *   Web only — native has no URL to reflect into.
 *
 * The `lastKey` ref is what distinguishes the two: it holds the selection the URL
 * last represented, so a genuine param change (seed) is told apart from a
 * reflect-driven one (which we record so it doesn't look like a new navigation on
 * the next focus). Uses `useNavigation().setParams` (not `router.setParams`) so
 * the params land on this screen's `/artworks` route.
 */
export const useArtworkFiltersUrlSync = ({
  initialQuery,
  initialScope,
  initialTags,
}: UseArtworkFiltersUrlSyncArgs): void => {
  const navigation = useNavigation();

  // The selection the URL last represented — seeded lazily on the first focus.
  const lastKey = useRef<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      const urlSearch = initialQuery ?? "";
      const urlScope = isSearchScope(initialScope) ? initialScope : "all";
      const urlTags = toTagArray(initialTags);
      const urlKey = filterKey(urlSearch, urlScope, urlTags);

      // URL → store: params changed (new navigation / deep link) → seed.
      if (urlKey !== lastKey.current) {
        lastKey.current = urlKey;
        setFilters({ tags: urlTags, search: urlSearch, scope: urlScope });
        return;
      }

      // store → URL: params unchanged (returned from the filter sheet) → reflect.
      // Web only — native has no address bar. `useNavigation` types this route as
      // param-less, so narrow `setParams` to our query shape.
      if (Platform.OS !== "web") return;
      const search = getSearch();
      const searchScope = getSearchScope();
      const selectedTags = getSelectedTags();
      lastKey.current = filterKey(search, searchScope, selectedTags);
      const setParams = navigation.setParams as unknown as (params: {
        q?: string;
        scope?: SearchScope;
        tag?: string[];
      }) => void;
      setParams({
        q: search || undefined,
        scope: searchScope === "all" ? undefined : searchScope,
        tag: selectedTags.length ? selectedTags : undefined,
      });
    }, [initialQuery, initialScope, initialTags, navigation]),
  );
};
