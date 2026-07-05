# Rule: enums are `as const` objects + a derived `keyof typeof` key union

Never use the TS `enum` keyword. An "enum" in this codebase is an `as const`
object, and **every** such object exports a key-union type derived from it with
`keyof typeof`, right below the object:

```ts
export const DarkColorEnum = {
  bg: "#0e0e0f",
  primary: "#ff5b1f",
  // …
} as const;

export type ColorEnumType = keyof typeof DarkColorEnum;
```

- **Always pair them.** The `as const` object and its `keyof typeof` type are
  written together — defining the object without the derived union is incomplete.
- `as const` (not `enum`) keeps the values plain (numbers/strings) so they drop
  straight into RN styles, and narrows the keys to a literal union.
- **Naming**: the object is `{Name}Enum` (PascalCase, `Enum` suffix —
  `ColorEnum`, `SpacingEnum`, `FontSizeEnum`); the derived key union is the same
  base with an `EnumType` suffix (`ColorEnumType`, `SpacingEnumType`,
  `FontSizeEnumType`).
- **Placement**: these live in a `{name}.enums.ts` file (see
  [file-naming](file-naming.md)); the derived type stays in the same file as its
  source object, never a separate `.types.ts`.
- Reference: `src/theme/enums/scale.enums.ts` (`SpacingEnum`/`SpacingEnumType`, …)
  and `src/theme/enums/color.enums.ts` (`DarkColorEnum`+`LightColorEnum`/
  `ColorEnumType`).

## Colors: two palettes, one key union, plus `*Value` and `Palette`

Colors come as **two parallel palettes** — `DarkColorEnum` and `LightColorEnum`
— with identical keys. The key union derives from the dark one; the light one is
checked against it with `satisfies`, so adding a token to only one palette is a
compile error. Because tokens are consumed as resolved **values**
(`colors.primary` is a hex string, not the key `"primary"`), the key union pairs
with a **value union** and the `Palette` shape handed out by `useTheme()`:

```ts
export type ColorEnumType = keyof typeof DarkColorEnum;

export const LightColorEnum = {
  // …same keys, light values…
} as const satisfies Record<ColorEnumType, string>;

/** The resolved color values (hex strings) — what the palettes resolve to. */
export type ColorEnumValue =
  | (typeof DarkColorEnum)[ColorEnumType]
  | (typeof LightColorEnum)[ColorEnumType];

/** The active palette shape handed out by `useTheme()` / `useThemeStyles`. */
export type Palette = Record<ColorEnumType, ColorEnumValue>;
```

- **Read colors from the theme, not the palette objects** — `useTheme().colors`
  in components/hooks, the `c: Palette` param in a `createStyles` factory (see
  [styling-stylesheet](styling-stylesheet.md)). Importing `DarkColorEnum` /
  `LightColorEnum` directly is reserved for the theme layer and `+html.tsx`.
- **Type a color you hold/return as `ColorEnumValue`, never `string`** — e.g. a
  `{ bg; fg }` returned by `useButtonColors` / `useGetTagColors`. `string`
  loses the "from the palette" guarantee; `ColorEnumType` is wrong (that's the
  *key*, and these hold values).
- Need `"transparent"` (or any non-token color)? Add it to **both** palettes as
  a token so it stays inside `ColorEnumValue` — don't widen the type with `| "…"`.
- This value-union companion is **colors-only**: the scale enums (`SpacingEnum`,
  `FontSizeEnum`, …) are typed by their **key** union when used as props (see
  [design-scale](design-scale.md)), and resolved to a number inside the component.
