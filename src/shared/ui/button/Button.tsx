import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Icon, type IconProps } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";
import { type ButtonVariant, useButtonColors } from "./hooks/useButtonColors";

type Size = "sm" | "normal";

export type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: Size;
  iconBefore?: IconProps;
  iconAfter?: IconProps;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  label,
  variant = "default",
  size = "normal",
  iconBefore,
  iconAfter,
  isLoading,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const { colors } = useTheme();
  const buttonColor = useButtonColors(variant);
  const { bg, fg, border } = buttonColor;

  const sm = size === "sm";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
      disabled={disabled || isLoading}
      style={(state) => [
        styles.base,
        {
          minHeight: sm ? ControlHeightEnum.sm : ControlHeightEnum.md,
          paddingHorizontal: sm ? SpacingEnum.md : SpacingEnum.lg,
          borderColor: colors[border],
          backgroundColor: colors[bg],
          opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {isLoading && <ActivityIndicator color={colors[fg]} size="small" />}

      <View style={styles.row}>
        {iconBefore && (
          <Icon
            size={sm ? "xs" : "sm"}
            color={fg}
            strokeWidth={1.8}
            {...iconBefore}
          />
        )}
        <Text size={sm ? "md" : "base"} color={fg} style={styles.label}>
          {label}
        </Text>
        {iconAfter && (
          <Icon
            size={sm ? "xs" : "sm"}
            color={fg}
            strokeWidth={1.8}
            {...iconAfter}
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.sm,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
  },
  row: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.sm,
  },
  label: {
    flexShrink: 1,
    textAlign: "center",
  },
});
