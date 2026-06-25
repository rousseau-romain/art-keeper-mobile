import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { ColorEnum, type ColorEnumType } from "@/theme/enums/color.enums";
import { FontSizeEnum, type FontSizeEnumType } from "@/theme/enums/scale.enums";
import { FONTS } from "@/theme/fonts.constant";
import type { FontRole } from "@/theme/theme.types";

export type TextProps = RNTextProps & {
  font?: FontRole;
  size?: FontSizeEnumType;
  color?: ColorEnumType;
};

export const Text = ({
  font = "body",
  size = "base",
  color = "ink",
  style,
  ...rest
}: TextProps) => (
  <RNText
    {...rest}
    style={[
      {
        fontFamily: FONTS[font],
        fontSize: FontSizeEnum[size],
        color: ColorEnum[color],
      },
      style,
    ]}
  />
);
