import { type Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type SuccessStepProps = {
  slug?: string;
  onAnother: () => void;
};

/** Step 5 — the post-submit confirmation panel. */
export const SuccessStep = ({ slug, onAnother }: SuccessStepProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useThemeStyles(createStyles);

  return (
    <View
      style={[styles.success, { paddingTop: insets.top + SpacingEnum.xxxl }]}
    >
      <View style={styles.icon}>
        <Icon name="Check" size="xxl" color="primaryInk" strokeWidth={2.4} />
      </View>

      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.success.title")}
      </Text>
      <Text font="body" size="base" color="textSoft" style={styles.body}>
        {tr("artwork.new.success.body")}
      </Text>

      <View style={styles.statusPill}>
        <Text font="mono" size="xs" color="textMuted">
          {tr("artwork.new.success.status")}
        </Text>
      </View>

      <View style={styles.actions}>
        {slug && (
          <Button
            label={tr("artwork.new.success.track")}
            block
            onPress={() => router.push(`/artworks/${slug}` as Href)}
          />
        )}
        <Button
          label={tr("artwork.new.success.another")}
          variant="primary"
          block
          onPress={onAnother}
        />
        <Pressable
          onPress={() => router.replace("/artworks")}
          hitSlop={8}
          style={styles.backLink}
        >
          <Text font="mono" size="sm" color="primary">
            {tr("artwork.new.success.backToBrowse")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    success: {
      flex: 1,
      alignItems: "center",
      gap: SpacingEnum.lg,
      paddingHorizontal: SpacingEnum.xl,
    },
    icon: {
      width: ControlHeightEnum.md,
      height: ControlHeightEnum.md,
      borderRadius: RadiusEnum.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
    },
    title: { textTransform: "uppercase" },
    body: { textAlign: "center" },
    statusPill: {
      paddingHorizontal: SpacingEnum.md,
      paddingVertical: SpacingEnum.xs,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface2,
    },
    actions: {
      alignSelf: "stretch",
      gap: SpacingEnum.md,
      alignItems: "center",
    },
    backLink: { paddingVertical: SpacingEnum.sm },
  });
