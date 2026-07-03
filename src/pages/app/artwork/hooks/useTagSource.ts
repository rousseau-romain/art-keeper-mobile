import { useSyncExternalStore } from "react";

import { useTags } from "@/lib/api/tags";
import {
  getTagSource,
  setTagSource,
  subscribe,
} from "@/pages/app/artwork/tag-source-store";

// How many quick-pick chips to fetch from the account's real tags.
const CHIP_COUNT = 8;

/**
 * Read/write the persisted tag-source preference and resolve the suggestion
 * chips it implies. The preference lives in an external store (shared between
 * the TagPicker and Settings via `useSyncExternalStore`); the chips are the
 * account's tags from `GET /tags/`, ordered by the preference — `mostUsed`
 * (count desc) / `lastUsed` (newest) — or an empty list for `none` (no fetch).
 * There is no hardcoded fallback: an empty account shows no chips.
 */
export const useTagSource = () => {
  const source = useSyncExternalStore(subscribe, getTagSource, getTagSource);

  const sort = source === "lastUsed" ? "-createdAt" : "-count";
  const { tags } = useTags(
    { limit: CHIP_COUNT, sort },
    { enabled: source !== "none" },
  );

  const chips = source === "none" ? [] : tags.map((tag) => tag.name);

  return { source, setSource: setTagSource, chips };
};
