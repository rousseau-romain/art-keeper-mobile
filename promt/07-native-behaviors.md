## 7. Native behaviors & polish
- **Permissions:** request camera, photo library, and location with clear rationale strings (configure in `app.json`).
- **Maps:** real pins from `coords`; cluster if needed; animate to region on filter/selection. The detail and artist maps should center and zoom on their subject.
- **Gestures:** the Browse bottom sheet should be a real draggable sheet (`@gorhom/bottom-sheet` or Reanimated). Map pin → preview card → push detail.
- **Haptics** on like, submit success, and accept/reject decisions (`expo-haptics`).
- **Safe areas**, keyboard avoidance on forms, and pull-to-refresh on grids.
- **Entrance transitions** between screens (the prototype animates screen changes) — keep them quick and subtle; respect reduced-motion.
- **Persist** chosen skin/theme/accent and auth/session across launches.
- Accessibility: hit targets ≥ 44px, label icons, support dynamic type within reason.
