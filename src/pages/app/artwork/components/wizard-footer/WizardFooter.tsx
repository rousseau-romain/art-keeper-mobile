import { StyleSheet, View } from "react-native";

import { type HapticName, useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type WizardFooterProps = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
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
  loading,
  showArrow,
  haptic = "light",
  onPress,
}: WizardFooterProps) => {
  const trigger = useHaptics();
  const onPressWithHaptic = () => {
    if (haptic) trigger(haptic);
    onPress();
  };
  return (
    <View style={styles.footer}>
      <Button
        label={label}
        variant="primary"
        block
        disabled={disabled}
        loading={loading}
        iconAfter={showArrow ? { name: "ArrowRight" } : undefined}
        onPress={onPressWithHaptic}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SpacingEnum.xl,
    paddingVertical: SpacingEnum.md,
    borderTopWidth: 1.5,
    borderTopColor: ColorEnum.borderSoft,
    backgroundColor: ColorEnum.bg,
  },
});
