import { Redirect } from "expo-router";

/**
 * Entry gate: everyone lands on the public browse. The artwork browse + detail
 * routes are open (SEO / shared links), so signed-out visitors go there too —
 * signing in is an explicit action (the "Sign in" entry in the header).
 *
 * The redirect target is auth-independent, so forward immediately without reading
 * `status` — waiting on it would re-introduce the get-session delay on the entry
 * route that the new `isHydrated` gate was made to remove.
 */
export default function Index() {
  return <Redirect href="/artworks" />;
}
