import { type RefObject, useRef, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";

import { normalizeTag } from "@/pages/app/artwork/normalize-tag";

export type UseTagDraft = {
  /** The current free-form tag text (controlled input value). */
  draft: string;
  setDraft: (next: string) => void;
  /** Attach to the tag `Input` so `commit` can clear it imperatively. */
  inputRef: RefObject<RNTextInput | null>;
  /**
   * Normalize the current draft, hand the resulting tag to `add` (skipped when
   * the draft normalizes to empty), then reset the field.
   */
  commit: (add: (tag: string) => void) => void;
};

/**
 * The free-form tag-entry field shared by the create form (`TagPicker`) and the
 * filter sheet (`FilterFormSheetScreen`): owns the draft text, the input ref,
 * and the submit → normalize → clear flow. Callers pass an `add` that routes the
 * normalized tag wherever it belongs (an RHF field, the filter store, …).
 */
export const useTagDraft = (): UseTagDraft => {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<RNTextInput>(null);

  const commit = (add: (tag: string) => void) => {
    const tag = normalizeTag(draft);
    if (tag) add(tag);
    setDraft("");
    // Fabric doesn't clear a controlled TextInput reset to "" inside its own
    // onSubmitEditing — clear it imperatively so the field empties on-screen.
    inputRef.current?.clear();
  };

  return { draft, setDraft, inputRef, commit };
};
