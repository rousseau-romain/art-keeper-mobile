import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FONT_SIZE, RADIUS, SPACING, useTheme } from "@/theme";
import { type Variant, useGetButtonsColors } from "./hooks/useGetButtonsColors";

type Size = "sm" | "normal";

// Wraps a Pressable and forwards the rest of its props to it.
type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  block?: boolean;
  liked?: boolean;
  loading?: boolean;
};

export const Button = ({
  label,
  variant = "default",
  size = "normal",
  icon: Icon,
  block,
  liked,
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const { t, fonts } = useTheme();
  const { bg, fg } = useGetButtonsColors(variant, liked);
  const sm = size === "sm";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      {...rest}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        {
          minHeight: sm ? 36 : 48,
          paddingHorizontal: sm ? SPACING.md : SPACING.lg,
          borderColor: variant === "ghost" ? t.line : "transparent",
          backgroundColor: bg,
          alignSelf: block ? "stretch" : "flex-start",
          opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={styles.row}>
          {Icon ? (
            <Icon size={sm ? 16 : 18} color={fg} strokeWidth={1.8} />
          ) : null}
          <Text
            style={[
              styles.label,
              {
                fontFamily: fonts.body,
                fontSize: sm ? FONT_SIZE.md : FONT_SIZE.base,
                color: fg,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// Static, theme-independent layout only. useTheme/dynamic values stay inline above.
const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
  },
  label: { fontWeight: "600", letterSpacing: 0.2 },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
});
