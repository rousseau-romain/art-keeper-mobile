// Persisted reactive store for the *default* browse view (grid ⇄ map) on native.
// AsyncStorage-backed (no SSR), default `map` — preserves the native browse-first
// experience. Mirrors `tag-source-store.ts`: a versioned key, hydrated once on
// module load, errors swallowed so a failed read/write never breaks the UI.

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";

const BROWSE_VIEW_KEY = "artkeeper:browse-view:v1";
const DEFAULT_VIEW: ArtworkView = "map";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = (): void => {
  for (const listener of listeners) listener();
};

const isView = (raw: string): raw is ArtworkView =>
  raw === "map" || raw === "grid";

let view: ArtworkView = DEFAULT_VIEW;

// Hydrate the persisted choice once on module load (init defaulted to `map`).
AsyncStorage.getItem(BROWSE_VIEW_KEY)
  .then((raw) => {
    if (raw && isView(raw)) {
      view = raw;
      emit();
    }
  })
  .catch(() => {});

/** Subscribe to preference changes; returns the unsubscribe. */
export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Current default-view preference — a stable reference between changes. */
export const getBrowseView = (): ArtworkView => view;

/** Native has no SSR — the server snapshot is the same as the client one. */
export const getServerBrowseView = (): ArtworkView => view;

/** Deterministic first-render default (the current in-memory preference). */
export const getInitialBrowseView = (): ArtworkView => view;

/** Set the preference. No-op (no emit) when unchanged; persisted best-effort. */
export const setBrowseView = (next: ArtworkView): void => {
  if (next === view) return;
  view = next;
  emit();
  AsyncStorage.setItem(BROWSE_VIEW_KEY, next).catch(() => {});
};
