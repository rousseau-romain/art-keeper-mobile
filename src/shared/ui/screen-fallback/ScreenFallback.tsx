import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type ScreenFallbackProps = Record<string, never>;

/**
 * Full-screen themed spinner. Used as a `<Suspense>` fallback for a route whose
 * screen suspends (e.g. a detail screen reading Expo Router loader data during a
 * client-side navigation), so the transition shows the app background + a spinner
 * instead of a blank flash.
 */
export const ScreenFallback = () => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.screen}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.bg,
    },
  });
