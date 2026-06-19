# Rule: iOS dev-client launch error 115 is a transient race, not a real failure

**Applies to:** local iOS dev (`bun ios` = `expo run:ios`) on the Simulator.

**Symptom:** the build/install succeeds, then the run fails at the launch step:

```
xcrun simctl openurl <udid> com.artkeeper.app://expo-development-client/?url=...
  exited with non-zero code: 115
LSApplicationWorkspaceErrorDomain error 115
error: script "ios" exited with code 1
```

**Cause:** a LaunchServices race — Expo fires the dev-client deep link before iOS
has registered the *freshly installed* app's URL scheme. It is **not** a build,
ATS/networking, or URL-scheme config problem (the scheme is registered fine), and
it's more common on newer simulators.

**Recovery** (the app is already built + installed):
- Just re-run `bun ios` — now that the app is registered it launches cleanly; or
- `xcrun simctl launch <udid> com.artkeeper.app` once, then re-open the deep link; or
- `bun start` and press `i` (Metro is independent of the launch flake).
