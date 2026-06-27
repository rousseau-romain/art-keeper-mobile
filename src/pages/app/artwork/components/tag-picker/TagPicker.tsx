import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ARTWORK_TAG_PRESETS } from "@/pages/app/artwork/tags.constant";
import { Input } from "@/shared/ui/input/Input";
import { Tag } from "@/shared/ui/tag/Tag";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type TagPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

// Widened view of the preset tuple so `.includes(aString)` type-checks.
const PRESETS: readonly string[] = ARTWORK_TAG_PRESETS;

/** Normalize a typed tag: trim, lowercase, drop a leading "#". */
const normalizeTag = (raw: string) =>
  raw.trim().toLowerCase().replace(/^#+/, "");

/**
 * Tag selector for the Details step: the preset quick-pick chips plus any
 * free-form tags the user typed. Tapping a chip toggles it; typing a tag and
 * submitting adds a custom one (deduped against the presets and existing tags).
 */
export const TagPicker = ({ value, onChange }: TagPickerProps) => {
  const { t: tr } = useTranslation();
  const [draft, setDraft] = useState("");

  const toggle = (tag: string) =>
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag],
    );

  const addDraft = () => {
    const tag = normalizeTag(draft);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  // Custom tags = selected tags that aren't preset chips; shown as active chips
  // after the presets so they're visible and removable (tap to remove).
  const customTags = value.filter((tag) => !PRESETS.includes(tag));

  return (
    <View style={styles.wrap}>
      <View style={styles.tagWrap}>
        {ARTWORK_TAG_PRESETS.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            state={value.includes(tag) ? "active" : "muted"}
            onPress={() => toggle(tag)}
          />
        ))}
        {customTags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            state="active"
            onPress={() => toggle(tag)}
          />
        ))}
      </View>
      <Input
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={addDraft}
        placeholder={tr("artwork.new.details.tagsAddPlaceholder")}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: SpacingEnum.sm },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
