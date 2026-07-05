/**
 * The app's color palettes — semantic tokens resolved per scheme. `DarkColorEnum`
 * is the original "gritty · dark" set (values ported from the prototype,
 * promt/02-design-system.md); `LightColorEnum` mirrors every key for the light
 * scheme. Components never read a palette object directly: the active one is
 * handed out as `colors` by `useTheme()` (see `@/theme/ThemeProvider`), and
 * StyleSheets receive it through `useThemeStyles` factories.
 *
 * Modeled as `as const` objects (like the design scales in scale.enums.ts) so
 * the keys are a literal union (`ColorEnumType`) and the values stay plain hex
 * strings; `satisfies` enforces key parity between the two palettes.
 */
export const DarkColorEnum = {
  transparent: "transparent",
  bg: "#0e0e0f",
  surface: "#19191b",
  surface2: "#212124",
  text: "#f2f0ea",
  textSoft: "#b4b1a8",
  textMuted: "#6d6a63",
  border: "#3a3a3e",
  borderSoft: "#2a2a2d",
  primary: "#ff5b1f",
  primaryInk: "#0e0e0f",
  primarySoft: "#2a1a10",
  successBg: "#16241a",
  success: "#5fd07f",
  dangerBg: "#2a1614",
  danger: "#ff6a4d",
  info: "#5b9dff",
  infoBg: "#13202e",
  warn: "#e0a93f",
  warnBg: "#2a2110",
  scrim: "rgba(14,14,15,0.72)",
} as const;

export type ColorEnumType = keyof typeof DarkColorEnum;

export const LightColorEnum = {
  transparent: "transparent",
  bg: "#faf9f6",
  surface: "#ffffff",
  surface2: "#efede7",
  text: "#17171a",
  textSoft: "#55524b",
  textMuted: "#8b8880",
  border: "#d8d5cd",
  borderSoft: "#e7e4dc",
  primary: "#ff5b1f",
  primaryInk: "#0e0e0f",
  primarySoft: "#ffe6da",
  successBg: "#e4f4ea",
  success: "#1f8a4c",
  dangerBg: "#fbe9e4",
  danger: "#d43d1f",
  info: "#2f6fd0",
  infoBg: "#e7f0fc",
  warn: "#a97b12",
  warnBg: "#f8efd8",
  scrim: "rgba(23,23,26,0.45)",
} as const satisfies Record<ColorEnumType, string>;

/** The resolved color values (hex strings) — what the palettes resolve to. */
export type ColorEnumValue =
  | (typeof DarkColorEnum)[ColorEnumType]
  | (typeof LightColorEnum)[ColorEnumType];

/** The active palette shape handed out by `useTheme()` / `useThemeStyles`. */
export type Palette = Record<ColorEnumType, ColorEnumValue>;
