import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getArtistsByIdOptions,
  getArtistsInfiniteOptions,
  getArtistsInfiniteQueryKey,
  getArtistsSlugBySlugOptions,
  getArtistsSlugBySlugQueryKey,
} from "./generated/@tanstack/react-query.gen";
import {
  deleteArtistsByIdFollow,
  postArtists,
  postArtistsByIdFollow,
} from "./generated/sdk.gen";
import type {
  Artist,
  ArtistPage,
  GetArtistsData,
  SocialLinks,
} from "./generated/types.gen";

export type { Artist, ArtistPage, SocialLinks };

/** A single row of the artists list response (the list returns a leaner shape
 * than the full `Artist` detail). */
export type ArtistListItem = ArtistPage["data"][number];

/** List filters = the artists list query params minus pagination controls. */
export type ArtistFilters = Omit<
  NonNullable<GetArtistsData["query"]>,
  "cursor" | "limit"
>;

// The list endpoint filters server-side (name/tag/sort), so the autocomplete
// passes its query down and only needs a small page — the dropdown shows ≤ 6.
const PAGE_SIZE = 10;

// --- Query keys ------------------------------------------------------------
//   getArtistsInfiniteQueryKey() → every artists list page

/**
 * Paginated artists list (cursor pagination). Powers the artist autocomplete on
 * the new-artwork flow; filtering by name and ordering happen server-side via
 * the `name` / `sort` query params. Pass `enabled: false` to skip the fetch
 * (e.g. while the search box is empty).
 */
export const useArtists = (
  filters: ArtistFilters = {},
  options: { enabled?: boolean } = {},
) => {
  const query = useInfiniteQuery({
    ...getArtistsInfiniteOptions({ query: { ...filters, limit: PAGE_SIZE } }),
    initialPageParam: {},
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: options.enabled,
  });

  const artists = query.data?.pages.flatMap((page) => page.data) ?? [];
  return { ...query, artists };
};

/**
 * Fetch a single artist by id — used to resolve an artwork's `artistId` to its
 * name on the artwork detail screen. Public endpoint; skips the fetch when no
 * `id` is set (an artwork with no attributed artist).
 *
 * `initialData` seeds the cache from the detail route's server `loader` (web
 * SSR), so the artist name ships in the initial HTML. `initialDataUpdatedAt: 0`
 * backdates the seed so it's stale on arrival and refetched on mount — the same
 * contract every loader seed follows (see `useArtworks`).
 */
export const useArtist = (
  id: string | null | undefined,
  initialData?: Artist,
) =>
  useQuery({
    ...getArtistsByIdOptions({ path: { id: id ?? "" } }),
    enabled: !!id,
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
  });

/**
 * Create an artist from just a name — the quick-create path on the artist
 * autocomplete when the search turns up no existing artist. The SDK runs
 * through the configured client (bearer token, Origin, Accept-Language,
 * ApiError on non-2xx), so `data` is the created `Artist` on resolve. The new
 * artist is unverified; on success the artists list is invalidated so it can
 * surface there once an admin verifies it.
 */
export const useCreateArtist = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<Artist> => {
      const { data } = await postArtists({ body: { name } });
      return data as Artist;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getArtistsInfiniteQueryKey() });
    },
  });
};

/**
 * A single artist by slug — the public, SEO-friendly lookup used by the artist
 * profile route. The fetched artist still carries `.id`, so writes (follow) key
 * off that.
 *
 * `initialData` seeds the cache from the route's server `loader` (web SSR), so the
 * profile header renders in the initial HTML instead of after a client fetch.
 * `initialDataUpdatedAt: 0` backdates the seed so it's stale on arrival and
 * refetched on mount — see `useArtworkBySlug` for why that line is load-bearing.
 */
export const useArtistBySlug = (slug: string, initialData?: Artist) =>
  useQuery({
    ...getArtistsSlugBySlugOptions({ path: { slug } }),
    enabled: !!slug,
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
  });

// The profile detail is cached by slug (DetailScreen → useArtistBySlug), but a
// follow only knows the id — so match every slug-detail query by its endpoint id
// (partial key) and patch the one whose artist `.id` matches. Mirrors the
// `slugDetailKey` pattern in `artworks.ts`.
const slugDetailKey = [
  { _id: getArtistsSlugBySlugQueryKey({ path: { slug: "" } })[0]._id },
];

/** Apply a follow/unfollow to a cached artist (count + flag stay in sync). */
function withFollow(a: Artist, isFollowing: boolean): Artist {
  if (a.followedByMe === isFollowing) return a;
  return {
    ...a,
    followedByMe: isFollowing,
    followerCount: a.followerCount + (isFollowing ? 1 : -1),
  };
}

// SDK functions reject (throwOnError → ApiError) on non-2xx, so `data` is defined
// on resolve; both follow endpoints return the updated `Artist`.
async function setFollow(id: string, isFollowing: boolean): Promise<Artist> {
  const { data } = isFollowing
    ? await postArtistsByIdFollow({ path: { id } })
    : await deleteArtistsByIdFollow({ path: { id } });
  return data as Artist;
}

/**
 * Follow / unfollow with an optimistic update: every cached slug-detail flips
 * immediately, rolls back on error, and the artist lists + the touched detail are
 * re-fetched on settle so the server's authoritative follower count wins. Mirrors
 * `useToggleArtworkLike`, simpler (no infinite-list patch — the follow control
 * lives on the detail).
 */
export const useToggleArtistFollow = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFollowing }: { id: string; isFollowing: boolean }) =>
      setFollow(id, isFollowing),

    onMutate: async ({ id, isFollowing }) => {
      // Stop in-flight refetches so they can't clobber the optimistic value.
      await qc.cancelQueries({ queryKey: slugDetailKey });

      const previousBySlug = qc.getQueriesData<Artist>({
        queryKey: slugDetailKey,
      });
      qc.setQueriesData<Artist>({ queryKey: slugDetailKey }, (old) =>
        old && old.id === id ? withFollow(old, isFollowing) : old,
      );

      return { previousBySlug };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.previousBySlug?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      // Targeted invalidation: the slug-detail (the follow flag/count) and any
      // artist list the row may sit in.
      qc.invalidateQueries({ queryKey: slugDetailKey });
      qc.invalidateQueries({ queryKey: getArtistsInfiniteQueryKey() });
    },
  });
};

export { getArtistsInfiniteQueryKey };
