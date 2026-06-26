import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { FontSizeEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type WizardHeaderProps = {
  step: number;
  total: number;
  isFirst: boolean;
  onBack: () => void;
};

/**
 * Wizard chrome: a Cancel/Back affordance, the numbered step dots (completed →
 * filled with a check, current → accent ring), and the "n/total" counter.
 */
export const WizardHeader = ({
  step,
  total,
  isFirst,
  onBack,
}: WizardHeaderProps) => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + SpacingEnum.sm }]}>
      <View style={styles.left}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
          <Icon name="ChevronLeft" size="sm" color="inkSoft" />
          <Text font="mono" size="md" color="inkSoft">
            {isFirst ? tr("artwork.new.cancel") : tr("artwork.new.back")}
          </Text>
        </Pressable>

        <View style={styles.dots}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
            const done = n < step;
            const active = n === step;
            return (
              <View key={n} style={styles.dotWrap}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done
                        ? ColorEnum.accent
                        : ColorEnum.transparent,
                      borderColor:
                        done || active ? ColorEnum.accent : ColorEnum.line,
                    },
                  ]}
                >
                  {done ? (
                    <Icon name="Check" size="xs" color="accentInk" />
                  ) : (
                    <Text
                      font="mono"
                      size="xs"
                      color={active ? "accent" : "inkMute"}
                    >
                      {n}
                    </Text>
                  )}
                </View>
                {n < total && (
                  <View
                    style={[
                      styles.connector,
                      {
                        backgroundColor: done
                          ? ColorEnum.accent
                          : ColorEnum.line,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <Text font="mono" size="sm" color="inkMute">
        {tr("artwork.new.stepOf", { step, total })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SpacingEnum.lg,
    paddingBottom: SpacingEnum.md,
    gap: SpacingEnum.sm,
    backgroundColor: ColorEnum.bg,
    borderBottomWidth: 1.5,
    borderBottomColor: ColorEnum.hair,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.md,
    flexShrink: 1,
  },
  back: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  dots: { flexDirection: "row", alignItems: "center" },
  dotWrap: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: FontSizeEnum.xl,
    height: FontSizeEnum.xl,
    borderRadius: FontSizeEnum.xl / 2,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: { width: SpacingEnum.sm, height: 1.5 },
});
