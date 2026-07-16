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
  getArtworksChangesQueryKey,
  getArtworksInfiniteOptions,
  getArtworksInfiniteQueryKey,
  getArtworksSlugBySlugOptions,
  getArtworksSlugBySlugQueryKey,
} from "./generated/@tanstack/react-query.gen";
import {
  deleteArtworksByIdLike,
  postArtworks,
  postArtworksByIdChanges,
  postArtworksByIdLike,
} from "./generated/sdk.gen";
import type {
  Artwork,
  ArtworkPage,
  GetArtworksData,
  PostArtworksByIdChangesData,
  PostArtworksData,
} from "./generated/types.gen";

export type { Artwork, ArtworkPage };

/** List filters = the list query params minus pagination controls. */
export type ArtworkFilters = Omit<
  NonNullable<GetArtworksData["query"]>,
  "cursor" | "limit"
>;

/**
 * Which field a free-text browse search targets — a single, mutually-exclusive
 * scope. `"all"` uses the API's `q` (title OR artist); `"title"` / `"artist"`
 * narrow to that one field. See `searchFilter` / `useBrowseArtworks`.
 */
export type SearchScope = "all" | "title" | "artist";

export const PAGE_SIZE = 20;

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

// The detail is also cached by slug (DetailScreen → useArtworkBySlug), but a
// like only knows the id — so match every slug-detail query by its endpoint id
// (partial key) and patch the one whose artwork `.id` matches.
const slugDetailKey = [
  { _id: getArtworksSlugBySlugQueryKey({ path: { slug: "" } })[0]._id },
];

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
export const useArtworks = (
  filters: ArtworkFilters = {},
  options?: { enabled?: boolean },
  // Web SSR: the route `loader` prefetches the first page; seeding it as
  // `initialData` renders the list from the server HTML (no client fetch first).
  // Passed WITHOUT `initialDataUpdatedAt` on purpose — the loader runs
  // unauthenticated, so it's treated as stale and refetched in the background to
  // personalize `likedByMe` (same rationale as `useArtworkBySlug`).
  initialData?: ArtworkPage
) => {
  const query = useInfiniteQuery({
    ...getArtworksInfiniteOptions({ query: { ...filters, limit: PAGE_SIZE } }),
    // The generated queryFn treats an object pageParam as page params and a
    // string as the cursor; `{}` is the first page (no cursor).
    initialPageParam: {},
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: options?.enabled ?? true,
    // Seed the first page from the loader. `pageParams: [{}]` mirrors
    // `initialPageParam` (the first page has no cursor); `{} as never` sidesteps
    // the generated page-param union without widening the query type.
    initialData: initialData
      ? { pages: [initialData], pageParams: [{} as never] }
      : undefined,
  });

  const artworks = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  return { ...query, artworks };
};

/**
 * Map a free-text search + its target scope to the list query's search fields.
 * `"all"` uses the API's `q` (a title-OR-artist substring match); `"title"` /
 * `"artist"` narrow to that one field. Empty query → no search filter (the plain
 * base list).
 */
const searchFilter = (query: string, scope: SearchScope): ArtworkFilters => {
  if (!query) return {};
  switch (scope) {
    case "title":
      return { title: [query] };
    case "artist":
      return { artist: [query] };
    default:
      return { q: query };
  }
};

const SEARCH_SCOPES: readonly SearchScope[] = ["all", "title", "artist"];

/** Narrow a raw `scope` query param to a `SearchScope` (defaults handled by callers). */
export const isSearchScope = (
  value: string | undefined
): value is SearchScope =>
  value !== undefined && SEARCH_SCOPES.includes(value as SearchScope);

/** Normalize a `tag` query param into a deduped list of trimmed, lowercased tags. */
export const toTagArray = (raw: string | string[] | undefined): string[] => {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const seen = new Set<string>();
  for (const value of list) {
    const tag = value.trim().toLowerCase();
    if (tag) seen.add(tag);
  }
  return [...seen];
};

/**
 * Map the browse URL query params (`q` / `scope` / `tag`) to the exact
 * `ArtworkFilters` shape `useBrowseArtworks` produces internally — so the route
 * `loader` (server prefetch) and the screen's first render build the **same**
 * query key, and the seeded `initialData` attaches. Shared by both to keep them
 * in lock-step. Empty params → `{}` (the base list).
 */
export const paramsToBrowseFilters = (
  q?: string,
  scope?: string,
  tag?: string | string[]
): ArtworkFilters => {
  const tags = toTagArray(tag);
  const searchScope: SearchScope = isSearchScope(scope) ? scope : "all";
  return {
    ...(tags.length ? { tag: tags } : {}),
    ...searchFilter((q ?? "").trim(), searchScope),
  };
};

/**
 * The browse list, with an optional free-text search targeting a single scope.
 * A single request handles every case: `"all"` goes through the API's `q` (title
 * OR artist), `"title"` / `"artist"` narrow to that field, and no search is the
 * plain filtered list. Returns the `useArtworks` query verbatim (`artworks` +
 * the query-state flags) — the shape `IndexScreen` consumes.
 */
export const useBrowseArtworks = (
  filters: ArtworkFilters = {},
  search = "",
  scope: SearchScope = "all",
  initialData?: ArtworkPage
) =>
  useArtworks(
    { ...filters, ...searchFilter(search.trim(), scope) },
    undefined,
    initialData
  );

/** Radius (metres) for the detail screen's "nearby pieces" lookup. Capped at the API's max (≤ 100000). */
export const NEARBY_RADIUS = 200;

/**
 * Drop a given artwork from a list of artworks — used to keep a piece out of its
 * own "nearby" neighbourhood and "more by this artist" strip. Shared by the
 * detail hooks and the web route `loader` (which fetches the same lists
 * imperatively), so the self-exclusion rule lives in one place.
 */
