# Rule: styling — inline holds only `useTheme` values; everything static is `StyleSheet`

Split styling by what's knowable at module load. The reference is
`src/app/(auth)/login.tsx`.

## The split

- **Inline** (a style object written in the JSX) holds **only** values that
  *cannot* live in a static `StyleSheet`:
  - **`useTheme()` values** — `t.*`, `fonts.*`, and the `display` / `body` /
    `mono` helpers.
  - **prop/state-driven values** — `backgroundColor: bg`,
    `opacity: disabled ? 0.5 : 1`, `minHeight: sm ? 36 : 48`,
    `paddingTop: insets.top + SPACING.xl`, etc.
- **Everything else is static** and lives in a single module-scope
  `StyleSheet.create({ ... })` at the bottom of the file (named `styles`). This
  includes **all** literals **and** the design-scale constants — `flex`,
  `flexDirection`, `alignItems`, `gap`, `overflow`, `lineHeight`, `textAlign`,
  fixed sizes, `borderWidth: 1.5`, `borderRadius: RADIUS.sm`,
  `padding: SPACING.lg`, `fontSize: FONT_SIZE.sm`, … `SPACING` / `RADIUS` /
  `FONT_SIZE` are module constants, not theme tokens, so they are static.

If a value reads `t.*` / `fonts.*` or a prop/state, it's inline; otherwise it's
in `styles`. **There is no third bucket** — a bare `borderWidth: 1.5` next to a
themed `borderColor: t.hair` is **split**: the width goes to `styles`, the color
stays inline.

Do **not** build a themed `StyleSheet` factory or a `useThemedStyles`-style hook —
that indirection was removed on purpose. `StyleSheet.create` holds only values
that never change with the theme.

## Composing the two

Merge a static named style with an inline `useTheme`/dynamic object via a
**style array** — split every object that mixes the two kinds:

```ts
// static flex + themed background
<View style={[styles.flex1, { backgroundColor: t.bg }]} />

// static header layout; safe-area inset is dynamic (prop-derived) → inline
<View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: t.bg }]} />

// font helper (runtime size) + themed color
<Text style={[display(26), { color: t.ink }]}>ArtKeeper</Text>

// a "card": borderRadius + borderWidth are static → styles.card;
// only the themed colors stay inline
<View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line }]} />

// prop-driven color
<View style={[styles.dot, { backgroundColor: color }]} />
```

Even when an object is mostly themed, **pull its static props out** into `styles`
and merge via the array — the inline object must end up containing nothing but
`useTheme`/dynamic values. An object with no static props at all is left inline
as-is (nothing to extract).

## Exceptions

- A purely static style with no theme/dynamic dependency at all (e.g. a bare
  `{ flex: 1 }`) is just a plain module `StyleSheet.create` — see `staticStyles`
  in `src/app/_layout.tsx`.
- `StyleSheet.absoluteFill` and other RN style constants are used as-is.
- Navigation config that only accepts a single style object (some
  `screenOptions` fields) still accepts a **style array**, so split it the same
  way (`tabBarStyle: [styles.tabBar, { backgroundColor: t.surface }]`).
