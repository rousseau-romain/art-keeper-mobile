import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { queryClient } from "@/lib/query";
import { useAppFonts, useTheme } from "@/theme";

if (__DEV__) {
  // Conditional require (not a static import) so Reactotron and its deps are
  // never pulled into a production bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/lib/reactotron");
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={staticStyles.fill}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <AuthProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { status } = useAuth();
  const { t } = useTheme();

  const ready = (fontsLoaded || !!fontError) && status !== "loading";

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready)
    return <View style={[staticStyles.fill, { backgroundColor: t.bg }]} />;

  return (
    <View style={[staticStyles.fill, { backgroundColor: t.bg }]}>
      {/* The single theme is dark, so status-bar content is always light. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

const staticStyles = StyleSheet.create({ fill: { flex: 1 } });
