import { HeaderHeightContext } from "expo-router/build/react-navigation";
import { BottomTabBarHeightContext } from "expo-router/js-tabs";
import { use } from "react";
import type { ViewStyle } from "react-native";
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export type SafeHeight = {
  /** Height of the navigator header (falls back to the top inset). */
  headerHeight: number;
  /** Height of the bottom tab bar (falls back to the bottom inset). */
  tabBarHeight: number;
  /** The raw safe-area insets. */
  insets: EdgeInsets;
  /**
   * Content padding that clears the header and the bottom tab bar — pass to a
   * scroll view's `contentContainerStyle` so its content isn't tucked under the
   * navigation chrome.
   */
  contentPadding: Pick<ViewStyle, "paddingTop" | "paddingBottom">;
};

/**
 * Heights of the navigation chrome (header + bottom tab bar), so a screen can
 * offset absolutely-positioned overlays clear of them.
 *
 * - web: the react-navigation contexts provide the heights.
 * - native (NativeTabs): no context → the safe-area insets already reflect the
 *   status bar / UITabBar.
 */
export const useSafeHeight = (): SafeHeight => {
  const insets = useSafeAreaInsets();
  const headerHeight = use(HeaderHeightContext) ?? insets.top;
  const tabBarHeight = use(BottomTabBarHeightContext) ?? insets.bottom;
  return {
    headerHeight,
    tabBarHeight,
    insets,
    contentPadding: { paddingTop: headerHeight, paddingBottom: tabBarHeight },
  };
};
