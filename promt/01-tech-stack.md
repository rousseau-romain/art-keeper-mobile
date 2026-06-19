## 1. Tech stack & project setup

- **Expo SDK (latest stable)** with the **managed workflow**, TypeScript.
- **expo-router** (file-based routing) for navigation. Use a tab layout for the main app and a stack for nested screens.
- **react-native-maps** (Google/Apple maps) for the real map — replaces the prototype's stylized `CityMap` SVG.
- **expo-camera** + **expo-image-picker** for the submit flow's photo step.
- **expo-location** for "use my location" and auto-pinning.
- **expo-image** for performant image rendering.
- **expo-font** + `@expo-google-fonts/*` for the typefaces (see design system).
- **Data fetching:** `@tanstack/react-query` over a thin typed `api` client (`fetch` wrapper). The client injects the auth bearer token, sets `Accept-Language`, builds query strings, and normalizes the `{ data, nextCursor }` pagination envelope. Centralize all endpoints in `lib/api/` — one module per tag (artworks, artists, reports, places, auth).
- **Auth:** the backend uses **Better Auth**. Use the bearer-token flow (it sidesteps cookies on native): on sign-in/sign-up, read the **`set-auth-token`** response header and store it; send it on every request as `Authorization: Bearer <token>`. Hydrate the session on launch via `GET /auth/get-session`.
- Persist theme settings and the auth token with **expo-secure-store** (token) / **AsyncStorage** (prefs).

Set up a clean folder structure, e.g. `app/` (routes), `components/`, `theme/`, `lib/api/` (endpoint modules + react-query hooks), `lib/auth/`, `data/` (fallback fixtures + helpers).

### API base URL
Point the client at a configurable base URL via `app.config` / `EXPO_PUBLIC_API_URL` (default `http://localhost:3000`). All paths below are relative to it.
