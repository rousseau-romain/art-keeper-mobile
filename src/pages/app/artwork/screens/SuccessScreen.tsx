import { type Href, useRouter } from "expo-router";
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
  const router = useRouter();
  const { reset } = useFormContext<ArtworkValues>();

  const onAnother = () => {
    reset(EMPTY_ARTWORK_DRAFT);
    clearArtworkDraft();
    router.replace("/artworks/new" as Href);
  };

  return (
    <View style={styles.screen}>
      <SuccessStep artworkId={id} onAnother={onAnother} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
});
