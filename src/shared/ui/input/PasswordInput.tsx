import { TextInput, type TextInputProps } from "@/shared/ui/input/TextInput";

export type PasswordInputProps = TextInputProps;

export const PasswordInput = (props: PasswordInputProps) => (
  <TextInput
    autoCapitalize="none"
    autoComplete="password"
    autoCorrect={false}
    secureTextEntry
    textContentType="password"
    {...props}
  />
);
