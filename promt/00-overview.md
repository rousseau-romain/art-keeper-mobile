# Build ArtKeeper as an Expo (React Native) app

You are implementing **ArtKeeper**, a mobile app for cataloging street art — a living, crowd-sourced map of murals, stencils, paste-ups, mosaics, and tags before they get buffed or painted over. The product already exists as a high-fidelity web prototype; your job is to faithfully rebuild it as a **native Expo app** (iOS + Android) that uses real device capabilities (camera, GPS, maps) where the prototype used mockups.

Treat the prototype as the source of truth for **layout, copy, flows, and the design system**. Reproduce its structure and interaction model — don't redesign it. Where the prototype faked a native feature (photo placeholders, a stylized fake map, EXIF GPS), wire up the real thing. **Where the prototype used hard-coded fixture data, wire up the real Art Keeper REST API instead** (see §4). The fixtures remain useful only as a reference for the *shape* of the UI and as offline placeholders — the live app is backed by the API.

Build it screen by screen, matching the prototype's copy and information hierarchy. Prioritize Auth → Browse → Artwork detail → Submit → Admin in that order.

## Reading order
1. `01-tech-stack.md` — Tech stack & project setup
2. `02-design-system.md` — The design system
3. `03-iconography.md` — Iconography
4. `04-backend-api.md` — Backend API integration (the real data model)
5. `05-navigation-screens.md` — Navigation & screens
6. `06-shared-components.md` — Shared components to build
7. `07-native-behaviors.md` — Native behaviors & polish
8. `08-acceptance-checklist.md` — Acceptance checklist
