import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { TagSourcePicker } from "@/pages/app/artwork/components/tag-source-picker/TagSourcePicker";
import { useTagSource } from "@/pages/app/artwork/hooks/useTagSource";
import { normalizeTag } from "@/pages/app/artwork/normalize-tag";
import { Input } from "@/shared/ui/input/Input";
import { Tag } from "@/shared/ui/tag/Tag";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type TagPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

/**
 * Tag selector for the Details step: quick-pick chips plus any free-form tags
 * the user typed. The chips come from `useTagSource` — the account's tags from
 * `GET /tags/` ordered by the user's most-used / last-used preference, or none
 * when the preference is "No tags" (picked via the native `TagSourcePicker`).
 * Tapping a chip toggles it; typing a tag and submitting adds a custom one
 * (deduped against the chips and existing tags).
 */
export const TagPicker = ({ value, onChange }: TagPickerProps) => {
  const { t: tr } = useTranslation();
  const [draft, setDraft] = useState("");

  const { source, setSource, chips } = useTagSource();

  const toggle = (tag: string) =>
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]
    );

  const addDraft = () => {
    const tag = normalizeTag(draft);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  // Custom tags = selected tags that aren't quick-pick chips; shown as active
  // chips after the chips so they're visible and removable (tap to remove).
  const customTags = value.filter((tag) => !chips.includes(tag));

  return (
    <View style={styles.wrap}>
      <TagSourcePicker value={source} onChange={setSource} />
      <View style={styles.tagWrap}>
        {chips.map((tag) => (
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
        submitBehavior="blurAndSubmit"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: SpacingEnum.sm },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
