import type { ColorEnumValue } from "@/theme/enums/color.enums";
import { useTheme } from "@/theme/ThemeProvider";

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
  const { colors } = useTheme();
  switch (state) {
    case "solid":
      return {
        bg: colors.primary,
        fg: colors.primaryInk,
        borderColor: colors.borderSoft,
      };
    case "active":
      return {
        bg: colors.primarySoft,
        fg: colors.primary,
        borderColor: colors.primary,
      };
    default:
      return {
        bg: colors.surface2,
        fg: colors.textSoft,
        borderColor: colors.borderSoft,
      };
  }
};
