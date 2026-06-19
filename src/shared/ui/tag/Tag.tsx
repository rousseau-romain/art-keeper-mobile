import { Pressable, StyleSheet, Text } from "react-native";

import { FONT_SIZE, RADIUS, SPACING, useTheme } from "@/theme";

type TagState = "active" | "muted" | "solid";

type TagProps = {
  label: string;
  /** Display style prepends `#` (tags have no `#` on the wire). */
  hash?: boolean;
  state?: TagState;
  onPress?: () => void;
};

export const Tag = ({
  label,
  hash = true,
  state = "muted",
  onPress,
}: TagProps) => {
  const { t, fonts } = useTheme();

  const bg =
    state === "solid"
      ? t.accent
      : state === "active"
        ? t.accentSoft
        : t.surface2;
  const fg =
    state === "solid" ? t.accentInk : state === "active" ? t.accent : t.inkSoft;
  const borderColor = state === "active" ? t.accent : t.hair;

  const content = (
    <Text
      style={[
        styles.tag,
        {
          fontFamily: fonts.mono,
          color: fg,
          borderColor,
          backgroundColor: bg,
        },
      ]}
    >
      {hash ? `#${label}` : label}
    </Text>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tag: {
    fontSize: FONT_SIZE.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    overflow: "hidden",
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
  },
});
