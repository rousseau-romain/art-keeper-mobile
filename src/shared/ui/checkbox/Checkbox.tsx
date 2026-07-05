import { Check as CheckIcon } from "lucide-react-native";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import {
  FontSizeEnum,
  IconSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";

export type CheckboxProps = Omit<PressableProps, "style" | "onPress"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export const Checkbox = ({
  checked,
  onChange,
  label,
  ...rest
}: CheckboxProps) => {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
      onPress={() => onChange(!checked)}
      {...rest}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? ColorEnum.primary : ColorEnum.transparent,
            borderColor: checked ? ColorEnum.primary : ColorEnum.border,
          },
        ]}
      >
        {checked && (
          <CheckIcon
            size={IconSizeEnum.xs}
            color={ColorEnum.primaryInk}
            strokeWidth={2.6}
          />
        )}
      </View>
      {label && (
        <Text font="body" size="base" color="textSoft" style={styles.label}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.md },
  box: {
    width: FontSizeEnum.xl,
    height: FontSizeEnum.xl,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1 },
});
