import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTheme } from "@/theme/ThemeProvider";

// Native (iOS + Android) renders the real platform tab bar via NativeTabs — a
// UIKit tab bar on iOS, a Material bottom navigation on Android. Web keeps the
// JS `_layout.tsx` (with its desktop WebHeader). The tab set mirrors that JS
// layout one-for-one — same routes, same order, same visibility rules. Each
// icon carries both an SF Symbol (`sf`, iOS) and a Material glyph (`md`,
// Android), standing in for the lucide glyphs used on web: Map→map,
// SprayCan→paintbrush.pointed/brush, Plus→plus/add, Shield→shield,
// Vibrate→waveform/graphic_eq. Native has no `href: null`, so hidden tabs use
// the `hidden` prop; `create-artwork` stays gated by `Tabs.Protected`.
export default function TabsLayout() {
  const { t: tr } = useTranslation();
  const { status, isReviewer, isAdmin } = useAuth();
  const { colors } = useTheme();
  return (
    <NativeTabs
      disableTransparentOnScrollEdge={true}
      blurEffect="prominent"
      tintColor={colors.primary}
      rippleColor={colors.primary}
      tabBarRespectsIMEInsets
    >
      <NativeTabs.Trigger name="artworks" role="search">
        <NativeTabs.Trigger.Label>{tr("artwork.tab")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="artists">
        <NativeTabs.Trigger.Label>{tr("artist.tab")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="paintbrush.pointed" md="brush" />
      </NativeTabs.Trigger>

      {/* Submitting a piece needs an account — unregistered when signed out. */}
      <Tabs.Protected guard={status !== "unauthenticated"}>
        <NativeTabs.Trigger name="create-artwork">
          <NativeTabs.Trigger.Label>
            {tr("artwork.createTab")}
          </NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus" md="add" />
        </NativeTabs.Trigger>
      </Tabs.Protected>

      {/* Reviewer/admin-only moderation queue — hidden from everyone else. */}
      <NativeTabs.Trigger name="admin" hidden={!(isReviewer || isAdmin)}>
        <NativeTabs.Trigger.Label>
          {tr("moderation.tab")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="shield" md="shield" />
      </NativeTabs.Trigger>

      {/* Dev-only tooling — hidden in production builds. */}
      <NativeTabs.Trigger name="dev" hidden={!__DEV__}>
        <NativeTabs.Trigger.Label>{tr("dev.tab")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform" md="graphic_eq" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
