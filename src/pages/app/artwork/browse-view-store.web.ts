// Persisted reactive store for the *default* browse view (grid ⇄ map) on web.
// Cookie-backed (not just localStorage) so the SSR render can read the choice
// from the request and render the matching view — no flash, deterministic first
// render. Crawlers (no cookie) fall on the `grid` default → the crawlable list.
// Mirrors `theme-mode-store.web.ts` (cookie + requestHeaders) plus `filter-store`
// (subscribe/emit for `useSyncExternalStore`).

import { requestHeaders } from "expo-server";

import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";

const BROWSE_VIEW_COOKIE = "browse-view";
const DEFAULT_VIEW: ArtworkView = "grid";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = (): void => {
  for (const listener of listeners) listener();
};

const normalize = (raw: string | null | undefined): ArtworkView =>
  raw === "map" || raw === "grid" ? raw : DEFAULT_VIEW;

const readCookie = (jar: string | null | undefined): string | null => {
  const m = jar?.match(new RegExp(`(?:^|;\\s*)${BROWSE_VIEW_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
};

/**
 * Sync first-render default from the cookie: the browser reads `document.cookie`,
 * the SSR render reads the request's `Cookie` header. Server and client's first
 * render therefore agree, so the chosen view renders without a flash.
 */
export const getInitialBrowseView = (): ArtworkView => {
  if (typeof document === "undefined") {
    try {
      return normalize(readCookie(requestHeaders().get("cookie")));
    } catch {
      return DEFAULT_VIEW;
    }
  }
  return normalize(readCookie(document.cookie));
};

// Client-only in-memory mirror, seeded lazily from the cookie on first read. Never
// touched on the server (`getServerBrowseView` reads the request per call), so no
// module-state leak across concurrent requests.
let view: ArtworkView | null = null;

/** Subscribe to preference changes; returns the unsubscribe. */
export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Client snapshot for `useSyncExternalStore`. */
export const getBrowseView = (): ArtworkView => {
  if (view === null) view = getInitialBrowseView();
  return view;
};

/** Server snapshot — reads the request cookie per call (no cached module state). */
export const getServerBrowseView = (): ArtworkView => getInitialBrowseView();

/** Set the default-view preference. No-op (no emit) when unchanged. */
export const setBrowseView = (next: ArtworkView): void => {
  if (getBrowseView() === next) return;
  view = next;
  // 1 year; `lax` so it rides the top-level document request the SSR render reads.
  // biome-ignore lint/suspicious/noDocumentCookie: document.cookie is portable; the Cookie Store API is async and unsupported in Safari.
  document.cookie = `${BROWSE_VIEW_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  emit();
};
