import { Image, StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  type ControlHeightEnumType,
  RadiusEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type AvatarProps = {
  /** Display name — its initials are the fallback when there's no image. */
  name: string;
  /** Optional avatar image; when absent the initials render on an accent disc. */
  uri?: string | null;
  /** Diameter, from the control-height scale. */
  size?: ControlHeightEnumType;
  /**
   * Accessibility label — the image/disc announces this, not the initials.
   * Defaults to `name`; pass `""` to mark a purely decorative avatar (when the
   * same name is already read from adjacent text).
   */
  alt?: string;
};

/** First letters of up to two words, uppercased — e.g. "Ghost Roller" → "GR". */
const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();

/**
 * A round avatar: the artist's photo when it has one, otherwise their initials on
 * an accent disc. Feature-agnostic primitive — sized from the control-height
 * scale, resolved to pixels inside (initials font tracks the diameter).
 */
export const Avatar = ({ name, uri, size = "md", alt }: AvatarProps) => {
  const styles = useThemeStyles(createStyles);
  const px = ControlHeightEnum[size];
  const round = { width: px, height: px, borderRadius: px / 2 };
  const label = alt ?? name;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        // `alt` → accessibilityLabel on native, aria-label on web (mirrors ArtworkHero).
        alt={label}
        style={[styles.image, round]}
        resizeMode="cover"
      />
    );
  }

  // The disc announces the name; the initials are a visual shorthand, so hide
  // them from a11y (a reader would otherwise spell out "G R" instead of the name).
  return (
    <View
      style={[styles.fallback, round]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Text
        font="display"
        color="primaryInk"
        style={{ fontSize: px * 0.4 }}
        importantForAccessibility="no-hide-descendants"
        aria-hidden
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    image: { backgroundColor: c.surface2 },
    fallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
      borderWidth: 1.5,
      borderColor: c.borderSoft,
      borderRadius: RadiusEnum.full,
    },
  });
