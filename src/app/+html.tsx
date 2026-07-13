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

// expo-router's web-modal stylesheet (the `EXPO_UNSTABLE_WEB_MODAL` overlay that
// backs `presentation: "formSheet" | "modal"` routes). Its CSS module is imported
// inside the *lazy* modal chunk, and — same bug as the Leaflet CSS above — Metro
// doesn't extract async-chunk CSS in the production web export, so it's never
// linked in `output: "server"`. Without it the drawer has no positioning
// (`position: static`) and renders off-screen below the fold: the filter sheet
// "doesn't open" in prod while working in dev (where Metro injects it at runtime).
//
// Verbatim copy of `node_modules/expo-router/assets/modal.module.css` as emitted
// by the build (`dist/.../css/modal.module-*.css`). The `fApBhq_` prefix is the
// CSS-module class hash — deterministic for a given expo-router version (verified
// identical in the staging and local bundles), so it matches the class names the
// modal JS references. RE-SYNC THIS after an expo SDK / expo-router upgrade if the
// web filter sheet renders off-screen again (the hash changes with the file).
const modalCss = `.fApBhq_modal{pointer-events:auto;border:var(--expo-router-modal-border,none);box-sizing:border-box;will-change:transform;flex-direction:column;flex:1;display:flex;overflow:auto}.fApBhq_overlay{background-color:var(--expo-router-modal-overlay-background,#00000040);position:fixed;inset:0}@media (width>=768px){.fApBhq_modal{z-index:50;width:var(--expo-router-modal-width,83vw);min-width:var(--expo-router-modal-min-width,auto);max-width:var(--expo-router-modal-max-width,min(936px,83vw));height:var(--expo-router-modal-height,79dvh);max-height:min(var(--expo-router-modal-height,min(586px,79dvh)),calc(100dvh - 2rem));min-height:min(var(--expo-router-modal-min-height,var(--expo-router-modal-height,min(586px,79dvh))),calc(100dvh - 2rem));filter:var(--expo-router-modal-shadow,drop-shadow(0 10px 8px #0000000a)drop-shadow(0 4px 3px #0000001a));outline:none;position:relative;overflow:auto}.fApBhq_modalWrap>.fApBhq_modal{pointer-events:auto}}.fApBhq_drawerContent{outline:none;flex-direction:column;height:100%;display:flex;position:fixed;bottom:0;left:0;right:0}body>.fApBhq_transparentDrawerContent{outline:none;flex-direction:column;height:100%;animation:none;display:flex;position:fixed;bottom:0;left:0;right:0}@media (width>=768px){.fApBhq_drawerContent{pointer-events:box-none;max-height:100%}}.fApBhq_modal::-webkit-scrollbar{width:0;height:0}.fApBhq_modal::-webkit-scrollbar-thumb{background:0 0}.fApBhq_modalBody{box-sizing:border-box;flex:1;display:flex;overflow:auto}.fApBhq_drawerContent .fApBhq_modal[data-presentation=formSheet],.fApBhq_drawerContent .fApBhq_modal[data-presentation=containedModal]{box-shadow:none;filter:none;border-radius:inherit;width:100%;max-width:none;min-height:auto;max-height:none;position:relative;transform:none}.fApBhq_drawerContent .fApBhq_modal[data-presentation=modal],.fApBhq_drawerContent .fApBhq_modal[data-presentation=fullScreenModal]{width:var(--expo-router-modal-width,83vw);min-width:var(--expo-router-modal-min-width,auto);max-width:var(--expo-router-modal-max-width,min(936px,83vw));filter:var(--expo-router-modal-shadow,drop-shadow(0px 25px 50px #0000004d));border-radius:var(--expo-router-modal-border-radius,24px);margin:0;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)}.fApBhq_srOnly{display:none}`;

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
        {/* Web-modal positioning CSS that Metro drops from the prod export — see
            the `modalCss` note above. Without it the filter sheet renders
            off-screen. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: build-time constant, no user input */}
        <style dangerouslySetInnerHTML={{ __html: modalCss }} />
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
