# Rule: hey-api client interceptors — return the request/response, or throw

**Applies to:** `src/lib/api/client.ts`, where the generated
`@hey-api/client-fetch` instance (`generated/client.gen.ts`) is configured.

The client is wired **once** at module load: `client.setConfig({ baseUrl,
credentials })` plus a request and a response interceptor that reproduce the
behaviors the old openapi-fetch middleware had — inject the bearer token, native
`Origin`, and `Accept-Language`; capture the `set-auth-token` header; throw
`ApiError` on non-2xx. `src/app/_layout.tsx` imports `@/lib/api/client` for that
side effect so the client is configured before any request runs.

**Rule:** an interceptor must **return** the (possibly-modified) `Request` /
`Response`. To signal a failure, **throw** — the thrown value rejects the call.

```ts
client.interceptors.request.use((request) => {
  const token = getToken();
  if (token) request.headers.set("Authorization", `Bearer ${token}`);
  if (Platform.OS !== "web") request.headers.set("Origin", AUTH_ORIGIN);
  request.headers.set("Accept-Language", acceptLanguage());
  return request; // always return the request
});

client.interceptors.response.use(async (response) => {
  const issued = response.headers.get("set-auth-token");
  if (issued) await setToken(issued);
  if (!response.ok) {
    const body = await response.clone().json().catch(() => undefined);
    throw toApiError(response.status, body); // reject with ApiError
  }
  return response; // read what you need, return the same response
});
```

**Unlike openapi-fetch**, hey-api has **no `instanceof Response` replacement
check**, so returning the same `response` is safe under RN/Hermes — the old
`"onResponse: must return new Response()"` trap is gone. We throw `ApiError`
inside the response interceptor (before the client's own untyped error handling),
so every non-2xx rejects with an `ApiError` that React Query surfaces as the error
state, regardless of the SDK's `throwOnError` setting.

**Don't:** forget to return the request/response (a non-returning interceptor
breaks the call), and don't read a `Response` body without `.clone()` if the
client still needs to parse it.
