import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";

// Versioned so a future shape change can bump the key instead of choking on an
// old payload (mirrors LOCALE_STORAGE_KEY in the i18n setup).
const DRAFT_KEY = "artkeeper:artwork.draft:v1";

/** Persist the in-progress wizard values. Errors are swallowed — a failed save
 * must never break typing. */
export const saveArtworkDraft = async (
  values: ArtworkValues,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // Likely a localStorage quota overflow from a large data-URL photo on web —
    // keep the rest of the draft rather than losing everything.
    try {
      await AsyncStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ ...values, photo: null }),
      );
    } catch {
      // ignore — best-effort persistence
    }
  }
};

/**
 * Read the saved draft, or `null` when there's none / it can't be parsed.
 * Web photos are now persisted as self-contained `data:` URLs (see
 * `usePhotoPicker`), so they restore intact. The `blob:` strip below is a safety
 * net for stale drafts saved before that change — a `blob:` URL dies on reload,
 * so we drop just the photo (keeping every other field) and let the user re-pick.
 */
export const loadArtworkDraft = async (): Promise<ArtworkValues | null> => {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as ArtworkValues;
    if (Platform.OS === "web" && draft.photo?.uri.startsWith("blob:")) {
      return { ...draft, photo: null };
    }
    return draft;
  } catch {
    return null;
  }
};

export const clearArtworkDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
};
