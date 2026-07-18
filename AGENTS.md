# Art Keeper Mobile — Agent Guide

Guidance lives one-topic-per-file in `.claude/rules/`. Core conventions are
`@`-imported (always in context). Situational rules are **not** imported — they're
listed below with a "read when" trigger; open the file with the Read tool when the
trigger matches, to keep context lean.

## Always-on conventions

@.claude/rules/data-fetching.md
@.claude/rules/api-types-openapi.md
@.claude/rules/i18n-translation.md
@.claude/rules/styling-stylesheet.md
@.claude/rules/types-not-interface.md
@.claude/rules/export-const-functions.md
@.claude/rules/component-module-structure.md
@.claude/rules/one-component-per-file.md
@.claude/rules/app-route-page-screens.md
@.claude/rules/design-scale.md
@.claude/rules/serena-code-navigation.md

## Read on demand

Open these when the trigger applies (they are intentionally not imported):

- **`.claude/rules/expo-workflow.md`** — before writing any Expo/SDK code, running
  the dev server, or using simulator automation. Versioned docs (v56), Expo MCP
  tools, `bun start:mcp`, bun-not-npm.
- **`.claude/rules/web-prod-export.md`** — when editing the `Dockerfile`,
  `src/app/+html.tsx`, or upgrading the Expo SDK/expo-router. Web production
  export gotchas: build-time bundler flags (`EXPO_UNSTABLE_WEB_MODAL`) that must
  reach `expo export`, Metro dropping async-chunk CSS in prod (hoist real CSS into
  `+html.tsx`), and the modal-CSS re-sync check on upgrade.
- **`.claude/rules/web-ssr-hydration.md`** — when touching web SSR: the
  `RootNavigator` auth gate (`hydrated`, not `status`), a provider's first-render
  value (theme / i18n / token / breakpoint), the `QueryClient` construction
  (`getQueryClient`, per-request), a route `loader` + `useLoaderData` seeding, or
  a protected-route guard's `loading` behavior. **The SSR is authenticated by the
  request's session cookie** — forward it per SDK call (`forwardedCookie`), never
  via the module-singleton client and never as a bearer token; read it when
  touching an SSR fetch, anything that makes the HTML per-visitor (CDN caching —
  `/_expo/loaders/` is **not** a cacheable asset), the `ak-profile` chrome seed, or
  request config read server-side (`Accept-Language` / a cookie). Keeps the server
  render == the client's first render (no #418 hydration mismatch).
- **`.claude/rules/ssr-loader-anchor.md`** — when adding/moving a route that
  exports a `loader` in a stack whose `_layout` declares
  `unstable_settings.initialRouteName`, or debugging a "Failed to load loader
  data" / "Switched to client rendering" SSR error on a deep link to a nested
  route. The seeded stack anchor renders a loader-bearing screen server-side with
  no prefetched data → a relative `fetchLoader` that rejects on Node. Gate the
  loader read on `useIsFocused` (an ErrorBoundary does **not** help).
- **`.claude/rules/seo-generate-metadata.md`** — when touching a public web
  route's SEO: a route's `generateMetadata` export, a page `<title>` /
  description / Open Graph tags, or an `alternates.canonical` (built inline from
  `origin()`). Server-only, translated with `serverT`, canonical from the
  request's own origin.
- **`.claude/rules/seo-open-graph.md`** — when touching a public route's social
  share preview: an `openGraph` / `twitter` block in a `generateMetadata`, a
  share image, or an `og:type` / `og:url`. Expo infers nothing — every tag is
  declared, `og:title` does *not* fall back to the page title, and the
  `article:*` tags ship only under `type: "article"`.
- **`src/shared/ui/seo/README.md`** — when rendering a web-facing screen's
  document body: reaching for a heading (`Heading` / `H1`…`H6`) or a semantic
  landmark/container (`Main`, `Banner`, `Nav`, `Article`, `Section`, `Aside`,
  `Footer`, `Figure`, `List`, `ListItem`) instead of a bare `View`/`Text`. All
  live under `src/shared/ui/seo/`; they pass a `role` that react-native-web maps
  to a real HTML element (`<main>`, `<article>`, `<h1>`…) for the crawlable
  outline, and pose the ARIA role on native. No `<p>`/`<strong>`/`<em>` (excluded
  — see the README).
- **`.claude/rules/email-verification.md`** — when touching auth: login, sign-up,
  sign-in, or the `AuthProvider` / `(auth)/login` screens. Backend requires email
  verification; handle null-token sign-up and the `EMAIL_NOT_VERIFIED` 403.
- **`.claude/rules/ios-dev-client-launch-115.md`** — when `bun ios` fails at the
  launch step with `LSApplicationWorkspaceErrorDomain` error 115.
- **`.claude/rules/haptics.md`** — when adding or changing haptic feedback. All
  feedback goes through the `useHaptics` hook (`src/shared/hooks/useHaptics.ts`);
  never import `expo-haptics` directly at a call site.
- **`.claude/rules/forms-react-hook-form.md`** — before building or editing any
  form: `useForm` / `<Controller>` fields, a `{Name}Form` component, the `input/`
  components, the submit/validation flow, or keyboard handling.
- **`.claude/rules/heyapi-client-interceptors.md`** — when editing
  `src/lib/api/client.ts` or changing the request/response interceptors.
- **`.claude/rules/router-navigation-paths.md`** — when writing a navigation
  target (`router.push`/`replace`/`navigate`, `<Redirect href>`, `<Link href>`);
  strip route-group parens from the URL.
- **`.claude/rules/protected-routes.md`** — when gating a route by auth/role
  (guest-only, admin-only, signed-in-only); use `<Stack.Protected guard={…}>` in
  the layout, not a `<Redirect>` in the route/screen body.
- **`.claude/rules/link-aschild-pressable.md`** — when wrapping a component that
  renders its own touchable box (`Tag`, `Button`, a padded `Pressable`) in a
  `<Link>`; use `asChild` so the padded area is the tap target, not a bare Link.
- **`.claude/rules/enums-as-const.md`** — when defining a new "enum" (`as const`
  object + derived `keyof typeof` union), e.g. a new `*.enums.ts`.
- **`.claude/rules/control-flow-switch.md`** — when branching on a discriminant
  union with more than two outcomes (use `switch`, not nested ternaries).
- **`.claude/rules/file-naming.md`** — when creating a file that is purely enums
  / types / constants (`*.enums.ts` / `*.types.ts` / `*.constant.ts`).
- **`.claude/rules/import-path-alias.md`** — when unsure of import style or after
  a Biome `noRestrictedImports` error (Biome already enforces `@/` over `../`).

To add guidance: drop a file in `.claude/rules/`, then either `@`-import it above
(always-on convention) or add a "read when" line here (situational rule).
