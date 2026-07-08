# Rule: wrap a pressable component in `<Link>` with `asChild` — never bare

When a navigation target is a component that already renders its own touchable
box (a `Tag`, a `Button`, a `Pressable` with padding), wrap it in expo-router's
`<Link>` with **`asChild`** — never as a bare `<Link><Thing/></Link>`.

```tsx
// Yes — asChild: the Tag itself becomes the link, so its padding + hitSlop ARE
// the tap/click target.
<Link href={{ pathname: "/artworks", params: { tag } }} asChild>
  <Tag label={tag} accessibilityLabel={tr("a11y.searchTag", { tag })} />
</Link>

// No — bare Link: the padding lives on the child, the Link shrink-wraps it and
// adds none of its own, so the tappable box doesn't match the padded visual.
<Link href={{ pathname: "/artworks", params: { tag } }}>
  <Tag label={tag} />
</Link>
```

## Why

The padding that makes the element look tappable lives **inside** the child
component (e.g. `Tag`'s inner `Text` carries `paddingHorizontal/Vertical`), not
on the `<Link>`. A bare `<Link>` is just a wrapper: it contributes no padding and
tightly wraps its child, so the link's hit area doesn't line up with the padded
visual — the padding reads as dead space.

With `asChild`, expo-router **clones the child and injects its navigation
`onPress`** (plus `href`/`role`/accessibility) instead of rendering its own
wrapper element. The child's own touchable — its padded box and any `hitSlop` —
*is* the link, so the whole padded area is pressable.

- A component like `Tag` only renders its `Pressable` variant **when it receives
  an `onPress`** (`src/shared/ui/tag/Tag.tsx`); `asChild` supplies that `onPress`,
  so the padded `Pressable` (with `hitSlop`) is what gets tapped — you don't pass
  `onPress` yourself.
- Pass field-specific props (`accessibilityLabel`, the RHF wiring, …) on the
  child, not the `<Link>` — they'd be dropped from a bare Link's inner element.
- Reference: the artist handle **and** the tags in
  `src/pages/app/artwork/components/artwork-meta/ArtworkMeta.tsx` both use
  `asChild`.

## `<Link>` or `onPress`? — content vs action

Before reaching for `asChild`, decide whether the target should be a `<Link>` at
**all**. On web, `<Link>` renders a real `<a href>`; a plain `onPress` +
`router.push` renders only a `Pressable`. So the choice is about **what the
target is**, not just how it's styled:

- **Content navigation → `<Link>`** (with `asChild` per above). Anything that
  leads to an indexable, shareable page — an artist profile, a tag/filter
  listing, an artwork detail. The `<a href>` matters: it's crawlable (SEO),
  right-/middle-clickable to open in a new tab, shows the URL on hover, and can
  prefetch. Use `<Link>` even though native ignores the anchor — the web build
  needs it.
- **Action → `onPress` + `router.push`.** A control that performs an action
  rather than exposing a document: an authenticated edit screen, a wizard step, a
  destructive/confirm flow, anything behind a guard. There's no SEO or
  open-in-new-tab value in an `<a href>` here, so a `Button`/`Pressable` with
  `onPress` (calling `useRouter().push`) is correct — and lets the control own
  loading/disabled state.

```tsx
// content → Link asChild (crawlable, new-tab-able)
<Link href={{ pathname: "/artworks", params: { tag } }} asChild>
  <Tag label={tag} />
</Link>

// action → onPress (no anchor needed; a Button variant="text" reads as a link)
<Button
  variant="text"
  label={tr("artwork.detail.proposeEdit")}
  onPress={() =>
    router.push({ pathname: "/artworks/[slug]/edit", params: { slug } })
  }
/>
```

Reference: in
`src/pages/app/artwork/components/artwork-meta/ArtworkMeta.tsx` the handle and
tags are `<Link asChild>` (content), while "propose edit" is a `Button` with
`onPress` (action → the edit screen).

## When it doesn't apply

Plain inline **text** links (a word inside a sentence) have no touchable box of
their own — a bare `<Link>` around a `<Text>` is fine there. This rule is about
wrapping a component that **already renders its own padded/touchable element**.

See [router-navigation-paths](router-navigation-paths.md) for the href value
itself (strip route-group parens).
