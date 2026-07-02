import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth/AuthProvider";
import {
  type BiometricAvailability,
  type BiometricKind,
  getBiometricAvailability,
  getBiometricKind,
  getBiometricLabelKey,
} from "@/lib/auth/biometrics";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Seo } from "@/shared/ui/seo/Seo";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type SettingsScreenProps = Record<string, never>;

// The sub-label explains *why* the toggle is off when it can't be enabled:
// "not-enrolled" is actionable (set one up in system settings), "no-hardware"
// isn't. While availability is still loading (null) we show the normal hint.
const HINT_KEY: Record<
  BiometricAvailability,
  | "settings.biometricHint"
  | "settings.biometricNotEnrolled"
  | "settings.biometricUnavailable"
> = {
  available: "settings.biometricHint",
  "not-enrolled": "settings.biometricNotEnrolled",
  "no-hardware": "settings.biometricUnavailable",
};

export const SettingsScreen = () => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { biometricEnabled, setBiometricEnabled, signOut } = useAuth();

  const [availability, setAvailability] =
    useState<BiometricAvailability | null>(null);
  const [kind, setKind] = useState<BiometricKind>("biometric");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getBiometricAvailability().then(setAvailability);
    getBiometricKind().then(setKind);
  }, []);

  const onToggle = async (next: boolean) => {
    setBusy(true);
    // The provider verifies with a biometric prompt when enabling and only flips
    // `biometricEnabled` on success, so the bound Switch reflects the real state.
    await setBiometricEnabled(next);
    setBusy(false);
  };

  const method = tr(getBiometricLabelKey(kind));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + SpacingEnum.xl }]}>
      <Seo title={tr("settings.title.index")} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Icon name="ChevronLeft" size="lg" color="ink" />
        </Pressable>
        <Text font="display" size="xxl">
          {tr("settings.title.index")}
        </Text>
      </View>

      <Text font="mono" size="sm" color="inkMute" style={styles.section}>
        {tr("settings.security")}
      </Text>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text font="body" size="base">
            {tr("settings.biometricLabel", { method })}
          </Text>
          <Text font="body" size="sm" color="inkSoft">
            {tr(
              availability ? HINT_KEY[availability] : "settings.biometricHint",
              {
                method,
              },
            )}
          </Text>
        </View>
        <Switch
          value={biometricEnabled}
          onValueChange={onToggle}
          disabled={busy || availability !== "available"}
          trackColor={{ false: ColorEnum.line, true: ColorEnum.accent }}
          thumbColor={ColorEnum.ink}
          accessibilityLabel={tr("a11y.biometricToggle")}
        />
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + SpacingEnum.xl },
        ]}
      >
        <Button
          label={tr("settings.signOut")}
          variant="ghost"
          block
          onPress={signOut}
          iconBefore={{ name: "LogOut" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ColorEnum.bg,
    paddingHorizontal: SpacingEnum.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.md,
    marginBottom: SpacingEnum.xxl,
  },
  section: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SpacingEnum.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SpacingEnum.lg,
    paddingVertical: SpacingEnum.md,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: ColorEnum.hair,
  },
  rowText: { flex: 1, gap: SpacingEnum.xs },
  footer: { marginTop: "auto" },
});
