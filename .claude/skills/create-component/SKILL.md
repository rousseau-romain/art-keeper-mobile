---
name: create-component
description: Scaffold a new React Native component in src/components/ following the project's conventions (separate {Component}Props type, themed createStyles/useThemeStyles split, i18n, deep-path imports — no barrel). Use when the user asks to create/add a new component.
---

# Create a component

Scaffold a new component that matches the existing components (`Button.tsx`,
`Tag.tsx`, `Check.tsx`). Component name is given as the argument (PascalCase),
e.g. `Component`.

## Where it goes

Decide the directory by how reusable the component is:

- **`src/shared/ui/`** — for a reusable, generic UI primitive (a button, tag,
  badge, input, card… something with no feature-specific logic that's used
  across many screens). If `src/shared/ui/` doesn't exist yet, create it.
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
4. **No barrel.** There is no `{dir}/index.ts` re-export — callers import the
   component straight from its module via the deep `@/` path, e.g.
   `import { Component } from "@/shared/ui/component/Component"`. See the
   `import-path-alias` rule.

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
- **Theme tokens** (no `@/theme` barrel — deep `@/` paths): colors come from the
  active theme — `useTheme()` (`@/theme/ThemeProvider`) for inline reads and the
  `Palette` param of a `createStyles` factory for sheets. Scale constants
  (`SpacingEnum` / `RadiusEnum` / `FontSizeEnum` from
  `@/theme/enums/scale.enums`) and `FONTS` (`@/theme/fonts.constant`) are plain
  module constants. Never hard-code a hex or import `DarkColorEnum` /
  `LightColorEnum` directly.
- **Styling split** (see `.claude/rules/styling-stylesheet.md`):
  - A color-bearing sheet is a `const createStyles = (c: Palette) =>
    StyleSheet.create({ ... })` factory at the **bottom** of the file, resolved
    in the component with `const styles = useThemeStyles(createStyles)`
    (`@/theme/hooks/useThemeStyles`). It holds layout, scale constants, literal
    sizes, `borderWidth`, the `c.*` colors, and `FONTS.*` families.
  - A sheet with **no** colors stays a plain module-scope
    `const styles = StyleSheet.create({ ... })`.
  - Inline (style arrays in JSX) holds **only** prop/state-driven values
    (`backgroundColor: bg`, `opacity: disabled ? 0.5 : 1`, a color *chosen* by
    state like `active ? colors.primary : colors.transparent`, with `colors`
    from `useTheme()`).
  - Merge the two with a style array: `style={[styles.base, { backgroundColor: bg }]}`.
    Split any object that mixes sheet-able + dynamic — fixed props (incl. fixed
    colors) move into the sheet, only prop/state-driven values stay inline.
- **i18n** (see `.claude/rules/i18n-translation.md`): no hardcoded user-facing
  strings. Pull copy through `useTranslation()` (aliased `const { t: tr } =
  useTranslation();` by convention across the app) and add the key to **both**
  `src/lib/i18n/locales/en.constant.ts` and `fr.constant.ts`. Put a11y labels
  under the `a11y` namespace. Pressable/interactive elements get
  `accessibilityRole` + `accessibilityLabel`.
- **One file for the component itself.** The `{Component}Props` type, the
  component function, and the sheet (`createStyles` factory or plain `styles`)
  all live in the single
  `{dir}/{component}/{Component}.tsx`. Do **not** split the props type or styles
  into separate `.types.ts` / `.constant.ts` files. (Colocated *hooks* are the
  exception — they get their own files under `hooks/`, per the
  `component-module-structure` rule.)
- **File naming**: a component module keeps a plain `{Component}.tsx` name (it's
  mixed runtime logic, not a `.types`/`.constant`/`.enums` file).

## Reference

`src/shared/ui/button/Button.tsx` is the canonical example (own folder, props
type `ButtonProps`, theme split, a colocated `hooks/useButtonColors.ts`).
`src/shared/ui/check/Check.tsx` shows a tiny one-file component with a single
optional prop and a `createStyles` factory.

After writing, leave the file ready to compile — don't add placeholder TODOs for
imports that the conventions already dictate.
