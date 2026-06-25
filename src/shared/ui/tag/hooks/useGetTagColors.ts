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
        bg: ColorEnum.accent,
        fg: ColorEnum.accentInk,
        borderColor: ColorEnum.hair,
      };
    case "active":
      return {
        bg: ColorEnum.accentSoft,
        fg: ColorEnum.accent,
        borderColor: ColorEnum.accent,
      };
    default:
      return {
        bg: ColorEnum.surface2,
        fg: ColorEnum.inkSoft,
        borderColor: ColorEnum.hair,
      };
  }
};
