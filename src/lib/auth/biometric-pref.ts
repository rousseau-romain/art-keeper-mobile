import AsyncStorage from "@react-native-async-storage/async-storage";

// The user's opt-in choice for biometric app-lock. Persisted in AsyncStorage
// (not SecureStore) — it's a non-sensitive UI preference, mirroring the locale
// override in src/lib/i18n. The token itself stays in the keychain (token-store).

/** AsyncStorage key for the biometric-lock opt-in (parallels LOCALE_STORAGE_KEY). */
export const BIOMETRIC_PREF_KEY = "artkeeper:biometric:v1";

/** AsyncStorage key marking that we've offered biometric unlock once (post-login). */
export const BIOMETRIC_ASKED_KEY = "artkeeper:biometric-asked:v1";

/** Whether the user has enabled biometric unlock. Defaults to `false` (opt-in). */
export const getBiometricPref = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(BIOMETRIC_PREF_KEY)) === "1";
  } catch {
    return false;
  }
};

export const setBiometricPref = async (enabled: boolean): Promise<void> => {
  try {
    if (enabled) await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, "1");
    else await AsyncStorage.removeItem(BIOMETRIC_PREF_KEY);
  } catch {
    // Preference persistence is best-effort; a write failure just means the
    // choice isn't remembered across launches, not a crash.
  }
};

/** Whether the one-time "enable biometric unlock?" offer has already been shown. */
export const getBiometricAsked = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(BIOMETRIC_ASKED_KEY)) === "1";
  } catch {
    // Treat a read failure as "already asked" so we never nag on every launch.
    return true;
  }
};

export const setBiometricAsked = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ASKED_KEY, "1");
  } catch {
    // Best-effort; worst case the offer shows again next login.
  }
};
