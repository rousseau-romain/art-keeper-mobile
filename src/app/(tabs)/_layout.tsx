import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
import {
  Map as MapIcon,
  Plus as PlusIcon,
  Vibrate as VibrateIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ColorEnum } from "@/theme/enums/color.enums";
import { ControlHeightEnum, FontSizeEnum } from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";

export default function TabsLayout() {
  const { t: tr } = useTranslation();
  const { status } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Auth guard: a sign-out (or expired/invalidated session) flips status to
  // "unauthenticated" while the user is deep in the tab stack — bounce them
  // back to Login instead of stranding them on a session-less screen.
  if (status !== "authenticated") return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ColorEnum.accent,
        tabBarInactiveTintColor: ColorEnum.inkMute,
        tabBarStyle: [
          styles.tabBar,
          Platform.OS === "web" && {
            height: ControlHeightEnum.lg + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="artworks"
        options={{
          title: tr("artwork.tab"),
          tabBarIcon: ({ color, size }) => (
            <MapIcon size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-artwork"
        options={{
          title: tr("artwork.createTab"),
          tabBarIcon: ({ color, size }) => (
            <PlusIcon size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="dev"
        options={{
          // Dev-only tooling — `href: null` hides the tab (and its route) from
          // production builds, leaving it reachable only in development.
          href: __DEV__ ? undefined : null,
          title: tr("dev.tab"),
          tabBarIcon: ({ color, size }) => (
            <VibrateIcon size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1.5,
    backgroundColor: ColorEnum.surface,
    borderTopColor: ColorEnum.hair,
  },
  tabLabel: { fontSize: FontSizeEnum.xs, fontFamily: FONTS.mono },
});
