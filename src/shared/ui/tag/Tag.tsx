import { Pressable, type PressableProps, StyleSheet } from "react-native";
import { Text } from "@/shared/ui/text/Text";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { type TagState, useGetTagColors } from "./hooks/useGetTagColors";

export type TagProps = PressableProps & {
  label: string;
  hasHash?: boolean;
  state?: TagState;
};

export const Tag = ({
  label,
  hasHash = true,
  state = "muted",
  onPress,
  ...rest
}: TagProps) => {
  const { bg, fg, borderColor } = useGetTagColors(state);

  const content = (
    <Text
      font="mono"
      size="sm"
      style={[styles.tag, { color: fg, borderColor, backgroundColor: bg }]}
    >
      {hasHash ? `#${label}` : label}
    </Text>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.xs,
    overflow: "hidden",
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
  },
});
