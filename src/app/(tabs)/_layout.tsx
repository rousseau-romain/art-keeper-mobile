import { Redirect, Tabs } from "expo-router";
import { Map as MapIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";

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
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.hair,
          borderTopWidth: t.borderWeight,
        },
        tabBarLabelStyle: { fontFamily: fonts.mono, fontSize: FONT_SIZE.xs },
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
