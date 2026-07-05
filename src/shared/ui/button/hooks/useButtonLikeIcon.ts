import { useTranslation } from "react-i18next";
import type { IconProps } from "@/shared/ui/icon/Icon";
import { useTheme } from "@/theme/ThemeProvider";

export const useButtonLikeIcon = (liked: boolean): IconProps => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  return {
    name: "Heart",
    color: liked ? "primary" : "textMuted",
    accessibilityLabel: liked ? tr("artwork.unlike") : tr("artwork.like"),
    fill: liked ? colors.primary : colors.transparent,
  };
};
