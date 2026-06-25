import { StyleSheet, View } from "react-native";
import { Text } from "@/shared/ui/text/Text";
import type { ColorEnumValue } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type StatusDotProps = {
  color: ColorEnumValue;
  label: string;
};

export const StatusDot = ({ color, label }: StatusDotProps) => {
  return (
    <View style={styles.statusDot}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text font="mono" size="xs">
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.xs,
  },
  dot: { width: 6, height: 6, borderRadius: RadiusEnum.md },
});
