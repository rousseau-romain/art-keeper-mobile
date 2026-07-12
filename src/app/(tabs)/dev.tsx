import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { HapticsScreen } from "@/pages/app/dev/screens/HapticsScreen";

export default function Screen() {
  const { status } = useAuth();

  // Dev-only tooling. The tab is hidden outside `__DEV__`; also require an
  // account so the route isn't reachable by signed-out visitors via URL.
  if (status !== "authenticated") return <Redirect href="/login" />;

  return <HapticsScreen />;
}
