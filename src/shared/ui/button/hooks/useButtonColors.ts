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
        bg: ColorEnum.primary,
        fg: ColorEnum.primaryInk,
        border: ColorEnum.transparent,
      };
    case "ghost":
      return {
        bg: ColorEnum.transparent,
        fg: ColorEnum.text,
        border: ColorEnum.border,
      };
    case "text":
      return {
        bg: "transparent",
        fg: ColorEnum.text,
        border: "transparent",
      };
    default:
      return {
        bg: ColorEnum.surface2,
        fg: ColorEnum.text,
        border: ColorEnum.transparent,
      };
  }
};
