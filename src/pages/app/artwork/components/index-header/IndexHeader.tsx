import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { Button } from "@/shared/ui/button/Button";
import { IconButton } from "@/shared/ui/icon-button/IconButton";
import { Seo } from "@/shared/ui/seo/Seo";
import { StatusDot } from "@/shared/ui/status-dot/StatusDot";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum, type ColorEnumValue } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type IndexHeaderProps = {
  count: number;
  hasNextPage: boolean;
  backgroundRefetching: boolean;
  isStale: boolean;
};

export const IndexHeader = ({
  count,
  hasNextPage,
  backgroundRefetching,
  isStale,
}: IndexHeaderProps) => {
  const { t: tr } = useTranslation();
  const { language, toggleLanguage } = useLocale();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const router = useRouter();

  const status = ((): { color: ColorEnumValue; label: string } => {
    if (backgroundRefetching)
      return { color: ColorEnum.accent, label: tr("artwork.statusUpdating") };
    if (isStale)
      return { color: ColorEnum.inkMute, label: tr("artwork.statusStale") };
    return { color: ColorEnum.diffAdd, label: tr("artwork.statusLive") };
  })();

  return (
    <View style={[styles.header, { paddingTop: insets.top + SpacingEnum.xl }]}>
      <Seo title={tr("artwork.title.index")} />
      <View style={styles.headerRow}>
        <Text font="display" size="xxl" style={styles.title}>
          {tr("artwork.title.index")}
        </Text>
        <View style={styles.headerActions}>
          <Button
            variant="text"
            size="sm"
            label={language}
            onPress={toggleLanguage}
            accessibilityLabel={tr("a11y.language", { language })}
          />
          <IconButton
            name="Settings"
            onPress={() => router.push("/settings")}
            accessibilityLabel={tr("a11y.settings")}
          />
          <IconButton
            name="LogOut"
            onPress={signOut}
            accessibilityLabel={tr("artwork.signOut")}
          />
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text font="mono" size="sm">
          {tr("artwork.pieceCount", { count })}
          {hasNextPage ? "+" : ""} · {tr("artwork.location")}
        </Text>
        <StatusDot color={status.color} label={status.label} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: SpacingEnum.xs,
    borderBottomWidth: 1.5,
    backgroundColor: ColorEnum.bg,
    borderBottomColor: ColorEnum.hair,
    paddingBottom: SpacingEnum.md,
    zIndex: 1,
    elevation: 1,
  },
  title: { textTransform: "uppercase" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SpacingEnum.xl,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
    paddingHorizontal: SpacingEnum.xl,
  },
});
