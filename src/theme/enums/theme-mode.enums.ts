/**
 * Theme mode — the user's *choice* in Settings. `auto` follows the device
 * (native `userInterfaceStyle`) / browser (`prefers-color-scheme`) setting;
 * the resolved scheme (`ThemeScheme`, light|dark only) is what styling keys off.
 */
export const ThemeModeEnum = {
  auto: "auto",
  light: "light",
  dark: "dark",
} as const;

export type ThemeModeEnumType = keyof typeof ThemeModeEnum;

/** A mode resolved against the device — what the palettes are keyed by. */
export type ThemeScheme = Exclude<ThemeModeEnumType, "auto">;
