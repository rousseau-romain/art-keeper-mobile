import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth/AuthProvider";
import {
  type BiometricKind,
  getBiometricKind,
  getBiometricLabelKey,
} from "@/lib/auth/biometrics";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Icon, type IconName } from "@/shared/ui/icon/Icon";
import { Seo } from "@/shared/ui/seo/Seo";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";

export type LockScreenProps = Record<string, never>;

// The biometric kind picks the affordance icon; the label comes from the shared
// getBiometricLabelKey (platform-aware Face ID / Touch ID / Fingerprint wording).
const METHOD_ICON: Record<BiometricKind, IconName> = {
  faceId: "ScanFace",
  touchId: "FingerprintPattern",
  biometric: "FingerprintPattern",
};

/**
 * Biometric gate shown over the app when a session exists but hasn't been
 * unlocked. Auto-prompts on mount; the primary button re-prompts after a cancel,
 * and "sign out" is the escape hatch. Rendered by RootNavigator, so it fully
 * covers the tab stack until `unlock()` clears the lock.
 */
export const LockScreen = () => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptics();
  const { unlock, signOut } = useAuth();

  const [kind, setKind] = useState<BiometricKind>("biometric");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getBiometricKind().then(setKind);
  }, []);

  const handleUnlock = useCallback(async () => {
    setPending(true);
    const ok = await unlock();
    setPending(false);
    if (ok) haptic("success");
  }, [unlock, haptic]);

  // Fire the biometric sheet once as soon as the screen appears, so the user
  // isn't forced to tap before the prompt shows.
  const prompted = useRef(false);
  useEffect(() => {
    if (prompted.current) return;
    prompted.current = true;
    void handleUnlock();
  }, [handleUnlock]);

  const method = tr(getBiometricLabelKey(kind));

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + SpacingEnum.xxxl }]}
    >
      <Seo title={tr("auth.title.lock")} />

      <View style={styles.center}>
        <View style={styles.brand}>
          <Icon name="Star" size="xl" color="primary" fill={ColorEnum.primary} />
          <Text font="display" size="xl" style={styles.brandText}>
            ArtKeeper
          </Text>
        </View>

        <View style={styles.lockIcon}>
          <Icon name="LockKeyhole" size="xl" color="primary" />
        </View>

        <Text font="display" size="xxl" style={styles.title}>
          {tr("auth.title.lock")}
        </Text>
        <Text font="body" size="base" color="textSoft" style={styles.subtitle}>
          {tr("auth.lockSubtitle")}
        </Text>
      </View>

      <View
        style={[
          styles.actions,
          { paddingBottom: insets.bottom + SpacingEnum.xl },
        ]}
      >
        <Button
          label={tr("auth.unlockCta", { method })}
          variant="primary"
          block
          loading={pending}
          onPress={handleUnlock}
          iconBefore={{ name: METHOD_ICON[kind] }}
        />
        <Button
          label={tr("auth.lockSignOut")}
          variant="ghost"
          block
          onPress={signOut}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
    marginBottom: SpacingEnum.xxl,
  },
  brandText: { letterSpacing: 0.5 },
  lockIcon: {
    width: ControlHeightEnum.lg,
    height: ControlHeightEnum.lg,
    borderRadius: RadiusEnum.full,
    backgroundColor: ColorEnum.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SpacingEnum.sm,
  },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center" },
  actions: { gap: SpacingEnum.sm },
});
