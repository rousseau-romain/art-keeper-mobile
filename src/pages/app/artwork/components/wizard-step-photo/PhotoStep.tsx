import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { usePhotoPicker } from "@/pages/app/artwork/hooks/usePhotoPicker";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

/** Step 1 — pick a single photo (camera or library), show EXIF auto-pin. */
export const PhotoStep = () => {
  const { t: tr } = useTranslation();
  const { photo, addPhoto, exifPinned } = usePhotoPicker();

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.photo.title")}
      </Text>
      <Text font="body" size="base" color="inkSoft">
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
              <Text font="mono" size="xs" color="inkSoft">
                {tr("artwork.new.photo.replace")}
              </Text>
            </View>
          </Pressable>

          {exifPinned && (
            <View style={styles.exif}>
              <Icon name="MapPin" size="xs" color="accent" />
              <Text font="mono" size="sm" color="accent">
                {tr("artwork.new.photo.exifFound")}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Pressable onPress={addPhoto} style={styles.empty}>
          <Icon name="Camera" size="xxl" color="inkMute" strokeWidth={1.4} />
          <Text
            font="display"
            size="lg"
            color="inkSoft"
            style={styles.emptyCta}
          >
            {tr("artwork.new.photo.cta")}
          </Text>
          <Text font="mono" size="sm" color="inkMute">
            {tr("artwork.new.photo.tapToAdd")}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  step: { gap: SpacingEnum.md },
  gap: { gap: SpacingEnum.md },
  title: { textTransform: "uppercase" },
  cover: {
    aspectRatio: 1,
    borderRadius: RadiusEnum.lg,
    overflow: "hidden",
    backgroundColor: ColorEnum.surface2,
  },
  coverBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.xs,
    borderRadius: RadiusEnum.sm,
    backgroundColor: ColorEnum.surface,
  },
  exif: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
  empty: {
    aspectRatio: 1,
    borderRadius: RadiusEnum.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: ColorEnum.line,
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.md,
    backgroundColor: ColorEnum.surface,
  },
  emptyCta: { textTransform: "uppercase", textAlign: "center" },
});
