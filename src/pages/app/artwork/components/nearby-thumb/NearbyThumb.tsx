import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Side of the square nearby thumbnail. */
const THUMB_SIZE = 72;

export type NearbyThumbProps = {
  artwork: Artwork;
};

/** A small square thumbnail linking to a nearby artwork's detail. */
export const NearbyThumb = ({ artwork }: NearbyThumbProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);
  return (
    <Link
      href={{ pathname: "/artworks/[slug]", params: { slug: artwork.slug } }}
      asChild
    >
      <Pressable
        style={styles.thumb}
        accessibilityLabel={tr("a11y.selectArtwork", { title: artwork.title })}
      >
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>
    </Link>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: RadiusEnum.sm,
      borderWidth: 1.5,
      overflow: "hidden",
      backgroundColor: c.surface2,
      borderColor: c.borderSoft,
    },
    image: { width: "100%", height: "100%" },
  });
