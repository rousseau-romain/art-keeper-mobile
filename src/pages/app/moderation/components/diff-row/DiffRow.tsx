import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type DiffRowProps = {
  /** Translated field label (e.g. "Artist"). */
  label: string;
  /** Display value for this side (already fallback-applied). */
  value: string;
  /** Which panel this row belongs to — drives the tint + marker. */
  side: "before" | "after";
  /** Whether the proposal changes this field. */
  changed: boolean;
  /** When set, the row is tappable and shows a chevron affordance. */
  onPress?: () => void;
  /** a11y label for the tappable row (required with `onPress`). */
  accessibilityLabel?: string;
};

/**
 * One labelled field inside a diff panel. When the proposal changes the field,
 * the row is tinted (red on the "before" side, green on the "after" side) and
 * gains a `-` / `+` marker; unchanged fields render neutral. With `onPress` the
 * whole row becomes a button (a trailing chevron signals it) — used by the
 * location row to open the map sheet.
 */
export const DiffRow = ({
  label,
  value,
  side,
  changed,
  onPress,
  accessibilityLabel,
}: DiffRowProps) => {
  const { colors } = useTheme();
  const before = side === "before";
  const accent = before ? colors.danger : colors.success;
  const accentBg = before ? colors.dangerBg : colors.successBg;

  const content = (
    <>
      <View style={styles.labelCol}>
        {changed && (
          <Text
            font="mono"
            size="xs"
            style={[styles.marker, { color: accent }]}
          >
            {before ? "-" : "+"}
          </Text>
        )}
        <Text
          font="mono"
          size="xs"
          style={[styles.label, { color: changed ? accent : colors.textMuted }]}
        >
          {label}
        </Text>
      </View>
      <Text
        size="base"
        style={[styles.value, { color: changed ? accent : colors.text }]}
      >
        {value}
      </Text>
      {onPress && <Icon name="ChevronRight" size="sm" color="textMuted" />}
    </>
  );

  const rowStyle = [
    styles.row,
    { backgroundColor: changed ? accentBg : colors.transparent },
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={rowStyle}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.md,
  },
  labelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.xs,
    width: 96,
  },
  marker: { width: SpacingEnum.sm },
  label: { textTransform: "uppercase", letterSpacing: 0.5 },
  value: { flex: 1 },
});
