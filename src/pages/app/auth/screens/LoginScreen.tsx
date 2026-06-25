import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Segment } from "@/pages/app/auth/components/segment/Segment";
import { LoginForm, type LoginValues } from "@/pages/app/auth/form/LoginForm";
import { useGoogleSignIn } from "@/pages/app/auth/hooks/useGoogleSignIn";
import { useLoginSubmit } from "@/pages/app/auth/hooks/useLoginSubmit";
import { useResendVerification } from "@/pages/app/auth/hooks/useResendVerification";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { useToast } from "@/shared/ui/toast/Toast";
import { ColorEnum } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

type Mode = "sign-in" | "create";

export const LoginScreen = () => {
  const { t: tr } = useTranslation();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const { show } = useToast();

  const [mode, setMode] = useState<Mode>("sign-in");

  const methods = useForm<LoginValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  });
  const {
    reset,
    formState: { isSubmitting },
  } = methods;

  const isCreate = mode === "create";

  const { onSubmit, verifyEmail, setVerifyEmail } = useLoginSubmit({
    methods,
    isCreate,
  });
  const { onGoogle, googlePending } = useGoogleSignIn();
  const { onResend, resendPending } = useResendVerification({
    email: verifyEmail,
  });

  const brand = (
    <View style={styles.brand}>
      <Icon name="Star" size="xl" color="accent" fill={ColorEnum.accent} />
      <Text font="display" size="xl" style={styles.brandText}>
        ArtKeeper
      </Text>
    </View>
  );

  const tagline = (
    <Text font="mono" size="md" color="inkSoft">
      {tr("auth.tagline")}
    </Text>
  );

  // Shared form body: segmented toggle → fields → primary → "or" → Google.
  // FormProvider exposes the form to <LoginForm> via useFormContext.
  const formCore = (
    <FormProvider {...methods}>
      <View style={styles.toggle}>
        <Segment
          label={tr("auth.signIn")}
          active={!isCreate}
          onPress={() => setMode("sign-in")}
        />
        <Segment
          label={tr("auth.createAccount")}
          active={isCreate}
          onPress={() => setMode("create")}
        />
      </View>

      <LoginForm isCreate={isCreate} />

      <Button
        label={isCreate ? tr("auth.createAccount") : tr("auth.signIn")}
        variant="primary"
        block
        loading={isSubmitting}
        onPress={onSubmit}
      />

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text font="mono" size="xs">
          {tr("common.or")}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        label={tr("auth.continueWithGoogle")}
        variant="ghost"
        block
        loading={googlePending}
        onPress={onGoogle}
      />
    </FormProvider>
  );

  // Shown after sign-up (or a sign-in blocked by EMAIL_NOT_VERIFIED): the link
  // is already on its way, so this is purely informational + a way back.
  const verifyCore = (
    <View style={styles.verify}>
      <View style={styles.verifyIcon}>
        <Icon name="MailCheck" size="lg" color="accent" />
      </View>
      <Text font="display" size="xl" style={styles.verifyTitle}>
        {tr("auth.title.verify")}
      </Text>
      <Text font="body" size="base" color="inkSoft" style={styles.verifyText}>
        {tr("auth.verifyBefore")}
        <Text color="ink" style={styles.verifyEmail}>
          {verifyEmail}
        </Text>
        {tr("auth.verifyAfter")}
      </Text>
      <View style={styles.spacer} />
      <Button
        label={tr("auth.verifyBackToSignIn")}
        variant="primary"
        block
        onPress={() => {
          setVerifyEmail(null);
          setMode("sign-in");
          reset();
        }}
      />
      <Button
        label={tr("auth.verifyResend")}
        variant="ghost"
        block
        loading={resendPending}
        onPress={onResend}
      />
    </View>
  );

  // Hero — a fixed 50% side panel on desktop, a stacked banner on mobile.
  const hero = (
    <View
      style={[
        styles.hero,
        wide
          ? styles.heroWide
          : [styles.heroNarrow, { paddingTop: insets.top + SpacingEnum.xxxl }],
      ]}
    >
      <View style={styles.heroBrandWrap}>{brand}</View>
      {tagline}
      <Text
        font="display"
        size={wide ? "display" : "xxl"}
        style={[
          styles.heroHeading,
          wide ? styles.heroHeadingWide : styles.heroHeadingNarrow,
        ]}
      >
        {tr("auth.title.hero")}
      </Text>
    </View>
  );

  const footer = verifyEmail ? null : (
    <View style={wide ? styles.footerRow : styles.footerCol}>
      <Pressable onPress={() => show(tr("auth.resetSoon"))} hitSlop={8}>
        <Text
          font={wide ? "mono" : "body"}
          size="md"
          color={wide ? "accent" : "inkMute"}
        >
          {tr("auth.forgotPassword")}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setMode(isCreate ? "sign-in" : "create")}
        hitSlop={8}
      >
        <Text
          font={wide ? "mono" : "body"}
          size="md"
          color={wide ? "accent" : "inkSoft"}
        >
          {wide
            ? isCreate
              ? tr("auth.switchToSignIn")
              : tr("auth.switchToCreate")
            : isCreate
            ? tr("auth.footerHaveAccount")
            : tr("auth.footerNewHere")}
        </Text>
      </Pressable>
    </View>
  );

  // Single flex layout — row (hero | form) on desktop, stacked on mobile.
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.flex1, wide ? styles.row : styles.col]}>
        {/* On desktop the hero is a fixed 50% panel beside the scrolling form;
            on mobile it scrolls with the form inside the ScrollView. */}
        {wide ? hero : null}
        <ScrollView
          style={wide ? styles.flex1 : undefined}
          contentContainerStyle={
            wide ? styles.scrollContentWide : styles.scrollContentNarrow
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {wide ? null : hero}
          <View style={wide ? styles.formWide : styles.formNarrow}>
            {verifyEmail ? verifyCore : formCore}
            {footer}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// All static values (layout + ColorEnum/FONTS). Only prop/state-driven values
// (insets, `wide`, `active`) and display/body/mono calls stay inline above.
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  row: { flexDirection: "row" },
  col: { flexDirection: "column" },
  dividerLine: { flex: 1, height: 1.5, backgroundColor: ColorEnum.hair },
  verifyIcon: {
    width: ControlHeightEnum.md,
    height: ControlHeightEnum.md,
    borderRadius: RadiusEnum.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ColorEnum.surface2,
    borderColor: ColorEnum.hair,
  },
  verifyTitle: { textTransform: "uppercase" },
  verifyText: { lineHeight: 21 },
  verifyEmail: { fontWeight: "600" },
  hero: { backgroundColor: ColorEnum.surface2 },
  heroWide: {
    flex: 1,
    padding: SpacingEnum.xxxl,
    justifyContent: "flex-end",
    borderRightWidth: 1.5,
    borderRightColor: ColorEnum.line,
  },
  heroNarrow: {
    paddingBottom: SpacingEnum.xxl,
    paddingHorizontal: SpacingEnum.xl,
    borderBottomWidth: 1.5,
    borderBottomColor: ColorEnum.line,
  },
  heroHeading: { marginTop: SpacingEnum.lg, textTransform: "uppercase" },
  scrollContentWide: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SpacingEnum.xxxl,
  },
  scrollContentNarrow: { flexGrow: 1 },
  formWide: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: SpacingEnum.lg,
  },
  formNarrow: { padding: SpacingEnum.xl, gap: SpacingEnum.lg },
  brand: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.md },
  brandText: { textTransform: "uppercase" },
  heroBrandWrap: { marginBottom: SpacingEnum.xl },
  heroHeadingWide: { lineHeight: 56 },
  heroHeadingNarrow: { lineHeight: 36 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.md,
    marginVertical: SpacingEnum.xs,
  },
  verify: { gap: SpacingEnum.lg, alignItems: "flex-start" },
  spacer: { height: SpacingEnum.xs },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SpacingEnum.sm,
  },
  footerCol: {
    alignItems: "center",
    gap: SpacingEnum.md,
    marginTop: SpacingEnum.sm,
  },
  toggle: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    padding: SpacingEnum.xs,
    backgroundColor: ColorEnum.surface2,
    borderColor: ColorEnum.hair,
  },
});
