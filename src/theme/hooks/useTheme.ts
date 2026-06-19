import type { TextStyle } from "react-native";

import { FONTS } from "../fonts.constant";
import { FONT_SIZE } from "../scale.enums";
import { THEME } from "../theme.constant";
import type { Fonts, Theme } from "../theme.types";

export type ThemeApi = {
  /** Resolved color tokens. */
  t: Theme;
  fonts: Fonts;
  /** Display-type style (weight/spacing/transform + ink color). */
  display: (size?: number) => TextStyle;
  /** Body-type style. */
  body: (size?: number) => TextStyle;
  /** Mono-type style (metadata, coordinates, counts). */
  mono: (size?: number) => TextStyle;
};

// The theme is a constant now, so the API is a singleton — no context needed.
const API: ThemeApi = {
  t: THEME,
  fonts: FONTS,
  display: (size = FONT_SIZE.xl) => ({
    fontFamily: FONTS.display,
    fontSize: size,
    color: THEME.ink,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    // expo-google-fonts carry their own weight; keep RN weight as a hint.
    fontWeight: "800",
  }),
  body: (size = FONT_SIZE.base) => ({
    fontFamily: FONTS.body,
    fontSize: size,
    color: THEME.ink,
  }),
  mono: (size = FONT_SIZE.sm) => ({
    fontFamily: FONTS.mono,
    fontSize: size,
    color: THEME.inkMute,
  }),
};

/** Primary hook — components read everything visual from here, never hard-coded. */
export const useTheme = (): ThemeApi => {
  return API;
};
