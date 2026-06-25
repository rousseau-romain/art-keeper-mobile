import type { IconName } from "@/shared/ui/icon/Icon";
import type { ColorEnumType } from "@/theme/enums/color.enums";

export type ToastVariant = "info" | "success" | "warning" | "error";

// Keys (not resolved values) — the `accent` feeds the keyed `Icon` wrapper
// directly, and both keys resolve to a hex via `ColorEnum[...]` for the bubble's
// inline styles.
type ToastColors = {
  bg: ColorEnumType; // bubble background tint
  accent: ColorEnumType; // bubble border + icon tint
  icon: IconName; // lucide glyph for the variant
};

export const useToastColors = (variant: ToastVariant): ToastColors => {
  switch (variant) {
    case "success":
      return { bg: "diffAddBg", accent: "diffAdd", icon: "CircleCheck" };
    case "warning":
      return { bg: "warnBg", accent: "warn", icon: "TriangleAlert" };
    case "error":
      return { bg: "diffDelBg", accent: "diffDel", icon: "CircleX" };
    default:
      return { bg: "infoBg", accent: "info", icon: "Info" };
  }
};
