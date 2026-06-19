# Rule: use `type`, never `interface`

All object/shape declarations use a `type` alias — `interface` is **not** used
anywhere in `src/`.

```ts
// Yes
type ButtonProps = {
  label: string;
  onPress?: () => void;
};

type Theme = ColorTokens; // alias, not `interface Theme extends ColorTokens {}`

// No
interface ButtonProps {
  label: string;
}
```

- Component props are a `type` named `{Component}Props` (see the `create-component`
  skill and `src/shared/ui/Button.tsx`).
- Extension/composition uses intersections (`type A = B & { … }`) or aliases,
  not `interface … extends …`.

## Only exception

**Module augmentation**, which TypeScript requires to be an `interface` — e.g.
`src/lib/i18n/i18next.d.ts` augments `i18next`'s `CustomTypeOptions`. Ambient
`.d.ts` augmentation is the sole place an `interface` is allowed.
