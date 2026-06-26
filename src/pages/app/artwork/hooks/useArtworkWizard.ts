import { useState } from "react";

export type WizardStep = 1 | 2 | 3 | 4;

/** Number of input steps before the success screen (photo, location, details, review). */
export const WIZARD_TOTAL = 4;

/**
 * Linear step machine for the new-artwork wizard. Holds the current step and the
 * forward / back / jump-to transitions; the screen decides what each step
 * renders and gates advancing. Step 5 (success) is a separate `created` flag in
 * `useArtworkSubmit`, not a step here.
 */
export const useArtworkWizard = () => {
  const [step, setStep] = useState<WizardStep>(1);

  const next = () =>
    setStep((s) => (s < WIZARD_TOTAL ? ((s + 1) as WizardStep) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  const goTo = (s: WizardStep) => setStep(s);

  return {
    step,
    total: WIZARD_TOTAL,
    next,
    back,
    goTo,
    isFirst: step === 1,
    isLast: step === WIZARD_TOTAL,
  };
};
