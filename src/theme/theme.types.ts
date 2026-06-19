/** Semantic color tokens — never hard-code a color in a component. */
export type ColorTokens = {
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
};

/** The app's single resolved theme, handed to components via useTheme(). */
export type Theme = ColorTokens;

export type FontRole = "display" | "body" | "mono";
export type Fonts = Record<FontRole, string>;
