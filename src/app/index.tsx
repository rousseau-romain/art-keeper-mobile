import { Redirect } from "expo-router";

import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Entry gate: everyone lands on the public browse. The artwork browse + detail
 * routes are open (SEO / shared links), so signed-out visitors go there too —
 * signing in is an explicit action (the "Sign in" entry in the header).
 */
export default function Index() {
  const { status } = useAuth();
  if (status === "loading") return null; // splash still showing
  return <Redirect href="/artworks" />;
}
