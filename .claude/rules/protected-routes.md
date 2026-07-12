# Rule: gate access with `<Stack.Protected guard={…}>`, not a `Redirect`

Access control on a route is **declarative** — wrap the screen in expo-router's
`<Stack.Protected guard={…}>` (or `<Tabs.Protected>`) inside the layout, rather
than rendering a `<Redirect>` from the route/screen body. When `guard` is
`false`, the wrapped screen becomes **unnavigable** and Expo Router redirects to
the stack's anchor route for you — no imperative bounce, no guard code in the
page.

```tsx
// Yes — the guard lives in the navigator config; the route stays thin.
// src/app/_layout.tsx
<Stack.Screen name="index" />
<Stack.Protected guard={status !== "authenticated"}>
  <Stack.Screen name="(auth)/login" />
</Stack.Protected>
<Stack.Screen name="(tabs)" />

// src/app/(auth)/login.tsx — no guard, just renders the screen
export default function Screen() {
  return <LoginScreen />;
}
```

```tsx
// No — an imperative Redirect inside the route/screen.
export default function Screen() {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status === "authenticated") return <Redirect href="/artworks" />;
  return <LoginScreen />;
}
```

## Why

- **It belongs in the layout.** Per
  [app-route-page-screens](app-route-page-screens.md), a `src/app/**` route file
  is navigator/screen config only and the page stays thin — a `guard` prop on
  `<Stack.Protected>` is exactly navigator config, so the access rule sits with
  the rest of the stack declaration instead of leaking into the route body or the
  page screen.
- **Expo Router owns the redirect.** A failing `guard` removes the screen from
  the navigable set and sends the user to the stack's **anchor** (its
  `initialRouteName`, else the first route). No `<Redirect>`, no `router.replace`
  in an effect, no "read stale status and bounce" race.

## Rules

- **`guard` is a boolean.** Drive it from a value already in scope in the layout
  (`status !== "authenticated"`, `isAdmin`, …). Don't invert it into a `Redirect`
  condition in the child.
- **Anchor the target.** The route the user lands on when a guard fails is the
  stack's anchor — set `unstable_settings = { initialRouteName: "index" }` where
  the intended fallback isn't already the first route (see
  [router-navigation-paths](router-navigation-paths.md)). In the root stack the
  anchor is `index`, which itself redirects to `/artworks`.
- **Wrap the `<Stack.Screen>`, group siblings.** One `<Stack.Protected>` can wrap
  several screens that share a guard; nest them for finer-grained rules.
- **Guards are evaluated only once the navigator renders.** The root
  `RootNavigator` already blocks on `status === "loading"` (a blank screen until
  `ready`), so a guard never sees the `"loading"` status — no `if (loading)
  return null` dance is needed in the route.

## When a `<Redirect>` is still right

`<Stack.Protected>` is for **access control** (this screen is off-limits in this
state). A route whose entire job is to **forward** — the entry `index.tsx` that
sends everyone to `/artworks` — is a legitimate `<Redirect>`; there's no screen
to protect, it's a pure redirect. The rule is: reach for a guard to *withhold* a
screen, a `<Redirect>` only to *forward* from a screen that renders nothing else.

## Reference

`src/app/_layout.tsx` — the `(auth)/login` route wrapped in `<Stack.Protected
guard={status !== "authenticated"}>` (guest-only), with `src/app/index.tsx`
remaining a plain forward `<Redirect href="/artworks" />`.
