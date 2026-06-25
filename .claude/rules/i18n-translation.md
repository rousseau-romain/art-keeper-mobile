# Rule: user-facing copy is translated — never hardcode strings

Every user-facing string goes through i18next. The setup lives in
`src/lib/i18n/` (`src/lib/i18n/index.ts` is the reference) and is wired once in
`src/app/_layout.tsx` via `<I18nProvider>`.

## How to use it

In components, pull `t` from `react-i18next` and key into the dictionary:

```ts
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
// ...
<Text>{t("auth.signIn")}</Text>
```

- Keys are **type-checked** against the English dictionary
  (`src/lib/i18n/locales/en.constant.ts`) through `src/lib/i18n/i18next.d.ts`, so a typo
  or missing key is a compile error — `t("…")` autocompletes.
- For an error fall back to the localized generic message, not a literal:
  `e instanceof ApiError ? e.message : t("auth.genericError")` (`ApiError.message`
  is already server copy, so it's shown as-is).

## Adding copy

1. Add the key to `src/lib/i18n/locales/en.constant.ts` (the base dictionary).
2. Add the **same key** to `src/lib/i18n/locales/fr.constant.ts`. `fr` is typed as
   `Resources` (= `typeof en`), so **any English key without a French
   counterpart fails the build** — both locales must stay in sync.
3. Group keys by feature namespace (`common`, `auth`, `browse`, `a11y`, …); add
   a11y labels under `a11y`.

Conventions:
- **Screen / panel titles** of a namespace are grouped under one nested `title`
  object keyed by the screen (or panel) — **never** flat `*Title` keys. For a CRUD
  domain that's the four screen names; for `auth` it's the panel names:

  ```ts
  artwork: {
    title: { index: "Browse", detail: "Artwork", edit: "Edit artwork", new: "New artwork" },
  },
  auth: {
    title: { hero: "Catalog the walls…", verify: "Check your inbox" },
  },
  ```

  So `t("artwork.title.detail")` / `t("auth.title.verify")` — not `detailTitle` /
  `verifyTitle`. The keys mirror the CRUD screen set
  ([app-route-page-screens](app-route-page-screens.md)).
- **Pluralization**: use i18next suffixes — `pieceCount_one` / `pieceCount_other`
  — and call `t("browse.pieceCount", { count })`.
- **Interpolation**: `{{count}}` / `{{email}}`. When the UI needs to style part of
  the string (e.g. an emphasized email), split the copy around it
  (`verifyBefore` / `verifyAfter`) rather than interpolating inline.
- `escapeValue` is off (RN has no XSS surface) and `returnNull` is false.

## Language selection

- `index.ts` inits **synchronously** from the device locale (`deviceLanguage()`),
  falling back to `en`. Supported langs: `SUPPORTED_LANGUAGES` (`en`, `fr`).
- A persisted manual override (`LOCALE_STORAGE_KEY` in AsyncStorage) is applied
  on launch by `I18nProvider`. Use the `useLocale()` hook
  (`language` / `setLanguage` / `toggleLanguage`) to read or change it — don't
  call `i18n.changeLanguage` directly from screens.
- The client middleware sends `Accept-Language`; that's driven by the same i18n
  state, so changing language also localizes server copy.
