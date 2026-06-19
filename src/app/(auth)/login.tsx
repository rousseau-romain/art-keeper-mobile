import { useRouter } from "expo-router";
import { MailCheck, Star } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Btn, useToast } from "@/components";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { FONT_SIZE, SPACING, useBreakpoint, useTheme } from "@/theme";

type Mode = "sign-in" | "create";

export default function LoginScreen() {
  const { t, fonts, display, body, mono } = useTheme();
  const { t: tr } = useTranslation();
  const { wide } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { show } = useToast();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    googlePending,
    resendVerification,
    resendPending,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // When set, the account exists but its email isn't verified yet — show the
  // "check your inbox" panel instead of the form (set on sign-up with no token,
  // or on a sign-in rejected with EMAIL_NOT_VERIFIED).
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const isCreate = mode === "create";
  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    (!isCreate || name.trim().length > 0);

  async function onSubmit() {
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    console.log(`[login] submit mode=${mode} email=${email.trim()}`);
    try {
      if (isCreate) {
        const outcome = await signUp(name.trim(), email.trim(), password);
        console.log(`[login] sign-up outcome=${outcome}`);
        if (outcome === "needs-verification") {
          setVerifyEmail(email.trim());
          return;
        }
      } else {
        await signIn(email.trim(), password);
        console.log("[login] sign-in ok");
      }
      router.replace("/(tabs)/browse");
    } catch (e) {
      // Log the raw error: an ApiError carries status/code, anything else is the
      // non-ApiError case the UI flattens into "Something went wrong".
      if (e instanceof ApiError) {
        console.warn(
          `[login] ApiError status=${e.status} code=${e.code ?? "-"} message=${e.message}`,
        );
      } else {
        console.error("[login] unexpected error", e);
      }
      // The backend already emailed a verification link at sign-up; route the
      // user to the "check your inbox" panel rather than a dead-end error.
      if (e instanceof ApiError && e.code === "EMAIL_NOT_VERIFIED") {
        setVerifyEmail(email.trim());
        return;
      }
      setError(e instanceof ApiError ? e.message : tr("auth.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (!verifyEmail || resendPending) return;
    try {
      await resendVerification(verifyEmail);
      show(tr("auth.verifySentToast"));
    } catch (e) {
      show(e instanceof ApiError ? e.message : tr("auth.resendFailed"));
    }
  }

  async function onGoogle() {
    setError(null);
    try {
      const outcome = await signInWithGoogle();
      if (outcome === "unavailable") {
        show(tr("auth.googleUnavailable"));
        return;
      }
      if (outcome === "success") {
        router.replace("/(tabs)/browse");
      }
      // "cancelled": user backed out — leave them on the login screen.
    } catch (e) {
      setError(e instanceof ApiError ? e.message : tr("auth.googleFailed"));
    }
  }

  const brand = (
    <View style={styles.brand}>
      <Star size={28} color={t.accent} fill={t.accent} strokeWidth={1.8} />
      <Text style={[display(FONT_SIZE.xl), { color: t.ink }]}>ArtKeeper</Text>
    </View>
  );

  const tagline = (
    <Text style={[mono(FONT_SIZE.md), { color: t.inkSoft }]}>
      {tr("auth.tagline")}
    </Text>
  );

  // Shared form body: segmented toggle → fields → primary → "or" → Google.
  const formCore = (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: t.surface2,
          borderRadius: t.radius,
          borderWidth: t.borderWeight,
          borderColor: t.hair,
          padding: SPACING.xs,
        }}
      >
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

      {isCreate ? (
        <Field
          label={tr("auth.nameLabel")}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder={tr("auth.namePlaceholder")}
        />
      ) : null}
      <Field
        label={tr("auth.emailLabel")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <Field
        label={tr("auth.passwordLabel")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      {error ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: FONT_SIZE.md,
            color: t.diffDel,
          }}
        >
          {error}
        </Text>
      ) : null}

      <Btn
        label={isCreate ? tr("auth.createAccount") : tr("auth.signIn")}
        variant="primary"
        block
        disabled={!canSubmit}
        loading={submitting}
        onPress={onSubmit}
      />

      {/* Divider */}
      <View style={styles.divider}>
        <View
          style={{ flex: 1, height: t.borderWeight, backgroundColor: t.hair }}
        />
        <Text style={mono(FONT_SIZE.xs)}>{tr("common.or")}</Text>
        <View
          style={{ flex: 1, height: t.borderWeight, backgroundColor: t.hair }}
        />
      </View>

      <Btn
        label={tr("auth.continueWithGoogle")}
        variant="ghost"
        block
        loading={googlePending}
        onPress={onGoogle}
      />
    </>
  );

  // Shown after sign-up (or a sign-in blocked by EMAIL_NOT_VERIFIED): the link
  // is already on its way, so this is purely informational + a way back.
  const verifyCore = (
    <View style={styles.verify}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: t.radius,
          backgroundColor: t.surface2,
          borderWidth: t.borderWeight,
          borderColor: t.hair,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MailCheck size={24} color={t.accent} strokeWidth={1.8} />
      </View>
      <Text style={[display(FONT_SIZE.xl), { color: t.ink }]}>
        {tr("auth.verifyTitle")}
      </Text>
      <Text
        style={[body(FONT_SIZE.base), { color: t.inkSoft, lineHeight: 21 }]}
      >
        {tr("auth.verifyBefore")}
        <Text style={{ color: t.ink, fontWeight: "600" }}>{verifyEmail}</Text>
        {tr("auth.verifyAfter")}
      </Text>
      <View style={styles.spacer} />
      <Btn
        label={tr("auth.verifyBackToSignIn")}
        variant="primary"
        block
        onPress={() => {
          setVerifyEmail(null);
          setError(null);
          setMode("sign-in");
          setPassword("");
        }}
      />
      <Btn
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
        { backgroundColor: t.surface2 },
        wide
          ? {
              flex: 1,
              padding: SPACING.xxxl,
              justifyContent: "flex-end",
              borderRightWidth: t.borderWeight,
              borderRightColor: t.line,
            }
          : {
              paddingTop: insets.top + SPACING.xxxl,
              paddingBottom: SPACING.xxl,
              paddingHorizontal: SPACING.xl,
              borderBottomWidth: t.borderWeight,
              borderBottomColor: t.line,
            },
      ]}
    >
      <View style={styles.heroBrandWrap}>{brand}</View>
      {tagline}
      <Text
        style={[
          display(wide ? FONT_SIZE.display : FONT_SIZE.xxl),
          { color: t.ink, marginTop: SPACING.lg },
          wide ? styles.heroHeadingWide : styles.heroHeadingNarrow,
        ]}
      >
        {tr("auth.hero")}
      </Text>
    </View>
  );

  const footer = verifyEmail ? null : (
    <View style={wide ? styles.footerRow : styles.footerCol}>
      <Pressable onPress={() => show(tr("auth.resetSoon"))} hitSlop={8}>
        <Text
          style={
            wide
              ? [mono(FONT_SIZE.md), { color: t.accent }]
              : [body(FONT_SIZE.md), { color: t.inkMute }]
          }
        >
          {tr("auth.forgotPassword")}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setMode(isCreate ? "sign-in" : "create")}
        hitSlop={8}
      >
        <Text
          style={
            wide
              ? [mono(FONT_SIZE.md), { color: t.accent }]
              : [body(FONT_SIZE.md), { color: t.inkSoft }]
          }
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
      style={[styles.flex1, { backgroundColor: t.bg }]}
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
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { t, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segment,
        {
          borderRadius: t.radius,
          backgroundColor: active ? t.accent : "transparent",
        },
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.body,
          fontWeight: "600",
          fontSize: FONT_SIZE.md,
          color: active ? t.accentInk : t.inkSoft,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  ...input
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  const { t, fonts, mono } = useTheme();
  return (
    <View style={styles.field}>
      <Text
        style={[
          mono(FONT_SIZE.xs),
          { color: t.inkMute, textTransform: "uppercase" },
        ]}
      >
        {label}
      </Text>
      <TextInput
        {...input}
        placeholderTextColor={t.inkMute}
        style={{
          fontFamily: fonts.body,
          fontSize: FONT_SIZE.base,
          color: t.ink,
          backgroundColor: t.surface,
          borderWidth: t.borderWeight,
          borderColor: t.hair,
          borderRadius: t.radius,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
        }}
      />
    </View>
  );
}

// Static, theme-independent layout only. Theme-colored styles stay inline above.
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: "row" },
  col: { flexDirection: "column" },
  scrollContentWide: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xxxl,
  },
  scrollContentNarrow: { flexGrow: 1 },
  formWide: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: SPACING.lg,
  },
  formNarrow: { padding: SPACING.xl, gap: SPACING.lg },
  brand: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  heroBrandWrap: { marginBottom: SPACING.xl },
  heroHeadingWide: { lineHeight: 56 },
  heroHeadingNarrow: { lineHeight: 36 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginVertical: SPACING.xs,
  },
  verify: { gap: SPACING.lg, alignItems: "flex-start" },
  spacer: { height: SPACING.xs },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  footerCol: { alignItems: "center", gap: SPACING.md, marginTop: SPACING.sm },
  segment: { flex: 1, paddingVertical: SPACING.sm, alignItems: "center" },
  field: { gap: SPACING.sm },
});
