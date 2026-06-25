import { Pressable, type PressableProps, StyleSheet } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type SegmentProps = PressableProps & {
  label: string;
  active: boolean;
};

export const Segment = ({ label, active, ...rest }: SegmentProps) => (
  <Pressable
    {...rest}
    style={[
      styles.segment,
      { backgroundColor: active ? ColorEnum.accent : ColorEnum.transparent },
    ]}
  >
    <Text
      font="body"
      size="md"
      color={active ? "accentInk" : "inkSoft"}
      style={styles.segmentLabel}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    paddingVertical: SpacingEnum.sm,
    alignItems: "center",
    borderRadius: RadiusEnum.sm,
  },
  segmentLabel: { fontWeight: "600" },
});
