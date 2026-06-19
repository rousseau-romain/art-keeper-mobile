# Rule: use the design scales, never magic numbers

Spacing, corner radius, and font size come from the named steps in
`src/theme/scale.enums.ts` (re-exported from `@/theme`): `SPACING`, `RADIUS`,
`FONT_SIZE`, with the key unions `Spacing`, `Radius`, `FontSize`. Never write a
raw point value where a scale step exists.

```ts
// Yes
padding: SPACING.lg,
borderRadius: RADIUS.sm,
fontSize: FONT_SIZE.base,

// No
padding: 16,
borderRadius: 2,
fontSize: 15,
```

## Size-like props take the scale's key type, not `number`

When a component exposes a size / spacing / radius prop, type it as the scale's
**key union** (`FontSize` / `Spacing` / `Radius`), default it to a named step,
and resolve to pixels inside the component via the constant — don't accept a raw
`number`.

```ts
import { FONT_SIZE, type FontSize, useTheme } from "@/theme";

type CheckProps = ViewProps & {
  size?: FontSize; // not `size?: number`
};

export const Check = ({ size = "base", ...rest }: CheckProps) => {
  const px = FONT_SIZE[size]; // resolve the named step to a value
  // … width: px, height: px, borderRadius: px / 2 …
};
```

Reference: `src/shared/ui/check/Check.tsx`. The scale constants are module
constants (not theme tokens), so values built from them stay in the static
`StyleSheet`; only prop/state-derived sizes (like `px` above) go inline — see
[styling-stylesheet](styling-stylesheet.md).
