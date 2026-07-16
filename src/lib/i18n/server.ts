import { createInstance, type i18n, type TFunction } from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./locales/en.constant";
import { fr } from "./locales/fr.constant";

// Server-side i18n, used both by route `generateMetadata` (resolves before React
// renders, outside the tree) and by the web SSR render itself (so the server
// renders the page in the request's language, matching the client's first render
// and avoiding a hydration mismatch). The react-i18next singleton in `./index` is
// device-locale driven and client-only (it pulls `expo-localization` + a persisted
// AsyncStorage override), so it can't drive a per-request server render. We pick
// the locale from the request's `Accept-Language` header and translate from the
// same bundled dictionaries, keeping copy in sync with the app's screens.

const SUPPORTED = ["en", "fr"] as const;
type ServerLanguage = (typeof SUPPORTED)[number];
const FALLBACK: ServerLanguage = "en";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

// One initialised instance per locale, created lazily and reused across requests.
// This is safe: a locale instance never changes language, so there's no per-request
// state to leak (unlike a shared mutable singleton). Init is synchronous (inline
// resources, no async backend). `initReactI18next` binds it to react-i18next so the
// same instance can back `<I18nextProvider>` during the SSR render.
const instances = new Map<ServerLanguage, i18n>();

const instanceFor = (lng: ServerLanguage): i18n => {
  const cached = instances.get(lng);
  if (cached) return cached;

  const instance = createInstance();
  // eslint-disable-next-line import/no-named-as-default-member -- mirrors ./index
  instance.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: FALLBACK,
    supportedLngs: SUPPORTED as unknown as string[],
    interpolation: { escapeValue: false }, // no XSS surface (server-rendered)
    returnNull: false,
  });
  instances.set(lng, instance);
  return instance;
};

/**
 * Best-effort supported locale from an `Accept-Language` header value (the first
 * tag's primary subtag), falling back to `en`. Accepts `null`/`undefined` because
 * the header may be absent (or the request itself is undefined during SSG).
 */
export const localeFromAcceptLanguage = (
  header: string | null | undefined,
): ServerLanguage => {
  const code = header?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return (SUPPORTED as readonly string[]).includes(code ?? "")
    ? (code as ServerLanguage)
    : FALLBACK;
};

/**
 * A translator bound to the request's locale, for use inside `generateMetadata`.
 * Pass the request's `Accept-Language` header (e.g.
 * `serverT(request.headers.get("accept-language"))`).
 */
export const serverT = (header: string | null | undefined): TFunction =>
  instanceFor(localeFromAcceptLanguage(header)).t;

/**
 * The react-i18next instance for the request's locale, to back `<I18nextProvider>`
 * during the SSR render so the server renders in the request's language.
 */
export const serverI18n = (header: string | null | undefined): i18n =>
  instanceFor(localeFromAcceptLanguage(header));
