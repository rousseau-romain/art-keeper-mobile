/**
 * Design scales — the allowed steps for spacing, corner radius, and font size.
 * Use these named steps instead of raw magic numbers in styles, e.g.
 * `padding: SpacingEnum.lg`, `borderRadius: RadiusEnum.md`, `mono(FontSizeEnum.sm)`.
 *
 * Modeled as `as const` objects (not TS `enum`) so the values stay plain numbers
 * usable directly in RN styles, and the keys are inferred as a literal union.
 */

export const SpacingEnum = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingEnumType = keyof typeof SpacingEnum;

export const RadiusEnum = {
  none: 0,
  sm: 2,
  md: 3,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export type RadiusEnumType = keyof typeof RadiusEnum;

export const FontSizeEnum = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 15,
  lg: 18,
  xl: 24,
  xxl: 28,
  display: 52,
} as const;

export type FontSizeEnumType = keyof typeof FontSizeEnum;

export const IconSizeEnum = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 36,
} as const;

export type IconSizeEnumType = keyof typeof IconSizeEnum;

export const ControlHeightEnum = {
  sm: 36,
  md: 48,
} as const;

export type ControlHeightEnumType = keyof typeof ControlHeightEnum;
