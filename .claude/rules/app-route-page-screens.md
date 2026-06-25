# Rule: `src/app/` files are thin routes; screens live in `src/pages/`

Files under `src/app/` are the **Expo Router boundary only** — they hold no
component logic of their own. The real screen (state, data hooks, layout,
colocated child components) lives in `src/pages/app/<domain>/screens/`, and the
route file just wires the router to it.

## The split

- **`src/app/**`** — a route file (`index.tsx`, `[id]/index.tsx`, `new.tsx`,
  `_layout.tsx`, …) does exactly three things and **nothing else**:
  1. declares the navigator / screen config (`<Stack>`, `<Stack.Screen>`,
     `<Tabs.Screen options={…}>`),
  2. reads route params with `useLocalSearchParams`,
  3. renders the matching page screen, **passing params in as props**.

  No JSX tree, no `StyleSheet`, no data hooks, no child components in an `app/`
  file beyond the navigator config above.

- **`src/pages/app/<domain>/screens/<X>Screen.tsx`** — the actual screen
  component. It receives param values as **props**; it does **not** call
  `useLocalSearchParams` itself, so the screen stays router-agnostic (testable,
  movable). Page-local child components and hooks live in **sibling**
  `components/` and `hooks/` subfolders of the domain folder (see
  [The domain folder layout](#the-domain-folder-layout) below), each component its
  own folder exactly as [component-module-structure](component-module-structure.md)
  describes — the `src/shared/ui` (cross-feature) vs page-local split is unchanged.

- **Exports**: route files keep `export default function Screen()` — the
  default-export exception in [export-const-functions](export-const-functions.md).
  Page screens are normal `const` arrow exports
  (`export const IndexScreen = (…) => {…}`).

## The domain folder layout

A domain folder (`src/pages/app/<domain>/`) has a **fixed bucket layout** —
screens, page-local components, page-local hooks, and (when the domain has a
form) its form each get their own subfolder. Nothing lives loose at the domain
root:

```
src/pages/app/artwork/
  screens/                       # the routable screens (CRUD set below)
    IndexScreen.tsx
    DetailScreen.tsx
    EditScreen.tsx
    NewScreen.tsx
  components/                    # page-local components (NOT routable)
    artwork-card/
      ArtworkCard.tsx
      hooks/                     # component-specific hooks colocate here
        useArtworkCardX.ts
    artwork-like-button/
      ArtworkLikeButton.tsx
  form/                          # the domain's react-hook-form component
    ArtworkForm.tsx
  hooks/                         # domain hooks shared across >1 screen/component
    useArtworkFilters.ts
```

- **`screens/`** — the only routable bucket. A `src/app/**` route file resolves
  to a `*Screen.tsx` here and nowhere else.
- **`components/`** — page-local components: built from `<domain>`'s data/types,
  not reusable across features (an artwork-specific component, not a generic
  primitive). Each is its **own kebab-case folder** holding a PascalCase
  `*.tsx` and any component-specific `hooks/`, exactly like `src/shared/ui/*`
  — the only difference is location (domain-local vs cross-feature). A component
  that helps **one** screen still goes here, not loose beside the screen.
- **`form/`** — the domain's `<Name>Form` component (the `<Controller>` fields,
  reading the form via `useFormContext`). Present only when the domain has a
  form; the screen owns `useForm` + `<FormProvider>` + submit. See
  [forms-react-hook-form](forms-react-hook-form.md).
- **`hooks/`** — domain hooks used by more than one screen/component. A hook used
  by a single component colocates in **that component's** `hooks/` folder instead.
  Screen-flow hooks (a form's submit, a screen's async actions like
  `useGoogleSignIn`) also live here, even when one screen uses them — see
  [forms-react-hook-form](forms-react-hook-form.md).

**`components/` is not `screens/`.** A file here is never a page and never gets a
`src/app/**` route — "screen / page" means a `*Screen.tsx` under `screens/` only.
Promote a component to `src/shared/ui/` only once it's genuinely
feature-agnostic; until then it stays in the domain's `components/`.

## The CRUD screen set

Every domain (resource) gets the standard four screens — **List / One / Update /
Create** — named and routed like this:

| Intent | Page screen (`src/pages/app/<domain>/screens/`) | Route file (`src/app/<domain>/`) | Sitemap URL |
| --- | --- | --- | --- |
| List   | `IndexScreen.tsx`  | `index.tsx`      | `/<domain>` |
| One    | `DetailScreen.tsx` | `[id]/index.tsx` | `/<domain>/:id` |
| Update | `EditScreen.tsx`   | `[id]/edit.tsx`  | `/<domain>/:id/edit` |
| Create | `NewScreen.tsx`    | `new.tsx`        | `/<domain>/new` |

- The static `new.tsx` wins over `[id]` — Expo Router prioritizes static
  segments over dynamic ones, so `/<domain>/new` resolves to `NewScreen`, not a
  detail with `id === "new"`.
- The domain folder's `_layout.tsx` (`<Stack>` for the nested screens) is itself
  a route file with **no component body** — just navigator config.
- The `app/` route folder is **plural** (`artworks/`, matching the URL); the
  `pages/` domain folder is **singular** (`artwork/`).
- The domain folder lives wherever the route belongs — directly under
  `src/app/<domain>/`, or inside a route group like `src/app/(tabs)/<domain>/`
  when it's part of the tab stack. The group prefix never changes the page
  screen's location (`src/pages/app/<domain>/`) or the sitemap URL (route groups
  are stripped — see [router-navigation-paths](router-navigation-paths.md)).

