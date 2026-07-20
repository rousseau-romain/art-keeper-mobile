import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ThemeModeEnum,
  type ThemeModeEnumType,
} from "./enums/theme-mode.enums";
import { THEME_MODE_STORAGE_KEY } from "./theme.constant";

const normalize = (raw: string | null | undefined): ThemeModeEnumType =>
  raw && raw in ThemeModeEnum ? (raw as ThemeModeEnumType) : "dark";

/**
 * Deterministic first-render mode. Native can't read the keychain synchronously,
 * so it starts on the default and applies the persisted value via
 * `readPersistedThemeMode` on launch. The web variant reads a cookie synchronously.
 */
export const getInitialThemeMode = (): ThemeModeEnumType => "dark";

/** The persisted mode, applied once on launch (native → AsyncStorage). */
export const readPersistedThemeMode =
  async (): Promise<ThemeModeEnumType | null> => {
    try {
      const raw = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
      return raw ? normalize(raw) : null;
    } catch {
      return null;
    }
  };

export const persistThemeMode = (mode: ThemeModeEnumType): void => {
  AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode).catch(() => {});
};
