import { useTranslation } from "react-i18next";

import {
  TagSourceEnum,
  type TagSourceEnumType,
} from "@/pages/app/artwork/tag-source.enums";
import { Picker } from "@/shared/ui/picker/Picker";

export type TagSourcePickerProps = {
  value: TagSourceEnumType;
  onChange: (next: TagSourceEnumType) => void;
};

const LABEL_KEY: Record<
  TagSourceEnumType,
  | "settings.tagSourceMostUsed"
  | "settings.tagSourceLastUsed"
  | "settings.tagSourceNone"
> = {
  mostUsed: "settings.tagSourceMostUsed",
  lastUsed: "settings.tagSourceLastUsed",
  none: "settings.tagSourceNone",
};

const OPTIONS = Object.keys(TagSourceEnum) as TagSourceEnumType[];

/**
 * Chooses where the TagPicker's quick-pick chips come from (most used / last
 * used / none) — a thin domain wrapper mapping `TagSourceEnum` to the shared
 * native `Picker`.
 */
export const TagSourcePicker = ({ value, onChange }: TagSourcePickerProps) => {
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
      accessibilityLabel={tr("a11y.tagSourceToggle")}
    />
  );
};
