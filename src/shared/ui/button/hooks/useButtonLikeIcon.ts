import { useTranslation } from "react-i18next";
import type { IconProps } from "@/shared/ui/icon/Icon";
import { ColorEnum } from "@/theme/enums/color.enums";

export const useButtonLikeIcon = (liked: boolean): IconProps => {
  const { t: tr } = useTranslation();
  return {
    name: "Heart",
    color: liked ? "primary" : "textMuted",
    accessibilityLabel: liked ? tr("artwork.unlike") : tr("artwork.like"),
    fill: liked ? ColorEnum.primary : ColorEnum.transparent,
  };
};
