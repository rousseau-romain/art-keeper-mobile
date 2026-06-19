## 6. Shared components to build
Port these primitives as themed RN components, reading tokens from the active theme:
- **Btn** — variants: primary (accent fill), ghost (outline), default; sizes sm/normal; optional leading icon; `block` (full-width). A `liked` state.
- **Tag** — chip; states active / muted / solid. Used for filter tags and metadata.
- **Check** — small accent verified/check badge.
- **Photo** — image-or-placeholder. Real `expo-image` when a source exists; otherwise a subtly striped placeholder showing a mono label. Supports aspect ratio or fixed height.
- **Avatar** — colored rounded block with the artist's initials, bg = artist `color`.
- **Credit** — "@handle" in accent + verified check; tappable.
- **MapView wrapper** — wraps `react-native-maps` with pins (normal / big / dot / active states), an optional caption chip, and tap handlers. Replaces the prototype's fake `CityMap`.
- **Stepper** — numbered dots + connecting segments with done/active states (submit wizard).
- **PieceCard** — grid card: cover photo (piece ratio), title (display), artist credit + like count (mono). Tappable.
- **Toast** — transient bottom message, auto-dismiss ~2.2s.
- **Masonry grid** — 2-column staggered layout honoring each piece's aspect ratio.
