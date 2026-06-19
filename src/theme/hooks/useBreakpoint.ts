import { useWindowDimensions } from "react-native";

/**
 * Width past which we switch from the stacked mobile layout to a desktop /
 * tablet split (e.g. hero | form side-by-side).
 */
export const WIDE_BREAKPOINT = 860;

/** Semantic responsive flags derived from the current window width. */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return { width, wide: width >= WIDE_BREAKPOINT };
}
