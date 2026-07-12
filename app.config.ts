import type { ConfigContext, ExpoConfig } from "expo/config";

// Hosted web URL for Expo Head (SEO `og:url` resolution + native Handoff). No
// production domain yet, so it's env-driven — set EXPO_PUBLIC_WEB_ORIGIN per
// environment; falls back to the Metro web origin for local dev. Changing it is
// a native config change, so it requires a rebuild (`npx expo prebuild`).
const WEB_ORIGIN =
  process.env.EXPO_PUBLIC_WEB_ORIGIN ?? "http://localhost:8081";

// Dynamic config that extends app.json (received as `config`) — everything stays
// in app.json except the `expo-router` plugin, which we replace with its
// configured form so Expo Head has an `origin` and request-time SSR is enabled.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    // `unstable_useServerRendering` renders HTML (and route `generateMetadata`)
    // at request time instead of at build time — required so the dynamic
    // `artworks/[slug]` detail route can resolve its SEO/Open Graph tags from
    // the live artwork. Pairs with `web.output: "server"` in app.json.
    ["expo-router", { origin: WEB_ORIGIN, unstable_useServerRendering: true }],
    ...(config.plugins ?? []).filter(
      (plugin) =>
        plugin !== "expo-router" &&
        !(Array.isArray(plugin) && plugin[0] === "expo-router"),
    ),
  ],
});
