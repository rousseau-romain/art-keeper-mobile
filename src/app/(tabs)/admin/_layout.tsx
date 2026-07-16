import { Redirect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { useAuth } from "@/lib/auth/AuthProvider";
import { formsheetOptions } from "@/shared/navigation/formsheet-options.constant";
import { HeaderRight } from "@/shared/navigation/header-right/HeaderRight";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Stack } from "@/shared/ui/stack/Stack";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

// The moderation stack hosts a form sheet (the location map), so seed `index`
// underneath — a direct load of `/admin/location` (web refresh, deep link) then
// rebuilds with the queue behind the sheet instead of a blank background.
export const unstable_settings = {
  initialRouteName: "index",
};

export default function AdminLayout() {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { wide } = useBreakpoint();
  const { status, isReviewer, isAdmin } = useAuth();

  // On desktop web the WebHeader (top brand nav) already covers navigation +
  // settings, so the per-page native header would be redundant — hide it there.
  // `wide` is hydration-safe (narrow until mounted, see useBreakpoint), so the
  // server + first client render agree the header is shown — toggling
  // `headerShown` is a structural branch that would mismatch otherwise — then it
  // hides post-mount.
  const webHeader = Platform.OS === "web" && wide;

  // Moderation is reviewer/admin-only. The tab is already hidden for everyone
  // else (`href: null` in `(tabs)/_layout`), but guard the route: signed-out →
  // Login, signed-in-without-role → back to the public browse.
  //
  // Hold during `loading`: the app now renders while get-session is in flight, so
  // redirecting on `status !== "authenticated"` would bounce an admin refreshing
  // here to Login before their session resolves. Wait until the status is known.
  if (status === "loading") return null;
  if (status !== "authenticated") return <Redirect href="/login" />;
  if (!isReviewer && !isAdmin) return <Redirect href="/artworks" />;

  return (
    <Stack
      screenOptions={{
        headerShown: !webHeader,
        headerRight: () => (
          <HeaderRight>
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
        options={{ title: tr("moderation.title.index") }}
      />
      <Stack.Screen
        name="location"
        options={{
          ...formsheetOptions,
          headerShown: false,
          headerRight: undefined,
          title: tr("moderation.title.location"),
        }}
      />
    </Stack>
  );
}
