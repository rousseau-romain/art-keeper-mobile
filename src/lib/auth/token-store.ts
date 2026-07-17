import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "artkeeper.auth.token";

// expo-secure-store has no web implementation (its methods throw), so on web we
// fall back to localStorage. Native keeps the encrypted keychain/keystore.
const isWeb = Platform.OS === "web";

// In-memory mirror so the API client can read the bearer token synchronously
// when building request headers. Kept in sync with persistent storage.
//
// On web the mirror is seeded synchronously at module load: localStorage is a
// synchronous API, so the token is available on the very first render — the web
// SSR gate can pass without awaiting an async hydrate, letting the app render
// public content immediately. Native keeps the async keychain read (see
// `hydrateToken`).
//
// The server has no localStorage, so this stays `null` there. That is the
// intended behaviour, not a gap to fill: this mirror is module scope, shared by
// every concurrent SSR request, so a token in it would leak across visitors
// (see `@/lib/is-server-render`). The server authenticates by forwarding the
// request's own cookie per call — never through this mirror.
let cached: string | null = isWeb
  ? (globalThis.localStorage?.getItem(KEY) ?? null)
  : null;

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
