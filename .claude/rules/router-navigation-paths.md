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
