import { useTranslation } from "react-i18next";
import { Pressable, type PressableProps, StyleSheet } from "react-native";
import { useFilterLabel } from "@/pages/app/artwork/hooks/useFilterLabel";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type FilterPillProps = PressableProps & {
  /** Number of active filters; drives the label (count vs. "Filters"). */
  count: number;
  onPress: () => void;
};

/**
 * Pill button that opens the artwork filter form sheet. Shows the applied-filter
 * count when any are active, otherwise the generic "Filters" label. Shared by the
 * map overlay and the grid controls row on the browse screen.
 */
export const FilterPill = ({
  count,
  onPress,
  style,
  ...rest
}: FilterPillProps) => {
  const { t: tr } = useTranslation();
  const { label } = useFilterLabel(count);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("a11y.filters")}
      style={(state) => [
        styles.pill,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Icon name="SlidersHorizontal" size="xs" color="ink" />
      <Text font="mono" size="sm">
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
    borderWidth: 1.5,
    borderColor: ColorEnum.hair,
    borderRadius: RadiusEnum.full,
    backgroundColor: ColorEnum.surface,
  },
});
