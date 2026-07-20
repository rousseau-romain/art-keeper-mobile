import { useTranslation } from "react-i18next";

import {
  ReviewModeEnum,
  type ReviewModeEnumType,
} from "@/pages/app/moderation/review-mode.enums";
import { Picker } from "@/shared/ui/picker/Picker";

export type ReviewModePickerProps = {
  value: ReviewModeEnumType;
  onChange: (next: ReviewModeEnumType) => void;
};

const LABEL_KEY: Record<
  ReviewModeEnumType,
  "settings.reviewModeSwipe" | "settings.reviewModeButton"
> = {
  swipe: "settings.reviewModeSwipe",
  button: "settings.reviewModeButton",
};

const OPTIONS = Object.keys(ReviewModeEnum) as ReviewModeEnumType[];

/**
 * Chooses how proposals are decided on the mobile review screen (swipe the card
 * or use the footer buttons) — a thin domain wrapper mapping `ReviewModeEnum` to
 * the shared native `Picker`.
 */
export const ReviewModePicker = ({
  value,
  onChange,
}: ReviewModePickerProps) => {
  const { t: tr } = useTranslation();

  const options = OPTIONS.map((option) => ({
    value: option,
    label: tr(LABEL_KEY[option]),
  }));

  return (
    <Picker
      value={value}
      onChange={onChange}
      options={options}
      accessibilityLabel={tr("a11y.reviewModeToggle")}
    />
  );
};
