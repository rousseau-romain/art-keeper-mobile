import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { SuccessStep } from "@/pages/app/artwork/components/wizard-step-success/SuccessStep";
import { clearArtworkDraft } from "@/pages/app/artwork/draft-store";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { EMPTY_ARTWORK_DRAFT } from "@/pages/app/artwork/hooks/useArtworkDraft";
import { ColorEnum } from "@/theme/enums/color.enums";

export type SuccessScreenProps = {
  id?: string;
};

/** Post-submit confirmation; "create another" resets the form and restarts. */
export const SuccessScreen = ({ id }: SuccessScreenProps) => {
  const navigation = useNavigation();
  const { reset } = useFormContext<ArtworkValues>();

  // Reset the wizard back to a blank step 1: pop the create-artwork stack to its
  // root, wipe the collected values, and clear the persisted draft — the same
  // cleanup the "submit another" button does, factored out for reuse.
  const resetWizard = useCallback(() => {
    // Pop the create-artwork stack to its root (step 1). Dispatched to this
    // screen's own stack so it lands on the wizard regardless of which tab is
    // focused when we leave — `POP_TO_TOP` is React Navigation's stack action.
    navigation.dispatch({ type: "POP_TO_TOP" });
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
      <SuccessStep artworkId={id} onAnother={onAnother} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
});
