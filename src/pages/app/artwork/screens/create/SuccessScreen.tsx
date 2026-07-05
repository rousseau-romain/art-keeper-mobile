import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SuccessStep } from "@/pages/app/artwork/components/wizard-step-success/SuccessStep";
import { clearArtworkDraft } from "@/pages/app/artwork/draft-store";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { EMPTY_ARTWORK_DRAFT } from "@/pages/app/artwork/hooks/useArtworkDraft";
import { Seo } from "@/shared/ui/seo/Seo";
import type { Palette } from "@/theme/enums/color.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type SuccessScreenProps = {
  slug?: string;
};

/** Post-submit confirmation; "create another" resets the form and restarts. */
export const SuccessScreen = ({ slug }: SuccessScreenProps) => {
  const { t: tr } = useTranslation();
  const navigation = useNavigation();
  const { reset } = useFormContext<ArtworkValues>();
  const styles = useThemeStyles(createStyles);

  // Reset the wizard back to a blank step 1: pop the create-artwork stack to its
  // root, wipe the collected values, and clear the persisted draft — the same
  // cleanup the "submit another" button does, factored out for reuse.
  const resetWizard = useCallback(() => {
    // Pop the create-artwork stack to its root (step 1) so re-entering the tab
    // starts fresh — `POP_TO_TOP` is React Navigation's stack action. Guarded by
    // `canGoBack()`: leaving via "back to browse" (`router.replace`) tears this
    // stack down first, so dispatching then would hit no navigator ("POP_TO_TOP
    // was not handled"). When we only blur (tab switch / push) the stack is still
    // mounted and `canGoBack()` is true, so the reset still happens.
    if (navigation.canGoBack()) {
      navigation.dispatch({ type: "POP_TO_TOP" });
    }
    reset(EMPTY_ARTWORK_DRAFT);
    clearArtworkDraft();
  }, [navigation, reset]);

  // Run it whenever the success screen loses focus — leaving via "track
  // submission", "back to browse", a back gesture, or switching tabs all reset
  // the wizard, not just "submit another". (Fires as the blur cleanup.)
  useFocusEffect(useCallback(() => resetWizard, [resetWizard]));

  const onAnother = () => resetWizard();

  return (
    <View style={styles.screen}>
      <Seo title={tr("artwork.new.title.success")} />
      <SuccessStep slug={slug} onAnother={onAnother} />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
  });
