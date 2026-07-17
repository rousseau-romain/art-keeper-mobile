import { requestHeaders } from "expo-server";

import { SESSION_PROFILE_COOKIE } from "./auth.constant";
import type { SessionProfile } from "./session.types";

/** ~7 days — the Better Auth session's own order of magnitude. Outliving it only
 * costs a flash (optimistic chrome, corrected by the mount refetch), never access. */
const MAX_AGE_SECONDS = 604800;

const readCookie = (jar: string | null | undefined): string | null => {
  const m = jar?.match(
    new RegExp(`(?:^|;\\s*)${SESSION_PROFILE_COOKIE}=([^;]+)`),
  );
  return m ? decodeURIComponent(m[1]) : null;
};

// The cookie is client-writable, so treat its contents as untrusted input: anything
// that isn't a well-formed profile is "signed out", never a throw. A malformed value
// must not be able to break the render — on the server that would 500 the document.
const parse = (raw: string | null): SessionProfile | null => {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const { id, role } = value as Partial<SessionProfile>;
    return typeof id === "string" && id ? { id, role } : null;
  } catch {
    return null;
  }
};

/**
 * Sync first-render profile: the browser reads `document.cookie`, the SSR render reads
 * the request's `Cookie` header. Server and client's first render therefore agree, so
 * the chrome paints signed-in with no hydration mismatch — the same deal
 * `getInitialThemeMode` makes for the theme.
 */
export const readProfileCookie = (): SessionProfile | null => {
  if (typeof document === "undefined") {
    try {
      return parse(readCookie(requestHeaders().get("cookie")));
    } catch {
      // `requestHeaders()` throws outside a request (e.g. a static render).
      return null;
    }
  }
  return parse(readCookie(document.cookie));
};

/** Mirror the resolved session into the cookie (or clear it when signed out). */
export const persistProfile = (profile: SessionProfile | null): void => {
  if (typeof document === "undefined") return; // nothing to persist server-side
  // `lax` so it rides the top-level document request the SSR render reads; `secure`
  // only over HTTPS, since a secure cookie is dropped on http://localhost in dev.
  const secure = location.protocol === "https:" ? "; secure" : "";
  if (!profile) {
    // biome-ignore lint/suspicious/noDocumentCookie: document.cookie is portable; the Cookie Store API is async and unsupported in Safari.
    document.cookie = `${SESSION_PROFILE_COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
    return;
  }
  const value = encodeURIComponent(JSON.stringify(profile));
  // biome-ignore lint/suspicious/noDocumentCookie: document.cookie is portable; the Cookie Store API is async and unsupported in Safari.
  document.cookie = `${SESSION_PROFILE_COOKIE}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax${secure}`;
};
