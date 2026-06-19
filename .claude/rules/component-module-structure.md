# Rule: every component lives in its own folder

A component is **always** a folder — never a bare file directly under
`src/shared/ui/` or `src/components/`. The folder is named after the component in
lowercase/kebab-case; the component file inside keeps its PascalCase name.

```
src/shared/ui/
  index.ts                      # barrel — re-exports every component
  button/
    Button.tsx                  # the component
    hooks/
      useGetButtonsColors.ts    # component-specific hooks colocate here
  tag/
    Tag.tsx
  check/
    Check.tsx
  toast/
    Toast.tsx
```

Rules:
- **One folder per component**, even a one-file component (`check/Check.tsx`, not
  `Check.tsx`). Folder = `lowercase`/`kebab-case`, file = `PascalCase.tsx`.
- **Colocate component-specific code** in that folder: hooks in a `hooks/`
  subfolder (`useX.ts`), plus any component-only types/constants/helpers. Hooks
  used by a single component do **not** go in a global hooks dir.
- **Leaf hooks own their shared types.** A colocated hook that defines a type the
  component also needs (e.g. `Variant`) exports it, and the component imports it
  from the hook — keeps the dependency one-directional (hook never imports the
  component). See `button/hooks/useGetButtonsColors.ts`.
- **The folder barrel** is the single `src/shared/ui/index.ts`, which re-exports
  from `./{folder}/{Component}`. External code imports from `@/shared/ui`, never
  a deep path.
- **Placement** (`src/shared/ui/` for reusable primitives vs `src/components/`
  for feature components) and the rest of the component conventions live in the
  `create-component` skill.
