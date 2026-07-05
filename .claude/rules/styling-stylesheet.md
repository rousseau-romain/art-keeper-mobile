# Rule: styling — theme colors via `createStyles` factory; inline holds only prop/state-driven values

The app has two palettes (dark + light, see `src/theme/enums/color.enums.ts`)
switched at runtime by `ThemeProvider` (`src/theme/ThemeProvider.tsx`): `auto` /
`light` / `dark`, persisted, with `auto` following the device/browser scheme. So
**colors are theme-dependent** and can never live in a module-scope constant
style. The reference is `src/pages/app/auth/screens/LoginScreen.tsx`.

## The split

- **Every color-bearing sheet is a `createStyles` factory** at the bottom of the
  file, resolved in the component by `useThemeStyles`
  (`src/theme/hooks/useThemeStyles.ts`):

  ```ts
  export const MyThing = () => {
    const styles = useThemeStyles(createStyles); // one line in the component
    return <View style={styles.card} />;         // usage unchanged
  };

  // bottom of file — same shape as the old static sheet, palette in, sheet out
  const createStyles = (c: Palette) =>
    StyleSheet.create({
      card: {
        borderWidth: 1.5,
        borderRadius: RadiusEnum.sm,
        backgroundColor: c.surface,   // palette token, not a hard-coded hex
        borderColor: c.borderSoft,
      },
    });
  ```

  `useThemeStyles` caches per factory per scheme (a module `WeakMap`), so each
  sheet is built at most twice for the app's lifetime — treat the factory as
  cheap and the pattern as the default.
- **A sheet with no color props stays a plain module-scope
  `StyleSheet.create`** (named `styles`) — don't convert layout-only sheets.
  Scales (`SpacingEnum.*`, `RadiusEnum.*`, `FontSizeEnum.*`, …) and `FONTS.*`
  are still plain module constants and belong in either kind of sheet.
- **Inline** (a style object written in the JSX) holds **only** values that
  cannot live in a sheet:
  - **prop/state-driven values** — `opacity: disabled ? 0.5 : 1`,
    `paddingTop: insets.top + SpacingEnum.xl`, a color from a hook
    (`backgroundColor: bg` from `useButtonColors`), and a **color picked by
    prop/state** — `backgroundColor: active ? colors.primary :
    colors.transparent` (values from `useTheme().colors`; the *choice* is
    dynamic, so it stays inline).

If a value is layout/scale/font, it's in a sheet (factory or static). If it's a
color, it's a `c.*` token in the factory — or, when chosen by prop/state, a
`colors.*` read inline. If it's computed from a prop/state, it's inline. **There
is no other bucket.**

## Reading colors outside a sheet

Pull the active palette from `useTheme()` and index it:

```ts
const { colors, scheme } = useTheme();
<ActivityIndicator color={colors.primary} />
<Switch trackColor={{ false: colors.border, true: colors.primary }} />
```

Components that take a token **key** prop (`color?: ColorEnumType`, like `Text`
/ `Icon`) resolve it internally via `useTheme().colors[color]` — call sites just
pass the key. Never import `DarkColorEnum` / `LightColorEnum` directly in a
component — the only legitimate consumers of the palette objects are the theme
layer itself and the web HTML shell (`src/app/+html.tsx`, static render).

## Composing

Merge a sheet style with an inline prop/state object via a **style array** —
split every object that mixes sheet-able and dynamic props:

```ts
// fully sheet-able → one named style, no inline object
<View style={styles.screen} />

// sheet layout + dynamic inset → array
<View style={[styles.header, { paddingTop: insets.top + SpacingEnum.xl }]} />

// color chosen by state → inline (values are palette tokens, choice is dynamic)
<View style={[styles.segment, { backgroundColor: active ? colors.primary : colors.transparent }]} />
```

## Exceptions

- `StyleSheet.absoluteFill` and other RN style constants are used as-is.
- Navigation config that only accepts a single style object takes the resolved
  themed style (`tabBarStyle: styles.tabBar` where `styles` came from
  `useThemeStyles` inside the layout component), or a **style array** when it
  mixes in a dynamic value.
- Do **not** rebuild a `useTheme`-per-property indirection beyond this: one
  `useThemeStyles(createStyles)` per file, plus one `useTheme()` where inline
  colors are needed.
