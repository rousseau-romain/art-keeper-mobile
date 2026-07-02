import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, AppState, Platform } from "react-native";

import {
  getSession,
  type SessionResponse,
  sendVerificationEmail,
  signInEmail,
  signInSocialUrl,
  signOutRequest,
  signUpEmail,
  type User,
} from "@/lib/api/auth";
import { getSessionQueryKey } from "@/lib/api/generated/@tanstack/react-query.gen";
import {
  getBiometricAsked,
  getBiometricPref,
  setBiometricAsked,
  setBiometricPref,
} from "./biometric-pref";
import { authenticate, isBiometricAvailable } from "./biometrics";
import { clearToken, getToken, hydrateToken, setToken } from "./token-store";

/** Re-lock after the app has been backgrounded at least this long. */
const LOCK_TIMEOUT_MS = 30_000;

/** Generated TanStack Query key for GET /auth/get-session. */
const SESSION_KEY = getSessionQueryKey();

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/** Result of the interactive Google flow, so callers can branch without errors. */
export type GoogleSignInOutcome = "success" | "cancelled" | "unavailable";

/**
 * Result of sign-up. When the backend requires email verification it returns
 * no token + an unverified user, so the caller must route to a "check your
 * inbox" state rather than treating the account as signed in.
 */
export type SignUpOutcome = "authenticated" | "needs-verification";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  isAdmin: boolean;
  /** True when a session exists but the user hasn't passed the biometric gate. */
  locked: boolean;
  /** Prompt for biometrics; on success clears `locked`. Resolves the outcome. */
  unlock: () => Promise<boolean>;
  /** Whether the user has opted into biometric app-lock. */
  biometricEnabled: boolean;
  /** Toggle the opt-in. Enabling verifies with biometrics first; resolves success. */
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<SignUpOutcome>;
  signInWithGoogle: () => Promise<GoogleSignInOutcome>;
  /** True while the interactive Google flow is in flight (for button spinners). */
  googlePending: boolean;
  /** (Re)send the verification email for an unverified account. */
  resendVerification: (email: string) => Promise<void>;
  /** True while a resend request is in flight (for button spinners). */
  resendPending: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const qc = useQueryClient();
  const { t } = useTranslation();

  // Biometric app-lock: `biometricEnabled` is the persisted opt-in, `locked` is
  // the live gate (a session exists but biometrics haven't been passed yet).
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);

  // The bearer token must be in the in-memory mirror before the session query
  // can authenticate, so gate the query on a one-shot hydration flag. In the same
  // pass we decide whether to open locked: a stored token + the opt-in + enrolled
  // biometrics means the app starts behind the Lock screen (the session still
  // loads in the background so it's ready the moment they unlock).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    (async () => {
      const tok = await hydrateToken();
      const pref = await getBiometricPref();
      setBiometricEnabledState(pref);
      if (tok && pref && (await isBiometricAvailable())) setLocked(true);
      console.log(
        `[auth] token hydrated present=${!!tok} biometric=${pref} locked=${
          !!tok && pref
        }`,
      );
    })().finally(() => setHydrated(true));
  }, []);

  // Re-lock when the app returns to the foreground after being backgrounded past
  // the timeout — a session left open on a table doesn't stay open forever.
  const backgroundedAt = useRef<number | null>(null);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background") {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next !== "active") return;
      const since = backgroundedAt.current;
      backgroundedAt.current = null;
      if (
        since !== null &&
        Date.now() - since > LOCK_TIMEOUT_MS &&
        biometricEnabled &&
        getToken()
      ) {
        setLocked(true);
      }
    });
    return () => sub.remove();
  }, [biometricEnabled]);

  const unlock = useCallback(async (): Promise<boolean> => {
    const ok = await authenticate(t("auth.unlockPrompt"));
    if (ok) setLocked(false);
    return ok;
  }, [t]);

  const setBiometricEnabled = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      // Enabling requires a live biometric check so we never turn on a lock the
      // user can't actually pass. Disabling is unconditional.
      if (enabled && !(await authenticate(t("auth.enablePrompt"))))
        return false;
      await setBiometricPref(enabled);
      setBiometricEnabledState(enabled);
      return true;
    },
    [t],
  );

  // One-time, post-login nudge to turn on biometric unlock. Native-only, shown at
  // most once (guarded by the "asked" flag), and skipped if it's already on or
  // the device can't do biometrics. Tapping "Enable" runs the normal opt-in
  // (which itself prompts for a biometric to confirm).
  const offerBiometric = useCallback(async () => {
    if (Platform.OS === "web") return;
    if (await getBiometricAsked()) return;
    if (await getBiometricPref()) return;
    if (!(await isBiometricAvailable())) return;
    await setBiometricAsked();
    Alert.alert(
      t("settings.enablePromptTitle"),
      t("settings.enablePromptBody"),
      [
        { text: t("common.notNow"), style: "cancel" },
        {
          text: t("common.enable"),
          onPress: () => void setBiometricEnabled(true),
        },
      ],
    );
  }, [t, setBiometricEnabled]);

  // get-session returns `{ session, user }` or `null`, so `data === undefined`
  // cleanly means "not loaded yet".
  const session = useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    enabled: hydrated,
  });
  const user = session.data?.user ?? null;

  const status: AuthStatus = !hydrated
    ? "loading"
    : session.data !== undefined
      ? user
        ? "authenticated"
        : "unauthenticated"
      : session.isError
        ? "unauthenticated"
        : "loading";

  useEffect(() => {
    console.log(`[auth] status=${status} user=${user?.id ?? "-"}`);
  }, [status, user]);

  // get-session resolves to `null` only when it ran and the server reported
  // "signed out". If a token is still stored at that point, it's stale (the
  // server rejected it) — drop it so we stop sending a dead credential on every
  // request. `undefined` (not loaded) and query errors are left untouched, so a
  // transient network failure never discards a still-valid token.
  useEffect(() => {
    if (session.data === null && getToken()) {
      console.log("[auth] stored token rejected by get-session — clearing");
      clearToken();
    }
  }, [session.data]);

  const invalidateSession = useCallback(
    () => qc.invalidateQueries({ queryKey: SESSION_KEY }),
    [qc],
  );

  // Seed the session from the auth response so `status` flips to "authenticated"
  // synchronously — before the login screen navigates. Without this, the screen
  // can navigate before the background refetch + re-render land, and the (tabs)
  // guard reads a stale "unauthenticated" status and bounces back to Login
  // (the "have to log in twice" bug). invalidateSession then fills the full
  // session object.
  const primeSession = useCallback(
    (u: User) =>
      qc.setQueryData(
        SESSION_KEY,
        (prev: SessionResponse | null | undefined) =>
          prev ? { ...prev, user: u } : ({ user: u } as SessionResponse),
      ),
    [qc],
  );

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInEmail(email, password),
    onSuccess: async (data) => {
      console.log(
        `[auth] sign-in success token=${!!data?.token} user=${data?.user?.id ?? "-"}`,
      );
      // Native captures the token from the set-auth-token header (client
      // middleware); web reads it from the body, where CORS can't hide it.
      if (data?.token) await setToken(data.token);
      if (data?.user) primeSession(data.user);
      await invalidateSession();
      // First successful sign-in on a capable device: offer to turn on the lock.
      if (data?.token) void offerBiometric();
    },
    onError: (e) => console.warn("[auth] sign-in failed:", e),
  });

  const signUpMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => signUpEmail(name, email, password),
    onSuccess: async (data) => {
      console.log(
        `[auth] sign-up success token=${!!data?.token} ` +
          `${data?.token ? "authenticated" : "needs-verification"}`,
      );
      // With email verification required, sign-up returns no token and an
      // unverified user. Don't seed the session in that case — doing so flips
      // status to "authenticated", the screen navigates to (tabs), and the
      // guard immediately bounces back to Login once the tokenless refetch
      // resolves to null (the confusing "nothing happened" bug). The caller
      // routes to the verify-email state instead (see SignUpOutcome).
      if (!data?.token) return;
      await setToken(data.token);
      // Sign-up's response user is a structural subset of User in the spec, but
      // it's a real user row at runtime — cast to seed the session.
      if (data?.user) primeSession(data.user as User);
      await invalidateSession();
    },
    onError: (e) => console.warn("[auth] sign-up failed:", e),
  });

  const signOutMutation = useMutation({
    mutationFn: signOutRequest,
    // onSettled runs on success AND error: clear locally even if the network
    // call fails. Resetting the session to `null` flips status to
    // "unauthenticated", which the (tabs) guard turns into a redirect to Login.
    onSettled: async () => {
      console.log("[auth] sign-out — clearing token + session");
      await clearToken();
      // Drop the lock gate too — there's no session left to protect, and a stale
      // `locked` would strand the next Login screen behind the Lock screen.
      setLocked(false);
      qc.setQueryData(SESSION_KEY, null);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => sendVerificationEmail(email),
    onSuccess: () => console.log("[auth] verification email resent"),
    onError: (e) => console.warn("[auth] resend verification failed:", e),
  });

  const signInGoogleMutation = useMutation({
    mutationFn: async (): Promise<GoogleSignInOutcome> => {
      const callbackURL = Linking.createURL("/");
      const url = await signInSocialUrl(callbackURL);
      if (!url) return "unavailable";
      const result = await WebBrowser.openAuthSessionAsync(url, callbackURL);
      return result.type === "success" ? "success" : "cancelled";
    },
    onSuccess: async (outcome) => {
      console.log(`[auth] google sign-in outcome=${outcome}`);
      // The browser flow set the session server-side; refetch to pick it up.
      if (outcome === "success") await invalidateSession();
    },
    onError: (e) => console.warn("[auth] google sign-in failed:", e),
  });

  const signIn = useCallback(
    (email: string, password: string) =>
      signInMutation.mutateAsync({ email, password }).then(() => {}),
    [signInMutation],
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<SignUpOutcome> => {
      const data = await signUpMutation.mutateAsync({ name, email, password });
      return data?.token ? "authenticated" : "needs-verification";
    },
    [signUpMutation],
  );

  const signInWithGoogle = useCallback(
    () => signInGoogleMutation.mutateAsync(),
    [signInGoogleMutation],
  );

  const resendVerification = useCallback(
    (email: string) =>
      resendVerificationMutation.mutateAsync(email).then(() => {}),
    [resendVerificationMutation],
  );

  const signOut = useCallback(
    () =>
      signOutMutation
        .mutateAsync()
        .then(() => {})
        // Fire-and-forget at the call site (onPress); onSettled already cleared.
        .catch(() => {}),
    [signOutMutation],
  );

  const refresh = useCallback(
    () => invalidateSession().then(() => {}),
    [invalidateSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: user?.role === "admin",
      locked,
      unlock,
      biometricEnabled,
      setBiometricEnabled,
      signIn,
      signUp,
      signInWithGoogle,
      googlePending: signInGoogleMutation.isPending,
      resendVerification,
      resendPending: resendVerificationMutation.isPending,
      signOut,
      refresh,
    }),
    [
      status,
      user,
      locked,
      unlock,
      biometricEnabled,
      setBiometricEnabled,
      signIn,
      signUp,
      signInWithGoogle,
      signInGoogleMutation.isPending,
      resendVerification,
      resendVerificationMutation.isPending,
      signOut,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
