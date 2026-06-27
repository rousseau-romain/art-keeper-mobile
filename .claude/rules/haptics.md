# Rule: haptic feedback goes through the `useHaptics` hook

All tactile feedback is fired through **`useHaptics`**
(`src/shared/hooks/useHaptics.ts`) — never import or call `expo-haptics`
directly from a component, screen, or hook.

`useHaptics()` returns a **stable** `trigger(name: HapticName)` callback (safe as
a `useCallback`/`useEffect` dependency). It maps a small set of named effects to
their native trigger:

| `HapticName` | Native effect | Use for |
| --- | --- | --- |
| `light` / `medium` / `heavy` | impact | a discrete tap — advancing a wizard step, pull-to-refresh, a toggle off |
| `success` / `warning` / `error` | notification | the **outcome** of a committed action (artwork created → `success`) |
| `selection` | selection tick | moving through discrete options |

```tsx
import { useHaptics } from "@/shared/hooks/useHaptics";

const haptic = useHaptics();
// …
haptic(liked ? "success" : "light");
```

Rules:
- **Never import `expo-haptics`** outside `useHaptics.ts`. Need a new effect? Add
  a named entry to the `effects` map there — don't call the SDK at a call site.
- **Pick the name by meaning, not strength** — a positive committed action is
  `success`, advancing a step is `light`. The `effects` keys are derived into
  `HapticName` (`keyof typeof effects`), so the type stays in sync with the map.
- **Fire on the real outcome, not the press**, when an action can fail: a submit
  fires `success` only after the mutation resolves
  (`src/pages/app/artwork/hooks/useArtworkSubmit.ts`), not on button press.
- **Conditional / opt-out**: gate the call (`if (kind) trigger(kind)`) and pass
  the name — or `null` to fire nothing — down as a prop. See `WizardFooter`'s
  `haptic?: HapticName | null` (the submit step passes `null` so it doesn't
  double-buzz the `success` fired on creation).
