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
        headerTransparent: true,
        // `headerTransparent` only floats the header over the content — on iOS it
        // does NOT make the UINavigationBar itself transparent. react-native-screens
        // only calls `configureWithTransparentBackground` when `headerStyle`'s
        // backgroundColor has alpha 0 (RNSScreenStackHeaderConfig.mm); otherwise it
        // uses `configureWithOpaqueBackground`, which renders the default white/blur
        // gradient. So the transparent bg here is what actually removes it.
        headerStyle: styles.header,
        headerTintColor: colors.primary,
        headerTitleStyle: styles.headerTitle,
        // Renders exactly like upstream's, minus the `<h1>` it forces on web —
        // see StackHeaderTitle. Set here so every navigator in the app inherits it,
        // keeping navigator chrome out of the document outline (a detail screen's
        // header title would otherwise be a second <h1> beside the body's real one).
        headerTitle: (props) => <StackHeaderTitle {...props} />,
        // `headerTransparent` floats the header over the content, so the body
        // starts at y=0 (under the notch). Screens apply their own top safe-area
        // inset — so a screen with an edge-to-edge hero (the artwork detail) can
        // opt out — rather than a blanket `paddingTop` here.
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
    // alpha-0 bg → RNScreens configures the iOS nav bar transparent (no gradient).
    header: { backgroundColor: c.transparent },
    headerTitle: { fontFamily: FONTS.display, color: c.text },
    content: { backgroundColor: c.bg },
  });
