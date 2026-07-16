import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";

import i18n, {
  type Language,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "./index";
import { resolveI18n } from "./resolve-i18n";

type LocaleContextValue = {
  /** Active language (BCP-47 base, e.g. "en"). */
  language: Language;
  setLanguage: (lng: Language) => void;
  /** Cycle to the next supported language (used by the header switcher). */
  toggleLanguage: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function normalize(lng: string): Language {
  const base = lng.split("-")[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base)
    ? (base as Language)
    : "en";
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  // On the web server this is the request's Accept-Language instance; in the
  // browser / on native it's the device-locale singleton (so the mutation methods
  // below, which run client-side only, target the same instance we render with).
  const i18nInstance = resolveI18n();
  const [language, setLanguageState] = useState<Language>(
    normalize(i18nInstance.language),
  );

  // Apply a persisted manual override once on launch (init defaulted to device).
  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const lng = normalize(raw);
        i18n.changeLanguage(lng);
        setLanguageState(lng);
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lng: Language) => {
    setLanguageState(lng);
    i18n.changeLanguage(lng);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, lng).catch(() => {});
  }, []);

  const toggleLanguage = useCallback(() => {
    const idx = SUPPORTED_LANGUAGES.indexOf(normalize(i18n.language));
    const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
    setLanguage(next);
  }, [setLanguage]);

  const value = useMemo<LocaleContextValue>(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  );

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within I18nProvider");
  return ctx;
};
