import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  ThemeModeEnum,
  type ThemeModeEnumType,
  type ThemeScheme,
} from "@/theme/enums/theme-mode.enums";
import { THEME_MODE_STORAGE_KEY } from "@/theme/theme.constant";

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

function normalize(raw: string): ThemeModeEnumType {
  return raw in ThemeModeEnum ? (raw as ThemeModeEnumType) : "dark";
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Dark is the app's default: it applies until a persisted choice loads, and
  // it's the fallback when `auto` can't read a device scheme.
  const [mode, setModeState] = useState<ThemeModeEnumType>("dark");
  const device = useColorScheme();

  // Apply a persisted manual override once on launch.
  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)
      .then((raw) => {
        if (raw) setModeState(normalize(raw));
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeModeEnumType) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, next).catch(() => {});
  }, []);

  // `useColorScheme` can report null/"unspecified" — dark stays the fallback.
  const scheme: ThemeScheme =
    mode === "auto" ? (device === "light" ? "light" : "dark") : mode;

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
