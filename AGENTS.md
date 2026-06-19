# Art Keeper Mobile — Agent Guide

Guidance lives one-topic-per-file in `.claude/rules/`. Core conventions are
`@`-imported (always in context). Situational rules are **not** imported — they're
listed below with a "read when" trigger; open the file with the Read tool when the
trigger matches, to keep context lean.

## Always-on conventions

@.claude/rules/data-fetching.md
@.claude/rules/api-types-openapi.md
@.claude/rules/openapi-fetch-middleware.md
@.claude/rules/i18n-translation.md
@.claude/rules/styling-stylesheet.md
@.claude/rules/file-naming.md

## Read on demand

Open these when the trigger applies (they are intentionally not imported):

- **`.claude/rules/expo-workflow.md`** — before writing any Expo/SDK code, running
  the dev server, or using simulator automation. Versioned docs (v56), Expo MCP
  tools, `bun start:mcp`, bun-not-npm.
- **`.claude/rules/email-verification.md`** — when touching auth: login, sign-up,
  sign-in, or the `AuthProvider` / `(auth)/login` screens. Backend requires email
  verification; handle null-token sign-up and the `EMAIL_NOT_VERIFIED` 403.
- **`.claude/rules/ios-dev-client-launch-115.md`** — when `bun ios` fails at the
  launch step with `LSApplicationWorkspaceErrorDomain` error 115.

To add guidance: drop a file in `.claude/rules/`, then either `@`-import it above
(always-on convention) or add a "read when" line here (situational rule).
