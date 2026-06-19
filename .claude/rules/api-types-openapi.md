# Rule: API types + client come from the backend OpenAPI spec

Do **not** hand-write request/response models, request functions, or React Query
wiring. They are generated from the art-keeper-api OpenAPI doc by
**`@hey-api/openapi-ts`** into `src/lib/api/generated/` (checked in) via
`openapi-ts.config.ts`.

```sh
bun gen:api   # openapi-ts  → reads openapi-ts.config.ts
```

The config's plugins generate, into `src/lib/api/generated/`:

- `types.gen.ts` — schema models + per-operation `*Data` / `*Response` / `*Error`.
- `sdk.gen.ts` — one typed request function per operation.
- `client.gen.ts` + `client/` — the `@hey-api/client-fetch` instance (configured
  in `src/lib/api/client.ts`).
- `@tanstack/react-query.gen.ts` — `*Options` / `*InfiniteOptions` / `*Mutation` /
  `*QueryKey` helpers (see [data-fetching](data-fetching.md)).

- The backend must be running on `:3000` to regenerate. Rerun after any API change.
- Derive app types from `generated/types.gen.ts`, e.g. the generated `Artwork`
  model, or `GetArtworksData["query"]` for an endpoint's query params (see
  `src/lib/api/artworks.ts` / `auth.ts` for the pattern). When the spec types a
  response as `unknown` (e.g. `get-session`), model it from the generated
  `Session` / `User` models rather than `any`.
- **Never edit anything in `src/lib/api/generated/`** by hand — regenerate it.
  The directory is excluded from biome (`biome.json`).
