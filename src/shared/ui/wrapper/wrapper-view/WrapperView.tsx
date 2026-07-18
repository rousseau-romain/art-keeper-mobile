import { StyleSheet, View, type ViewProps } from "react-native";

/** `main` pose le landmark `<main>` (react-native-web mappe `role="main"` vers un
 *  vrai `<main>`) — un seul par page. */
export type WrapperViewProps = ViewProps & { main?: boolean };

export const WrapperView = ({ style, main, role, ...rest }: WrapperViewProps) => {
  return <View role={main ? "main" : role} style={[styles.screen, style]} {...rest} />;
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
