import type { ColorEnumType } from "@/theme/enums/color.enums";

export type ButtonVariant = "primary" | "ghost" | "text" | "default";

type ButtonColors = {
  bg: ColorEnumType;
  fg: ColorEnumType;
  border: ColorEnumType;
};

export const useButtonColors = (variant: ButtonVariant): ButtonColors => {
  switch (variant) {
    case "primary":
      return {
        bg: "primary",
        fg: "primaryInk",
        border: "transparent",
      };
    case "ghost":
      return {
        bg: "transparent",
        fg: "text",
        border: "border",
      };
    case "text":
      return {
        bg: "transparent",
        fg: "text",
        border: "transparent",
      };
    default:
      return {
        bg: "surface2",
        fg: "text",
        border: "transparent",
      };
  }
};
