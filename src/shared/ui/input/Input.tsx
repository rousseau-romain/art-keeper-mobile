import { type Ref, useEffect, useRef, useState } from "react";
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  StyleSheet,
} from "react-native";

import { ColorEnum } from "@/theme/enums/color.enums";
import {
  FontSizeEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";

export type InputProps = RNTextInputProps & {
  invalid?: boolean;
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
  invalid,
  debounce = 0,
  value,
  onChangeText,
  placeholderTextColor = ColorEnum.inkMute,
  style,
  ...input
}: InputProps) => {
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
      placeholderTextColor={placeholderTextColor}
      style={[
        styles.input,
        { borderColor: invalid ? ColorEnum.diffDel : ColorEnum.hair },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: FontSizeEnum.base,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    paddingHorizontal: SpacingEnum.lg,
    paddingVertical: SpacingEnum.md,
    fontFamily: FONTS.body,
    color: ColorEnum.ink,
    backgroundColor: ColorEnum.surface,
  },
});
