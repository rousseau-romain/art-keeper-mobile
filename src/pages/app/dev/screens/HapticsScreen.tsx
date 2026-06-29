import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HAPTIC_NAMES, useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Seo } from "@/shared/ui/seo/Seo";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export const HapticsScreen = () => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptics();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + SpacingEnum.xl,
          paddingBottom: insets.bottom + SpacingEnum.xl,
        },
      ]}
    >
      <Seo title={tr("dev.haptics.title")} />
      <Text font="display" size="xxl" style={styles.title}>
        {tr("dev.haptics.title")}
      </Text>
      <Text font="mono" size="sm" color="inkMute">
        {tr("dev.haptics.subtitle")}
      </Text>

      <View style={styles.list}>
        {HAPTIC_NAMES.map((name) => (
          <Button
            key={name}
            label={name}
            variant="default"
            block
            iconBefore={{ name: "Vibrate" }}
            onPress={() => haptic(name)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  content: {
    paddingHorizontal: SpacingEnum.xl,
    gap: SpacingEnum.xs,
  },
  title: { textTransform: "uppercase" },
  list: { marginTop: SpacingEnum.xl, gap: SpacingEnum.md },
});
