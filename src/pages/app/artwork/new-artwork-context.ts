import { createContext, useContext } from "react";

/**
 * Shares the draft state the wizard layout owns (`useArtworkDraft` runs once,
 * above the per-step routes) down to the first step, where the `DraftBanner`
 * renders. The hook can't run on the step itself — its save subscription must
 * span every step — so the isRestored flag + discard come through this context.
 */
export type NewArtworkContextValue = {
  isRestored: boolean;
  discardDraft: () => void;
};

export const NewArtworkContext = createContext<NewArtworkContextValue | null>(
  null,
);

export const useNewArtwork = (): NewArtworkContextValue => {
  const ctx = useContext(NewArtworkContext);
  if (!ctx) {
    throw new Error("useNewArtwork must be used within NewArtworkLayout");
  }
  return ctx;
};
