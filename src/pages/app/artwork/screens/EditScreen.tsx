import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { useArtworkBySlug } from "@/lib/api/artworks";
import { EditPhotoBand } from "@/pages/app/artwork/components/edit-photo-band/EditPhotoBand";
import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import {
  type EditProposalValues,
  ProposeEditForm,
} from "@/pages/app/artwork/form/ProposeEditForm";
import { useProposeEditSubmit } from "@/pages/app/artwork/hooks/useProposeEditSubmit";
import { useHeaderHeight } from "@/shared/hooks/useHeaderHeight";
import { Text } from "@/shared/ui/text/Text";
import { WrapperKeyboardAvoidingView } from "@/shared/ui/wrapper/wrapper-keyboard-avoiding-view/WrapperKeyboardAvoidingView";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type EditScreenProps = { slug: string };

/**
 * Propose an edit to an existing artwork — an admin reviews it before it applies.
 * The form lives in the edit stack's shared `FormProvider` (see
 * `EditProposalLayout`), which also gates loading / not-found, so this screen just
 * reads the ready form via `useFormContext` and renders the fields + submit.
 */
export const EditScreen = ({ slug }: EditScreenProps) => {
  const { t: tr } = useTranslation();
  const headerHeight = useHeaderHeight();

  const { data: artwork } = useArtworkBySlug(slug);
  const methods = useFormContext<EditProposalValues>();
  const { onSubmit, submitting } = useProposeEditSubmit({ methods, artwork });

  // The layout only mounts this screen once the artwork is loaded (cache hit here).
  if (!artwork) return null;

  return (
    <WrapperKeyboardAvoidingView keyboardVerticalOffset={headerHeight}>
      <WrapperScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text font="display" size="xxl" style={styles.title}>
            {tr("artwork.edit.heading")}
          </Text>
          <Text font="body" size="base" color="textSoft">
            {tr("artwork.edit.intro", { title: artwork.title })}
          </Text>
        </View>

        <EditPhotoBand imageUrl={artwork.imageUrl} />

        <ProposeEditForm slug={slug} />
      </WrapperScrollView>

      <WizardFooter
        label={tr("artwork.edit.submitCta")}
        showArrow
        haptic={null}
        loading={submitting}
        onPress={onSubmit}
      />
    </WrapperKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: SpacingEnum.xl, gap: SpacingEnum.xl },
  header: { gap: SpacingEnum.sm },
  title: { textTransform: "uppercase" },
});
