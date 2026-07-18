import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
} from "react-native";

/** `main` pose le landmark `role="main"` — un seul par page. */
export type WrapperKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & { main?: boolean };

export const WrapperKeyboardAvoidingView = ({
  style,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
  main,
  role,
  ...rest
}: WrapperKeyboardAvoidingViewProps) => {
  return (
    <KeyboardAvoidingView
      role={main ? "main" : role}
      style={[styles.screen, style]}
      behavior={behavior}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
