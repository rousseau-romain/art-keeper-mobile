import { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";

export type ArtworkHeroProps = {
  imageUrl: string;
  /** Wide layout: the hero sits beside the meta, so it grows via `flex`. */
  wide?: boolean;
};

export const ArtworkHero = ({ imageUrl, wide }: ArtworkHeroProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();

  useEffect(() => {
    let active = true;
    Image.getSize(imageUrl, (width, height) => {
      if (active && height > 0) setAspectRatio(width / height);
    });
    return () => {
      active = false;
    };
  }, [imageUrl]);

  return (
    <Image
      source={{ uri: imageUrl }}
      // Wide: `flex` claims a share of the row. Stacked (mobile): full width +
      // aspectRatio drives the height — `flex` here would collapse to 0 in the
      // scroll column and the image would vanish.
      style={[styles.hero, { aspectRatio }, wide ? styles.wide : styles.full]}
      resizeMode="contain"
    />
  );
};

/** Cap the hero image height so tall portraits don't dominate the screen. */
const HERO_MAX_HEIGHT = 550;

const styles = StyleSheet.create({
  hero: {
    maxHeight: HERO_MAX_HEIGHT,
  },
  wide: { flex: 3 },
  full: { width: "100%" },
});
