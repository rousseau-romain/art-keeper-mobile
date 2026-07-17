import { useRouter } from "expo-router";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import { LocationStep } from "@/pages/app/artwork/components/wizard-step-location/LocationStep";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/** Step 2 — confirm the pin. The map can't sit in a ScrollView (gesture conflict). */
export const LocationStepScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { control } = useFormContext<ArtworkValues>();
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const hasPin = latitude != null && longitude != null;

  useDocumentTitle(tr("artwork.new.title.location"));

  return (
    <WrapperView>
      <View style={styles.mapBody}>
        <LocationStep />
      </View>

      <WizardFooter
        label={tr("artwork.new.next")}
        disabled={!hasPin}
        showArrow
        onPress={() => router.push("/create-artwork/details")}
      />
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  mapBody: { flex: 1, padding: SpacingEnum.xl },
});
