# Rule: data fetching — one pattern

Server state lives **only** in the TanStack Query cache — never in Context,
Zustand, or other global client state. The whole app uses one convention; do
**not** reach for `openapi-react-query` / `$api` (removed) or hand-rolled fetch.

Each domain gets a module under `src/lib/api/<domain>.ts` with three parts
(`src/lib/api/artworks.ts` is the reference):

1. **Colocated request functions** over the typed `fetchClient` (openapi-fetch,
   from `client.ts`). The client middleware injects the bearer token, native
   `Origin`, and `Accept-Language`, captures `set-auth-token`, and throws
   `ApiError` on non-2xx — so request functions stay thin and never set headers.
2. **A domain query-key factory** modelling the product domain hierarchically,
   so writes invalidate at the right granularity:

   ```ts
   export const artworkKeys = {
     all: ["artworks"] as const,
     lists: () => [...artworkKeys.all, "list"] as const,
     list: (filters) => [...artworkKeys.lists(), filters] as const,
     detail: (id) => [...artworkKeys.all, "detail", id] as const,
   };
   ```

3. **Plain `@tanstack/react-query` hooks** (`useQuery` / `useInfiniteQuery` /
   `useMutation`) built on those keys + functions.

Rules:
- **Mutations**: optimistic update where it helps UX (`onMutate` snapshot +
  patch, `onError` rollback), then **targeted** invalidation in `onSettled` —
  invalidate the specific key(s) touched, never the whole cache.
- **Screens** render every query state: loading, error (show `ApiError.message`),
  empty, background-refetch (`isFetching && !isLoading`), and stale (`isStale`).
  See `src/app/(tabs)/browse.tsx`.
- `apiRequest` in `client.ts` is the escape hatch for anything not in the spec.
- openapi-fetch middleware must return a falsy value unless it is actually
  replacing the request/response — see
  [openapi-fetch-middleware](openapi-fetch-middleware.md).
