import { Stack } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

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
import { ColorEnum } from "@/theme/enums/color.enums";

/**
 * The wizard shell: owns the form, draft persistence, and the header for every
 * step route. `useForm` + `<FormProvider>` live here (above the per-step routes)
 * so the collected values survive navigating between steps; the header is the
 * Stack's custom `header`, with the active step derived from the focused route.
 */
export const NewArtworkLayout = () => {
  const methods = useForm<ArtworkValues>({
    mode: "onTouched",
    defaultValues: EMPTY_ARTWORK_DRAFT,
  });
  const draft = useArtworkDraft({ methods });

  return (
    <FormProvider {...methods}>
      <NewArtworkContext.Provider value={draft}>
        <Stack
          screenOptions={{
            header: ({ navigation, route }) => {
              const step = STEP_BY_ROUTE[route.name] ?? 1;
              return (
                <WizardHeader
                  step={step}
                  total={DISPLAY_TOTAL}
                  isFirst={step === 1}
                  onBack={() => navigation.goBack()}
                />
              );
            },
            contentStyle: styles.content,
          }}
        >
          <Stack.Screen name="success" options={{ headerShown: false }} />
        </Stack>
      </NewArtworkContext.Provider>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: ColorEnum.bg },
});
