import { Pressable, type PressableProps, StyleSheet } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type SegmentProps = PressableProps & {
  label: string;
  active: boolean;
};

export const Segment = ({ label, active, ...rest }: SegmentProps) => {
  const { colors } = useTheme();
  return (
    <Pressable
      {...rest}
      style={[
        styles.segment,
        { backgroundColor: active ? colors.primary : colors.transparent },
      ]}
    >
      <Text
        font="body"
        size="md"
        color={active ? "primaryInk" : "textSoft"}
        style={styles.segmentLabel}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    paddingVertical: SpacingEnum.sm,
    alignItems: "center",
    borderRadius: RadiusEnum.sm,
  },
  segmentLabel: { fontWeight: "600" },
});
