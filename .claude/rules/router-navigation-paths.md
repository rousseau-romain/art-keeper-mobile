# Rule: navigate with sitemap URLs — never include route-group parentheses

Expo Router **strips route groups** (`(tabs)`, `(auth)`, …) from the URL: they
organize files and layouts, they are **not** path segments. So a navigation
target must use the path the Expo sitemap generates — the group parentheses never
appear in it.

```ts
// Yes — the actual sitemap URL
router.replace("/browse");
<Redirect href={authed ? "/browse" : "/login"} />;

// No — route-group parentheses in a navigation path
router.replace("/(tabs)/browse");
<Redirect href="/(auth)/login" />;
```

This applies to **every navigation target**: `router.push` / `replace` /
`navigate`, `<Redirect href>`, and `<Link href>`. Map the file location to its
sitemap URL by dropping each `(group)` segment:

| File | Sitemap URL |
| --- | --- |
| `src/app/(tabs)/browse.tsx` | `/browse` |
| `src/app/(auth)/login.tsx` | `/login` |

When unsure of a path, generate the sitemap with the Expo MCP tool
(`expo_router_sitemap`, needs the dev server — see
[expo-workflow](expo-workflow.md)) and copy the URL from there.

## The one exception: `Stack.Screen name`

`<Stack.Screen name="(auth)/login" />` is a route **name** (the file-segment
identifier relative to the layout), **not** a URL — it keeps the group prefix.
The rule is navigation-paths-only; screen/route names are unaffected.

## Sheet / modal routes need a stack anchor — `unstable_settings`

When a stack hosts a **sheet or modal** route (`presentation: "formSheet"` /
`"modal"`, e.g. the `filters` formsheet in
`src/app/(tabs)/artworks/_layout.tsx`), a direct load of that URL — a web
refresh, or a cold deep link — rebuilds the stack **from the URL alone**. That
leaves only the sheet on the stack with nothing rendered behind it: the sheet
floats over a blank background, and dismissing it has nowhere to go.

Fix it by declaring the stack's anchor in the layout, so Expo Router always seeds
that screen underneath before pushing the deep-linked one:

```ts
// src/app/(tabs)/artworks/_layout.tsx
export const unstable_settings = {
  initialRouteName: "index", // must match a route filename in this layout exactly
};

export default function ArtworksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="filters" options={{ ...formsheetOptions, headerShown: false }} />
    </Stack>
  );
}
```

- **`initialRouteName` is per-Stack** — there is no global switch. The convention:
  **any stack layout that hosts a sheet/modal route declares
  `unstable_settings = { initialRouteName: "index" }`.**
- The value must match a **route filename** in that layout exactly (`"index"`),
  not a sitemap URL — this is a route name, like the `Stack.Screen name` exception
  above.
- A full-screen-only stack doesn't get the blank-background bug, but anchoring
  `index` is still good hygiene (a sane back target on a deep-linked nested
  route — e.g. the create-artwork wizard). **Skip it** where the `index` route is
  a `<Redirect>` (rendering it behind a deep link would fire the redirect) and on
  the `Tabs` navigator (not a stack).
