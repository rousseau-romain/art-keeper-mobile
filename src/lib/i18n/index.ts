import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./locales/en.constant";
import { fr } from "./locales/fr.constant";

export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** AsyncStorage key for a manual override (parallels the appearance key). */
export const LOCALE_STORAGE_KEY = "artkeeper:locale:v1";

const FALLBACK: Language = "en";

/** The device's preferred language if we support it, else the fallback. */
export function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code ?? "")
    ? (code as Language)
    : FALLBACK;
}

// Init synchronously with bundled resources and the device locale. A persisted
// manual override (read from AsyncStorage) is applied later by `I18nProvider`.
// eslint-disable-next-line import/no-named-as-default-member -- `.use` is the i18next instance method, not the named `use` export
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: deviceLanguage(),
  fallbackLng: FALLBACK,
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  interpolation: { escapeValue: false }, // RN has no XSS surface
  returnNull: false,
});

export default i18n;
