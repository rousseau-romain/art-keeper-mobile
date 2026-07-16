import { requestHeaders } from "expo-server";
import type { i18n as I18nInstance } from "i18next";

import i18nSingleton from "./index";
import { serverI18n } from "./server";

/**
 * Picks the i18next instance for `<I18nextProvider>`:
 * - Web **server** render (`document` undefined): the request's Accept-Language
 *   instance, so SSR renders in the user's language and matches the client's first
 *   render (which inits from the device locale) — no hydration mismatch.
 * - Web **browser**: the device-locale singleton (a persisted manual override is
 *   applied post-hydration by `I18nProvider`).
 */
export const resolveI18n = (): I18nInstance => {
  if (typeof document === "undefined") {
    try {
      return serverI18n(requestHeaders().get("accept-language"));
    } catch {
      // No request context available — fall back to the singleton.
      return i18nSingleton;
    }
  }
  return i18nSingleton;
};
