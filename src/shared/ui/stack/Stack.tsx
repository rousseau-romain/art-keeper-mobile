import { Stack as ExpoStack } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { ColorEnum } from "@/theme/enums/color.enums";
import { FONTS } from "@/theme/fonts.constant";

export type StackProps = ComponentProps<typeof ExpoStack>;

/**
 * Expo Router's `Stack` preset with the app's default chrome — surface header,
 * accent tint, display-font title, and bg content. Pass `screenOptions` to
 * extend or override the defaults per navigator; `Stack.Screen` is re-exposed
 * unchanged so callers keep the usual `<Stack><Stack.Screen … /></Stack>` shape.
 */
export const Stack = ({ screenOptions, ...rest }: StackProps) => (
  <ExpoStack
    screenOptions={{
      headerStyle: styles.header,
      headerTintColor: ColorEnum.primary,
      headerTitleStyle: styles.headerTitle,
      contentStyle: styles.content,
      ...screenOptions,
    }}
    {...rest}
  />
);

Stack.Screen = ExpoStack.Screen;

const styles = StyleSheet.create({
  header: { backgroundColor: ColorEnum.surface },
  headerTitle: { fontFamily: FONTS.display, color: ColorEnum.text },
  content: { backgroundColor: ColorEnum.bg },
});
