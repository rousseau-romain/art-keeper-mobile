# Rule: one component per `.tsx` file — never declare a second component beside it

A `.tsx` module defines **exactly one** React component. Never declare a second
component — a card, a row, a dot, a wrapper, a "Centered" helper — in the same
file as the component it helps. Each one gets its **own folder + file** per
[component-module-structure](component-module-structure.md).

```tsx
// No — three components in one file
export const IndexScreen = () => { ... };
function ArtworkCard({ ... }) { ... }   // ← second component
function StatusDot({ ... }) { ... }     // ← third component
function Centered({ ... }) { ... }      // ← fourth component

// Yes — IndexScreen.tsx holds only IndexScreen; the helpers move out:
//   src/pages/app/artwork/components/artwork-card/ArtworkCard.tsx  (page-local)
//   src/shared/ui/status-dot/StatusDot.tsx                        (feature-agnostic)
//   src/shared/ui/centered/Centered.tsx                           (feature-agnostic)
import { ArtworkCard } from "@/pages/app/artwork/components/artwork-card/ArtworkCard";
import { Centered } from "@/shared/ui/centered/Centered";
import { StatusDot } from "@/shared/ui/status-dot/StatusDot";
```

## Where the extracted component goes

When you pull a second component out, place it by reach (the same split as
[component-module-structure](component-module-structure.md) /
[app-route-page-screens](app-route-page-screens.md)):

- **Built from one feature's data/types** (an artwork card) → page-local,
  `src/pages/app/<domain>/components/<kebab>/<Component>.tsx`.
- **Genuinely feature-agnostic** (a status dot, a centered wrapper) → promote to
  `src/shared/ui/<kebab>/<Component>.tsx`; callers import it straight from that
  module's deep `@/` path (there is no barrel to register it in).

Each extracted file is a normal component module: its own `type {Component}Props`
([types-not-interface](types-not-interface.md)), `const` arrow export
([export-const-functions](export-const-functions.md)), and its **own**
module-scope `StyleSheet` holding only the styles it uses — don't leave it
reaching into the original file's `styles`.

## Screens are not an exception

A screen file (`*Screen.tsx`) is **one component too** — the screen. Its inline
cards / dots / list-item / empty-state wrappers are second components and must be
extracted. `src/pages/app/artwork/screens/IndexScreen.tsx` is the canonical
before/after: it once declared `ArtworkCard` + `StatusDot` + `Centered` inline;
those moved to their own folders, leaving the file with only `IndexScreen`.

The one thing that stays one-per-file by definition: an Expo Router route file's
`export default function Screen()` — the default-export exception in
[export-const-functions](export-const-functions.md). That default *is* the file's
single component; it renders a page screen and declares nothing beside itself.
