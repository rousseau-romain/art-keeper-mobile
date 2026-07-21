import { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";

export type ArtworkHeroProps = {
  imageUrl: string;
  /** Descriptive alt text — sets the image's accessibility label on native. */
  alt: string;
  /** Wide layout: the hero sits beside the meta, so it grows via `flex`. */
  isWide?: boolean;
};

export const ArtworkHero = ({ imageUrl, alt, isWide }: ArtworkHeroProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();

  useEffect(() => {
    let isActive = true;
    Image.getSize(imageUrl, (width, height) => {
      if (isActive && height > 0) setAspectRatio(width / height);
    });
    return () => {
      isActive = false;
    };
  }, [imageUrl]);

  return (
    <Image
      source={{ uri: imageUrl }}
      alt={alt}
      // Wide: `flex` claims a share of the row. Stacked (mobile): full width +
      // aspectRatio drives the height — `flex` here would collapse to 0 in the
      // scroll column and the image would vanish.
      style={[
        styles.hero,
        { aspectRatio },
        isWide ? styles.isWide : styles.full,
      ]}
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
  isWide: { flex: 3 },
  full: { width: "100%" },
});