export const excludeArtwork = (list: Artwork[], id: string): Artwork[] =>
  list.filter((a) => a.id !== id);

/**
 * Pieces geographically near a given artwork — the detail screen's "nearby"
 * panel. Composes `useArtworks` with the list endpoint's `lat`/`lng`/`radius`
 * filter and drops the artwork itself from its own neighbourhood. Accepts an
 * `undefined` artwork (the detail screen calls it before the fetch resolves) and
 * stays disabled until it's known. Returns the query plus `nearby` (the
 * flattened, self-excluded rows) and the `radius` used.
 */
export const useNearbyArtworks = (artwork: Artwork | undefined) => {
  const query = useArtworks(
    artwork
      ? { lat: artwork.latitude, lng: artwork.longitude, radius: NEARBY_RADIUS }
      : {},
    { enabled: !!artwork }
  );
  const nearby = artwork
    ? excludeArtwork(query.artworks, artwork.id)
    : query.artworks;
  return { ...query, nearby, radius: NEARBY_RADIUS };
};

/**
 * Other pieces by the same artist — the detail screen's "more by" strip. Uses
 * the list `artistId` filter, which matches the artist foreign key exactly (no
 * name-substring guessing), so it takes the artwork's `artistId` directly — no
 * need to wait on the artist name resolving. The fetch is skipped until the id
 * is known. Returns the `useArtworks` query verbatim (`artworks` + state flags).
 */
export const useArtworksByArtist = (artistId: string) =>
  useArtworks({ artistId: artistId || undefined }, { enabled: !!artistId });

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

/** The fields a proposed edit can touch — the partial the backend records as `changes`. */
export type ArtworkChangeFields = {
  title?: string;
  description?: string | null;
  tags?: string[];
  artistId?: string | null;
  latitude?: number;
  longitude?: number;
};

/** What the "propose an edit" screen submits: the touched fields + a required reason. */
export type ProposeArtworkChangeInput = {
  artworkId: string;
  changes: ArtworkChangeFields;
  note: string;
};

/**
 * Submit a proposed edit to an existing artwork (`POST /artworks/{id}/changes`).
 * An admin reviews it before it applies — nothing on the artwork changes yet, so
 * on success we only invalidate the pending-changes queue (so a moderator sees
 * it), not the artwork detail or any list.
 *
 * The endpoint is multipart-capable (it can carry a replacement `image`), so we
 * take the same structured-body override as `useCreateArtwork` — build the
 * `FormData` by hand, pass it through untouched (`bodySerializer: (b) => b`), and
 * drop the SDK's JSON `Content-Type` so the boundary is computed. Only the keys
 * present in `changes` are appended (a cleared field arrives as an empty string);
 * `tags` is a single JSON-encoded field. No image part this flow (photo edits are
 * proposed separately).
 */
export const useProposeArtworkChange = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProposeArtworkChangeInput): Promise<void> => {
      const { changes } = input;
      const form = new FormData();
      if (changes.title !== undefined) form.append("title", changes.title);
      if (changes.description !== undefined) {
        form.append("description", changes.description ?? "");
      }
      if (changes.tags !== undefined) {
        form.append("tags", JSON.stringify(changes.tags));
      }
      if (changes.artistId !== undefined) {
        form.append("artistId", changes.artistId ?? "");
      }
      if (changes.latitude !== undefined) {
        form.append("latitude", String(changes.latitude));
      }
      if (changes.longitude !== undefined) {
        form.append("longitude", String(changes.longitude));
      }
      form.append("note", input.note);

      await postArtworksByIdChanges({
        path: { id: input.artworkId },
        body: form as unknown as PostArtworksByIdChangesData["body"],
        bodySerializer: (body) => body,
        headers: { "Content-Type": null },
      });
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getArtworksChangesQueryKey() });
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
 * A single artwork by slug — the public, SEO-friendly lookup used by the detail
 * route. The fetched artwork still carries `.id`, so writes (like/unlike, future
 * edit) key off that.
 *
 * `initialData` seeds the cache from the route's server `loader` (web SSR), so the
 * detail hero renders in the initial HTML instead of after a client fetch. It's
 * passed WITHOUT `initialDataUpdatedAt` on purpose: the loader runs unauthenticated
 * (no user token server-side), so `likedByMe` is neutral — treating the data as
 * immediately stale triggers a background refetch that personalizes it on the client.
 */
export const useArtworkBySlug = (slug: string, initialData?: Artwork) => {
  return useQuery({
    ...getArtworksSlugBySlugOptions({ path: { slug } }),
    enabled: !!slug,
    initialData,
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

      await qc.cancelQueries({ queryKey: slugDetailKey });

      const previousDetail = qc.getQueryData<Artwork>(detailKey);
      const previousLists = qc.getQueriesData<InfiniteData<ArtworkPage>>({
        queryKey: listsKey,
      });
      const previousBySlug = qc.getQueriesData<Artwork>({
        queryKey: slugDetailKey,
      });

      if (previousDetail) {
        qc.setQueryData(detailKey, withLike(previousDetail, liked));
      }
      qc.setQueriesData<Artwork>({ queryKey: slugDetailKey }, (old) =>
        old && old.id === id ? withLike(old, liked) : old
      );
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

      return { previousDetail, previousLists, previousBySlug };
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
      ctx?.previousBySlug?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: (_data, _err, { id }) => {
      // Targeted invalidation: only this artwork's detail + the lists it sits in.
      qc.invalidateQueries({
        queryKey: getArtworksByIdQueryKey({ path: { id } }),
      });
      qc.invalidateQueries({ queryKey: getArtworksInfiniteQueryKey() });
      qc.invalidateQueries({ queryKey: slugDetailKey });
    },
  });
};
