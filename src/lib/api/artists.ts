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
} from "./generated/@tanstack/react-query.gen";
import { postArtists } from "./generated/sdk.gen";
import type { Artist, ArtistPage, GetArtistsData } from "./generated/types.gen";

export type { Artist, ArtistPage };

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
 */
export const useArtist = (id: string | null | undefined) =>
  useQuery({
    ...getArtistsByIdOptions({ path: { id: id ?? "" } }),
    enabled: !!id,
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

export { getArtistsInfiniteQueryKey };
