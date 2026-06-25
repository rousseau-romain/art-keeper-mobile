# Rule: enums are `as const` objects + a derived `keyof typeof` key union

Never use the TS `enum` keyword. An "enum" in this codebase is an `as const`
object, and **every** such object exports a key-union type derived from it with
`keyof typeof`, right below the object:

```ts
export const ColorEnum = {
  bg: "#0e0e0f",
  accent: "#ff5b1f",
  // …
} as const;

export type ColorEnumType = keyof typeof ColorEnum;
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
  and `src/theme/enums/color.enums.ts` (`ColorEnum`/`ColorEnumType`).

## Colors: also derive a `*Value` union for the resolved values

`ColorEnum` is consumed as resolved **values** (`ColorEnum.accent` is the hex
string `"#ff5b1f"`, not the key `"accent"`), so it pairs its key union with a
**value union** derived with an indexed access, right below the key type:

```ts
export type ColorEnumType = keyof typeof ColorEnum;
/** The resolved color values (hex strings) — what `ColorEnum.*` resolves to. */
export type ColorEnumValue = (typeof ColorEnum)[ColorEnumType];
```

- **Type a color you hold/return as `ColorEnumValue`, never `string`** — e.g. a
  `{ bg; fg }` returned by `useButtonColors` / `useGetTagColors`. `string`
  loses the "from the palette" guarantee; `ColorEnumType` is wrong (that's the
  *key*, and these hold values).
- Need `"transparent"` (or any non-token color)? Add it to `ColorEnum` as a token
  so it stays inside `ColorEnumValue` — don't widen the type with `| "…"`.
- This value-union companion is **colors-only**: the scale enums (`SpacingEnum`,
  `FontSizeEnum`, …) are typed by their **key** union when used as props (see
  [design-scale](design-scale.md)), and resolved to a number inside the component.
