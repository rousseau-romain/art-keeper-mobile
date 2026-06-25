# Rule: use the design scales, never magic numbers

Spacing, corner radius, font size, **icon size**, and **control height** come from
the named steps in `src/theme/enums/scale.enums.ts` (re-exported from `@/theme`):

| Scale | Object / key union | Covers |
| --- | --- | --- |
| Spacing | `SpacingEnum` / `SpacingEnumType` | padding / margin / gap |
| Radius | `RadiusEnum` / `RadiusEnumType` | corner radius |
| Font size | `FontSizeEnum` / `FontSizeEnumType` | text size |
| Icon size | `IconSizeEnum` / `IconSizeEnumType` | lucide glyph `size` (incl. the `Icon` wrapper) |
| Control height | `ControlHeightEnum` / `ControlHeightEnumType` | min-heights / square sizes of interactive controls |

Never write a raw point value where a scale step exists.

```ts
// Yes
padding: SpacingEnum.lg,
borderRadius: RadiusEnum.sm,
fontSize: FontSizeEnum.base,
minHeight: ControlHeightEnum.md,
<Star size={IconSizeEnum.xl} />

// No
padding: 16,
borderRadius: 2,
fontSize: 15,
minHeight: 48,
<Star size={28} />
```

## Size-like props take the scale's key type, not `number`

When a component exposes a size / spacing / radius prop, type it as the matching
scale's **key union** (`FontSizeEnumType` / `SpacingEnumType` / `RadiusEnumType` /
`IconSizeEnumType` / `ControlHeightEnumType`), default it to a named step, and
resolve to pixels inside the component via the constant — don't accept a raw
`number`. The `Icon` wrapper (`src/shared/ui/icon/Icon.tsx`) does this with
`IconSizeEnumType`.

```ts
import { FontSizeEnum, type FontSizeEnumType } from "@/theme";

type CheckProps = ViewProps & {
  size?: FontSizeEnumType; // not `size?: number`
};

export const Check = ({ size = "base", ...rest }: CheckProps) => {
  const px = FontSizeEnum[size]; // resolve the named step to a value
  // … width: px, height: px, borderRadius: px / 2 …
};
```

Reference: `src/shared/ui/check/Check.tsx`. The scale constants are module
constants (not theme tokens), so values built from them stay in the static
`StyleSheet`; only prop/state-derived sizes (like `px` above) go inline — see
[styling-stylesheet](styling-stylesheet.md).
