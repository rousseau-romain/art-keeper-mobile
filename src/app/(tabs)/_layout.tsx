import { Tabs } from "expo-router";
import {
  Map as MapIcon,
  Plus as PlusIcon,
  Shield as ShieldIcon,
  Vibrate as VibrateIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth/AuthProvider";
import { WebHeader } from "@/shared/navigation/web-header/WebHeader";
import type { Palette } from "@/theme/enums/color.enums";
import { ControlHeightEnum, FontSizeEnum } from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { t: tr } = useTranslation();
  const { status, isReviewer, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const { wide } = useBreakpoint();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  // Desktop web swaps the bottom tab bar for a top brand header; native and
  // narrow / mobile web keep the default bottom bar. `wide` is hydration-safe
  // (narrow until mounted, see useBreakpoint), so the server + first client
  // render agree on the bottom bar — the swap is a structural (element-type)
  // branch that would throw a hydration mismatch otherwise — then flip to the
  // WebHeader post-mount.
  const webHeader = Platform.OS === "web" && wide;

  // No blanket auth guard here: the `artworks` browse + detail routes are public
  // (SEO / shared links). `create-artwork` is gated below with `Tabs.Protected`
  // (unregistered → tab hidden + route unreachable for signed-out visitors, and
  // the history is purged if they sign out mid-wizard). `admin` / `dev` still use
  // the `href: null` pattern (role- / dev-gated), and `artworks/[slug]/edit`
  // guards itself in the artworks Stack layout.

  return (
    <Tabs
      tabBar={webHeader ? (props) => <WebHeader {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: webHeader ? "top" : "bottom",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
      {/* Submitting a piece needs an account. `Tabs.Protected` unregisters the
          route when signed out — hiding the tab and blocking deep links — and
          purges its history if the user signs out mid-wizard, redirecting to the
          anchor (the public browse) rather than to Login. Guard on
          `!== "unauthenticated"` (not `=== "authenticated"`) so the brief
          `loading` window — the app now renders during get-session instead of
          blocking on it — doesn't unregister the route under an authenticated
          user refreshing here; it stays registered until we KNOW they're signed out. */}
      <Tabs.Protected guard={status !== "unauthenticated"}>
        <Tabs.Screen
          name="create-artwork"
          options={{
            title: tr("artwork.createTab"),
            tabBarIcon: ({ color, size }) => (
              <PlusIcon size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="admin"
        options={{
          // Reviewer/admin-only moderation queue — `href: null` hides the tab
          // (and its route) from everyone else, mirroring the dev-tab pattern.
          href: isReviewer || isAdmin ? undefined : null,
          title: tr("moderation.tab"),
          tabBarIcon: ({ color, size }) => (
            <ShieldIcon size={size} color={color} strokeWidth={1.8} />
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

const createStyles = (c: Palette) =>
  StyleSheet.create({
    tabBar: {
      borderTopWidth: 1.5,
      backgroundColor: c.surface,
      borderTopColor: c.borderSoft,
    },
    tabLabel: { fontSize: FontSizeEnum.xs, fontFamily: FONTS.mono },
  });
