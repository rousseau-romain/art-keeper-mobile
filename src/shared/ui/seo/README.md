# SEO semantic components (`src/shared/ui/seo/`)

Wrapper components that render **real HTML elements** on web — `<main>`,
`<article>`, `<h1>`…`<h6>`, `<nav>`, `<figure>`, … — instead of the generic
`<div>`/`<span>` a bare `View`/`Text` produces. They give the SSR'd public pages
(see `.claude/rules/seo/generate-metadata.md`,
`.claude/rules/web-ssr-hydration.md`) a **crawlable document outline** and proper
accessibility landmarks. On native the same components pose the ARIA role for
VoiceOver / TalkBack and render exactly like their base primitive.

Reach for these instead of a raw `View`/`Text` **whenever the element carries
document meaning** on a web-facing screen — the page's main region, an artwork as
a standalone article, a heading, an image figure, a list of tags. Decorative /
layout-only containers stay a plain `View`.

## How it works — react-native-web maps `role` → a DOM element

The whole family is a thin pass of a **`role`** (or `accessibilityRole`) prop to
the base primitive. react-native-web (v0.21.2) resolves it in two steps:

- `AccessibilityUtil/propsToAriaRole` turns a native `accessibilityRole` into the
  ARIA role (`header` → `heading`), and lets an ARIA `role` through unchanged.
- `AccessibilityUtil/propsToAccessibilityComponent` maps that role to the DOM
  element — `main`→`<main>`, `article`→`<article>`, `region`→`<section>`,
  `navigation`→`<nav>`, `complementary`→`<aside>`, `contentinfo`→`<footer>`,
  `banner`→`<header>`, `figure`→`<figure>`, `list`→`<ul>`, `listitem`→`<li>`,
  and `heading` + `aria-level` → `<h{level}>`.

Native ignores the DOM mapping and keeps the role as accessibility metadata. The
`role` value is a **static prop**, identical on server and client, so these
components never introduce a hydration mismatch (see
`.claude/rules/web-ssr-hydration.md`).

## Headings — `Heading` + `H1`…`H6` (derived from `Text`)

`heading/Heading.tsx` composes `@/shared/ui/text/Text`, adding
`accessibilityRole="header"` + `aria-level={level}`. The `level` prop (1–6)
drives the default size from the `display` font scale; `size` / `font` / `color`
stay overridable through `TextProps`.

| Component | `level` | default `size` (px) | web element |
| --- | --- | --- | --- |
| `H1` | 1 | `xxl` (28) | `<h1>` |
| `H2` | 2 | `xl` (24) | `<h2>` |
| `H3` | 3 | `lg` (18) | `<h3>` |
| `H4` | 4 | `base` (15) | `<h4>` |
| `H5` | 5 | `md` (13) | `<h5>` |
| `H6` | 6 | `sm` (12) | `<h6>` |

`H1`…`H6` (`h{n}/H{n}.tsx`) are thin aliases —
`export const H2 = (props) => <Heading level={2} {...props} />`. Prefer them at
call sites; use `<Heading level={n}>` when the level is dynamic. One `<h1>` per
page (the page title); nest the rest in order without skipping levels.

```tsx
import { H1 } from "@/shared/ui/seo/h1/H1";

<H1>{artwork.title}</H1>
<H2 color="muted">{tr("artwork.detail.related")}</H2>
```

## Landmarks & containers (derived from `View`)

Each is a neutral `View` wrapper (`type XProps = ViewProps`, no default style,
`role` set before `{...rest}` so it stays overridable) on the `Centered` pattern.

| Component | folder | `role` | web element | use for |
| --- | --- | --- | --- | --- |
| `Main` | `main/` | `main` | `<main>` | the page's primary content (one per page) |
| `Banner` | `banner/` | `banner` | `<header>` | the page header region |
| `Nav` | `nav/` | `navigation` | `<nav>` | a navigation group |
| `Article` | `article/` | `article` | `<article>` | self-contained content (an artwork) |
| `Section` | `section/` | `region` | `<section>` | a thematic grouping (add `aria-label` for a named landmark) |
| `Aside` | `aside/` | `complementary` | `<aside>` | complementary / sidebar content |
| `Footer` | `footer/` | `contentinfo` | `<footer>` | the page footer region |
| `Figure` | `figure/` | `figure` | `<figure>` | a self-contained illustration (artwork image) |
| `List` | `list/` | `list` | `<ul>` | a semantic list (tags, metadata) |
| `ListItem` | `list-item/` | `listitem` | `<li>` | an item inside a `List` |

`List`/`ListItem` are for **short, non-virtualized** lists (a row of tags). Keep
`FlatList` for long, virtualized collections — it can't render `<ul>`/`<li>`.

### Worked example — an artwork detail page

```tsx
import { Main } from "@/shared/ui/seo/main/Main";
import { Article } from "@/shared/ui/seo/article/Article";
import { Figure } from "@/shared/ui/seo/figure/Figure";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { List } from "@/shared/ui/seo/list/List";
import { ListItem } from "@/shared/ui/seo/list-item/ListItem";

<Main style={styles.screen}>
  <Article>
    <Figure>
      <Image source={{ uri: artwork.imageUrl }} /* the LCP hero */ />
    </Figure>
    <H1>{artwork.title}</H1>
    {/* description Text… */}
    <List>
      {artwork.tags.map((tag) => (
        <ListItem key={tag}>{/* Tag… */}</ListItem>
      ))}
    </List>
  </Article>
</Main>
```

