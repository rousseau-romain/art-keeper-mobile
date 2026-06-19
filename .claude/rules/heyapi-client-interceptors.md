# Rule: openapi-fetch middleware must return falsy unless replacing

**Applies to:** `src/lib/api/client.ts` (the `fetchClient` middleware) and any new
openapi-fetch `Middleware` (`onRequest` / `onResponse` / `onError`).

**Rule:** A middleware hook must return a **falsy value** unless it is *actually
replacing* the request/response. openapi-fetch treats any truthy return as a
replacement and requires it to be `instanceof Response` (or `Request` for
`onRequest`, `Response`/`Error` for `onError`).

**Why it bites us:** in the **RN/Hermes** runtime the fetch polyfill's `Response`
fails that `instanceof` check. So returning the original `response` from
`onResponse` throws `"onResponse: must return new Response()"` at runtime — on
**every successful 2xx call** (it silently breaks `get-session`, list queries,
and successful sign-in/sign-up alike, surfacing as non-`ApiError` query errors).

**Do:**

```ts
async onResponse({ response }) {
  const issued = response.headers.get("set-auth-token");
  if (issued) await setToken(issued);
  if (!response.ok) throw toApiError(response.status, await readBody(response));
  return; // read what you need, replace nothing → return nothing
}
```

**Don't:** `return response;` (or `return request;` from `onRequest`) when you
haven't built a `new Response()` / `new Request()`. Only return when you mean to
swap the object out.
