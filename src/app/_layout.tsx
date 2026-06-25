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
import { queryClient } from "@/lib/query";
import { ColorEnum } from "@/theme/enums/color.enums";
import { useAppFonts } from "@/theme/hooks/useAppFonts";

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

  const ready = (fontsLoaded || !!fontError) && status !== "loading";

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={staticStyles.screen} />;

  return (
    <View style={staticStyles.screen}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: staticStyles.bg,
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

const staticStyles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  bg: { backgroundColor: ColorEnum.bg },
});
