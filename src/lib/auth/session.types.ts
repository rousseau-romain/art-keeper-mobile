import type { User } from "@/lib/api/auth";

/**
 * The slice of the signed-in user that the web SSR render carries in a cookie
 * (`SESSION_PROFILE_COOKIE`) so the chrome can paint authenticated on the first byte.
 *
 * Deliberately the *minimum* the UI branches on: `role` backs `isAdmin` / `isReviewer`,
 * and `id` identifies the session. Nothing else — no name, no email. This cookie is
 * readable by client JS, so every field added here is a field published to the page;
 * before widening it, check the field is actually consumed (today no component reads
 * `useAuth().user` at all — only `status` / `isAdmin` / `isReviewer`).
 */
export type SessionProfile = Pick<User, "id" | "role">;
