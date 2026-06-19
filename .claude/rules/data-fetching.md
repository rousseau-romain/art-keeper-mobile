# Rule: data fetching — one pattern

Server state lives **only** in the TanStack Query cache — never in Context,
Zustand, or other global client state. The whole app uses one convention built on
the **generated** API layer (`@hey-api/openapi-ts`, see
[api-types-openapi](api-types-openapi.md)); do **not** hand-roll fetch or
re-introduce `openapi-fetch` / `$api` (removed).

`bun gen:api` writes `src/lib/api/generated/` from the OpenAPI spec, including:

- **`sdk.gen.ts`** — one typed request function per operation
  (`getArtworks`, `postArtworksByIdLike`, …), all driven by the single configured
  client (`client.ts`).
- **`@tanstack/react-query.gen.ts`** — per operation: `*Options`,
  `*InfiniteOptions`, `*Mutation`, and `*QueryKey` / `*InfiniteQueryKey` helpers.

Each domain gets a thin module under `src/lib/api/<domain>.ts` that **composes**
those generated helpers (`src/lib/api/artworks.ts` is the reference):

1. **Re-export domain types** from `generated/types.gen.ts` (e.g. `Artwork`,
   `ArtworkPage`) and derive filter types from the generated `*Data` query shape.
2. **Use the generated query keys** — they model the domain for you. Each key is
   `[{ _id, baseUrl, query?, path?, _infinite? }]` and React Query **matches
   partially**, so writes invalidate at the right granularity:

   ```ts
   getArtworksInfiniteQueryKey()             // every filtered list (any filters)
   getArtworksByIdQueryKey({ path: { id } }) // one artwork's detail
   ```

3. **Hooks**: spread the generated options into `useQuery` / `useInfiniteQuery` /
   `useMutation`. Hand-write a hook **only** for behavior the generated option
   can't express — infinite pagination params (`initialPageParam` /
   `getNextPageParam`), optimistic updates, or a bespoke flow (see `AuthProvider`).

Rules:
- **Imperative calls**: call the generated **SDK** function
  (`postArtworksByIdLike({ path: { id } })`) — it runs through the configured
  client, so the bearer token, native `Origin`, `Accept-Language`,
  `set-auth-token` capture, and `ApiError`-on-non-2xx all apply. SDK functions
  reject with `ApiError` on failure, so `data` is defined on resolve.
- **Mutations**: optimistic update where it helps UX (`onMutate` snapshot + patch,
  `onError` rollback), then **targeted** invalidation in `onSettled` using the
  generated keys — invalidate the specific operation key(s) touched, never the
  whole cache.
- **Screens** render every query state: loading, error (show `ApiError.message`),
  empty, background-refetch (`isFetching && !isLoading`), and stale (`isStale`).
  See `src/app/(tabs)/browse.tsx`.
- `apiRequest` in `client.ts` is the escape hatch for anything not in the spec.
- **Never edit `generated/`** by hand — regenerate with `bun gen:api`.
- Client interceptors must return the request/response or throw — see
  [heyapi-client-interceptors](heyapi-client-interceptors.md).
