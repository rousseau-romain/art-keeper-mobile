import { type Href, useRouter } from "expo-router";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import { ReviewStep } from "@/pages/app/artwork/components/wizard-step-review/ReviewStep";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useArtworkSubmit } from "@/pages/app/artwork/hooks/useArtworkSubmit";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/** Step 4 — review summary + submit; success replaces into its own route. */
export const ReviewStepScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const methods = useFormContext<ArtworkValues>();
  const { onSubmit, submitting } = useArtworkSubmit({
    methods,
    onCreated: (artwork) =>
      router.replace({
        pathname: "/create-artwork/success",
        params: { slug: artwork.slug },
      }),
  });

  useDocumentTitle(tr("artwork.new.title.review"));

  return (
    <WrapperView>
      <WrapperScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ReviewStep
          onEdit={(target) => router.push(`/create-artwork/${target}` as Href)}
        />
      </WrapperScrollView>

      <WizardFooter
        label={tr("artwork.new.submitCta")}
        loading={submitting}
        haptic={null}
        onPress={onSubmit}
      />
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: SpacingEnum.lg, gap: SpacingEnum.lg },
});