## Worked example — artwork

```tsx
// src/app/(tabs)/artworks/[id]/index.tsx — route: params in, screen out
import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetailScreen id={id} />;
}
```

```tsx
// src/pages/app/artwork/screens/DetailScreen.tsx — the screen, router-agnostic
import { useArtwork } from "@/lib/api/artworks";

type DetailScreenProps = { id: string };

export const DetailScreen = ({ id }: DetailScreenProps) => {
  const { data, isLoading } = useArtwork(id);
  // …render loading / error / empty / data states…
};
```

The current `(tabs)/browse.tsx` is the **before** picture: it holds the artwork
list plus its `ArtworkCard` / `StatusDot` helpers inline. Under this rule that
body moves to `src/pages/app/artwork/screens/IndexScreen.tsx`, with the
`ArtworkCard` / `StatusDot` helpers extracted into their own folders under
`src/pages/app/artwork/components/` (e.g. `components/artwork-card/ArtworkCard.tsx`),
leaving `src/app/(tabs)/artworks/index.tsx` a thin delegate. *That migration is
the canonical illustration of the pattern — not done yet.*

## Consistency with other rules

- [router-navigation-paths](router-navigation-paths.md) — navigation targets
  still use group-stripped URLs (`router.push("/artworks/" + id)`, **not**
  `/(tabs)/artworks/[id]`); the `<Stack.Screen name>` exception (file-segment
  name keeps its groups) is unchanged.
- [import-path-alias](import-path-alias.md) / [file-naming](file-naming.md) —
  import screens via the `@/pages/...` alias (never `../`); screen files are
  PascalCase `*Screen.tsx`.
- [i18n-translation](i18n-translation.md), [styling-stylesheet](styling-stylesheet.md),
  [data-fetching](data-fetching.md), [design-scale](design-scale.md) — all apply
  **inside the page screen** exactly as before; nothing about them changes, they
  just no longer live in the `app/` file.

## Reference

`src/lib/api/artworks.ts` already exposes the data hooks the artwork screens
need — `useArtworks()` (infinite list → `IndexScreen`), `useArtwork(id)`
(`DetailScreen`), and `useToggleArtworkLike()`.
