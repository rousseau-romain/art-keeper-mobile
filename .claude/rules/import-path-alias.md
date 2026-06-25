# Rule: import with the `@/` alias, never a parent-relative `../` path

Cross-module imports use the `@/` path alias (mapped to `src/*` in
`tsconfig.json`), **never** a parent-relative `../` path. Reach up the tree with
`@/`, not `../`.

```ts
// Yes — absolute alias, stable regardless of where the file moves
import { Text } from "@/shared/ui/text/Text";
import { getToken } from "@/lib/auth/token-store";
import { FONT_MAP } from "@/theme/fonts.constant";

// No — parent-relative climb
import { Text } from "../text/Text";
import { getToken } from "../auth/token-store";
import { FONT_MAP } from "../fonts.constant";
```

- **Same-folder imports stay relative** with `./` — only the parent climb (`../`,
  `../../`, …) is banned. `import { Icon } from "./Icon"` is fine.
- **No barrel files.** Import each symbol straight from the module that defines
  it via its deep `@/` path (`@/shared/ui/text/Text`), never an aggregating
  re-export `index.ts` (`@/shared/ui`) — barrels are not used in this codebase
  (see [component-module-structure](component-module-structure.md)).

## Enforced by Biome

`noRestrictedImports` in `biome.json` denies any import matching `../**` with the
message pointing to the `@/` alias, so a parent-relative import is a lint error,
not just a convention.
