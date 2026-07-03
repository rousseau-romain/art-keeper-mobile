import { StyleSheet } from "react-native";

import { Text, type TextProps } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type SectionTitleProps = TextProps & {
  label: string;
};

export const SectionTitle = ({ label, style, ...rest }: SectionTitleProps) => (
  <Text
    font="mono"
    size="sm"
    color="inkMute"
    {...rest}
    style={[styles.title, style]}
  >
    {label}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SpacingEnum.md,
  },
});
