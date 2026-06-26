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
  postArtworks,
  postArtworksByIdLike,
} from "./generated/sdk.gen";
import type {
  Artwork,
  ArtworkPage,
  GetArtworksData,
  PostArtworksData,
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

/** What the new-artwork flow collects before it can submit. */
export type CreateArtworkInput = {
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  tags: string[];
  artistId?: string;
  image: { uri: string; name: string; type: string };
};

/**
 * Read a picked image URI into a real `Blob` for multipart upload. The app's
 * global `fetch` is Expo's "winter" fetch, whose FormData serializer only
 * understands a `string` or a `Blob` — it rejects React Native's
 * `{ uri, name, type }` file convention with "Unsupported FormDataPart
 * implementation" — and its URLSession-based fetch can't read a `file://` URI
 * directly either. An `XMLHttpRequest` with `responseType: "blob"` reads both
 * the native `file://` URI and the web `blob:` URL, yielding a Blob we can
 * append.
 */
const uriToBlob = (uri: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error("Failed to read the selected image"));
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

/**
 * Create an artwork via multipart/form-data through the generated `postArtworks`
 * SDK (so the bearer token, Origin, Accept-Language, and ApiError handling from
 * the client interceptors all apply). The SDK hardcodes a JSON content-type and
 * the client defaults to JSON serialization, so for this one upload we override:
 *
 * - `...formDataBodySerializer` builds a `FormData` from the body object instead
 *   of `JSON.stringify`-ing it (`image: Blob | File` lands as a real file part);
 * - `Content-Type: null` drops the SDK's `application/json` header so the
 *   `Request` constructor computes the multipart boundary itself.
 *
 * The picked photo is still read into a real `File` first (see `uriToBlob`):
 * winter fetch rejects RN's `{ uri, name, type }` convention regardless of which
 * request path we use. On success the browse list is invalidated so the new
 * piece shows up.
 */
export const useCreateArtwork = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateArtworkInput): Promise<Artwork> => {
      const raw = await uriToBlob(input.image.uri);
      // Guarantee an `image/*` content-type even if the Blob came back untyped —
      // the backend validates `image` as `t.File({ type: "image/*" })`, and the
      // content-type is what carries that through.
      const image = raw.type
        ? raw
        : new Blob([raw], { type: input.image.type });

      // Build the multipart body by hand instead of `formDataBodySerializer`:
      // that serializer appends the image via the 2-arg `FormData.append(key,
      // value)`, and Expo's "winter" fetch does NOT stamp a filename onto a bare
      // Blob. A multipart part with no `filename` is parsed by the backend as a
      // text field, so `t.File` rejects it ("image must be a string"). Passing
      // the filename as the 3rd `append` arg forces a real file part — a File
      // value can't be used instead because winter crashes setting its readonly
      // `.name`. Numbers go through `String()` (the backend reads them as
      // `t.Numeric`), and `tags` is a single JSON-encoded field, not repeated.
      const form = new FormData();
      form.append("title", input.title);
      form.append("latitude", String(input.latitude));
      form.append("longitude", String(input.longitude));
      if (input.description) form.append("description", input.description);
      if (input.tags.length) form.append("tags", JSON.stringify(input.tags));
      if (input.artistId) form.append("artistId", input.artistId);
      form.append("image", image, input.image.name);

      const { data } = await postArtworks({
        body: form as unknown as PostArtworksData["body"],
        bodySerializer: (body) => body,
        headers: { "Content-Type": null },
      });
      return data as Artwork;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getArtworksInfiniteQueryKey() });
    },
  });
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
                a.id === id ? withLike(a, liked) : a
              ),
            })),
          }
      );

      return { previousDetail, previousLists };
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.previousDetail) {
        qc.setQueryData(
          getArtworksByIdQueryKey({ path: { id } }),
          ctx.previousDetail
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
