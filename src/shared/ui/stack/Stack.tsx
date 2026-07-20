import { Stack as ExpoStack } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { StackHeaderTitle } from "@/shared/ui/stack-header-title/StackHeaderTitle";
import type { Palette } from "@/theme/enums/color.enums";
import { FONTS } from "@/theme/fonts.constant";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type StackProps = ComponentProps<typeof ExpoStack>;

/**
 * Expo Router's `Stack` preset with the app's default chrome — surface header,
 * accent tint, display-font title, and bg content. Pass `screenOptions` to
 * extend or override the defaults per navigator; `Stack.Screen` and
 * `Stack.Protected` are re-exposed unchanged so callers keep the usual
 * `<Stack><Stack.Screen … /></Stack>` shape (and can guard routes with
 * `<Stack.Protected guard={…}>`).
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
        // Renders exactly like upstream's, minus the `<h1>` it forces on web —
        // see StackHeaderTitle. Set here so every navigator in the app inherits it.
        headerTitle: (props) => <StackHeaderTitle {...props} />,
        contentStyle: styles.content,
        ...screenOptions,
      }}
      {...rest}
    />
  );
};

Stack.Screen = ExpoStack.Screen;
Stack.Protected = ExpoStack.Protected;

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: { backgroundColor: c.surface },
    headerTitle: { fontFamily: FONTS.display, color: c.text },
    content: { backgroundColor: c.bg },
  });
