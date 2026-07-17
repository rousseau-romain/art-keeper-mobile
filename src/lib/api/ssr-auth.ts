/**
 * The `Cookie` header to forward from a server render's own request to the API,
 * shaped as hey-api's per-call `headers` option.
 *
 * The session cookie is the only credential the web server ever holds, and it
 * belongs to *this* request alone. So it is threaded explicitly through each SDK
 * call — never through `client.setConfig` or `token-store`'s mirror, which are
 * module scope and therefore shared by every concurrent request (that is the
 * leak `@/lib/is-server-render` guards). Passing it per call keeps one visitor's
 * identity from ever reaching another's render.
 *
 * Returns `undefined` for an anonymous request, so the call stays unauthenticated
 * rather than sending an empty header — which is exactly what a crawler, and
 * `generateMetadata`, should get.
 *
 * Only meaningful inside a `loader` / `generateMetadata`: native has no loaders,
 * and the browser attaches the cookie itself (same-origin `credentials: "include"`).
 *
 * Typed on the only thing it reads, so it accepts both a `Request` and the
 * `ImmutableRequest` a loader is handed — without importing either.
 */
export const forwardedCookie = (
  request: { headers: Headers } | undefined,
): { cookie: string } | undefined => {
  const cookie = request?.headers.get("cookie");
  return cookie ? { cookie } : undefined;
};
