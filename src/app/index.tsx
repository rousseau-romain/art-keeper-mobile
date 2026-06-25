import { Redirect } from "expo-router";

import { useAuth } from "@/lib/auth/AuthProvider";

/** Session gate: route to the app when authenticated, else to Login. */
export default function Index() {
  const { status } = useAuth();
  if (status === "loading") return null; // splash still showing
  return (
    <Redirect href={status === "authenticated" ? "/artworks" : "/login"} />
  );
}
