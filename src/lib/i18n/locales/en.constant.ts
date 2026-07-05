// English base dictionary. `fr.ts` is typed against this (`typeof en`), so any
// key added here without a French counterpart is a compile error.
export const en = {
  common: {
    or: "or",
    retry: "Retry",
    notNow: "Not now",
    enable: "Enable",
  },
  auth: {
    tagline: "A living map of street art.",
    title: {
      hero: "Catalog the walls before they're gone.",
      verify: "Check your inbox",
      lock: "Locked",
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
    // Biometric app-lock. `{{method}}` interpolates the device's biometric name,
    // picked per platform by getBiometricLabelKey (iOS: Face ID / Touch ID;
    // Android: Face unlock / Fingerprint; else the generic "biometrics").
    faceId: "Face ID",
    touchId: "Touch ID",
    faceUnlock: "Face unlock",
    fingerprint: "Fingerprint",
    biometric: "biometrics",
    unlockPrompt: "Unlock ArtKeeper",
    enablePrompt: "Confirm to enable biometric unlock",
    lockSubtitle: "Unlock to get back to the wall.",
    unlockCta: "Unlock with {{method}}",
    lockSignOut: "Sign out instead",
    // Form validation messages
    errors: {
      nameRequired: "Enter your name",
      emailRequired: "Enter your email",
      emailInvalid: "Enter a valid email",
      passwordRequired: "Enter your password",
      biometricFailed: "Couldn't verify. Try again.",
    },
  },
  artwork: {
    tab: "Artworks",
    createTab: "Add",
    title: {
      index: "Browse",
      detail: "Artwork",
      edit: "Edit artwork",
      new: "New artwork",
    },
    meta: {
      descriptionFallback: "Discover {{title}} on ArtKeeper.",
    },
    byline: "by {{name}}",
    location: "Paris 11e",
    pieceCount_one: "{{count}} piece",
    pieceCount_other: "{{count}} pieces",
    // Browse map ⇄ grid view.
    map: {
      toggleMap: "Map",
      toggleGrid: "Grid",
      piecesInView_one: "{{count}} piece in view",
      piecesInView_other: "{{count}} pieces in view",
      dragForGrid: "drag ↑ for grid",
    },
    // Tag filter sheet (the (formsheet) modal).
    filters: {
      title: "Filters",
      open: "Filters",
      clear: "Clear all",
      done: "Done",
      searchLabel: "Search",
      searchPlaceholder: "Search by name…",
      scopeAll: "All",
      scopeTitle: "Artwork",
      scopeArtist: "Artist",
      tagsLabel: "Tags",
      addPlaceholder: "Add a tag — type and press enter",
      appliedCount_one: "{{count}} filter",
      appliedCount_other: "{{count}} filters",
    },
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
    // The 5-step "add artwork" wizard.
    new: {
      cancel: "Cancel",
      back: "Back",
      next: "Next",
      reviewCta: "Review",
      submitCta: "Submit for review",
      stepOf: "{{step}}/{{total}}",
      // Per-step header titles, keyed by the wizard route name.
      title: {
        index: "Photo",
        location: "Location",
        details: "Details",
        review: "Review",
        success: "Submitted!",
      },
      draft: {
        restored: "Draft restored",
        discard: "Discard",
      },
      photo: {
        title: "Add a photo",
        subtitle: "Camera or library. One photo per piece.",
        cta: "Take or choose a photo",
        tapToAdd: "tap to add",
        replace: "tap to replace",
        exifFound: "GPS found in EXIF — auto-pinned",
        camera: "Take photo",
        library: "Choose from library",
      },
      location: {
        title: "Confirm the location",
        subtitle: "Auto-pinned from your photo. Tap the map to nudge it.",
        hint: "tap to move pin · or use my location",
        useMyLocation: "Use my location",
        locating: "Locating…",
        error: "Couldn't get your location.",
      },
      details: {
        title: "Details",
        titleLabel: "Title",
        titlePlaceholder: "e.g. La Sirène qui Pleure",
        artistLabel: "Artist",
        artistPlaceholder: "@handle — autocompletes verified artists",
        createArtist: 'Create "{{name}}"',
        tagsLabel: "Tags",
        tagsAddPlaceholder: "Add your own — type and press enter",
        noteLabel: "Note (optional)",
        notePlaceholder: "Spotted near the canal…",
      },
      review: {
        title: "Look right?",
        noArtist: "no artist credited",
        where: "Where",
        tags: "Tags",
        note: "Note",
        edit: "edit",
        rights: "I shot or have rights to this photo.",
      },
      success: {
        title: "Submitted!",
        body: "An admin will review your piece shortly. You'll get a ping when it goes live.",
        status: "Status · Pending review",
        track: "Track submission",
        another: "Submit another",
        backToBrowse: "back to browse",
      },
      errors: {
        photoRequired: "Add a photo.",
        locationRequired: "Pin the location first.",
        titleRequired: "Enter a title.",
        rightsRequired: "Confirm you have rights to this photo.",
        noArtist: "No artist credited. Continue without one.",
      },
    },
  },
  settings: {
    title: {
      index: "Settings",
    },
    language: "Language",
    languageLabel: "App language",
    languageHint: "Choose the language used across the app.",
    // Language names are shown as endonyms (each in its own language), so these
    // stay identical across locales.
    languageEnglish: "English",
    languageFrench: "Français",
    security: "Security",
    // `{{method}}` interpolates the device biometric name (see auth.faceId/…).
    biometricLabel: "Unlock with {{method}}",
    biometricHint:
      "Ask for {{method}} on launch and when you return after a while.",
    biometricNotEnrolled:
      "Set up {{method}} in your device settings to turn this on.",
    biometricUnavailable: "Biometric unlock isn't available on this device.",
    signOut: "Sign out",
    // One-time post-login offer (Alert).
    enablePromptTitle: "Lock ArtKeeper?",
    enablePromptBody:
      "Require biometric unlock to open the app and protect your session.",
    tags: "Tags",
    tagSourceLabel: "Suggested tags",
    tagSourceHint:
      "Which tags to suggest as quick-pick chips on a new artwork.",
    tagSourceMostUsed: "Most used",
    tagSourceLastUsed: "Last used",
    tagSourceNone: "No tags",
  },
  dev: {
    tab: "Dev",
    haptics: {
      title: "Haptics",
      subtitle: "Tap to fire each effect.",
    },
  },
  a11y: {
    verified: "verified",
    language: "Language: {{language}}",
    viewMap: "Show map view",
    viewGrid: "Show grid view",
    selectArtwork: "Show {{title}}",
    searchTag: "Browse artworks tagged {{tag}}",
    filters: "Open tag filters",
    settings: "Open settings",
    biometricToggle: "Toggle biometric unlock",
    tagSourceToggle: "Choose how suggested tags are ordered",
  },
};

// `typeof en` keeps the key structure but widens leaf values to `string`, so the
// French dictionary must supply every key without having to match the English
// wording verbatim.
export type Resources = typeof en;
