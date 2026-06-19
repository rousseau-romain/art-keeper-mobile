# Rule: styling — static `StyleSheet`, theme/dynamic styles inline

Split styling by what's knowable at module load. The reference is
`src/app/(auth)/login.tsx`.

## The split

- **Static, theme-independent styles** → a single module-scope
  `StyleSheet.create({ ... })` at the bottom of the file (named `styles`). These
  are pure layout: `flex`, `flexDirection`, `alignItems`, `gap`, fixed
  paddings/sizes, `lineHeight`, `textAlign`, `overflow`, etc.
- **Anything that reads a theme token** (`t.*`, `fonts.*`) **or a prop/state
  value** → write it **inline** in the component (the file already calls
  `useTheme()` for `t` / `display` / `body` / `mono`).

Do **not** build a themed `StyleSheet` factory or a `useThemedStyles`-style hook —
that indirection was removed on purpose. `StyleSheet.create` holds only values
that never change with the theme.

## Composing the two

Merge a static named style with an inline themed object via a **style array**:

```ts
// container: static flex + themed background
<View style={[styles.flex1, { backgroundColor: t.bg }]} />

// safe-area inset is dynamic → inline alongside the static header layout
<View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: t.bg }]} />

// font helper (runtime size) + themed color
<Text style={[display(26), { color: t.ink }]}>ArtKeeper</Text>

// prop-driven color
<View style={[styles.dot, { backgroundColor: color }]} />
```

Keep each style object whole — don't split one **mostly-themed** object (e.g. a
card with `backgroundColor` + `borderColor` + `borderRadius` + one `overflow`)
across both just to relocate its one static prop. Put it inline as a unit. Only
pull a style into `styles` when it is **entirely** static.

## Exceptions

- A purely static style with no theme dependency at all (e.g. a bare
  `{ flex: 1 }`) is just a plain module `StyleSheet.create` — see `staticStyles`
  in `src/app/_layout.tsx`.
- `StyleSheet.absoluteFill` and other RN style constants are used as-is.
