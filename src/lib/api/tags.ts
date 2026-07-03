import { useQuery } from "@tanstack/react-query";

import { getTagsOptions } from "./generated/@tanstack/react-query.gen";
import type { GetTagsData, Tag, TagPage } from "./generated/types.gen";

export type { Tag, TagPage };

/** The `GET /tags/` query params (cursor / limit / name / sort). */
export type TagQuery = NonNullable<GetTagsData["query"]>;

/**
 * Tags list. A plain (non-infinite) query — the quick-pick chips only need the
 * top slice, so callers pass `limit` / `sort` directly (the API defaults to
 * `count` desc). Pass `enabled: false` to skip the fetch entirely. Returns the
 * query verbatim plus the flattened `tags` rows.
 */
export const useTags = (
  query: TagQuery = {},
  options?: { enabled?: boolean },
) => {
  const result = useQuery({
    ...getTagsOptions({ query }),
    enabled: options?.enabled,
  });
  const tags = result.data?.data ?? [];
  return { ...result, tags };
};
