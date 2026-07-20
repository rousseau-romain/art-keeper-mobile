import { requestHeaders } from "expo-server";

import {
  ThemeModeEnum,
  type ThemeModeEnumType,
} from "./enums/theme-mode.enums";
import { THEME_MODE_COOKIE } from "./theme.constant";

const normalize = (raw: string | null | undefined): ThemeModeEnumType =>
  raw && raw in ThemeModeEnum ? (raw as ThemeModeEnumType) : "dark";

const readCookie = (jar: string | null | undefined): string | null => {
  const m = jar?.match(new RegExp(`(?:^|;\\s*)${THEME_MODE_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
};

/**
 * Sync first-render mode from the cookie: the browser reads `document.cookie`, the
 * SSR render reads the request's `Cookie` header. Server and client's first render
 * therefore agree, so an explicit light/dark choice renders without a flash.
 */
export const getInitialThemeMode = (): ThemeModeEnumType => {
  if (typeof document === "undefined") {
    try {
      return normalize(readCookie(requestHeaders().get("cookie")));
    } catch {
      return "dark";
    }
  }
  return normalize(readCookie(document.cookie));
};

/** Web resolves the mode synchronously from the cookie — no async override. */
export const readPersistedThemeMode =
  async (): Promise<ThemeModeEnumType | null> => null;

export const persistThemeMode = (mode: ThemeModeEnumType): void => {
  // 1 year; `lax` so it rides the top-level document request the SSR render reads.
  // biome-ignore lint/suspicious/noDocumentCookie: document.cookie is portable; the Cookie Store API is async and unsupported in Safari.
  document.cookie = `${THEME_MODE_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.dataset.theme = mode; // keep the pre-paint CSS in sync
};
