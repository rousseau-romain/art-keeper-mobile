/**
 * The app's color palette — the former "gritty · dark" default, ported verbatim
 * from the prototype (promt/02-design-system.md). The one resolved set of
 * semantic color tokens; read them straight off `ColorEnum`, never hard-code a color.
 *
 * Modeled as an `as const` object (like the design scales in scale.enums.ts) so
 * the keys are a literal union (`ColorEnumType`) and the values stay plain hex strings.
 */
export const ColorEnum = {
  transparent: "transparent",
  bg: "#0e0e0f",
  surface: "#19191b",
  surface2: "#212124",
  ink: "#f2f0ea",
  inkSoft: "#b4b1a8",
  inkMute: "#6d6a63",
  line: "#3a3a3e",
  hair: "#2a2a2d",
  accent: "#ff5b1f",
  accentInk: "#0e0e0f",
  accentSoft: "#2a1a10",
  diffAddBg: "#16241a",
  diffAdd: "#5fd07f",
  diffDelBg: "#2a1614",
  diffDel: "#ff6a4d",
  info: "#5b9dff",
  infoBg: "#13202e",
  warn: "#e0a93f",
  warnBg: "#2a2110",
} as const;

export type ColorEnumType = keyof typeof ColorEnum;

export type ColorEnumValue = (typeof ColorEnum)[ColorEnumType];
