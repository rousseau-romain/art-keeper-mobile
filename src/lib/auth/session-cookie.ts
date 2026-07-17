import type { SessionProfile } from "./session.types";

/**
 * Native has no SSR, so there is no first render to align with a server's — the
 * session simply resolves from the keychain token via `get-session`. The web
 * variant reads a cookie synchronously; here both calls are inert.
 */
export const readProfileCookie = (): SessionProfile | null => null;

export const persistProfile = (_profile: SessionProfile | null): void => {};
