import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

/** Which face of the browse screen is showing — the map or the card grid. */
export type ArtworkView = "map" | "grid";

export type ViewToggleProps = ViewProps & {
  view: ArtworkView;
  onChange: (view: ArtworkView) => void;
};

/** Segmented Map ⇄ Grid control for the browse header. */
export const ViewToggle = ({
  view,
  onChange,
  style,
  ...rest
}: ViewToggleProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={[styles.group, style]} {...rest}>
      <Pressable
        onPress={() => onChange("map")}
        accessibilityRole="button"
        accessibilityState={{ selected: view === "map" }}
        accessibilityLabel={tr("a11y.viewMap")}
        style={[
          styles.segment,
          {
            backgroundColor:
              view === "map" ? colors.primary : colors.transparent,
          },
        ]}
      >
        <Icon
          name="Map"
          size="xs"
          color={view === "map" ? "primaryInk" : "textMuted"}
        />
        <Text
          font="mono"
          size="sm"
          color={view === "map" ? "primaryInk" : "textMuted"}
        >
          {tr("artwork.map.toggleMap")}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("grid")}
        accessibilityRole="button"
        accessibilityState={{ selected: view === "grid" }}
        accessibilityLabel={tr("a11y.viewGrid")}
        style={[
          styles.segment,
          {
            backgroundColor:
              view === "grid" ? colors.primary : colors.transparent,
          },
        ]}
      >
        <Icon
          name="LayoutGrid"
          size="xs"
          color={view === "grid" ? "primaryInk" : "textMuted"}
        />
        <Text
          font="mono"
          size="sm"
          color={view === "grid" ? "primaryInk" : "textMuted"}
        >
          {tr("artwork.map.toggleGrid")}
        </Text>
      </Pressable>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    group: {
      flexDirection: "row",
      borderWidth: 1.5,
      borderColor: c.borderSoft,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface,
      overflow: "hidden",
    },
    segment: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.xs,
      paddingHorizontal: SpacingEnum.md,
      paddingVertical: SpacingEnum.sm,
    },
  });
