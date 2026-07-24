import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

// All expo-local-authentication access is isolated in this module (mirroring how
// token-store.ts isolates expo-secure-store), so the SDK is imported in one place
// and the rest of the app talks to a small, intention-revealing surface.

/** Which biometric the device offers — drives the i18n label shown to the user. */
export type BiometricKind = "faceId" | "touchId" | "biometric";

/**
 * Why biometric unlock can or can't be turned on. Splitting "no-hardware" from
 * "not-enrolled" lets the UI tell the user something actionable — enrolling a
 * fingerprint/face in system settings fixes the latter, nothing fixes the former.
 */
export type BiometricAvailability =
  | "available"
  | "not-enrolled"
  | "no-hardware";

export const getBiometricAvailability =
  async (): Promise<BiometricAvailability> => {
    if (!(await LocalAuthentication.hasHardwareAsync())) return "no-hardware";
    return (await LocalAuthentication.isEnrolledAsync())
      ? "available"
      : "not-enrolled";
  };

/** True when the device has biometric hardware AND the user has enrolled a face/finger. */
export const isBiometricAvailable = async (): Promise<boolean> =>
  (await getBiometricAvailability()) === "available";

/**
 * Best-effort classification of the enrolled biometric. Face wins when both are
 * present (rare); otherwise fingerprint; otherwise a generic "biometric" (iris on
 * Android, or an unknown type).
 */
export const getBiometricKind = async (): Promise<BiometricKind> => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION))
    return "faceId";
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
    return "touchId";
  return "biometric";
};

/** The i18n label keys a biometric can resolve to (kept in sync with the auth.* copy). */
export type BiometricLabelKey =
  | "auth.faceId"
  | "auth.touchId"
  | "auth.faceUnlock"
  | "auth.fingerprint"
  | "auth.biometric";

/**
 * The i18n key for a kind's user-facing name, picked per platform: "Face ID" /
 * "Touch ID" are Apple terms, so Android uses "Face unlock" / "Fingerprint". The
 * modality (face vs finger) is the same; only the wording differs.
 */
export const getBiometricLabelKey = (
  kind: BiometricKind,
): BiometricLabelKey => {
  const android = Platform.OS === "android";
  switch (kind) {
    case "faceId":
      return android ? "auth.faceUnlock" : "auth.faceId";
    case "touchId":
      return android ? "auth.fingerprint" : "auth.touchId";
    default:
      return "auth.biometric";
  }
};

/**
 * Open the native screen where the user can enroll a biometric, so a
 * "not-enrolled" device can be made ready without leaving for the OS by hand.
 * Android deep-links straight to the biometric enrollment flow (falling back to
 * the security settings on pre-API-30 devices that lack the dedicated action).
 * iOS forbids deep-linking to Face ID/Touch ID enrollment, so it opens the app's
 * settings page — the copy points the user on to Settings › Face ID & Passcode.
 */
export const openBiometricEnrollment = async (): Promise<void> => {
  if (Platform.OS === "android") {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.BIOMETRIC_ENROLL,
      );
    } catch {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.SECURITY_SETTINGS,
      );
    }
    return;
  }
  await Linking.openSettings();
};

/**
 * Prompt for a biometric check. Resolves `true` only on a confirmed match; a
 * cancel, lockout, or any error resolves `false` (never throws), so callers can
 * branch on a plain boolean. `disableDeviceFallback: false` lets the OS offer a
 * passcode fallback after failed biometric attempts.
 */
export const authenticate = async (
  promptMessage: string,
  cancelLabel?: string,
): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: false,
  });
  return result.success;
};
