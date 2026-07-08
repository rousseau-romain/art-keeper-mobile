import { useRouter } from "expo-router";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { DraftBanner } from "@/pages/app/artwork/components/draft-banner/DraftBanner";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import { PhotoStep } from "@/pages/app/artwork/components/wizard-step-photo/PhotoStep";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useNewArtwork } from "@/pages/app/artwork/new-artwork-context";
import { Seo } from "@/shared/ui/seo/Seo";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/** Step 1 — pick the photo; restored-draft banner lives here, on the first step. */
export const PhotoStepScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { control } = useFormContext<ArtworkValues>();
  const { restored, discardDraft } = useNewArtwork();
  const photo = useWatch({ control, name: "photo" });

  return (
    <WrapperView>
      <Seo title={tr("artwork.new.title.index")} />
      {restored && <DraftBanner onDiscard={discardDraft} />}

      <WrapperScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <PhotoStep />
      </WrapperScrollView>

      <WizardFooter
        label={tr("artwork.new.next")}
        disabled={photo == null}
        showArrow
        onPress={() => router.push("/create-artwork/location")}
      />
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: SpacingEnum.xl, gap: SpacingEnum.md },
});
