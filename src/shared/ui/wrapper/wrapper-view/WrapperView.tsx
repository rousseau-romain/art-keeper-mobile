import { StyleSheet, View, type ViewProps } from "react-native";

/** `isMain` pose le landmark `<main>` (react-native-web mappe `role="main"` vers un
 *  vrai `<main>`) — un seul par page. */
export type WrapperViewProps = ViewProps & { isMain?: boolean };

export const WrapperView = ({
  style,
  isMain,
  role,
  ...rest
}: WrapperViewProps) => {
  return (
    <View
      role={isMain ? "main" : role}
      style={[styles.screen, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
