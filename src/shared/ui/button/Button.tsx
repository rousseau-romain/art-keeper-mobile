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
  block?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  label,
  variant = "default",
  size = "normal",
  iconBefore,
  iconAfter,
  block,
  loading,
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
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        {
          minHeight: sm ? ControlHeightEnum.sm : ControlHeightEnum.md,
          paddingHorizontal: sm ? SpacingEnum.md : SpacingEnum.lg,
          borderColor: colors[border],
          backgroundColor: colors[bg],
          alignSelf: block ? "stretch" : "flex-start",
          opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator color={colors[fg]} size="small" />}

      <View style={styles.row}>
        {iconBefore && (
          <Icon
            size={sm ? "xs" : "sm"}
            color={fg}
            strokeWidth={1.8}
            {...iconBefore}
          />
        )}
        <Text size={sm ? "md" : "base"} color={fg}>
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
  row: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
});
