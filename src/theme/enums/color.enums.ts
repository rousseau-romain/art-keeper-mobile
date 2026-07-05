/**
 * The app's color palette — the former "gritty · dark" default, with values
 * ported from the prototype (promt/02-design-system.md). The one resolved set of
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

export type ColorEnumType = keyof typeof ColorEnum;

export type ColorEnumValue = (typeof ColorEnum)[ColorEnumType];
