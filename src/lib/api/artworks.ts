import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getArtworksByIdOptions,
  getArtworksByIdQueryKey,
  getArtworksInfiniteOptions,
  getArtworksInfiniteQueryKey,
} from "./generated/@tanstack/react-query.gen";
import {
  deleteArtworksByIdLike,
  postArtworksByIdLike,
} from "./generated/sdk.gen";
import type {
  Artwork,
  ArtworkPage,
  GetArtworksData,
} from "./generated/types.gen";

export type { Artwork, ArtworkPage };

/** List filters = the list query params minus pagination controls. */
export type ArtworkFilters = Omit<
  NonNullable<GetArtworksData["query"]>,
  "cursor" | "limit"
>;

const PAGE_SIZE = 20;

// --- Query keys ------------------------------------------------------------
// The generated `*QueryKey` helpers model the domain hierarchically (each key
// is `[{ _id, baseUrl, query?, path?, _infinite? }]`), and React Query matches
// partially, so writes can invalidate at the right granularity:
//   getArtworksInfiniteQueryKey()         → every filtered list (any filters)
//   getArtworksByIdQueryKey({ path:{id} }) → one artwork's detail

// --- Mutation function -----------------------------------------------------
// SDK functions reject (throwOnError → ApiError) on non-2xx, so `data` is
// defined on resolve; the cast drops the client's `T | undefined` success type.

async function setLike(id: string, liked: boolean): Promise<Artwork> {
  const { data } = liked
    ? await postArtworksByIdLike({ path: { id } })
    : await deleteArtworksByIdLike({ path: { id } });
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
export const useArtworks = (filters: ArtworkFilters = {}) => {
  const query = useInfiniteQuery({
    ...getArtworksInfiniteOptions({ query: { ...filters, limit: PAGE_SIZE } }),
    // The generated queryFn treats an object pageParam as page params and a
    // string as the cursor; `{}` is the first page (no cursor).
    initialPageParam: {},
    getNextPageParam: (last) => (last.nextCursor as string | null) ?? undefined,
  });

  const artworks = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { ...query, artworks };
};

/** A single artwork by id. */
export const useArtwork = (id: string) => {
  return useQuery({
    ...getArtworksByIdOptions({ path: { id } }),
    enabled: !!id,
  });
};

/**
 * Like / unlike with an optimistic update: the detail and every cached list
 * page flip immediately, roll back on error, and the affected artwork is
 * re-fetched on settle so the server's authoritative count wins.
 */
export const useToggleArtworkLike = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      setLike(id, liked),

    onMutate: async ({ id, liked }) => {
      const detailKey = getArtworksByIdQueryKey({ path: { id } });
      const listsKey = getArtworksInfiniteQueryKey();

      // Stop in-flight refetches so they can't clobber the optimistic value.
      await qc.cancelQueries({ queryKey: detailKey });
      await qc.cancelQueries({ queryKey: listsKey });

      const previousDetail = qc.getQueryData<Artwork>(detailKey);
      const previousLists = qc.getQueriesData<InfiniteData<ArtworkPage>>({
        queryKey: listsKey,
      });

      if (previousDetail) {
        qc.setQueryData(detailKey, withLike(previousDetail, liked));
      }
      qc.setQueriesData<InfiniteData<ArtworkPage>>(
        { queryKey: listsKey },
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
        qc.setQueryData(
          getArtworksByIdQueryKey({ path: { id } }),
          ctx.previousDetail,
        );
      }
      ctx?.previousLists?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: (_data, _err, { id }) => {
      // Targeted invalidation: only this artwork's detail + the lists it sits in.
      qc.invalidateQueries({
        queryKey: getArtworksByIdQueryKey({ path: { id } }),
      });
      qc.invalidateQueries({ queryKey: getArtworksInfiniteQueryKey() });
    },
  });
};
