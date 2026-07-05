import { ColorEnum, type ColorEnumValue } from "@/theme/enums/color.enums";

export type TagState = "active" | "muted" | "solid";

type TagColors = {
  /** Background fill. */
  bg: ColorEnumValue;
  /** Foreground color (label text). */
  fg: ColorEnumValue;
  /** Border color. */
  borderColor: ColorEnumValue;
};

/** Resolve a tag's background + foreground + border from its state. */
export const useGetTagColors = (state: TagState): TagColors => {
  switch (state) {
    case "solid":
      return {
        bg: ColorEnum.primary,
        fg: ColorEnum.primaryInk,
        borderColor: ColorEnum.borderSoft,
      };
    case "active":
      return {
        bg: ColorEnum.primarySoft,
        fg: ColorEnum.primary,
        borderColor: ColorEnum.primary,
      };
    default:
      return {
        bg: ColorEnum.surface2,
        fg: ColorEnum.textSoft,
        borderColor: ColorEnum.borderSoft,
      };
  }
};
