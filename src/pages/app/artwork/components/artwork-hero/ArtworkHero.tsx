import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export type ArtworkHeroProps = {
  imageUrl: string;
  /** Descriptive alt text — sets the image's accessibility label on native. */
  alt: string;

  isWide: boolean;
};

export const ArtworkHero = ({ imageUrl, alt, isWide }: ArtworkHeroProps) => {
  return (
    <Image
      source={{ uri: imageUrl }}
      alt={alt}
      style={[styles.image, isWide ? { flex: 3 } : null]}
      contentFit="contain"
      transition={200}
    />
  );
};
/** Cap the hero image height so tall portraits don't dominate the screen. */
const HERO_MAX_HEIGHT = 550;

const styles = StyleSheet.create({
  image: { aspectRatio: 3 / 2, maxHeight: HERO_MAX_HEIGHT },
});
