import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
} from "react-native";

/** `isMain` pose le landmark `role="main"` — un seul par page. */
export type WrapperKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  isMain?: boolean;
};

export const WrapperKeyboardAvoidingView = ({
  style,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
  isMain,
  role,
  ...rest
}: WrapperKeyboardAvoidingViewProps) => {
  return (
    <KeyboardAvoidingView
      role={isMain ? "main" : role}
      style={[styles.screen, style]}
      behavior={behavior}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
