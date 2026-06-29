import type { NativeStackNavigationOptions } from "expo-router";

/**
 * Shared options for every screen in the `(formsheet)` group: present it as an
 * iOS form sheet that sizes itself to its content. Lives outside `src/app/` so
 * Expo Router doesn't treat it as a route. `NativeStackNavigationOptions` comes
 * from `expo-router` (v56 vendors react-navigation's native stack — there is no
 * `@react-navigation/native-stack` dependency to import from).
 */
export const formsheetOptions: NativeStackNavigationOptions = {
  presentation: "formSheet",
  sheetAllowedDetents: "fitToContents",
};
