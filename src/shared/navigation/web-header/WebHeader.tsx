import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/shared/ui/icon/Icon";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type WebHeaderProps = BottomTabBarProps;

/**
 * Desktop-web replacement for the bottom tab bar: the ArtKeeper brand on the
 * left, the tab links + settings on the right. Rendered via the `<Tabs tabBar>`
 * prop with `tabBarPosition: "top"`, so it sits above the screen content. Only
 * used on `Platform.OS === "web"` past the wide breakpoint — native / mobile web
 * keep the default bottom bar (see `src/app/(tabs)/_layout.tsx`). On desktop the
 * per-page native headers are hidden, so this is also where settings is reached.
 */
export const WebHeader = ({
  state,
  descriptors,
  navigation,
}: WebHeaderProps) => {
  const router = useRouter();
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Icon name="Star" size="xl" color="primary" fill={colors.primary} />
        <Text font="display" size="xl">
          ArtKeeper
        </Text>
      </View>

      <View style={styles.right}>
        <View style={styles.links}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            // `href: null` (the dev tab in prod) is implemented by expo-router
            // as a hidden tab item — skip it so the header mirrors the tabs.
            const itemStyle = StyleSheet.flatten(options.tabBarItemStyle);
            if (itemStyle?.display === "none") return null;

            const active = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="link"
                style={styles.link}
              >
                <Text
                  font="mono"
                  size="sm"
                  color={active ? "primary" : "textMuted"}
                >
                  {options.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <IconButton
          name="Settings"
          onPress={() => router.push("/settings")}
          accessibilityLabel={tr("a11y.settings")}
        />
      </View>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SpacingEnum.xl,
      paddingVertical: SpacingEnum.lg,
      backgroundColor: c.surface,
      borderBottomWidth: 1.5,
      borderBottomColor: c.borderSoft,
    },
    brand: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
    right: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xl },
    links: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xl },
    link: { paddingVertical: SpacingEnum.xs },
  });
