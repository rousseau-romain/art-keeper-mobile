import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

import { DarkColorEnum, LightColorEnum } from "@/theme/enums/color.enums";
import { THEME_MODE_STORAGE_KEY } from "@/theme/theme.constant";

/**
 * Web-only root HTML shell (Expo Router, static output). Paints the background
 * and sets the browser `color-scheme` (native form controls, scrollbars) before
 * React mounts, honoring the persisted theme mode so a manual override doesn't
 * flash the wrong theme. Dark is the default (no stored choice); "auto" follows
 * `prefers-color-scheme`. Native (iOS/Android) is handled by
 * `userInterfaceStyle: "automatic"` in app.json + ThemeProvider.
 */

// The stored mode is applied as `data-theme` on <html> by the blocking script
// below, before first paint. Unset/unknown falls back to dark (the default).
const themeCss = `
:root { color-scheme: dark; }
body { background-color: ${DarkColorEnum.bg}; }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="light"] body { background-color: ${LightColorEnum.bg}; }
@media (prefers-color-scheme: light) {
  :root[data-theme="auto"] { color-scheme: light; }
  :root[data-theme="auto"] body { background-color: ${LightColorEnum.bg}; }
}
`;

// AsyncStorage's web backend is localStorage with the raw key, so the persisted
// mode is readable synchronously here.
const themeScript = `
try {
  document.documentElement.dataset.theme =
    localStorage.getItem(${JSON.stringify(THEME_MODE_STORAGE_KEY)}) || "dark";
} catch (e) {}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="color-scheme" content="dark light" />
        {/* Leaflet's layout CSS, loaded globally here rather than via the
            `import "leaflet/dist/leaflet.css"` inside the lazy map chunks: Metro
            doesn't reliably extract async-chunk CSS in the production web export,
            so without this the tiles scatter (works in dev, breaks in prod).
            Pinned to the installed leaflet version. */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time constants, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time constants, no user input */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* Keeps `position: fixed` / `100vh` scrolling correct with static web output. */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
