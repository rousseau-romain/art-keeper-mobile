import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth/AuthProvider";
import {
  type BiometricAvailability,
  type BiometricKind,
  getBiometricAvailability,
  getBiometricKind,
  getBiometricLabelKey,
} from "@/lib/auth/biometrics";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { type Language, SUPPORTED_LANGUAGES } from "@/lib/i18n/index";
import { TagSourcePicker } from "@/pages/app/artwork/components/tag-source-picker/TagSourcePicker";
import { useTagSource } from "@/pages/app/artwork/hooks/useTagSource";
import { ReviewModePicker } from "@/pages/app/moderation/components/review-mode-picker/ReviewModePicker";
import { useReviewMode } from "@/pages/app/moderation/hooks/useReviewMode";
import { SectionTitle } from "@/pages/app/settings/components/section-title/SectionTitle";
import { SettingRow } from "@/pages/app/settings/components/setting-row/SettingRow";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Picker } from "@/shared/ui/picker/Picker";
import { Seo } from "@/shared/ui/seo/Seo";
import { Text } from "@/shared/ui/text/Text";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import {
  ThemeModeEnum,
  type ThemeModeEnumType,
} from "@/theme/enums/theme-mode.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type SettingsScreenProps = Record<string, never>;

// Language names are rendered as endonyms; the key maps each supported language
// to its `settings.language*` translation entry.
const LANGUAGE_LABEL_KEY: Record<
  Language,
  "settings.languageEnglish" | "settings.languageFrench"
> = {
  en: "settings.languageEnglish",
  fr: "settings.languageFrench",
};

const THEME_LABEL_KEY: Record<
  ThemeModeEnumType,
  "settings.themeAuto" | "settings.themeLight" | "settings.themeDark"
> = {
  auto: "settings.themeAuto",
  light: "settings.themeLight",
  dark: "settings.themeDark",
};

// Picker order: the explicit schemes first, "follow the device" last.
const THEME_MODES: ThemeModeEnumType[] = [
  ThemeModeEnum.dark,
  ThemeModeEnum.light,
  ThemeModeEnum.auto,
];

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
  const {
    biometricEnabled,
    setBiometricEnabled,
    signOut,
    isReviewer,
    isAdmin,
  } = useAuth();
  const { source, setSource } = useTagSource();
  const { reviewMode, setReviewMode } = useReviewMode();
  const { language, setLanguage } = useLocale();
  const { mode, setMode, colors } = useTheme();

  const languageOptions = SUPPORTED_LANGUAGES.map((lng) => ({
    value: lng,
    label: tr(LANGUAGE_LABEL_KEY[lng]),
  }));

  const themeOptions = THEME_MODES.map((value) => ({
    value,
    label: tr(THEME_LABEL_KEY[value]),
  }));

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

  const sections = [
    // Biometrics are a native-only capability — hide the security section on web.
    ...(Platform.OS === "web"
      ? []
      : [
          {
            key: "security",
            title: tr("settings.security"),
            rows: [
              {
                key: "biometric",
                label: tr("settings.biometricLabel", { method }),
                hint: tr(
                  availability
                    ? HINT_KEY[availability]
                    : "settings.biometricHint",
                  { method },
                ),
                control: (
                  <Switch
                    value={biometricEnabled}
                    onValueChange={onToggle}
                    disabled={busy || availability !== "available"}
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    thumbColor={colors.text}
                    accessibilityLabel={tr("a11y.biometricToggle")}
                  />
                ),
              },
            ],
          },
        ]),
    {
      key: "appearance",
      title: tr("settings.appearance"),
      rows: [
        {
          key: "theme",
          label: tr("settings.appearanceLabel"),
          hint: tr("settings.appearanceHint"),
          control: (
            <Picker
              value={mode}
              onChange={setMode}
              options={themeOptions}
              accessibilityLabel={tr("a11y.appearance")}
            />
          ),
        },
      ],
    },
    {
      key: "language",
      title: tr("settings.language"),
      rows: [
        {
          key: "language",
          label: tr("settings.languageLabel"),
          hint: tr("settings.languageHint"),
          control: (
            <Picker
              value={language}
              onChange={setLanguage}
              options={languageOptions}
              accessibilityLabel={tr("a11y.language", { language })}
            />
          ),
        },
      ],
    },
    {
      key: "tags",
      title: tr("settings.tags"),
      rows: [
        {
          key: "tagSource",
          label: tr("settings.tagSourceLabel"),
          hint: tr("settings.tagSourceHint"),
          control: <TagSourcePicker value={source} onChange={setSource} />,
        },
      ],
    },
    // The review-mode preference only matters to someone who sees the moderation
    // queue — hide the section from regular users, like the Admin tab itself.
    ...(isReviewer || isAdmin
      ? [
          {
            key: "moderation",
            title: tr("settings.moderation"),
            rows: [
              {
                key: "reviewMode",
                label: tr("settings.reviewModeLabel"),
                hint: tr("settings.reviewModeHint"),
                control: (
                  <ReviewModePicker
                    value={reviewMode}
                    onChange={setReviewMode}
                  />
                ),
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <WrapperView
      style={[styles.screen, { paddingTop: insets.top + SpacingEnum.xl }]}
    >
      <Seo title={tr("settings.title.index")} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Icon name="ChevronLeft" size="lg" color="text" />
        </Pressable>
        <Text font="display" size="xxl">
          {tr("settings.title.index")}
        </Text>
      </View>

      <View style={styles.sections}>
        {sections.map(({ key, title, rows }) => (
          <View key={key}>
            <SectionTitle label={title} />
            {rows.map(({ key: rowKey, label, hint, control }) => (
              <SettingRow key={rowKey} label={label} hint={hint}>
                {control}
              </SettingRow>
            ))}
          </View>
        ))}
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
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: SpacingEnum.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.md,
    marginBottom: SpacingEnum.xxl,
  },
  sections: { gap: SpacingEnum.md },
  footer: { marginTop: "auto" },
});
