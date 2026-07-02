import { Pressable, type PressableProps, StyleSheet } from "react-native";
import type { IconName } from "@/shared/ui/icon/Icon";
import { Icon } from "@/shared/ui/icon/Icon";
import type { ColorEnumType } from "@/theme/enums/color.enums";
import type { IconSizeEnumType } from "@/theme/enums/scale.enums";

export type IconButtonProps = Omit<
  PressableProps,
  "children" | "accessibilityLabel"
> & {
  name: IconName;
  // Required: an icon-only button has no visible text, so it must carry a label.
  accessibilityLabel: string;
  size?: IconSizeEnumType;
  color?: ColorEnumType;
  strokeWidth?: number;
};

export const IconButton = ({
  name,
  size = "md",
  color = "inkMute",
  strokeWidth,
  hitSlop = 8,
  disabled,
  style,
  ...rest
}: IconButtonProps) => (
  <Pressable
    accessibilityRole="button"
    hitSlop={hitSlop}
    disabled={disabled}
    style={(state) => [
      styles.base,
      { opacity: disabled ? 0.5 : state.pressed ? 0.6 : 1 },
      typeof style === "function" ? style(state) : style,
    ]}
    {...rest}
  >
    <Icon name={name} size={size} color={color} strokeWidth={strokeWidth} />
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
