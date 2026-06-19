import { RADIUS } from "./scale.enums";
import type { Theme } from "./theme.types";

/**
 * The app's single theme — the former "gritty · dark" default, ported verbatim
 * from the prototype (promt/02-design-system.md). Skin/mode/accent switching was
 * removed; this is the one and only resolved theme.
 */
export const THEME: Theme = {
  // Colors.
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

  // Shape & display-type.
  radius: RADIUS.sm,
  radiusLg: RADIUS.md,
  borderWeight: 1.5,
  shadow: {}, // gritty has no shadow
  displayWeight: "800",
  displaySpacing: 0.5,
  displayTransform: "uppercase",
};
