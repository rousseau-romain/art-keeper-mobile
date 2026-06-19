import { fetchClient } from "./client";
import type { components, operations } from "./schema";

// Models come straight from the API's OpenAPI spec (regenerate with `bun gen:api`).
export type User = components["schemas"]["User"];
export type Session = components["schemas"]["Session"];

/** Body of GET /auth/get-session — `{ session, user }`, or `null` when signed out. */
export type SessionResponse = NonNullable<
  operations["getSession"]["responses"][200]["content"]["application/json"]
>;

/** TanStack Query key for the current session. */
export const SESSION_KEY = ["session"] as const;

// --- Colocated request functions (typed via the OpenAPI client) -----------
// The client middleware throws ApiError on non-2xx and captures the bearer
// token from the `set-auth-token` header, so these stay thin.

/** Current session, or `null` when unauthenticated (server returns 200 + null). */
export async function getSession(): Promise<SessionResponse | null> {
  const { data } = await fetchClient.GET("/auth/get-session");
  return data ?? null;
}

export async function signInEmail(email: string, password: string) {
  const { data } = await fetchClient.POST("/auth/sign-in/email", {
    body: { email, password },
  });
  return data;
}

export async function signUpEmail(
  name: string,
  email: string,
  password: string,
) {
  const { data } = await fetchClient.POST("/auth/sign-up/email", {
    body: { name, email, password },
  });
  return data;
}

export async function signOutRequest(): Promise<void> {
  await fetchClient.POST("/auth/sign-out", { body: {} });
}

/** (Re)send the verification email for an unverified account. */
export async function sendVerificationEmail(email: string): Promise<void> {
  await fetchClient.POST("/auth/send-verification-email", { body: { email } });
}

/** Start the Google flow; returns the provider authorize URL (or null). */
export async function signInSocialUrl(
  callbackURL: string,
): Promise<string | null> {
  const { data } = await fetchClient.POST("/auth/sign-in/social", {
    body: { provider: "google", callbackURL },
  });
  return data?.url ?? null;
}
