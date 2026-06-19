/**
 * Design scales — the allowed steps for spacing, corner radius, and font size.
 * Use these named steps instead of raw magic numbers in styles, e.g.
 * `padding: SPACING.lg`, `borderRadius: RADIUS.md`, `mono(FONT_SIZE.sm)`.
 *
 * Modeled as `as const` objects (not TS `enum`) so the values stay plain numbers
 * usable directly in RN styles, and the keys are inferred as a literal union.
 */

/** 4pt-based spacing steps (padding / margin / gap). */
export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Corner radius steps. `full` pills/circles via a large value. */
export const RADIUS = {
  none: 0,
  sm: 2,
  md: 3,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

/** Font-size steps (point sizes passed to display/body/mono). */
export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 15,
  lg: 18,
  xl: 24,
  xxl: 28,
  display: 52,
} as const;

export type Spacing = keyof typeof SPACING;
export type Radius = keyof typeof RADIUS;
export type FontSize = keyof typeof FONT_SIZE;
