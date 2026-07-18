import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback } from "react";
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

// The selection the URL last represented — MODULE-level, not a component ref, so
// it survives `IndexScreen` remounts. The route's `Screen` swaps `<BrowseSeed>`
// ⇄ `<IndexScreen>` on focus (the `useIsFocused` SSR-anchor gate), which remounts
// `IndexScreen` every time the filter sheet opens/closes. A component `useRef`
// would reset to `undefined` on that remount, so a return-from-sheet (unchanged
// URL) would look like a fresh navigation and take the URL→store SEED branch —
// wiping the tags the sheet just set. Keeping it at module scope preserves the
// "did the URL change since we were last here?" signal across those remounts.
//
// SSR-safe: it's only ever written inside the client-only focus effect and never
// read during render, so — unlike the filter values themselves — it can't leak
// across concurrent server requests.
let lastKey: string | undefined;

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
 * The module-level `lastKey` is what distinguishes the two: it holds the
 * selection the URL last represented, so a genuine param change (seed) is told
 * apart from a reflect-driven one (which we record so it doesn't look like a new
 * navigation on the next focus). It's module scope, not a component ref, so it
 * survives the `IndexScreen` remount the filter sheet triggers on open/close —
 * see the note beside its declaration. Uses `useNavigation().setParams` (not
 * `router.setParams`) so the params land on this screen's `/artworks` route.
 */
export const useArtworkFiltersUrlSync = ({
  initialQuery,
  initialScope,
  initialTags,
}: UseArtworkFiltersUrlSyncArgs): void => {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const urlSearch = initialQuery ?? "";
      const urlScope = isSearchScope(initialScope) ? initialScope : "all";
      const urlTags = toTagArray(initialTags);
      const urlKey = filterKey(urlSearch, urlScope, urlTags);

      // URL → store: params changed (new navigation / deep link) → seed.
      if (urlKey !== lastKey) {
        lastKey = urlKey;
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
      const storeKey = filterKey(search, searchScope, selectedTags);
      lastKey = storeKey;

      // Only write when the URL doesn't already match the store. `setParams`
      // re-renders the route (new params) → this focus effect re-runs, and an
      // unconditional write would then reflect again on the now-updated URL and
      // loop forever (React #185, "maximum update depth"). Once the URL mirrors
      // the store, `storeKey === urlKey` and we stop.
      if (storeKey === urlKey) return;

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
