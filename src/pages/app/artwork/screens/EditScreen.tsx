import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useArtwork } from "@/lib/api/artworks";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type EditScreenProps = { id: string };

export const EditScreen = ({ id }: EditScreenProps) => {
  const { t: tr } = useTranslation();
  const { data: artwork } = useArtwork(id);

  return (
    <View style={styles.screen}>
      <Icon name="Pencil" size="xxl" color="inkMute" strokeWidth={1.6} />
      {artwork ? (
        <Text font="display" size="lg" style={styles.title} numberOfLines={2}>
          {artwork.title}
        </Text>
      ) : null}
      <Text font="body" size="base" color="inkSoft" style={styles.note}>
        {tr("artwork.editComingSoon")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.md,
    padding: SpacingEnum.xxl,
    backgroundColor: ColorEnum.bg,
  },
  title: { textTransform: "uppercase", textAlign: "center" },
  note: { textAlign: "center" },
});