This renders as `<main><article><figure><img>…<h1>…<ul><li>…` in the SSR HTML —
exactly the outline a crawler expects — while staying plain `View`/`Text`/`Image`
on native.

## Conventions these follow

- Own folder + file per component, no barrel, deep `@/` imports (see
  `.claude/rules/component-module-structure.md`,
  `.claude/rules/import-path-alias.md`).
- `type {Component}Props` exported (`.claude/rules/types-not-interface.md`),
  `const` arrow export (`.claude/rules/export-const-functions.md`).
- **No default style** — they're semantic-only; pass layout via `style`. Headings
  carry only the size/font derived from `level` (still overridable). Sizes come
  from `FontSizeEnum` (`.claude/rules/design-scale.md`); `Text` handles theme
  colors (`.claude/rules/styling-stylesheet.md`).
- **No i18n inside** — copy is passed as `children`, already translated
  (`.claude/rules/i18n-translation.md`).

## Deliberately excluded — `<p>` / `<strong>` / `<em>`

There is **no** `Paragraph` / `Strong` / `Em`. Their roles (`paragraph` /
`strong` / `emphasis`) are **not in React Native's `Role` type**, and — more to
the point — they'd have **no native rendering**: the loaded fonts are
fixed-weight (`HankenGrotesk_400Regular`, no bold/italic face — see
`@/theme/fonts.constant`), so `<strong>`/`<em>` couldn't render heavier/italic on
native. Content text stays a plain `<Text>` (SEO-neutral — the words are read the
same inside a `<div>`). Add one only with a deliberate cast **and** a matching
font face.

## Adding a new semantic component

1. Pick a `role` that is **both** in RN's `Role` type
   (`node_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts`)
   **and** a key in RNW's `roleComponents`
   (`node_modules/react-native-web/dist/modules/AccessibilityUtil/propsToAccessibilityComponent.js`)
   — otherwise it won't typecheck or won't map to an element.
2. Derive from `View` (container) or `Text` (text-level), pass the `role` before
   `{...rest}`, no default style. Put it in its own `<kebab>/` folder here.
3. Verify against the **prod export**, not the dev server (see
   `.claude/rules/web-prod-export.md`): `curl` a route that renders it and confirm
   the real tag is in the HTML source, e.g. `document.querySelector("main article
   h1")` resolves and the node's `tagName` is the expected element (not `DIV`).
   On native, check the accessibility inspector shows the role.

## Exactly one `<h1>` per document — the navigator does not provide it

The page's `<H1>` must come from **this** family, rendered by the page screen.
Two things used to inject extra ones, and both are now handled — don't reintroduce
either:

- **The navigator header is not a heading.** expo-router's `HeaderTitle` hardcodes
  `role="heading" aria-level="1"`, so every `Stack.Screen`'s `options.title`
  rendered a real `<h1>` on web. `@/shared/ui/stack/Stack` now defaults
  `headerTitle` to `StackHeaderTitle`, which drops those attributes on web (native
  keeps the heading role). Any navigator that bypasses this `Stack` wrapper brings
  the stray `<h1>` back.
- **A seeded stack anchor renders its screen into someone else's document.** A
  deep link to a nested route renders the stack's `initialRouteName` screen behind
  it (see `.claude/rules/ssr-loader-anchor.md`), so the anchor's `<H1>` lands in
  that page's outline ahead of the real one. **A loader-bearing anchor screen that
  renders an `<H1>` needs a `useIsFocused()` gate** — URL-derived, so it's
  hydration-safe.

  Gate the **role, not the text**. `IndexScreen` renders its title as `<H1>` when
  focused and as a plain `<Text font="display" size="xxl">` otherwise (`Heading` is
  just `Text` with those defaults, so the two render identically). Gating the whole
  element would blank the listing's visible title from under the `filters`
  formsheet, which overlays the listing rather than replacing it.

Build the title from the same helper as the route's `<title>` (`browseTitle`), or
the outline and the tab disagree about what the page is.

**A heading may be scoped to where it belongs visually, as long as a crawler still
gets it.** `IndexScreen`'s title renders on **web, grid view only** — native
already shows it in the navigator header, and the map is full-bleed. That's SEO-safe
because a crawler sends no `browse-view` cookie and therefore always lands on the
`grid` default (`browse-view-store.web.ts`). Check that reasoning before scoping a
heading behind any preference: it holds only while the crawler's cookie-less path
is the one that renders the heading.

Verify with `curl <route> | grep -o '<h1.*</h1>'` against the **prod export**: one
match per page, matching the `<title>`.

## Where they fit in the SEO stack

These are the **document body**; the `<head>` is
`.claude/rules/seo/generate-metadata.md` / `.claude/rules/seo/open-graph.md`, and
the per-page tab title is `useDocumentTitle`. All three describe the same page and
must agree.
