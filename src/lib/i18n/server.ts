import { createInstance, type TFunction } from "i18next";

import { en } from "./locales/en.constant";
import { fr } from "./locales/fr.constant";

// Server-side i18n for route `generateMetadata`. Metadata resolves before React
// renders (outside the component tree), so the react-i18next singleton in
// `./index` — device-locale driven and client-only (it pulls `expo-localization`
// and a persisted AsyncStorage override) — isn't usable here. We pick the locale
// from the request's `Accept-Language` header and translate from the same bundled
// dictionaries, keeping metadata copy in sync with the app's screens.

const SUPPORTED = ["en", "fr"] as const;
type ServerLanguage = (typeof SUPPORTED)[number];
const FALLBACK: ServerLanguage = "en";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

// One initialised instance per locale, created lazily and reused across requests
// (init is synchronous with inline resources — no async backend).
const translators = new Map<ServerLanguage, TFunction>();

const translatorFor = (lng: ServerLanguage): TFunction => {
  const cached = translators.get(lng);
  if (cached) return cached;

  const instance = createInstance();
  // eslint-disable-next-line import/no-named-as-default-member -- mirrors ./index
  instance.init({
    resources,
    lng,
    fallbackLng: FALLBACK,
    supportedLngs: SUPPORTED as unknown as string[],
    interpolation: { escapeValue: false }, // no XSS surface (server-rendered <meta>)
    returnNull: false,
  });
  translators.set(lng, instance.t);
  return instance.t;
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
  translatorFor(localeFromAcceptLanguage(header));
