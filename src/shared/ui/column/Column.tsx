import { StyleSheet, View, type ViewProps } from "react-native";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ColumnProps = ViewProps;

export const Column = ({ style, ...rest }: ColumnProps) => {
  return <View style={[styles.column, style]} {...rest} />;
};

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    alignItems: "center",
    gap: SpacingEnum.lg,
  },
});
