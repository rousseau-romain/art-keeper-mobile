import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formsheetOptions } from "@/shared/navigation/formsheet-options.constant";
import { HeaderRight } from "@/shared/navigation/header-right/HeaderRight";
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
  const { status } = useAuth();

  // On desktop web the WebHeader (top brand nav) already covers navigation +
  // settings, so the per-page native header would be redundant — hide it there.
  const webHeader = Platform.OS === "web" && wide;

  return (
    <Stack
      screenOptions={{
        headerShown: !webHeader,
        // The settings entry point lives in the header right across the artwork
        // browsing area (Browse / detail / edit). On desktop it moves to the
        // WebHeader instead (the native header is hidden). Signed-out visitors
        // (the browse/detail are public) also get a Sign in entry here, since
        // there's no tab bar affordance to reach Login otherwise.
        headerRight: () => (
          <HeaderRight>
            {status !== "authenticated" && (
              <IconButton
                name="LogIn"
                onPress={() => router.push("/login")}
                accessibilityLabel={tr("a11y.signIn")}
              />
            )}
            <IconButton
              name="Settings"
              onPress={() => router.push("/settings")}
              accessibilityLabel={tr("a11y.settings")}
            />
          </HeaderRight>
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
      {/* The detail is public, but proposing an edit needs an account.
          `Stack.Protected` blocks deep links / web refreshes for signed-out
          visitors and redirects to the stack anchor (the public detail). */}
      <Stack.Protected guard={status === "authenticated"}>
        <Stack.Screen
          name="[slug]/edit"
          options={{ title: tr("artwork.title.edit") }}
        />
      </Stack.Protected>
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
