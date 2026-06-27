import { type Href, useRouter } from "expo-router";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import { ReviewStep } from "@/pages/app/artwork/components/wizard-step-review/ReviewStep";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useArtworkSubmit } from "@/pages/app/artwork/hooks/useArtworkSubmit";
import { ColorEnum } from "@/theme/enums/color.enums";
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
        pathname: "/artworks/new/success",
        params: { id: artwork.id },
      } as Href),
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ReviewStep
          onEdit={(target) => router.push(`/artworks/new/${target}` as Href)}
        />
      </ScrollView>

      <WizardFooter
        label={tr("artwork.new.submitCta")}
        loading={submitting}
        haptic={null}
        onPress={onSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  scrollView: { flex: 1 },
  scroll: { padding: SpacingEnum.xl, gap: SpacingEnum.md },
});
