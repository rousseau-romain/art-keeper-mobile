import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type MapThumbProps = {
  artwork: Artwork;
  /** Highlighted (its pin is selected on the map). */
  isActive: boolean;
};

/**
 * One artwork thumbnail on the map — both in the bottom "pieces in view" strip
 * and floating over a selected pin. Tapping it opens the artwork detail
 * (`Link asChild` → a real `<a href>` on web, a router push on native).
 */
export const MapThumb = ({ artwork, isActive }: MapThumbProps) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <Link href={`/artworks/${artwork.slug}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={artwork.title}
        style={styles.thumb}
      >
        <View
          style={[
            styles.frame,
            { borderColor: isActive ? colors.primary : colors.borderSoft },
          ]}
        >
          <Image
            source={{ uri: artwork.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </Pressable>
    </Link>
  );
};

const THUMB = ControlHeightEnum.lg;

const createStyles = (c: Palette) =>
  StyleSheet.create({
    thumb: { width: THUMB, gap: SpacingEnum.xs },
    frame: {
      width: THUMB,
      height: THUMB,
      borderWidth: 1.5,
      borderRadius: RadiusEnum.sm,
      overflow: "hidden",
      backgroundColor: c.surface2,
    },
    image: { width: "100%", height: "100%" },
    label: { textAlign: "center", textTransform: "lowercase" },
  });
