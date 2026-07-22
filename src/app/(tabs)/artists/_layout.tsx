import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useAuth } from "@/lib/auth/AuthProvider";
import { HeaderRight } from "@/shared/navigation/header-right/HeaderRight";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Stack } from "@/shared/ui/stack/Stack";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

export default function ArtistsLayout() {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { wide } = useBreakpoint();
  const { status } = useAuth();

  // On desktop web the WebHeader (top brand nav) already covers navigation +
  // settings, so the per-page native header would be redundant — hide it there.
  // `wide` is hydration-safe (narrow until mounted), so server + first client
  // render agree the header is shown before it hides post-mount.
  const webHeader = Platform.OS === "web" && wide;

  return (
    <Stack
      screenOptions={{
        headerShown: !webHeader,
        // The profile is public; mirror the artworks stack's header-right entry
        // points (Sign in for signed-out visitors + Settings).
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
        name="[slug]/index"
        options={{ title: tr("artist.title.detail") }}
      />
    </Stack>
  );
}
