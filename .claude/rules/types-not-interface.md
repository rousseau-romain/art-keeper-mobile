# Rule: use `type`, never `interface`

All object/shape declarations use a `type` alias — `interface` is **not** used
anywhere in `src/`.

```ts
// Yes
type ButtonProps = {
  label: string;
  onPress?: () => void;
};

// intersect, not `interface TagProps extends PressableProps { … }`
type TagProps = PressableProps & { label: string };

// No
interface ButtonProps {
  label: string;
}
```

- Component props are a `type` named `{Component}Props` (see the `create-component`
  skill and `src/shared/ui/button/Button.tsx`).
- **Always `export` the props type** — every component's `{Component}Props` is
  exported, even when nothing imports it yet, so callers can compose/extend it
  and the component's public shape is reachable:

  ```ts
  // Yes — exported even though only this file uses it today
  export type CenteredProps = ViewProps;
  export const Centered = ({ style, ...rest }: CenteredProps) => { … };

  // No — props type kept file-private
  type CenteredProps = ViewProps;
  ```

  This applies to **every** component: `src/shared/ui/*`, page-local
  `src/pages/app/<domain>/components/*`, and the `*Screen` props
  (`export type DetailScreenProps = { id: string }`). It does **not** force an
  export for non-props helper types that are genuinely file-internal.
- Extension/composition uses intersections (`type A = B & { … }`) or aliases,
  not `interface … extends …`.

## Only exception

**Module augmentation**, which TypeScript requires to be an `interface` — e.g.
`src/lib/i18n/i18next.d.ts` augments `i18next`'s `CustomTypeOptions`. Ambient
`.d.ts` augmentation is the sole place an `interface` is allowed.
