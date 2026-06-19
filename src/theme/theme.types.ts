import type { TextStyle, ViewStyle } from "react-native";

/** Semantic color tokens — never hard-code a color in a component. */
export interface ColorTokens {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  line: string;
  hair: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  diffAddBg: string;
  diffAdd: string;
  diffDelBg: string;
  diffDel: string;
}

/** Shape & display-type personality. */
export interface ShapeTokens {
  radius: number;
  radiusLg: number;
  borderWeight: number;
  shadow: ViewStyle;
  displayWeight: TextStyle["fontWeight"];
  displaySpacing: number;
  displayTransform: TextStyle["textTransform"];
}

/** The app's single resolved theme, handed to components via useTheme(). */
export interface Theme extends ColorTokens, ShapeTokens {}

export type FontRole = "display" | "body" | "mono";
export type Fonts = Record<FontRole, string>;
