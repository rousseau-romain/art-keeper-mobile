import type { LucideProps } from "lucide-react-native";
import * as icons from "lucide-react-native/icons";

import { ColorEnum, type ColorEnumType } from "@/theme/enums/color.enums";
import { IconSizeEnum, type IconSizeEnumType } from "@/theme/enums/scale.enums";

export type IconName = keyof typeof icons;

export type IconProps = Omit<LucideProps, "size" | "color"> & {
  name: IconName;
  size?: IconSizeEnumType;
  color?: ColorEnumType;
};

export const Icon = ({
  name,
  size = "sm",
  color = "ink",
  strokeWidth = 1.8,
  ...rest
}: IconProps) => {
  const Glyph = icons[name];
  return (
    <Glyph
      size={IconSizeEnum[size]}
      color={ColorEnum[color]}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};
