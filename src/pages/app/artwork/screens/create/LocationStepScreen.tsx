import { useRouter } from "expo-router";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import { LocationStep } from "@/pages/app/artwork/components/wizard-step-location/LocationStep";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { Seo } from "@/shared/ui/seo/Seo";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Step 2 — confirm the pin. The map can't sit in a ScrollView (gesture conflict). */
export const LocationStepScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { control } = useFormContext<ArtworkValues>();
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const hasPin = latitude != null && longitude != null;
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.screen}>
      <Seo title={tr("artwork.new.title.location")} />
      <View style={styles.mapBody}>
        <LocationStep />
      </View>

      <WizardFooter
        label={tr("artwork.new.next")}
        disabled={!hasPin}
        showArrow
        onPress={() => router.push("/create-artwork/details")}
      />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    mapBody: { flex: 1, padding: SpacingEnum.xl },
  });
