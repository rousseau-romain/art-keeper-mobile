import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { ColorEnumType } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type SwipeConfirmActionProps = {
  /** Which decision this revealed panel confirms. */
  variant: "accept" | "reject";
  /** Commit the decision (fired on tap). */
  onConfirm: () => void;
  /** Show a spinner while the mutation for this decision is in flight. */
  isLoading?: boolean;
  /** a11y label for the confirm button. */
  accessibilityLabel: string;
};

// Per-variant styling and copy: accept is green + check, reject is red + cross.
const VARIANT: Record<
  SwipeConfirmActionProps["variant"],
  {
    fg: ColorEnumType;
    bg: ColorEnumType;
    icon: "Check" | "X";
    label: "moderation.accept" | "moderation.reject";
  }
> = {
  accept: {
    fg: "success",
    bg: "successBg",
    icon: "Check",
    label: "moderation.accept",
  },
  reject: {
    fg: "danger",
    bg: "dangerBg",
    icon: "X",
    label: "moderation.reject",
  },
};

/**
 * The colored panel revealed behind the review card when it's swiped. Tapping it
 * confirms the decision (reveal-then-confirm), so a stray swipe never commits on
 * its own. Green "accept" is revealed on a right-swipe, red "reject" on a left-one.
 */
export const SwipeConfirmAction = ({
  variant,
  onConfirm,
  isLoading = false,
  accessibilityLabel,
}: SwipeConfirmActionProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const v = VARIANT[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onConfirm}
      disabled={isLoading}
      style={[styles.action, { backgroundColor: colors[v.bg] }]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={colors[v.fg]} />
        ) : (
          <Icon name={v.icon} size="xl" color={v.fg} />
        )}
        <Text font="mono" size="xs" color={v.fg} style={styles.label}>
          {tr(v.label)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  action: {
    width: 116,
    borderRadius: RadiusEnum.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { alignItems: "center", gap: SpacingEnum.xs },
  label: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
