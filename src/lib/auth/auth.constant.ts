/**
 * Cookie name for the **web** session profile — the few non-secret user fields the
 * chrome needs to paint signed-in (see `SessionProfile`).
 *
 * It exists for the same reason as `THEME_MODE_COOKIE`: a cookie rides the document
 * request, so the SSR render and the browser's first render can read it *synchronously*
 * from the same source and therefore agree — the invariant hydration depends on. The
 * bearer token in localStorage can't do that (the server has no localStorage), and the
 * Better Auth session cookie can't either (it's httpOnly, unreadable from JS).
 *
 * It is **not** a credential. The httpOnly Better Auth cookie remains the only thing
 * that authenticates; this one merely seeds an optimistic first render that the mount
 * refetch immediately reconciles. Forging it fakes some chrome and nothing else — the
 * API still refuses. Keep it that way: never put a token or an email in here.
 * (Cookie names can't contain `:`, hence the plain name.)
 */
export const SESSION_PROFILE_COOKIE = "ak-profile";
