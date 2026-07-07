import { useSyncExternalStore } from "react";

import {
  getReviewMode,
  setReviewMode,
  subscribe,
} from "@/pages/app/moderation/review-mode-store";

/**
 * Read/write the persisted moderation review-mode preference (swipe vs footer
 * buttons). Backed by an external store so the review screen and Settings share
 * one value without a Context. Only the narrow (mobile) review layout honors it.
 */
export const useReviewMode = () => {
  const reviewMode = useSyncExternalStore(
    subscribe,
    getReviewMode,
    getReviewMode,
  );

  return { reviewMode, setReviewMode };
};
