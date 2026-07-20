import { Check as CheckIcon } from "lucide-react-native";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import {
  FontSizeEnum,
  IconSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type CheckboxProps = Omit<PressableProps, "style" | "onPress"> & {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label?: string;
};

export const Checkbox = ({
  isChecked,
  onChange,
  label,
  ...rest
}: CheckboxProps) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      hitSlop={8}
      onPress={() => onChange(!isChecked)}
      {...rest}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: isChecked ? colors.primary : colors.transparent,
            borderColor: isChecked ? colors.primary : colors.border,
          },
        ]}
      >
        {isChecked && (
          <CheckIcon
            size={IconSizeEnum.xs}
            color={colors.primaryInk}
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
