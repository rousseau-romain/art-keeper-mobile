import type { GenerateMetadataFunction } from "expo-router/server";

import { serverT } from "@/lib/i18n/server";
import { LoginScreen } from "@/pages/app/auth/screens/LoginScreen";

// Reachable by a crawler (the guest-only guard is client-side), so it needs its
// own <title> — but a sign-in form is not content: `noindex, nofollow`, the
// standard policy for an auth entry point. The `description` still serves the
// browser tab and any link preview when someone shares the URL directly.
//
// No canonical: it would say "index this one", contradicting the noindex.
export const generateMetadata: GenerateMetadataFunction = async (request) => {
  const t = serverT(request.headers.get("accept-language"));

  return {
    title: t("auth.title.login"),
    description: t("auth.tagline"),
    robots: { index: false, follow: false },
  };
};

export default function Screen() {
  return <LoginScreen />;
}
