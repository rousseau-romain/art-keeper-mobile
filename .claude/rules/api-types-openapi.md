# Rule: API types come from the backend OpenAPI spec

Do **not** hand-write request/response models. They are generated from the
art-keeper-api OpenAPI doc into `src/lib/api/schema.d.ts` (checked in).

```sh
bun gen:api   # openapi-typescript http://localhost:3000/openapi/json -o src/lib/api/schema.d.ts
```

- The backend must be running on `:3000` to regenerate. Rerun after any API change.
- Derive app types from the generated schema, e.g.
  `components["schemas"]["Artwork"]` for a model or
  `operations["getSession"]["responses"][200]["content"]["application/json"]`
  for an endpoint's response (see `src/lib/api/auth.ts` for the pattern).
- Never edit `schema.d.ts` by hand — regenerate it.
