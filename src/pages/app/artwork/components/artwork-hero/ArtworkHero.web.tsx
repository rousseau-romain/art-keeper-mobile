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
export const ArtworkHero = ({ imageUrl, wide }: ArtworkHeroProps) => (
  <img
    src={imageUrl}
    alt=""
    fetchPriority="high"
    loading="eager"
    decoding="async"
    style={wide ? wideStyle : fullStyle}
  />
);

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
