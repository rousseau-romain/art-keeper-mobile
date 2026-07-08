import { StyleSheet, View, type ViewProps } from "react-native";

export type WrapperViewProps = ViewProps;

export const WrapperView = ({ style, ...rest }: WrapperViewProps) => {
  return <View style={[styles.screen, style]} {...rest} />;
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
