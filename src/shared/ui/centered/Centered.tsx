import { StyleSheet, View, type ViewProps } from "react-native";

export type CenteredProps = ViewProps;

export const Centered = ({ style, ...rest }: CenteredProps) => {
  return <View style={[styles.centered, style]} {...rest} />;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
