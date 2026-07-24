import { StyleSheet } from "react-native";

import { Text, type TextProps } from "@/shared/ui/text/Text";

export type SectionTitleProps = TextProps & {
  label: string;
};

export const SectionTitle = ({ label, style, ...rest }: SectionTitleProps) => (
  <Text
    font="mono"
    size="sm"
    color="textMuted"
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
  },
});
