import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  clearArtworkDraft,
  loadArtworkDraft,
  saveArtworkDraft,
} from "@/pages/app/artwork/draft-store";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";

type UseArtworkDraftParams = {
  methods: UseFormReturn<ArtworkValues>;
};

/** The pristine form shape — the wizard's defaults and what a discard resets to. */
export const EMPTY_ARTWORK_DRAFT: ArtworkValues = {
  photo: null,
  latitude: null,
  longitude: null,
  address: "",
  title: "",
  artistId: null,
  artistHandle: "",
  tags: [],
  note: "",
  rightsConfirmed: false,
};

const SAVE_DEBOUNCE_MS = 500;

/**
 * Persists the in-progress wizard so the user doesn't lose their work if the app
 * is closed or the web tab reloads: restores a saved draft on mount (exposing a
 * `restored` flag for the banner) and debounce-saves on every field change.
 */
export const useArtworkDraft = ({ methods }: UseArtworkDraftParams) => {
  const [restored, setRestored] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load once on mount, mirroring the i18n provider's read-on-init pattern.
  useEffect(() => {
    loadArtworkDraft().then((draft) => {
      if (!draft) return;
      methods.reset(draft);
      setRestored(true);
    });
  }, [methods]);

  // Save on change — debounced so rapid typing writes once it settles.
  useEffect(() => {
    const sub = methods.watch((values) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        saveArtworkDraft(values as ArtworkValues);
      }, SAVE_DEBOUNCE_MS);
    });
    return () => {
      sub.unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [methods]);

  const discardDraft = () => {
    clearArtworkDraft();
    methods.reset(EMPTY_ARTWORK_DRAFT);
    setRestored(false);
  };

  return { restored, discardDraft };
};
