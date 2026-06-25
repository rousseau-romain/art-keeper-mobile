import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export const NewScreen = () => {
  const { t: tr } = useTranslation();

  return (
    <View style={styles.screen}>
      <Icon name="Plus" size="xxl" color="inkMute" strokeWidth={1.6} />
      <Text font="body" size="base" color="inkSoft" style={styles.note}>
        {tr("artwork.createComingSoon")}
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
  note: { textAlign: "center" },
});
