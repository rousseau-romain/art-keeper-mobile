import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import type { SearchScope } from "@/lib/api/artworks";
import {
  addTag,
  getSearch,
  getSearchScope,
  getSelectedTags,
  setSearch,
  setSearchScope,
} from "@/pages/app/artwork/filter-store";

export type UseArtworkFiltersUrlSyncArgs = {
  initialQuery?: string;
  initialScope?: string;
  initialTags?: string | string[];
};

const SEARCH_SCOPES: readonly SearchScope[] = ["all", "title", "artist"];

const isSearchScope = (value: string | undefined): value is SearchScope =>
  value !== undefined && SEARCH_SCOPES.includes(value as SearchScope);

/** Normalize a `tag` query param into a deduped list of trimmed, lowercased tags. */
const toTagArray = (raw: string | string[] | undefined): string[] => {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const seen = new Set<string>();
  for (const value of list) {
    const tag = value.trim().toLowerCase();
    if (tag) seen.add(tag);
  }
  return [...seen];
};

/**
 * Two-way sync between the browse filter store and the `/artworks` URL query
 * string. Seeds the store from URL params once on mount (every platform, so a
 * deep link like `artkeeper://artworks?q=monet` opens pre-filtered), and — on
 * web only — reflects the filters back into the URL so the address bar is a
 * shareable link.
 *
 * Reflection runs on **focus**, not on every store change: the filter sheet
 * (`/artworks/filters`) is presented over this screen, so while the user is
 * editing filters `IndexScreen` is blurred and the URL stays put. When the sheet
 * is dismissed (Done → `router.back()`) the browse screen regains focus and the
 * applied filters are committed to the URL in one write. Uses
 * `useNavigation().setParams` (not `router.setParams`) so the params land on this
 * screen's `/artworks` route.
 */
export const useArtworkFiltersUrlSync = ({
  initialQuery,
  initialScope,
  initialTags,
}: UseArtworkFiltersUrlSyncArgs): void => {
  const navigation = useNavigation();

  // Seed the store from the URL once — later reflect-driven URL changes must not
  // re-seed, so guard with a ref rather than reacting to the params.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (initialQuery) setSearch(initialQuery);
    if (isSearchScope(initialScope)) setSearchScope(initialScope);
    for (const tag of toTagArray(initialTags)) addTag(tag);
  }, [initialQuery, initialScope, initialTags]);

  // Commit the applied filters to the URL whenever the browse screen gains focus
  // (web only — native has no address bar). Read the store getters directly so
  // the callback stays stable yet always writes the latest selection.
  // `useNavigation` types this route as param-less, so narrow `setParams` to our
  // query shape rather than casting the object to `never`.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "web") return;
      const setParams = navigation.setParams as unknown as (params: {
        q?: string;
        scope?: SearchScope;
        tag?: string[];
      }) => void;
      const search = getSearch();
      const searchScope = getSearchScope();
      const selectedTags = getSelectedTags();
      setParams({
        q: search || undefined,
        scope: searchScope === "all" ? undefined : searchScope,
        tag: selectedTags.length ? selectedTags : undefined,
      });
    }, [navigation]),
  );
};
