// English base dictionary. `fr.ts` is typed against this (`typeof en`), so any
// key added here without a French counterpart is a compile error.
export const en = {
  common: {
    or: "or",
    retry: "Retry",
  },
  auth: {
    tagline: "A living map of street art.",
    title: {
      hero: "Catalog the walls before they're gone.",
      verify: "Check your inbox",
    },
    signIn: "Sign in",
    createAccount: "Create account",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    passwordLabel: "Password",
    continueWithGoogle: "Continue with Google",
    forgotPassword: "forgot password?",
    switchToSignIn: "sign in",
    switchToCreate: "create account",
    footerHaveAccount: "Have an account? Sign in",
    footerNewHere: "New here? Create an account",
    // Verify-email panel
    verifyBackToSignIn: "Back to sign in",
    verifyResend: "Resend link",
    // Interpolated; the email is wrapped in its own emphasized <Text> in the UI,
    // so the copy is split around the address rather than using {{email}} inline.
    verifyBefore: "We sent a verification link to ",
    verifyAfter: ". Open it to activate your account, then sign in.",
    // Toasts / errors
    genericError: "Something went wrong. Try again.",
    verifySentToast: "Verification email sent",
    resendFailed: "Couldn't resend. Try again.",
    googleUnavailable: "Google sign-in unavailable",
    googleFailed: "Google sign-in failed.",
    resetSoon: "Password reset coming soon",
    // Form validation messages
    errors: {
      nameRequired: "Enter your name",
      emailRequired: "Enter your email",
      emailInvalid: "Enter a valid email",
      passwordRequired: "Enter your password",
    },
  },
  artwork: {
    tab: "Artworks",
    title: {
      index: "Browse",
      detail: "Artwork",
      edit: "Edit artwork",
      new: "New artwork",
    },
    location: "Paris 11e",
    pieceCount_one: "{{count}} piece",
    pieceCount_other: "{{count}} pieces",
    statusUpdating: "updating",
    statusStale: "stale",
    statusLive: "live",
    loading: "Loading the wall…",
    loadError: "Couldn't load artworks.",
    empty: "No artworks here yet.\nBe the first to catalog this wall.",
    signOut: "Sign out",
    like: "Like",
    unlike: "Unlike",
    notFound: "Artwork not found.",
    edit: "Edit",
    editComingSoon: "Editing isn't available yet.",
    createComingSoon: "Creating isn't available yet.",
  },
  a11y: {
    verified: "verified",
    language: "Language: {{language}}",
  },
};

// `typeof en` keeps the key structure but widens leaf values to `string`, so the
// French dictionary must supply every key without having to match the English
// wording verbatim.
export type Resources = typeof en;
