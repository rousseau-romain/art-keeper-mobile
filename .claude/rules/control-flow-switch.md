# Rule: branch with `switch`, not nested ternaries

When a value is chosen by branching on a discriminant (a `variant` / `state` /
`status` union) with **more than two** outcomes, use a `switch` — never a nested
or chained ternary pyramid.

```ts
// Yes — switch on the discriminant, return per case.
switch (variant) {
  case "primary":
    return { bg: liked ? t.accentSoft : t.accent, fg: liked ? t.accent : t.accentInk };
  case "ghost":
    return { bg: "transparent", fg: liked ? t.accent : t.ink };
  default:
    return { bg: t.surface2, fg: liked ? t.accent : t.ink };
}

// No — nested ternaries on the same discriminant.
const bg =
  variant === "primary"
    ? liked ? t.accentSoft : t.accent
    : variant === "ghost"
      ? "transparent"
      : t.surface2;
```

- A **single-level** ternary is fine (`liked ? a : b`) — the rule targets
  *nesting* / chaining, not all ternaries.
- Always include a `default` case so the union stays exhaustive.
- Reference: `src/shared/ui/button/hooks/useButtonColors.ts`.
