// Persisted reactive store for the moderation review-mode preference (swipe vs
// footer buttons on the mobile review screen). It lives outside React so the
// review screen and the Settings screen read/write the same value without a
// shared Context. Mirrors `tag-source-store.ts`: subscribe/emit for
// `useSyncExternalStore`, a versioned AsyncStorage key, errors swallowed so a
// failed read/write never breaks the UI.

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ReviewModeEnum,
  type ReviewModeEnumType,
} from "@/pages/app/moderation/review-mode.enums";

type Listener = () => void;

const REVIEW_MODE_KEY = "artkeeper:review-mode:v1";
const DEFAULT_MODE: ReviewModeEnumType = "swipe";

let mode: ReviewModeEnumType = DEFAULT_MODE;
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

const isReviewMode = (raw: string): raw is ReviewModeEnumType =>
  raw in ReviewModeEnum;

// Hydrate the persisted choice once on module load (init defaulted to swipe).
AsyncStorage.getItem(REVIEW_MODE_KEY)
  .then((raw) => {
    if (raw && isReviewMode(raw)) {
      mode = raw;
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

/** Current review-mode preference — a stable reference between changes for
 * `useSyncExternalStore`. */
export const getReviewMode = (): ReviewModeEnumType => mode;

/** Set the preference. No-op (no emit) when unchanged; persisted best-effort. */
export const setReviewMode = (next: ReviewModeEnumType): void => {
  if (next === mode) return;
  mode = next;
  emit();
  AsyncStorage.setItem(REVIEW_MODE_KEY, next).catch(() => {});
};
