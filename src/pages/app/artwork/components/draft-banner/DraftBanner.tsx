import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Button } from "@/shared/ui/button/Button";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type DraftBannerProps = {
  onDiscard: () => void;
};

export const DraftBanner = ({ onDiscard }: DraftBannerProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.banner}>
      <Text size="md" color="textSoft" style={styles.label}>
        {tr("artwork.new.draft.restored")}
      </Text>
      <Button
        label={tr("artwork.new.draft.discard")}
        variant="text"
        size="sm"
        onPress={onDiscard}
      />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SpacingEnum.sm,
      marginHorizontal: SpacingEnum.xl,
      marginTop: SpacingEnum.md,
      paddingLeft: SpacingEnum.md,
      paddingRight: SpacingEnum.sm,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface2,
      borderWidth: 1.5,
      borderColor: c.borderSoft,
    },
    label: { flex: 1 },
  });
