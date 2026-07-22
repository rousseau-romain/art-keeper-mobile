import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  type ControlHeightEnumType,
  RadiusEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type AvatarProps = {
  /** Display name — its initials are the fallback when there's no image. */
  name: string;
  /** Optional avatar image; when absent the initials render on an accent disc. */
  uri?: string | null;
  /** Diameter, from the control-height scale. */
  size?: ControlHeightEnumType;
  /**
   * Accessibility label + crawlable `alt` — the image/disc announces this, not
   * the initials. Defaults to `name`; pass `""` for a purely decorative avatar
   * (when the same name is already read from adjacent text).
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
 * Web avatar. The image branch renders a **real `<img>`** (not react-native-web's
 * `Image`, which paints a `background-image` div — its `alt` becomes an
 * `aria-label`, never crawlable image alt text). On the artist page the display
 * name lives only here (the H1 is the `@handle`), so a crawlable `alt` is the
 * page's sole indexable copy of the name. The initials fallback matches native.
 */
export const Avatar = ({ name, uri, size = "md", alt }: AvatarProps) => {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const px = ControlHeightEnum[size];
  const round = { width: px, height: px, borderRadius: px / 2 };
  const label = alt ?? name;

  if (uri) {
    return (
      <img
        src={uri}
        alt={label}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        style={{
          width: px,
          height: px,
          borderRadius: px / 2,
          objectFit: "cover",
          backgroundColor: colors.surface2,
        }}
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
        aria-hidden
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    fallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
      borderWidth: 1.5,
      borderColor: c.borderSoft,
      borderRadius: RadiusEnum.full,
    },
  });
