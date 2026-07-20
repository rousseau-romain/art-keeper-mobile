import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import {
  DarkColorEnum,
  LightColorEnum,
  type Palette,
} from "@/theme/enums/color.enums";
import type {
  ThemeModeEnumType,
  ThemeScheme,
} from "@/theme/enums/theme-mode.enums";
import {
  getInitialThemeMode,
  persistThemeMode,
  readPersistedThemeMode,
} from "@/theme/theme-mode-store";

type ThemeContextValue = {
  /** The user's choice ("auto" | "light" | "dark") — what Settings edits. */
  mode: ThemeModeEnumType;
  setMode: (mode: ThemeModeEnumType) => void;
  /** The mode resolved against the device — what styling keys off. */
  scheme: ThemeScheme;
  /** The active palette for `scheme`. */
  colors: Palette;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // First-render mode is deterministic across server + client: web reads it from a
  // cookie (so an explicit light/dark choice renders with no flash), native starts
  // on the default and applies the stored value on launch (below).
  const [mode, setModeState] = useState<ThemeModeEnumType>(getInitialThemeMode);
  const [isMounted, setIsMounted] = useState(false);
  const device = useColorScheme();

  useEffect(() => {
    setIsMounted(true);
    // Native only (web resolved the mode synchronously from the cookie above).
    readPersistedThemeMode()
      .then((m) => {
        if (m) setModeState(m);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeModeEnumType) => {
    setModeState(next);
    persistThemeMode(next);
  }, []);

  // "auto" follows the device scheme — but only after mount, so the server and the
  // client's first render agree (deterministic dark) rather than the server having
  // to guess a system preference it can't read. Explicit light/dark are immediate.
  const scheme: ThemeScheme =
    mode === "auto"
      ? isMounted && device === "light"
        ? "light"
        : "dark"
      : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      scheme,
      colors: scheme === "dark" ? DarkColorEnum : LightColorEnum,
    }),
    [mode, setMode, scheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
