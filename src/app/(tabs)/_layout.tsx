import { Redirect, Tabs } from "expo-router";
import { Map as MapIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { useAuth } from "@/lib/auth/AuthProvider";
import { FONT_SIZE, useTheme } from "@/theme";

export default function TabsLayout() {
  const { t, fonts } = useTheme();
  const { t: tr } = useTranslation();
  const { status } = useAuth();

  // Auth guard: a sign-out (or expired/invalidated session) flips status to
  // "unauthenticated" while the user is deep in the tab stack — bounce them
  // back to Login instead of stranding them on a session-less screen.
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.inkMute,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: t.surface, borderTopColor: t.hair },
        ],
        tabBarLabelStyle: [styles.tabLabel, { fontFamily: fonts.mono }],
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: tr("browse.title"),
          tabBarIcon: ({ color, size }) => (
            <MapIcon size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { borderTopWidth: 1.5 },
  tabLabel: { fontSize: FONT_SIZE.xs },
});
