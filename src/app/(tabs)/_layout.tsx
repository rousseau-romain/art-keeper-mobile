import { Redirect, Tabs } from "expo-router";
import { Map as MapIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { useAuth } from "@/lib/auth/AuthProvider";
import { ColorEnum } from "@/theme/enums/color.enums";
import { FontSizeEnum } from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";

export default function TabsLayout() {
  const { t: tr } = useTranslation();
  const { status } = useAuth();

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
        tabBarStyle: styles.tabBar,
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
