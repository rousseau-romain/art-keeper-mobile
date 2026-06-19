import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { FONT_SIZE, SPACING, useTheme } from "@/theme";

type Variant = "primary" | "ghost" | "default";
type Size = "sm" | "normal";

interface BtnProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  block?: boolean;
  liked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Btn({
  label,
  onPress,
  variant = "default",
  size = "normal",
  icon: Icon,
  block,
  liked,
  disabled,
  loading,
  style,
}: BtnProps) {
  const { t, fonts } = useTheme();
  const sm = size === "sm";

  const bg =
    variant === "primary"
      ? liked
        ? t.accentSoft
        : t.accent
      : variant === "ghost"
        ? "transparent"
        : t.surface2;
  const fg =
    variant === "primary"
      ? liked
        ? t.accent
        : t.accentInk
      : liked
        ? t.accent
        : t.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: sm ? 36 : 48,
          paddingHorizontal: sm ? SPACING.md : SPACING.lg,
          borderRadius: t.radius,
          borderWidth: variant === "ghost" ? t.borderWeight : 0,
          borderColor: variant === "ghost" ? t.line : "transparent",
          backgroundColor: bg,
          alignSelf: block ? "stretch" : "flex-start",
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
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
            style={{
              fontFamily: fonts.body,
              fontSize: sm ? FONT_SIZE.md : FONT_SIZE.base,
              fontWeight: "600",
              color: fg,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Static, theme-independent layout only. Theme-colored styles stay inline above.
const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
});
