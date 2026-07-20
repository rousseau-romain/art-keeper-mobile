import { StyleSheet, View } from "react-native";

import { type HapticName, useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type WizardFooterProps = {
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  hasArrow?: boolean;
  /**
   * Press haptic. Defaults to a light tap for advancing steps; the submit step
   * passes `null` so it doesn't double-buzz the success fired on creation.
   */
  haptic?: HapticName | null;
  onPress: () => void;
};

/** The fixed bottom action bar shared by every wizard step. */
export const WizardFooter = ({
  label,
  disabled,
  isLoading,
  hasArrow,
  haptic = "light",
  onPress,
}: WizardFooterProps) => {
  const trigger = useHaptics();
  const styles = useThemeStyles(createStyles);
  const onPressWithHaptic = () => {
    if (haptic) trigger(haptic);
    onPress();
  };
  return (
    <View style={styles.footer}>
      <Button
        label={label}
        variant="primary"
        disabled={disabled}
        isLoading={isLoading}
        iconAfter={hasArrow ? { name: "ArrowRight" } : undefined}
        onPress={onPressWithHaptic}
      />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    footer: {
      paddingHorizontal: SpacingEnum.xl,
      paddingVertical: SpacingEnum.md,
      borderTopWidth: 1.5,
      borderTopColor: c.borderSoft,
      backgroundColor: c.bg,
    },
  });
