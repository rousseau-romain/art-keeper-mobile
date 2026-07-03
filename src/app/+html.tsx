import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

import { ColorEnum } from "@/theme/enums/color.enums";

/**
 * Web-only root HTML shell (Expo Router, static output). Declares a dark
 * `color-scheme` so the browser renders native form controls — e.g. the
 * tag-source `<select>` and scrollbars — in dark to match the app's single dark
 * theme, and paints the body background so there's no white flash before React
 * mounts. Native (iOS/Android) is handled by `userInterfaceStyle: "dark"` in
 * app.json.
 */
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
        <meta name="color-scheme" content="dark" />
        {/* Keeps `position: fixed` / `100vh` scrolling correct with static web output. */}
        <ScrollViewStyleReset />
      </head>
      {/* Paint the background before React mounts so there's no white flash. */}
      <body style={{ backgroundColor: ColorEnum.bg }}>{children}</body>
    </html>
  );
}
