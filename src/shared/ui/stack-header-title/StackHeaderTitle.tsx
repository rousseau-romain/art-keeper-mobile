import { HeaderTitle } from "expo-router/build/react-navigation/elements/Header/HeaderTitle";
import type { ComponentProps } from "react";
import { Platform } from "react-native";

export type StackHeaderTitleProps = ComponentProps<typeof HeaderTitle>;

/**
 * The navigator's header title, stripped of its heading semantics **on web**.
 *
 * expo-router's `HeaderTitle` hardcodes `role="heading" aria-level="1"`, which
 * react-native-web maps to a real `<h1>`. That puts navigator *chrome* into the
 * document outline — and because a stack seeds its anchor screen behind a deep
 * link (`unstable_settings.initialRouteName`, see `ssr-loader-anchor.md`), an
 * artwork page shipped **three** `<h1>`s in its SSR HTML: the seeded browse
 * header, the detail header, and the only real one (the artwork title, from
 * `ArtworkMeta`). Crawlers read that outline, so the page's actual H1 sat third,
 * behind the title of a screen the visitor never sees.
 *
 * `HeaderTitle` spreads `...rest` *after* its own attributes, so passing these
 * through overrides them. Native keeps the heading role: it's correct a11y there
 * and there's no document outline to pollute.
 *
 * The import is an expo-router **internal** path (it isn't re-exported from the
 * package root) — deliberate, so the header keeps upstream's exact per-platform
 * font sizing instead of us duplicating values that aren't in `FontSizeEnum`.
 * An SDK bump that moves the file breaks the build loudly; re-point it then.
 */
export const StackHeaderTitle = (props: StackHeaderTitleProps) => (
  <HeaderTitle
    {...props}
    role={Platform.OS === "web" ? undefined : "heading"}
    aria-level={Platform.OS === "web" ? undefined : 1}
  />
);
