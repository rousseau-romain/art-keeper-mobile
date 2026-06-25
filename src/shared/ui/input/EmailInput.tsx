import { TextInput, type TextInputProps } from "@/shared/ui/input/TextInput";

export type EmailInputProps = TextInputProps;

export const EmailInput = ({ onChangeText, ...props }: EmailInputProps) => (
  <TextInput
    autoCapitalize="none"
    autoComplete="email"
    autoCorrect={false}
    inputMode="email"
    keyboardType="email-address"
    textContentType="emailAddress"
    placeholder="you@example.com"
    {...props}
    onChangeText={(text) => onChangeText?.(text.trim())}
  />
);
