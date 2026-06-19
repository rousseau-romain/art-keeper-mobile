import { useTheme } from "@/theme";

export type Variant = "primary" | "ghost" | "default";

type ButtonColors = {
  /** Background fill. */
  bg: string;
  /** Foreground color (icon + label). */
  fg: string;
};

/** Resolve a button's background + foreground from its variant and liked state. */
export const useGetButtonsColors = (
  variant: Variant,
  liked = false,
): ButtonColors => {
  const { t } = useTheme();

  switch (variant) {
    case "primary":
      return {
        bg: liked ? t.accentSoft : t.accent,
        fg: liked ? t.accent : t.accentInk,
      };
    case "ghost":
      return {
        bg: "transparent",
        fg: liked ? t.accent : t.ink,
      };
    default:
      return {
        bg: t.surface2,
        fg: liked ? t.accent : t.ink,
      };
  }
};
