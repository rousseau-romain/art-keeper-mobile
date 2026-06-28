import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { WizardHeader } from "@/pages/app/artwork/components/wizard-header/WizardHeader";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import {
  EMPTY_ARTWORK_DRAFT,
  useArtworkDraft,
} from "@/pages/app/artwork/hooks/useArtworkDraft";
import { NewArtworkContext } from "@/pages/app/artwork/new-artwork-context";
import {
  DISPLAY_TOTAL,
  STEP_BY_ROUTE,
} from "@/pages/app/artwork/wizard-steps.constant";
import { Stack } from "@/shared/ui/stack/Stack";

/**
 * The create-artwork wizard shell: owns the form + draft persistence so the
 * collected values survive moving between steps. The native Stack header is kept
 * (back button + safe area); each input step renders the `WizardHeader` step
 * indicator as its `headerTitle`.
 */
export default function Layout() {
  const { t: tr } = useTranslation();
  const methods = useForm<ArtworkValues>({
    mode: "onTouched",
    defaultValues: EMPTY_ARTWORK_DRAFT,
  });
  const draft = useArtworkDraft({ methods });

  return (
    <FormProvider {...methods}>
      <NewArtworkContext.Provider value={draft}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: tr("artwork.new.title.index"),
              headerTitle: () => (
                <WizardHeader step={STEP_BY_ROUTE.index} total={DISPLAY_TOTAL} />
              ),
            }}
          />
          <Stack.Screen
            name="location"
            options={{
              title: tr("artwork.new.title.location"),
              headerTitle: () => (
                <WizardHeader
                  step={STEP_BY_ROUTE.location}
                  total={DISPLAY_TOTAL}
                />
              ),
            }}
          />
          <Stack.Screen
            name="details"
            options={{
              title: tr("artwork.new.title.details"),
              headerTitle: () => (
                <WizardHeader
                  step={STEP_BY_ROUTE.details}
                  total={DISPLAY_TOTAL}
                />
              ),
            }}
          />
          <Stack.Screen
            name="review"
            options={{
              title: tr("artwork.new.title.review"),
              headerTitle: () => (
                <WizardHeader
                  step={STEP_BY_ROUTE.review}
                  total={DISPLAY_TOTAL}
                />
              ),
            }}
          />
          <Stack.Screen
            name="success"
            options={{
              title: tr("artwork.new.title.success"),
              headerShown: false,
            }}
          />
        </Stack>
      </NewArtworkContext.Provider>
    </FormProvider>
  );
}
