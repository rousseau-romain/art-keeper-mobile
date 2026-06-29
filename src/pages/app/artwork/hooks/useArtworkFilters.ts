import { useSyncExternalStore } from "react";

import {
  clearTags,
  getSelectedTags,
  subscribe,
  toggleTag,
} from "@/pages/app/artwork/filter-store";

export type UseArtworkFilters = {
  /** Active tag filters; an empty array means "all". */
  selectedTags: string[];
  /** Number of active filters. */
  count: number;
  toggleTag: (tag: string) => void;
  clear: () => void;
};

/**
 * Shared browse tag filters, backed by the module-level `filter-store`. Both the
 * browse list and the filter sheet consume this hook so toggling a chip in either
 * place updates the other. The selection drives `useArtworks(filters)`.
 */
export const useArtworkFilters = (): UseArtworkFilters => {
  // Third arg (server snapshot) keeps Expo Router static web rendering happy —
  // the store is plain module state, so the same getter works on the server.
  const selectedTags = useSyncExternalStore(
    subscribe,
    getSelectedTags,
    getSelectedTags,
  );
  return {
    selectedTags,
    count: selectedTags.length,
    toggleTag,
    clear: clearTags,
  };
};
