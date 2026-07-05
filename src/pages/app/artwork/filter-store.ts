// In-memory reactive store for the browse filters. It lives outside React so
// the filter sheet (a root-level (formsheet) route) and the browse list (deep in
// the (tabs) navigator) — which can't share a layout-scoped Context — read and
// write the same selection. This is ephemeral UI state that only derives the list
// query, so it stays out of the TanStack Query cache (see data-fetching rule) and
// needs no persistence (unlike the wizard's draft-store).

import type { SearchScope } from "@/lib/api/artworks";

type Listener = () => void;

const DEFAULT_SCOPE: SearchScope = "all";

let selectedTags: string[] = [];
let search = "";
let searchScope: SearchScope = DEFAULT_SCOPE;
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

/** Subscribe to selection changes; returns the unsubscribe. */
export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Current selection — a stable reference between changes for `useSyncExternalStore`. */
export const getSelectedTags = (): string[] => selectedTags;

/** Current free-text search query. */
export const getSearch = (): string => search;

/** Which field the search targets (a single, mutually-exclusive scope). */
export const getSearchScope = (): SearchScope => searchScope;

/** Add or remove a tag from the selection. */
export const toggleTag = (tag: string): void => {
  selectedTags = selectedTags.includes(tag)
    ? selectedTags.filter((t) => t !== tag)
    : [...selectedTags, tag];
  emit();
};

/** Add a tag to the selection. No-op (no emit) when already selected. */
export const addTag = (tag: string): void => {
  if (selectedTags.includes(tag)) return;
  selectedTags = [...selectedTags, tag];
  emit();
};

/** Set the free-text search query. No-op (no emit) when unchanged. */
export const setSearch = (next: string): void => {
  if (next === search) return;
  search = next;
  emit();
};

/** Set the search scope. No-op (no emit) when unchanged. */
export const setSearchScope = (scope: SearchScope): void => {
  if (scope === searchScope) return;
  searchScope = scope;
  emit();
};

/**
 * Replace the whole selection in one shot — used when seeding the filters from
 * the URL (a deep link or a tag link into `/artworks`). Emits once (no flicker
 * through intermediate states); a no-op when the selection already matches.
 */
export const setFilters = (next: {
  tags: string[];
  search: string;
  scope: SearchScope;
}): void => {
  const sameTags =
    next.tags.length === selectedTags.length &&
    next.tags.every((tag, i) => tag === selectedTags[i]);
  if (sameTags && next.search === search && next.scope === searchScope) return;
  selectedTags = next.tags;
  search = next.search;
  searchScope = next.scope;
  emit();
};

/** Drop every active filter — tags, search, and scope back to default.
 * No-op (no emit) when nothing is active. */
export const clearTags = (): void => {
  if (selectedTags.length === 0 && search === "") return;
  selectedTags = [];
  search = "";
  searchScope = DEFAULT_SCOPE;
  emit();
};
