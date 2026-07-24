import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type SettingRowProps = ViewProps & {
  label: string;
  hint: string;
  hasBottomBorder?: boolean;
  /** When set, the hint becomes a tappable call-to-action (e.g. open settings). */
  onHintPress?: () => void;
  /** Accessibility label for the tappable hint. */
  hintActionLabel?: string;
};

export const SettingRow = ({
  label,
  hint,
  children,
  style,
  hasBottomBorder = true,
  onHintPress,
  hintActionLabel,
  ...rest
}: SettingRowProps) => {
  const styles = useThemeStyles(createStyles);
  return (
    <View
      {...rest}
      style={[
        styles.row,
        style,
        hasBottomBorder ? null : styles.noBottomBorder,
      ]}
    >
      <View style={styles.rowText}>
        <Text font="body" size="base">
          {label}
        </Text>
        {onHintPress ? (
          <Pressable
            onPress={onHintPress}
            accessibilityRole="button"
            accessibilityLabel={hintActionLabel}
          >
            <Text font="body" size="sm" color="primary">
              {hint}
            </Text>
          </Pressable>
        ) : (
          <Text font="body" size="sm" color="textSoft">
            {hint}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SpacingEnum.lg,
      paddingVertical: SpacingEnum.md,
      borderBottomWidth: 1.5,
      borderColor: c.borderSoft,
    },
    noBottomBorder: { borderBottomWidth: 0 },
    rowText: { flex: 1, gap: SpacingEnum.xs },
  });
