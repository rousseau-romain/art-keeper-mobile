import type { Fonts } from "./theme.types";

/**
 * Web variant (Metro resolves `.web.ts` over `.ts`). On web the fonts are **not**
 * loaded through expo-font: their `@font-face` rules — the real WOFF2 plus a
 * metric-matched local fallback — are declared statically in the web shell
 * (`src/app/+html.tsx`), so text paints immediately in the adjusted fallback and
 * swaps to the real font with **no layout shift** (CLS). See the "web fonts"
 * section of `.claude/rules/web-prod-export.md`.
 *
 * Consequences of the split from the native `fonts.constant.ts`:
 * - `FONT_MAP` is **empty** — `useFonts({})` reports loaded immediately, so the
 *   render gate in `RootNavigator` never blocks the first web paint on fonts.
 * - `FONTS` values are **font stacks**, not single family names: the real family
 *   first, then the metric-override fallback family, then the base system font.
 *   react-native-web passes `fontFamily` through verbatim, so the browser uses
 *   the adjusted fallback until the WOFF2 arrives.
 */
export const FONT_MAP = {};

/** display / body / mono stacks — real family → metric-matched fallback → base.
 *  The fallback families + their overrides are defined in `+html.tsx`. */
export const FONTS: Fonts = {
  display: '"Archivo_800ExtraBold", "Archivo ExtraBold Fallback", Arial',
  body: '"HankenGrotesk_400Regular", "Hanken Grotesk Fallback", Arial',
  mono: '"SpaceMono_400Regular", "Space Mono Fallback", "Courier New"',
};
