import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type EditPhotoBandProps = { imageUrl: string };

/** Read-only cover thumbnail + caption — photo edits are proposed separately. */
export const EditPhotoBand = ({ imageUrl }: EditPhotoBandProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.band}>
      <Image source={{ uri: imageUrl }} style={styles.thumb} contentFit="cover" />
      <Text font="mono" size="xs" color="textMuted" style={styles.caption}>
        {tr("artwork.edit.photoNote")}
      </Text>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    band: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.md,
    },
    thumb: {
      width: ControlHeightEnum.lg,
      height: ControlHeightEnum.lg,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface2,
    },
    caption: { flex: 1 },
  });
