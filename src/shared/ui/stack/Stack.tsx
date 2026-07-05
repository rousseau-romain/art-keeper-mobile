import { Stack as ExpoStack } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import { FONTS } from "@/theme/fonts.constant";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type StackProps = ComponentProps<typeof ExpoStack>;

/**
 * Expo Router's `Stack` preset with the app's default chrome — surface header,
 * accent tint, display-font title, and bg content. Pass `screenOptions` to
 * extend or override the defaults per navigator; `Stack.Screen` is re-exposed
 * unchanged so callers keep the usual `<Stack><Stack.Screen … /></Stack>` shape.
 */
export const Stack = ({ screenOptions, ...rest }: StackProps) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <ExpoStack
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: colors.primary,
        headerTitleStyle: styles.headerTitle,
        contentStyle: styles.content,
        ...screenOptions,
      }}
      {...rest}
    />
  );
};

Stack.Screen = ExpoStack.Screen;

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: { backgroundColor: c.surface },
    headerTitle: { fontFamily: FONTS.display, color: c.text },
    content: { backgroundColor: c.bg },
  });
