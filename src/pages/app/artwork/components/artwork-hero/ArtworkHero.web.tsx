import type { CSSProperties } from "react";

export type ArtworkHeroProps = {
  imageUrl: string;
  /** Wide layout: the hero sits beside the meta, so it grows via `flex`. */
  wide?: boolean;
};

// Web renders a real <img> (not react-native-web's `Image`, which paints a
// `background-image` div — not LCP-eligible, can't take `fetchpriority`, and gets
// flagged as `loading=lazy`). `fetchPriority="high"` + `loading="eager"` make the
// hero a first-class LCP resource; it paints from the bytes already preloaded by
// the `Link: rel=preload` header the route's server `loader` emits.
//
// The `<figure>` is the semantic wrapper (see `src/shared/ui/seo/README.md`) —
// here a raw element, since this file is web-only and already emits raw DOM. It
// carries `display: contents` so it generates NO box: the `<img>` keeps its exact
// responsive styles (and stays the flex child of the `SplitRow` in wide mode) and
// its LCP eligibility, while the `<figure>` still lands in the HTML for crawlers.
export const ArtworkHero = ({ imageUrl, wide }: ArtworkHeroProps) => (
  <figure style={figureStyle}>
    <img
      src={imageUrl}
      alt=""
      fetchPriority="high"
      loading="eager"
      decoding="async"
      style={wide ? wideStyle : fullStyle}
    />
  </figure>
);

/** No box — purely a semantic wrapper; the `<img>` lays out as if unwrapped. */
const figureStyle: CSSProperties = { display: "contents" };

/** Cap the hero image height so tall portraits don't dominate the screen. */
const HERO_MAX_HEIGHT = 550;

const baseStyle: CSSProperties = {
  maxHeight: HERO_MAX_HEIGHT,
  objectFit: "contain",
};

// Stacked (mobile): full width, intrinsic ratio drives the height.
const fullStyle: CSSProperties = {
  ...baseStyle,
  width: "100%",
  height: "auto",
};

// Wide: claim a share of the row (matches the native `flex: 3`); `minWidth: 0`
// lets it shrink inside the flex row instead of overflowing.
const wideStyle: CSSProperties = {
  ...baseStyle,
  flex: 3,
  minWidth: 0,
};
