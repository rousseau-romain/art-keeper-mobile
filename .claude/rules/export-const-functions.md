# Rule: exports are `const` arrow functions, never `export function`

Every named export that is a function — components, hooks, request functions,
helpers — is declared as a `const` arrow:

```ts
// Yes
export const Button = (props: ButtonProps) => { ... };
export const useTheme = (): ThemeApi => API;
export const getToken = (): string | null => mirror;
export const apiRequest = async <T = unknown>(path: string): Promise<T> => { ... };

// No
export function Button(props: ButtonProps) { ... }
export async function apiRequest<T>(path: string): Promise<T> { ... }
```

- `async` goes after the `=`: `export const f = async () => { ... }`.
- Generic arrows in `.ts` are fine (`<T = unknown>(...)`); avoid bare `<T>` in
  `.tsx` (the `<T,>` JSX ambiguity) — these live in `.ts` files anyway.
- Because arrows aren't hoisted, define a const before the code that uses it
  within a module. (Module-level exports used across files are unaffected.)

## Exceptions

- **Expo Router route screens** keep `export default function Screen()` — an
  arrow can't be the inline default export, and the named function gives the
  route a stable display name. Applies to the `app/` screen/layout default
  exports only.
- This rule is about **exports**. Unexported local `function` helpers may stay
  as declarations (e.g. when hoisting is relied on), though `const` is preferred.
