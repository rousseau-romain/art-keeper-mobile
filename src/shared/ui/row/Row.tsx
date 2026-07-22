import { StyleSheet, View, type ViewProps } from "react-native";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type RowProps = ViewProps;

export const Row = ({ style, ...rest }: RowProps) => {
  return <View style={[styles.row, style]} {...rest} />;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.lg,
  },
});
