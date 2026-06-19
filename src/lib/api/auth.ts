import {
  getSession as getSessionSdk,
  sendVerificationEmail as sendVerificationEmailSdk,
  signInEmail as signInEmailSdk,
  signOut as signOutSdk,
  signUpWithEmailAndPassword,
  socialSignIn,
} from "./generated/sdk.gen";
import type { Session, User } from "./generated/types.gen";

// Models come straight from the API's OpenAPI spec (regenerate with `bun gen:api`).
export type { Session, User };

/**
 * Body of GET /auth/get-session — `{ session, user }`, or `null` when signed
 * out. The spec types this response as `unknown`, so we model it from the
 * generated `Session`/`User` models.
 */
export type SessionResponse = { session: Session; user: User };

// --- Colocated request functions (typed via the generated SDK) -------------
// The client interceptors throw ApiError on non-2xx and capture the bearer
// token from the `set-auth-token` header, so these stay thin.

/** Current session, or `null` when unauthenticated (server returns 200 + null). */
export const getSession = async (): Promise<SessionResponse | null> => {
  const { data } = await getSessionSdk();
  return (data as SessionResponse | null) ?? null;
};

export const signInEmail = async (email: string, password: string) => {
  const { data } = await signInEmailSdk({ body: { email, password } });
  return data;
};

export const signUpEmail = async (
  name: string,
  email: string,
  password: string,
) => {
  const { data } = await signUpWithEmailAndPassword({
    body: { name, email, password },
  });
  return data;
};

export const signOutRequest = async (): Promise<void> => {
  await signOutSdk({ body: {} });
};

/** (Re)send the verification email for an unverified account. */
export const sendVerificationEmail = async (email: string): Promise<void> => {
  await sendVerificationEmailSdk({ body: { email } });
};

/** Start the Google flow; returns the provider authorize URL (or null). */
export const signInSocialUrl = async (
  callbackURL: string,
): Promise<string | null> => {
  const { data } = await socialSignIn({
    body: { provider: "google", callbackURL },
  });
  return data?.url ?? null;
};
