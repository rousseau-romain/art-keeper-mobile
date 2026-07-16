import { useWindowDimensions } from "react-native";
import { useIsHydrated } from "@/shared/hooks/useIsHydrated";

/**
 * Width past which we switch from the stacked mobile layout to a desktop /
 * tablet split (e.g. hero | form side-by-side).
 */
export const WIDE_BREAKPOINT = 860;

/** Semantic responsive flags derived from the current window width. */
export const useBreakpoint = () => {
  const { width } = useWindowDimensions();
  const hydrated = useIsHydrated();
  // On web the browser reports the real window width synchronously on the very
  // first render, but the server rendered with width 0 (→ narrow). Forcing narrow
  // until hydrated keeps the client's first render identical to the SSR HTML, so
  // hydration matches — otherwise every `wide`-driven branch (SplitRow's
  // flexDirection, the hero's sizing, the tab-bar ↔ WebHeader swap) mismatches.
  // The real width applies post-mount (a reflow — the accepted desktop CLS, since
  // there's no reliable server viewport). Native starts hydrated, reading the real
  // width immediately. See .claude/rules/web-ssr-hydration.md.
  const effectiveWidth = hydrated ? width : 0;
  return { width: effectiveWidth, wide: effectiveWidth >= WIDE_BREAKPOINT };
};
