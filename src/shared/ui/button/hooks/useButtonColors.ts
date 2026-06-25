import { ColorEnum, type ColorEnumValue } from "@/theme/enums/color.enums";

export type ButtonVariant = "primary" | "ghost" | "text" | "default";

type ButtonColors = {
  bg: ColorEnumValue;
  fg: ColorEnumValue;
  border: ColorEnumValue;
};

export const useButtonColors = (variant: ButtonVariant): ButtonColors => {
  switch (variant) {
    case "primary":
      return {
        bg: ColorEnum.accent,
        fg: ColorEnum.accentInk,
        border: ColorEnum.transparent,
      };
    case "ghost":
      return {
        bg: ColorEnum.transparent,
        fg: ColorEnum.ink,
        border: ColorEnum.line,
      };
    case "text":
      return {
        bg: "transparent",
        fg: ColorEnum.ink,
        border: "transparent",
      };
    default:
      return {
        bg: ColorEnum.surface2,
        fg: ColorEnum.ink,
        border: ColorEnum.transparent,
      };
  }
};
