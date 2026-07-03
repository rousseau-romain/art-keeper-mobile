import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { formsheetOptions } from "@/shared/navigation/formsheet-options.constant";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Stack } from "@/shared/ui/stack/Stack";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function ArtworksLayout() {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { wide } = useBreakpoint();

  // On desktop web the WebHeader (top brand nav) already covers navigation +
  // settings, so the per-page native header would be redundant — hide it there.
  const webHeader = Platform.OS === "web" && wide;

  return (
    <Stack
      screenOptions={{
        headerShown: !webHeader,
        // The settings entry point lives in the header right across the artwork
        // browsing area (Browse / detail / edit). On desktop it moves to the
        // WebHeader instead (the native header is hidden).
        headerRight: () => (
          <IconButton
            name="Settings"
            onPress={() => router.push("/settings")}
            accessibilityLabel={tr("a11y.settings")}
          />
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: tr("artwork.title.index") }}
      />
      <Stack.Screen
        name="[slug]/index"
        options={{ title: tr("artwork.title.detail") }}
      />
      <Stack.Screen
        name="[slug]/edit"
        options={{ title: tr("artwork.title.edit") }}
      />
      <Stack.Screen
        name="filters"
        options={{
          ...formsheetOptions,
          headerShown: false,
          headerRight: undefined,
        }}
      />
    </Stack>
  );
}
