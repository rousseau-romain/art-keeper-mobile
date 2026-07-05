import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { FontSizeEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type WizardHeaderProps = {
  step: number;
  total: number;
};

/**
 * Wizard chrome rendered as the native header title: the numbered step dots
 * (completed → filled with a check, current → accent ring) and the "n/total"
 * counter. The native header bar supplies the safe-area inset, background and
 * back button, so this is a bare, content-sized row.
 */
export const WizardHeader = ({ step, total }: WizardHeaderProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
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
                    backgroundColor: done ? colors.primary : colors.transparent,
                    borderColor:
                      done || active ? colors.primary : colors.border,
                  },
                ]}
              >
                {done ? (
                  <Icon name="Check" size="xs" color="primaryInk" />
                ) : (
                  <Text
                    font="mono"
                    size="xs"
                    color={active ? "primary" : "textMuted"}
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
                      backgroundColor: done ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <Text font="mono" size="sm" color="textMuted">
        {tr("artwork.new.stepOf", { step, total })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.md,
  },
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
