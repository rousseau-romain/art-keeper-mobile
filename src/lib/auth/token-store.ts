import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "artkeeper.auth.token";

// expo-secure-store has no web implementation (its methods throw), so on web we
// fall back to localStorage. Native keeps the encrypted keychain/keystore.
const isWeb = Platform.OS === "web";

// In-memory mirror so the API client can read the bearer token synchronously
// when building request headers. Kept in sync with persistent storage.
let cached: string | null = null;

async function readStore(): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(KEY) ?? null;
  return SecureStore.getItemAsync(KEY);
}

async function writeStore(token: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(KEY, token);
    return;
  }
  await SecureStore.setItemAsync(KEY, token);
}

async function removeStore(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

/** Load the token from persistent storage into the in-memory mirror (call on launch). */
export const hydrateToken = async (): Promise<string | null> => {
  try {
    cached = await readStore();
  } catch {
    cached = null;
  }
  return cached;
};

/** Synchronous read for header injection. */
export const getToken = (): string | null => {
  return cached;
};

export const setToken = async (token: string): Promise<void> => {
  cached = token;
  await writeStore(token);
};

export const clearToken = async (): Promise<void> => {
  cached = null;
  await removeStore();
};
