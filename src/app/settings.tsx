import type { GenerateMetadataFunction } from "expo-router/server";

import { serverT } from "@/lib/i18n/server";
import { SettingsScreen } from "@/pages/app/settings/screens/SettingsScreen";

// Reachable signed-out (it's not behind a guard — theme/language work for
// everyone), so it still needs a real <title> instead of the app-wide default.
// It's a private preferences panel, though: `noindex, nofollow` (the policy for
// anything account-scoped), and no canonical — nothing to consolidate onto.
export const generateMetadata: GenerateMetadataFunction = async (request) => {
  const t = serverT(request.headers.get("accept-language"));

  return {
    title: t("settings.title.index"),
    robots: { index: false, follow: false },
  };
};

export default function Screen() {
  return <SettingsScreen />;
}
