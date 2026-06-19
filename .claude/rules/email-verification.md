# Rule: email verification is required — handle it in the auth flow

**Applies to:** `src/lib/auth/AuthProvider.tsx`, `src/app/(auth)/login.tsx`,
`src/lib/api/auth.ts`.

The backend (art-keeper-api) enforces `requireEmailVerification`. Two
consequences the app must handle — don't assume sign-up logs the user in:

**Sign-up** (`POST /auth/sign-up/email`) returns `200` but **`token: null`** and
an unverified user, and the **backend already sends the verification email**
(don't call `send-verification-email` yourself on sign-up).
- Do **not** seed the session when there's no token. Seeding flips `status` to
  `authenticated`, the screen navigates to `(tabs)`, then the tokenless
  `get-session` refetch resolves to `null` and the guard bounces back to Login
  (the "nothing happened" bug). `signUp` returns `"needs-verification"` instead.

**Sign-in** (`POST /auth/sign-in/email`) for an unverified account returns
**`403 { code: "EMAIL_NOT_VERIFIED" }`**. `ApiError` carries `.code` — branch on
it (not the message) and route to the "check your inbox" panel.

**Resend** uses `POST /auth/send-verification-email` (`sendVerificationEmail` in
`api/auth.ts` → `AuthProvider.resendVerification`) for the link-expired case.

Net: both sign-up needs-verification and the sign-in `EMAIL_NOT_VERIFIED` 403
funnel into the same verify-email state in `login.tsx`, with a resend action.
