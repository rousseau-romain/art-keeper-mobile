import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { HAPTIC_NAMES, useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Text } from "@/shared/ui/text/Text";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export const HapticsScreen = () => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptics();

  useDocumentTitle(tr("dev.tab"));

  return (
    <WrapperScrollView
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + SpacingEnum.xl,
          paddingBottom: insets.bottom + SpacingEnum.xl,
        },
      ]}
    >
      <Text font="display" size="xxl" style={styles.title}>
        {tr("dev.haptics.title")}
      </Text>
      <Text font="mono" size="sm" color="textMuted">
        {tr("dev.haptics.subtitle")}
      </Text>

      <View style={styles.list}>
        {HAPTIC_NAMES.map((name) => (
          <Button
            key={name}
            label={name}
            variant="default"
            iconBefore={{ name: "Vibrate" }}
            onPress={() => haptic(name)}
          />
        ))}
      </View>
    </WrapperScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SpacingEnum.xl,
    gap: SpacingEnum.xs,
  },
  title: { textTransform: "uppercase" },
  list: { marginTop: SpacingEnum.xl, gap: SpacingEnum.md },
});
