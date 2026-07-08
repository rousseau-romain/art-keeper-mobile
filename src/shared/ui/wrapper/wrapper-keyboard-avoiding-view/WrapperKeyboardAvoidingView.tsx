import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
} from "react-native";

export type WrapperKeyboardAvoidingViewProps = KeyboardAvoidingViewProps;

export const WrapperKeyboardAvoidingView = ({
  style,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
  ...rest
}: WrapperKeyboardAvoidingViewProps) => {
  return (
    <KeyboardAvoidingView style={[styles.screen, style]} behavior={behavior} {...rest} />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
