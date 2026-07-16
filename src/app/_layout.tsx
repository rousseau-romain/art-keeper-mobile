import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/shared/ui/toast/Toast";
// Side-effect import: configures the generated API client (base URL +
// auth/Origin/Accept-Language/error interceptors) before any request runs.
import "@/lib/api/client";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getQueryClient } from "@/lib/query";
import { LockScreen } from "@/pages/app/auth/screens/LockScreen";
import type { Palette } from "@/theme/enums/color.enums";
import { useAppFonts } from "@/theme/hooks/useAppFonts";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

if (__DEV__ && Platform.OS !== "web") {
  // Conditional require (not a static import) so Reactotron and its deps are
  // never pulled into a production bundle. Skipped on web: reactotron-react-native
  // deep-imports react-native internals (getDevServer, NativeExceptionsManager,
  // LogBox…) that have no react-native-web equivalent, so loading it on web throws
  // "__fbBatchedBridgeConfig is not set". Reactotron is a native-only debugger.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/lib/reactotron");
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Per-request on the web server, memoized singleton in the browser / on native.
  const queryClient = getQueryClient();
  return (
    <GestureHandlerRootView style={staticStyles.fill}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider>
                  <RootNavigator />
                </ToastProvider>
              </AuthProvider>
            </I18nProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { status, hydrated, locked } = useAuth();
  const { scheme } = useTheme();
  const styles = useThemeStyles(createStyles);

  // Status-bar glyphs must contrast with the themed background.
  const barStyle = scheme === "dark" ? "light" : "dark";

  // Gate on the local token hydration, NOT on `status` — waiting for `status`
  // meant waiting for the `get-session` network round-trip before rendering
  // anything, even the public artwork detail. `hydrated` is synchronous on web
  // (localStorage) and a fast keychain read on native, so public content (and
  // its LCP hero image) paints as soon as fonts + the token are ready; the
  // session resolves in the background and personalizes afterwards.
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={styles.screen} />;

  // Biometric gate: `locked` is decided at hydration (a stored token + the opt-in
  // + enrolled biometrics) — independent of the session query — so the Lock screen
  // shows immediately, before get-session resolves. The session loads behind it,
  // ready the moment they unlock. (Web is never locked: biometrics are native-only.)
  if (locked) {
    return (
      <View style={styles.screen}>
        <StatusBar style={barStyle} />
        <LockScreen />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style={barStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.bg,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        {/* Guest-only: once authenticated, login is unnavigable and Expo Router
            redirects to the anchor (index → /artworks). */}
        <Stack.Protected guard={status !== "authenticated"}>
          <Stack.Screen name="(auth)/login" />
        </Stack.Protected>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

const staticStyles = StyleSheet.create({
  fill: { flex: 1 },
});

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    bg: { backgroundColor: c.bg },
  });
