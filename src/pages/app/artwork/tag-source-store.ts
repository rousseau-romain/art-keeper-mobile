// Persisted reactive store for the tag-source preference (how the TagPicker
// orders its quick-pick chips). It lives outside React so the TagPicker (deep in
// the create-artwork wizard) and the Settings screen read and write the same
// value without a shared Context. Mirrors `filter-store.ts` (subscribe/emit for
// `useSyncExternalStore`) plus `draft-store.ts` persistence (a versioned
// AsyncStorage key; errors swallowed so a failed read/write never breaks the UI).

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  TagSourceEnum,
  type TagSourceEnumType,
} from "@/pages/app/artwork/tag-source.enums";

type Listener = () => void;

const TAG_SOURCE_KEY = "artkeeper:tag-source:v1";
const DEFAULT_SOURCE: TagSourceEnumType = "mostUsed";

let source: TagSourceEnumType = DEFAULT_SOURCE;
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

const isTagSource = (raw: string): raw is TagSourceEnumType =>
  raw in TagSourceEnum;

// Hydrate the persisted choice once on module load (init defaulted to mostUsed).
AsyncStorage.getItem(TAG_SOURCE_KEY)
  .then((raw) => {
    if (raw && isTagSource(raw)) {
      source = raw;
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

/** Current tag-source preference — a stable reference between changes for
 * `useSyncExternalStore`. */
export const getTagSource = (): TagSourceEnumType => source;

/** Set the preference. No-op (no emit) when unchanged; persisted best-effort. */
export const setTagSource = (next: TagSourceEnumType): void => {
  if (next === source) return;
  source = next;
  emit();
  AsyncStorage.setItem(TAG_SOURCE_KEY, next).catch(() => {});
};
