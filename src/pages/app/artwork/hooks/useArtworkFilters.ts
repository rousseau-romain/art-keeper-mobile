import { useSyncExternalStore } from "react";

import type { SearchScope } from "@/lib/api/artworks";
import {
  addTag,
  clearTags,
  getSearch,
  getSearchScope,
  getSelectedTags,
  setSearch,
  setSearchScope,
  subscribe,
  toggleTag,
} from "@/pages/app/artwork/filter-store";

export type { SearchScope };

export type UseArtworkFilters = {
  /** Active tag filters; an empty array means "all". */
  selectedTags: string[];
  /** Free-text search query (targets `searchScope`). */
  search: string;
  /** Which field the search targets (a single, mutually-exclusive scope). */
  searchScope: SearchScope;
  /** Number of active filters (tags + a non-empty search). */
  count: number;
  toggleTag: (tag: string) => void;
  addTag: (tag: string) => void;
  setSearch: (next: string) => void;
  setSearchScope: (scope: SearchScope) => void;
  clear: () => void;
};

/**
 * Shared browse filters, backed by the module-level `filter-store`. Both the
 * browse list and the filter sheet consume this hook so picking a scope or
 * typing a search in either place updates the other. The selection drives
 * `useBrowseArtworks(filters, search, searchScope)`.
 */
export const useArtworkFilters = (): UseArtworkFilters => {
  // Third arg (server snapshot) keeps Expo Router static web rendering happy —
  // the store is plain module state, so the same getter works on the server.
  const selectedTags = useSyncExternalStore(
    subscribe,
    getSelectedTags,
    getSelectedTags,
  );
  const search = useSyncExternalStore(subscribe, getSearch, getSearch);
  const searchScope = useSyncExternalStore(
    subscribe,
    getSearchScope,
    getSearchScope,
  );
  return {
    selectedTags,
    search,
    searchScope,
    count: selectedTags.length + (search.trim() ? 1 : 0),
    toggleTag,
    addTag,
    setSearch,
    setSearchScope,
    clear: clearTags,
  };
};
