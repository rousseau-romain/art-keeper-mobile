import { useRouter } from "expo-router";
import { useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { DraftBanner } from "@/pages/app/artwork/components/draft-banner/DraftBanner";
import { WizardHeader } from "@/pages/app/artwork/components/wizard-header/WizardHeader";
import { LocationStep } from "@/pages/app/artwork/components/wizard-step-location/LocationStep";
import { PhotoStep } from "@/pages/app/artwork/components/wizard-step-photo/PhotoStep";
import { ReviewStep } from "@/pages/app/artwork/components/wizard-step-review/ReviewStep";
import { SuccessStep } from "@/pages/app/artwork/components/wizard-step-success/SuccessStep";
import { clearArtworkDraft } from "@/pages/app/artwork/draft-store";
import {
  ArtworkForm,
  type ArtworkValues,
} from "@/pages/app/artwork/form/ArtworkForm";
import {
  EMPTY_ARTWORK_DRAFT,
  useArtworkDraft,
} from "@/pages/app/artwork/hooks/useArtworkDraft";
import { useArtworkSubmit } from "@/pages/app/artwork/hooks/useArtworkSubmit";
import { useArtworkWizard } from "@/pages/app/artwork/hooks/useArtworkWizard";
import { Button } from "@/shared/ui/button/Button";
import { Text } from "@/shared/ui/text/Text";
import { useToast } from "@/shared/ui/toast/Toast";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

// Display total includes the submit/success step so the counter reads "n/5"
// across the four input steps, matching the mockups.
const DISPLAY_TOTAL = 5;

export const NewScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { show } = useToast();

  const methods = useForm<ArtworkValues>({
    mode: "onTouched",
    defaultValues: EMPTY_ARTWORK_DRAFT,
  });
  const { restored, discardDraft } = useArtworkDraft({ methods });
  const { step, next, back, goTo, isFirst } = useArtworkWizard();
  const { onSubmit, submitting, created, clearCreated } = useArtworkSubmit({
    methods,
  });

  // useWatch (not methods.watch) so the footer's enable/disable reacts under the
  // React Compiler the instant a photo is added or the pin moves.
  const photo = useWatch({ control: methods.control, name: "photo" });
  const latitude = useWatch({ control: methods.control, name: "latitude" });
  const longitude = useWatch({ control: methods.control, name: "longitude" });
  const artistId = useWatch({ control: methods.control, name: "artistId" });
  const hasPhoto = photo != null;
  const hasPin = latitude != null && longitude != null;

  const warnedNoArtist = useRef(false);

  const onBack = () => {
    if (isFirst) router.back();
    else back();
  };

  const onAnother = () => {
    methods.reset(EMPTY_ARTWORK_DRAFT);
    clearArtworkDraft();
    clearCreated();
    goTo(1);
  };

  // Step 3 → review only advances once the title validates. The first attempt
  // without an artist warns (once) instead of advancing, so the user gets a
  // chance to credit one; tapping again proceeds without one.
  const advanceFromDetails = async () => {
    if (!(await methods.trigger("title"))) return;
    if (!artistId && !warnedNoArtist.current) {
      warnedNoArtist.current = true;
      show(tr("artwork.new.errors.noArtist"), "warning");
      return;
    }
    next();
  };

  if (created) {
    return (
      <View style={styles.screen}>
        <SuccessStep artworkId={created.id} onAnother={onAnother} />
      </View>
    );
  }

  const footer = (() => {
    switch (step) {
      case 1:
        return {
          label: tr("artwork.new.next"),
          disabled: !hasPhoto,
          loading: false,
          onPress: next,
        };
      case 2:
        return {
          label: tr("artwork.new.next"),
          disabled: !hasPin,
          loading: false,
          onPress: next,
        };
      case 3:
        return {
          label: tr("artwork.new.reviewCta"),
          disabled: false,
          loading: false,
          onPress: advanceFromDetails,
        };
      default:
        return {
          label: tr("artwork.new.submitCta"),
          disabled: false,
          loading: submitting,
          onPress: onSubmit,
        };
    }
  })();

  const body = (() => {
    switch (step) {
      case 1:
        return <PhotoStep />;
      case 3:
        return (
          <View style={styles.details}>
            <Text font="display" size="xxl" style={styles.detailsTitle}>
              {tr("artwork.new.details.title")}
            </Text>
            <ArtworkForm />
          </View>
        );
      default:
        return <ReviewStep onEdit={goTo} />;
    }
  })();

  return (
    <FormProvider {...methods}>
      <View style={styles.screen}>
        <WizardHeader
          step={step}
          total={DISPLAY_TOTAL}
          isFirst={isFirst}
          onBack={onBack}
        />

        {restored && <DraftBanner onDiscard={discardDraft} />}

        {/* The map step can't live in a ScrollView (gesture conflict), so it
            renders in a plain flex container; the others scroll. */}
        {step === 2 ? (
          <View style={styles.mapBody}>
            <LocationStep />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Button
            label={footer.label}
            variant="primary"
            block
            disabled={footer.disabled}
            loading={footer.loading}
            iconAfter={step < 4 ? { name: "ArrowRight" } : undefined}
            onPress={footer.onPress}
          />
        </View>
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  scrollView: { flex: 1 },
  scroll: { padding: SpacingEnum.xl, gap: SpacingEnum.md },
  mapBody: { flex: 1, padding: SpacingEnum.xl },
  details: { gap: SpacingEnum.xl },
  detailsTitle: { textTransform: "uppercase" },
  footer: {
    paddingHorizontal: SpacingEnum.xl,
    paddingVertical: SpacingEnum.md,
    borderTopWidth: 1.5,
    borderTopColor: ColorEnum.hair,
    backgroundColor: ColorEnum.bg,
  },
});
