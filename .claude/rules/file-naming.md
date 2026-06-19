# Rule: file naming by content kind — enums / types / constants

A module whose content is *purely* one of these three kinds carries a suffix that
names that kind, so the file's role is obvious from the import path:

| Content | File name | Example |
| --- | --- | --- |
| Enums (incl. `as const` "enum" objects + their derived key types) | `{name}.enums.ts` | `scale.enums.ts` (`SPACING`, `RADIUS`, `FONT_SIZE`) |
| Types / interfaces only | `{name}.types.ts` | `theme.types.ts` (`Theme`, `ColorTokens`, …) |
| Constant values only | `{name}.constant.ts` | `theme.constant.ts` (`THEME`), `fonts.constant.ts` (`FONT_MAP`, `FONTS`) |

`{name}` is the domain/module the file belongs to (`theme`, `scale`, `fonts`) —
never the kind itself (no `types.types.ts`).

## Rules

- **One kind per file.** Don't mix a hook (or component, or request fn) into a
  `.constant.ts` / `.types.ts` / `.enums.ts` file. If a module grows a hook,
  split it out (e.g. `fonts.constant.ts` holds the data; `hooks/useAppFonts.ts`
  holds the loader). Hooks live in a `hooks/` folder, not these files.
- **Derived types stay with their source.** A type that only exists to describe
  an enum or constant (`keyof typeof`, `typeof en`) lives in that `.enums.ts` /
  `.constant.ts` file, not a separate `.types.ts` — e.g. `Resources = typeof en`
  in `locales/en.constant.ts`.
- **Barrel exports** (`index.ts`) and intra-folder relative imports use the full
  suffixed name; external code should import from the folder barrel (`@/theme`)
  so renames stay internal.

## Exempt

- **`.d.ts`** ambient declaration files keep their name (`i18next.d.ts`) —
  they're not regular modules. Likewise, generated files keep the generator's
  own naming (the `*.gen.ts` files in `src/lib/api/generated/`).
- A file that legitimately holds **mixed** runtime logic (a component module, a
  provider, an API domain module) keeps a plain descriptive name; these suffixes
  are only for files that are *exclusively* enums, types, or constants.
