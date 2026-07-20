import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { usePhotoPicker } from "@/pages/app/artwork/hooks/usePhotoPicker";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Step 1 — pick a single photo (camera or library), show EXIF auto-pin. */
export const PhotoStep = () => {
  const { t: tr } = useTranslation();
  const { photo, addPhoto, isExifPinned } = usePhotoPicker();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.photo.title")}
      </Text>
      <Text font="body" size="base" color="textSoft">
        {tr("artwork.new.photo.subtitle")}
      </Text>

      {photo ? (
        <View style={styles.gap}>
          <Pressable onPress={addPhoto} style={styles.cover}>
            <Image
              source={{ uri: photo.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={styles.coverBadge}>
              <Text font="mono" size="xs" color="textSoft">
                {tr("artwork.new.photo.replace")}
              </Text>
            </View>
          </Pressable>

          {isExifPinned && (
            <View style={styles.exif}>
              <Icon name="MapPin" size="xs" color="primary" />
              <Text font="mono" size="sm" color="primary">
                {tr("artwork.new.photo.exifFound")}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Pressable onPress={addPhoto} style={styles.empty}>
          <Icon name="Camera" size="xxl" color="textMuted" strokeWidth={1.4} />
          <Text
            font="display"
            size="lg"
            color="textSoft"
            style={styles.emptyCta}
          >
            {tr("artwork.new.photo.cta")}
          </Text>
          <Text font="mono" size="sm" color="textMuted">
            {tr("artwork.new.photo.tapToAdd")}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    step: { gap: SpacingEnum.md },
    gap: { gap: SpacingEnum.md },
    title: { textTransform: "uppercase" },
    cover: {
      aspectRatio: 1,
      borderRadius: RadiusEnum.lg,
      overflow: "hidden",
      backgroundColor: c.surface2,
    },
    coverBadge: {
      position: "absolute",
      alignSelf: "center",
      top: "50%",
      paddingHorizontal: SpacingEnum.md,
      paddingVertical: SpacingEnum.xs,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface,
    },
    exif: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
    empty: {
      aspectRatio: 1,
      borderRadius: RadiusEnum.lg,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      gap: SpacingEnum.md,
      backgroundColor: c.surface,
    },
    emptyCta: { textTransform: "uppercase", textAlign: "center" },
  });
