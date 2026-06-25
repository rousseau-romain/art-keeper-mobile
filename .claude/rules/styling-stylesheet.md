# Rule: styling — inline holds only prop/state-driven values; everything static is `StyleSheet`

Split styling by what's knowable at module load. The reference is
`src/app/(auth)/login.tsx`.

## The split

- **Everything static lives in a single module-scope `StyleSheet.create({ ... })`**
  at the bottom of the file (named `styles`). "Static" = knowable at module load,
  which now includes **all colors and font families** — `ColorEnum.*` and
  `FONTS.*` are plain module constants (the single theme is a constant; there is
  no `useTheme` hook), exactly like the design scales. So `backgroundColor:
  ColorEnum.bg`, `color: ColorEnum.inkMute`, `borderColor: ColorEnum.hair`,
  `fontFamily: FONTS.body` all go in `styles` alongside `flex`, `gap`,
  `borderWidth: 1.5`, `borderRadius: RadiusEnum.sm`, `fontSize: FontSizeEnum.sm`, …
- **Inline** (a style object written in the JSX) holds **only** values that
  *cannot* live in a static `StyleSheet`:
  - **prop/state-driven values** — `backgroundColor: bg` (a color from a hook
    like `useButtonColors`), `opacity: disabled ? 0.5 : 1`,
    `minHeight: sm ? ControlHeightEnum.sm : ControlHeightEnum.md`,
    `paddingTop: insets.top + SpacingEnum.xl`, and a **color picked by a
    prop/state** — `backgroundColor: active ? ColorEnum.accent :
    ColorEnum.transparent`. The value is a `ColorEnum` token, but the *choice* is
    dynamic, so it stays inline.
  - **the `display` / `body` / `mono` helper calls** — `display(FontSizeEnum.xl)`
    returns a runtime `TextStyle` (size is a param), so the call is written inline
    and merged via a style array (see [design-scale](design-scale.md) for the
    helpers).

If a value is fixed at module load (a literal, a scale step, or a bare
`ColorEnum.*` / `FONTS.*`), it's in `styles`. If it's chosen or computed from a
prop/state, it's inline. **There is no third bucket** — a bare `borderWidth: 1.5`
next to a fixed `borderColor: ColorEnum.hair` both go to `styles`; only a
prop/state-chosen color stays inline.

Do **not** build a `StyleSheet` factory or a `useThemedStyles`-style hook, and
do **not** route colors through a `useTheme()` hook — those indirections were
removed on purpose. Read `ColorEnum` / `FONTS` straight from `@/theme`.

## Composing the two

Merge a static named style with an inline prop/state object via a **style
array** — split every object that mixes static and dynamic:

```ts
// fully static (flex + bg) → one named style, no inline object
<View style={styles.screen} />

// static header layout; safe-area inset is dynamic (prop-derived) → inline.
// The bg/border colors are static, so they live in styles.header.
<View style={[styles.header, { paddingTop: insets.top + SpacingEnum.xl }]} />

// font helper (runtime size). The default ink color is baked into display(),
// so no color override is needed.
<Text style={display(FontSizeEnum.xl)}>ArtKeeper</Text>

// a "card": borderRadius + borderWidth + the fixed colors are all static →
// everything lives in styles.card, the JSX is just the named style
<View style={styles.card} />

// prop-driven color (from a hook / passed in) → inline
<View style={[styles.dot, { backgroundColor: color }]} />

// color chosen by state → inline (the choice is dynamic, the values are tokens)
<View style={[styles.segment, { backgroundColor: active ? ColorEnum.accent : ColorEnum.transparent }]} />
```

When an object mixes static and dynamic props, **pull the static props out** into
`styles` and merge via the array — the inline object must end up containing
nothing but prop/state-driven values. An object whose props are all dynamic is
left inline as-is; an element whose styles are all static takes the named style
directly (no inline object at all).

## Exceptions

- `StyleSheet.absoluteFill` and other RN style constants are used as-is.
- Navigation config that only accepts a single style object (some
  `screenOptions` fields) takes the named static style directly when it's fully
  static (`tabBarStyle: styles.tabBar`, `contentStyle: staticStyles.bg`), or a
  **style array** when it mixes in a dynamic value.
