// In-memory reactive store for the browse tag filters. It lives outside React so
// the filter sheet (a root-level (formsheet) route) and the browse list (deep in
// the (tabs) navigator) — which can't share a layout-scoped Context — read and
// write the same selection. This is ephemeral UI state that only derives the list
// query, so it stays out of the TanStack Query cache (see data-fetching rule) and
// needs no persistence (unlike the wizard's draft-store).

type Listener = () => void;

let selectedTags: string[] = [];
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

/** Add or remove a tag from the selection. */
export const toggleTag = (tag: string): void => {
  selectedTags = selectedTags.includes(tag)
    ? selectedTags.filter((t) => t !== tag)
    : [...selectedTags, tag];
  emit();
};

/** Drop every active filter. No-op (no emit) when already empty. */
export const clearTags = (): void => {
  if (selectedTags.length === 0) return;
  selectedTags = [];
  emit();
};
