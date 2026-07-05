import type { StyleSheet } from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import type { ThemeScheme } from "@/theme/enums/theme-mode.enums";
import { useTheme } from "@/theme/ThemeProvider";

type StyleFactory<T> = (c: Palette) => T;

// One sheet per factory per scheme, shared across every component instance —
// a factory is built at most twice (dark + light) for the app's lifetime.
const cache = new WeakMap<
  StyleFactory<unknown>,
  Partial<Record<ThemeScheme, unknown>>
>();

/**
 * Resolve a color-bearing StyleSheet factory against the active theme:
 *
 * ```ts
 * const styles = useThemeStyles(createStyles); // in the component
 * // bottom of file:
 * const createStyles = (c: Palette) =>
 *   StyleSheet.create({ screen: { flex: 1, backgroundColor: c.bg } });
 * ```
 *
 * A sheet with no color props doesn't need this — keep it a plain module-scope
 * `StyleSheet.create`.
 */
export const useThemeStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: StyleFactory<T>,
): T => {
  const { scheme, colors } = useTheme();
  let bucket = cache.get(factory);
  if (!bucket) {
    bucket = {};
    cache.set(factory, bucket);
  }
  const hit = bucket[scheme];
  if (hit) return hit as T;
  const created = factory(colors);
  bucket[scheme] = created;
  return created;
};
