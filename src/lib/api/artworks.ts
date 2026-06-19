import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchClient } from "./client";
import type { paths } from "./schema";

// --- Domain types (sourced from the OpenAPI spec) -------------------------

export type Artwork =
  paths["/artworks/{id}"]["get"]["responses"][200]["content"]["application/json"];
export type ArtworkPage =
  paths["/artworks/"]["get"]["responses"][200]["content"]["application/json"];

/** List filters = the list query params minus pagination controls. */
type ListQuery = NonNullable<paths["/artworks/"]["get"]["parameters"]["query"]>;
export type ArtworkFilters = Omit<ListQuery, "cursor" | "limit">;

const PAGE_SIZE = 20;

// --- Query keys that model the domain -------------------------------------
// Hierarchical so writes can invalidate at the right granularity:
//   all → ["artworks"]                      (everything)
//   lists() → ["artworks","list"]           (every filtered list)
//   list(f) → ["artworks","list", filters]  (one list)
//   detail(id) → ["artworks","detail", id]  (one artwork)
export const artworkKeys = {
  all: ["artworks"] as const,
  lists: () => [...artworkKeys.all, "list"] as const,
  list: (filters: ArtworkFilters) => [...artworkKeys.lists(), filters] as const,
  details: () => [...artworkKeys.all, "detail"] as const,
  detail: (id: string) => [...artworkKeys.details(), id] as const,
};

// --- Colocated query/mutation functions (typed via the OpenAPI client) ----
// The client middleware throws ApiError on non-2xx, so `data` is defined on
// resolve; the cast just drops openapi-fetch's `T | undefined` success type.

async function fetchArtworks(
  filters: ArtworkFilters,
  cursor: string | undefined,
): Promise<ArtworkPage> {
  const { data } = await fetchClient.GET("/artworks/", {
    params: { query: { ...filters, cursor, limit: PAGE_SIZE } },
  });
  return data as ArtworkPage;
}

async function fetchArtwork(id: string): Promise<Artwork> {
  const { data } = await fetchClient.GET("/artworks/{id}", {
    params: { path: { id } },
  });
  return data as Artwork;
}

async function setLike(id: string, liked: boolean): Promise<Artwork> {
  const { data } = liked
    ? await fetchClient.POST("/artworks/{id}/like", {
        params: { path: { id } },
      })
    : await fetchClient.DELETE("/artworks/{id}/like", {
        params: { path: { id } },
      });
  return data as Artwork;
}

/** Apply a like/unlike to a cached artwork (count + flag stay in sync). */
function withLike(a: Artwork, liked: boolean): Artwork {
  if (a.likedByMe === liked) return a;
  return { ...a, likedByMe: liked, likeCount: a.likeCount + (liked ? 1 : -1) };
}

// --- Hooks ----------------------------------------------------------------

/**
 * Paginated, filterable artwork list. Cursor pagination via `fetchNextPage`.
 * Returns the flattened rows plus the raw query so the screen can render
 * loading / error / empty / background-refetch / stale states.
 */
export function useArtworks(filters: ArtworkFilters = {}) {
  const query = useInfiniteQuery({
    queryKey: artworkKeys.list(filters),
    queryFn: ({ pageParam }) => fetchArtworks(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const artworks = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { ...query, artworks };
}

/** A single artwork by id. */
export function useArtwork(id: string) {
  return useQuery({
    queryKey: artworkKeys.detail(id),
    queryFn: () => fetchArtwork(id),
    enabled: !!id,
  });
}

/**
 * Like / unlike with an optimistic update: the detail and every cached list
 * page flip immediately, roll back on error, and the affected artwork is
 * re-fetched on settle so the server's authoritative count wins.
 */
export function useToggleArtworkLike() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      setLike(id, liked),

    onMutate: async ({ id, liked }) => {
      // Stop in-flight refetches so they can't clobber the optimistic value.
      await qc.cancelQueries({ queryKey: artworkKeys.all });

      const previousDetail = qc.getQueryData<Artwork>(artworkKeys.detail(id));
      const previousLists = qc.getQueriesData<InfiniteData<ArtworkPage>>({
        queryKey: artworkKeys.lists(),
      });

      if (previousDetail) {
        qc.setQueryData(
          artworkKeys.detail(id),
          withLike(previousDetail, liked),
        );
      }
      qc.setQueriesData<InfiniteData<ArtworkPage>>(
        { queryKey: artworkKeys.lists() },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((a) =>
                a.id === id ? withLike(a, liked) : a,
              ),
            })),
          },
      );

      return { previousDetail, previousLists };
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.previousDetail) {
        qc.setQueryData(artworkKeys.detail(id), ctx.previousDetail);
      }
      ctx?.previousLists?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: (_data, _err, { id }) => {
      // Targeted invalidation: only this artwork's detail + the lists it sits in.
      qc.invalidateQueries({ queryKey: artworkKeys.detail(id) });
      qc.invalidateQueries({ queryKey: artworkKeys.lists() });
    },
  });
}
