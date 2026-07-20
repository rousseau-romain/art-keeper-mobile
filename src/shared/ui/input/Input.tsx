import { type Ref, useEffect, useRef, useState } from "react";
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  StyleSheet,
} from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import {
  FontSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type InputProps = RNTextInputProps & {
  isInvalid?: boolean;
  /**
   * Debounce `onChangeText` by this many ms. The field still updates instantly
   * (a local mirror drives the text); only the callback is deferred. `0` (the
   * default) passes value/onChangeText straight through, unchanged.
   */
  debounce?: number;
  /** Forwarded to the underlying `RNTextInput` — lets callers `.focus()` it. */
  ref?: Ref<RNTextInput>;
};

export const Input = ({
  ref,
  isInvalid,
  debounce = 0,
  value,
  onChangeText,
  placeholderTextColor,
  style,
  ...input
}: InputProps) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const debounced = debounce > 0;
  const [text, setText] = useState(value ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (next: string) => {
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChangeText?.(next), debounce);
  };

  return (
    <RNTextInput
      ref={ref}
      {...input}
      value={debounced ? text : value}
      onChangeText={debounced ? handleChange : onChangeText}
      placeholderTextColor={placeholderTextColor ?? colors.textMuted}
      style={[
        styles.input,
        { borderColor: isInvalid ? colors.danger : colors.borderSoft },
        style,
      ]}
    />
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    input: {
      fontSize: FontSizeEnum.base,
      borderWidth: 1.5,
      borderRadius: RadiusEnum.sm,
      paddingHorizontal: SpacingEnum.lg,
      paddingVertical: SpacingEnum.md,
      fontFamily: FONTS.body,
      color: c.text,
      backgroundColor: c.surface,
    },
  });
