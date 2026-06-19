---
name: create-component
description: Scaffold a new React Native component in src/components/ following the project's conventions (separate {Component}Props type, useTheme + StyleSheet split, i18n, barrel export). Use when the user asks to create/add a new component.
---

# Create a component

Scaffold a new component that matches the existing components (`Button.tsx`,
`Tag.tsx`, `Check.tsx`). Component name is given as the argument (PascalCase),
e.g. `Component`.

## Where it goes

Decide the directory by how reusable the component is:

- **`src/shared/ui/`** — for a reusable, generic UI primitive (a button, tag,
  badge, input, card… something with no feature-specific logic that's used
  across many screens). If `src/shared/ui/` doesn't exist yet, create it, and
  give it its own barrel `src/shared/ui/index.ts`.
- **`src/components/`** — for a feature/app-specific component that isn't a
  generic primitive.

When unsure, prefer `src/components/`. If the user says it's a shared/UI
component (or "reused a lot"), put it in `src/shared/ui/`. Below, `{dir}` refers
to the chosen directory.

## Steps

1. **Resolve the name and directory.** Take the PascalCase name from the
   argument (e.g. `Component`) and pick `{dir}` per "Where it goes". **Every
   component lives in its own folder** (see the `component-module-structure`
   rule), so the file is `{dir}/{component}/{Component}.tsx` — folder name
   lowercase/kebab-case, file PascalCase. If no name is given, ask for one.
2. **Ask only what you can't infer.** If the user didn't say what props the
   component needs, make a minimal reasonable guess and proceed — don't block.
3. **Write `{dir}/{component}/{Component}.tsx`** following the rules below.
   Colocate any component-specific hooks in `{dir}/{component}/hooks/useX.ts`.
4. **Add the named export** to the `{dir}` barrel `{dir}/index.ts` (creating it
   if it's a new `src/shared/ui/`), keeping the list alphabetically sorted:
   ```ts
   export { Component } from "./component/Component";
   ```

## Rules the generated file MUST follow

These mirror `.claude/rules/` — the always-on conventions.

- **Named `export const` arrow, no default, no `function`.** Components (and all
  named exports in this project) are `export const {Component} = (...) => { ... }`
  — never `export function`. See the `export-const-functions` rule.
- **Separate props type when there are props.** If the component takes props,
  declare a dedicated **`type`** named **`{Component}Props`** above the component
  and annotate the parameter with it — never inline the object type and never
  use `React.FC`. **Use `type`, never `interface`** (project-wide rule — see
  below):
  ```ts
  type ComponentProps = {
    label: string;
    onPress?: () => void;
  };

  export const Component = ({ label, onPress }: ComponentProps) => { ... };
  ```
  A component with **no** props takes no parameter at all.
- **When the component wraps a single RN element, intersect its props inline.**
  Declare `{Component}Props` as the wrapped component's prop type (e.g.
  `PressableProps`, `TextProps`, `ViewProps`) intersected with the component's
  own props — `type {Component}Props = PressableProps & { … }`, no separate base
  type. Destructure the props you use, spread `...rest` onto the wrapped element
  so callers can pass through any native prop (`onPress`, `testID`,
  `accessibilityState`, …). Don't redeclare props the wrapped type already
  provides (`onPress`, `disabled`, `style`).
  ```ts
  // Wraps a Pressable and forwards the rest of its props to it.
  type ComponentProps = PressableProps & {
    label: string;
    variant?: Variant;
    size?: Size;
  };

  export const Component = ({
    label,
    variant = "default",
    size = "normal",
    disabled,
    style,
    ...rest
  }: ComponentProps) => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        {...rest}
        disabled={disabled}
        style={(state) => [
          styles.base,
          /* themed/dynamic */,
          typeof style === "function" ? style(state) : style,
        ]}
      />
    );
  };
  ```
  Set the component's own defaults/accessibility **before** `{...rest}` so callers
  can override them, and the props the component must control (computed `style`,
  `disabled || loading`) **after**. See `src/shared/ui/button/Button.tsx` for the
  reference. If the component doesn't wrap a single forwardable element, just use
  a flat `{Component}Props` object type.
- **`type`, never `interface`.** All object/shape declarations in this project
  use `type X = { ... }` aliases — `interface` is not used anywhere (the only
  exception is module augmentation like `i18next.d.ts`, which TypeScript
  requires to be an `interface`).
- **Theme via `useTheme()`** from `@/theme` — `const { t, fonts } = useTheme();`.
  Use `t.*` color tokens, `fonts.body` / `fonts.mono`, and the `SPACING` /
  `RADIUS` / `FONT_SIZE` scale constants (also from `@/theme`).
- **Styling split** (see `.claude/rules/styling-stylesheet.md`):
  - A single module-scope `const styles = StyleSheet.create({ ... })` at the
    **bottom** of the file holds **only** static values — layout, scale
    constants (`SPACING`/`RADIUS`/`FONT_SIZE`), literal sizes, `borderWidth`,
    etc.
  - Inline (style arrays in JSX) holds **only** `useTheme` values (`t.*`,
    `fonts.*`) and prop/state-driven values (`backgroundColor: bg`,
    `opacity: disabled ? 0.5 : 1`, …).
  - Merge the two with a style array: `style={[styles.base, { color: t.ink }]}`.
    Split any object that mixes static + themed — static props move into
    `styles`, only themed/dynamic values stay inline.
- **i18n** (see `.claude/rules/i18n-translation.md`): no hardcoded user-facing
  strings. Pull copy through `useTranslation()` (`const { t: tr } =
  useTranslation();` when `t` is already the theme) and add the key to **both**
  `src/lib/i18n/locales/en.constant.ts` and `fr.constant.ts`. Put a11y labels
  under the `a11y` namespace. Pressable/interactive elements get
  `accessibilityRole` + `accessibilityLabel`.
- **One file for the component itself.** The `{Component}Props` type, the
  component function, and the `styles` `StyleSheet` all live in the single
  `{dir}/{component}/{Component}.tsx`. Do **not** split the props type or styles
  into separate `.types.ts` / `.constant.ts` files. (Colocated *hooks* are the
  exception — they get their own files under `hooks/`, per the
  `component-module-structure` rule.)
- **File naming**: a component module keeps a plain `{Component}.tsx` name (it's
  mixed runtime logic, not a `.types`/`.constant`/`.enums` file).

## Reference

`src/shared/ui/button/Button.tsx` is the canonical example (own folder, props
type `ButtonProps`, theme split, static `styles` at the bottom, a colocated
`hooks/useGetButtonsColors.ts`). `src/shared/ui/check/Check.tsx` shows a tiny
one-file component with a single optional prop.

After writing, leave the file ready to compile — don't add placeholder TODOs for
imports that the conventions already dictate.
