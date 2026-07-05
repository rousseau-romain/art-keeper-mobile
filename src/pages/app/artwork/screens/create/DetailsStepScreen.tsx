import { useRouter } from "expo-router";
import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { WizardFooter } from "@/pages/app/artwork/components/wizard-footer/WizardFooter";
import {
  ArtworkForm,
  type ArtworkValues,
} from "@/pages/app/artwork/form/ArtworkForm";
import { useHeaderHeight } from "@/shared/hooks/useHeaderHeight";
import { Seo } from "@/shared/ui/seo/Seo";
import { Text } from "@/shared/ui/text/Text";
import { useToast } from "@/shared/ui/toast/Toast";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Step 3 — the artwork details form (title, artist, tags, note). */
export const DetailsStepScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { show } = useToast();
  const { control, trigger } = useFormContext<ArtworkValues>();
  const artistId = useWatch({ control, name: "artistId" });
  const warnedNoArtist = useRef(false);
  const headerHeight = useHeaderHeight();
  const styles = useThemeStyles(createStyles);

  // Only advance once the title validates. The first attempt without an artist
  // warns (once) instead of advancing, so the user gets a chance to credit one;
  // tapping again proceeds without one.
  const onReview = async () => {
    if (!(await trigger("title"))) return;
    if (!artistId && !warnedNoArtist.current) {
      warnedNoArtist.current = true;
      show(tr("artwork.new.errors.noArtist"), "warning");
      return;
    }
    router.push("/create-artwork/review");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <Seo title={tr("artwork.new.title.details")} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.details}>
          <Text font="display" size="xxl" style={styles.detailsTitle}>
            {tr("artwork.new.details.title")}
          </Text>
          <ArtworkForm />
        </View>
      </ScrollView>

      <WizardFooter
        label={tr("artwork.new.reviewCta")}
        showArrow
        onPress={onReview}
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    scrollView: { flex: 1 },
    scroll: { padding: SpacingEnum.xl, gap: SpacingEnum.md },
    details: { gap: SpacingEnum.xl },
    detailsTitle: { textTransform: "uppercase" },
  });
