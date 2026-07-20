# Rule: a boolean is named `is{Thing}` — never a bare adjective or participle

Every boolean carries a **predicate prefix**, so reading the name tells you it's a
yes/no and not a value. `is` is the default; `has` / `should` / `can` are used
where they read better. A bare adjective (`wide`, `active`), a participle
(`liked`, `focused`, `mounted`), or a noun (`error` holding a boolean) is never a
boolean name.

```ts
// Yes
const isWide = width >= BreakpointEnum.md;
const isFocused = useIsFocused();
const [isMounted, setIsMounted] = useState(false);
const hasNextPage = !!data?.nextCursor;
const canSubmit = isValid && !isSubmitting;
const shouldSeed = isServerRender() && !!initialData;

// No
const wide = width >= BreakpointEnum.md;
const focused = useIsFocused();
const [mounted, setMounted] = useState(false);
const nextPage = !!data?.nextCursor;   // reads like it holds the page
```

## Which prefix

| Prefix | Meaning | Example |
| --- | --- | --- |
| `is` | a state / a kind — **the default** | `isLoading`, `isWide`, `isLiked`, `isServerRender` |
| `has` | possession or presence of something | `hasNextPage`, `hasError`, `hasTags` |
| `should` | a decision about what to do next | `shouldRefetch`, `shouldSeed` |
| `can` | a capability / permission | `canSubmit`, `canEdit` |

Reach for `is` unless one of the other three is plainly more accurate. Don't
invent further prefixes (`does`, `was`, `will`).

## It applies everywhere a boolean is named

- **Locals and `const`s** — `const isActive = …`.
- **`useState` pairs** — `const [isOpen, setIsOpen] = useState(false)`; the setter
  keeps the prefix (`setIsOpen`, not `setOpen`).
- **Component props** — an `is`-prefixed prop on the exported
  `{Component}Props` ([types-not-interface](types-not-interface.md)):
  `isInvalid?: boolean`, `isWide?: boolean`.
- **Object / type fields** the app declares itself, and **hook return values**
  (`{ isPending, isLiked }`).
- **Functions returning a boolean** — a predicate is named like the boolean it
  produces: `isServerRender()`, `hasRole(user, "admin")`.

## The exceptions — names this codebase does not own

Three sources of boolean names are **not** ours to rename; leave them exactly as
the upstream API spells them:

1. **React Native / DOM props passed through by spread.** `disabled`, `loading`,
   `multiline`, `secureTextEntry`, `editable`, `autoFocus` — a component that
   forwards `{...props}` to an `RNTextInput` / `Pressable` must keep the prop
   names the native component expects. Renaming them would force a manual
   mapping in every wrapper for no gain.
2. **Third-party library surfaces.** React Query's `isLoading` / `isFetching`
   already comply; react-hook-form's `isSubmitting` / `isValid` too. Where one
   doesn't, keep it — don't wrap a library just to rename a field.
3. **Generated API code.** `src/lib/api/generated/` and the backend's own model
   fields (`verified` on `Artwork`, `likedByMe`) come from the OpenAPI spec and
   are **never** edited by hand
   ([api-types-openapi](api-types-openapi.md)). When you copy such a field into a
   local, *that* local takes the prefix: `const isLiked = artwork.likedByMe`.

The rule governs the names **this repo chooses**. Everything crossing a boundary
we don't control keeps the other side's spelling.
