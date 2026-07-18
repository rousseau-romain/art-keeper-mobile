# Rule: a loader-bearing route that can be a *seeded stack anchor* must gate its loader read on focus

**Applies to:** any web route that (a) exports a `loader` **and** (b) lives in a
stack whose `_layout` declares `unstable_settings.initialRouteName` — today only
`(tabs)/artworks/index.tsx` (the browse listing; its stack anchors `index` for the
`filters` formsheet). Reference: that route's `Screen` + `BrowseSeed`.

## The failure

Deep-linking (a web refresh / cold link) to a **nested** sibling in the same stack
— one that has its *own* `_layout`, e.g. `/artworks/[slug]/edit` — makes the SSR
render **error and fall back to client rendering**:

```
Switched to client rendering because the server rendering errored:
Failed to load loader data for route: /(tabs)/artworks/index?slug=…
```

It reproduces **signed-in and signed-out alike** — it is *not* an auth/guard bug,
even though it surfaces on an auth-gated route.

## Why

`unstable_settings.initialRouteName` makes Expo Router **seed the stack's anchor
screen underneath** a deep-linked route (the same mechanism the `filters` sheet
relies on — see [router-navigation-paths](router-navigation-paths.md)). So loading
`/artworks/[slug]/edit` renders the **browse `index` behind** the edit screen.

But the server prefetches the loader of the **matched** route only, never the
seeded anchor's. So the browse-behind calls `useLoaderData` (via
`useLoaderArtworks`), finds no data in `ServerDataLoaderContext`, and falls through
to expo's client fetcher — a **relative** `fetch("/_expo/loaders/…")`. That's fine
in a browser but **invalid on the Node server render**: it rejects, and the whole
document errors. (A *direct-child* sibling like `[slug]/index` does **not** seed the
anchor, which is why the detail page is unaffected.)

## The fix — gate the loader read on `useIsFocused`

The seeded anchor is **occluded and never focused**, and its data is irrelevant.
So mount the loader-reading component **only when the route is focused**; otherwise
render the screen loader-less (the client fetches client-side if it's ever shown):

```tsx
// src/app/(tabs)/artworks/index.tsx
const focused = useIsFocused(); // from "expo-router"
return (
  <Suspense fallback={<ScreenFallback />}>
    {focused ? (
      <BrowseSeed initialQuery={q} initialScope={scope} initialTags={tag} />
    ) : (
      <IndexScreen page={undefined} initialQuery={q} initialScope={scope} initialTags={tag} />
    )}
  </Suspense>
);
```

- **The loader read must live in a child** (`BrowseSeed` calls `useLoaderArtworks`),
  conditionally *mounted* — a hook can't be called conditionally, so the gate is a
  component boundary, not an `if` inside the hook.
- **`useIsFocused` derives from the URL**, so it's identical on the server and the
  client's first render → the focus branch is **hydration-safe** (no #418), even
  though it's a *structural* branch (`BrowseSeed` vs `IndexScreen`). Verified with
  headless Chrome across anon / signed-in and the browse / edit / `filters` routes.
- The focused browse still ships its full SSR seed; only the occluded anchor renders
  empty. This also fixed the identical latent error on `/artworks/filters` (the
  browse is *its* anchor too).

## An ErrorBoundary does NOT fix this — don't try it

Wrapping the loader read in an error boundary **does not stop the "Switched to
client rendering" fallback.** On the server the read *suspends* first (the relative
`fetch` returns a pending promise → `<Suspense>` streams its fallback), and only
*then* rejects. Post-fallback errors in a streamed Suspense boundary are
**recoverable errors**: React re-renders them on the client regardless of any
boundary above. The only fix is to **avoid the suspension at the source** — i.e.
don't do the loader read when you're the background anchor. Hence `useIsFocused`.

## Adding a new loader-bearing route

If a new route exports a `loader` and its stack declares `initialRouteName`, and any
**nested** sibling exists in that stack, apply the same focus gate. If the stack has
no `initialRouteName`, or the route is never a seeded anchor, no gate is needed.
Builds on the loader-seeding conventions in
[web-ssr-hydration](web-ssr-hydration.md).
