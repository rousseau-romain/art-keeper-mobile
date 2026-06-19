## 4. Backend API integration (the real data model)

All data is served by the **Art Keeper REST API** (base URL configurable, default `http://localhost:3000`). Everything the prototype faked with fixtures now comes from these endpoints. Use react-query for caching, optimistic updates (likes/follows), and cursor pagination.

### 4.0 Auth (Better Auth, bearer-token flow)
| Action | Endpoint | Notes |
|---|---|---|
| Create account | `POST /auth/sign-up/email` | body `{ name, email, password }`. |
| Sign in | `POST /auth/sign-in/email` | body `{ email, password }`. Capture the **`set-auth-token`** response header → store as the bearer token. |
| Hydrate session | `GET /auth/get-session` | returns `{ session, user }` or null. Call on launch. |
| Sign out | `POST /auth/sign-out` | clear stored token. |
| Google | `POST /auth/sign-in/social` | provider `google` (optional; the prototype's "Continue with Google" button). |

Send `Authorization: Bearer <token>` on every authenticated request. **Admin-only** routes (review queues, verify, reports list) require the user's account to have the admin role — the seeded admin is `test+admin@art-keeper.local` / `admin1234`. Show the **Admin** tab only when the session user is an admin.

### 4.1 Entities & response shapes

**Artist** — `GET /artists/:id`, `GET /artists/` (paged)
```
id, name, slug, description|null, avatarUrl|null, tags[], 
socialLinks{ instagram?, twitter?, facebook?, tiktok?, website? },
verified, userId (owner), followerCount, followedByMe, createdAt, updatedAt
```
- Follow / unfollow: `POST` / `DELETE /artists/:id/follow` → returns updated artist (optimistic toggle of `followedByMe` + `followerCount`).
- Create: `POST /artists/` (multipart; `name` required, optional `avatar`, `tags`, `socialLinks`). `verified` starts false (admin-only flag).
- Piece count / "territory": the artist object has no piece count or city list — **derive** by querying `GET /artworks/?artist=<name>` (use `nextCursor`/`likeCount` data as needed) and clustering those artworks' coordinates for the cities/territory view.

**Artwork** — `GET /artworks/:id`, `GET /artworks/` (paged)
```
id, title, slug, description|null, tags[], latitude, longitude, imageUrl,
verified, artistId|null, userId (owner), likeCount, likedByMe, createdAt, updatedAt
```
- Like / unlike: `POST` / `DELETE /artworks/:id/like` → returns updated artwork (idempotent; optimistic toggle of `likedByMe` + `likeCount`).
- History: `GET /artworks/:id/history` — applied changes newest-first, each with `{ changes, previous, proposedByUserId, reviewedByUserId, appliedAt }`. Useful for a "provenance / edit history" view.
- Delete: `DELETE /artworks/:id` (owner if unverified; admin if verified).

### 4.2 Listing & filtering artworks (Browse)
`GET /artworks/` supports the filters the prototype's chips/search need:
- Repeatable **`tag`** (AND — all must match), **`title`** and **`artist`** (OR within each), all case-insensitive.
- **Geographic** (mutually exclusive): a **circle** via `lat`+`lng`+`radius` (km, ≤100, all three required together) **or** a **`polygon`** = JSON array of ≥3 GeoJSON `[lng,lat]` points. Map the visible map region → a polygon (or center+radius) to fetch "pieces in view".
- **`verified`** filter: non-admins see verified artworks plus their own unverified; `verified=false` returns just the caller's own unverified (use this for the user's "pending" list).
- Pagination: `limit` (default 20, max 100) + `cursor`; response is `{ data[], nextCursor }`. `likedByMe` reflects the signed-in caller.

> **Prototype → API field mapping.** `handle` → artist `slug`/`name` (identity is `id`); `bio` → `description`; `followers` → `followerCount`; `following` → `followedByMe`; `note` → artwork `description`; `likes`/`liked` → `likeCount`/`likedByMe`; tags have **no `#` prefix** in the API (the proto's display style adds it — strip on write, prepend on display). The proto's **`color`** (avatar bg), **`loc`** (street), **`ratio`** (photo aspect), and **`big`** (featured) are **not** API fields — derive them: `color` deterministically from the artist id/slug; `loc` via reverse-geocode of lat/lng (expo-location) or the Places API; `ratio` from the loaded image's natural dimensions; `big`/featured from a `likeCount` threshold. The proto's per-artist **cities** list is derived by clustering that artist's artworks' coordinates.

### 4.3 Submitting a piece (Submit wizard)
There is **no "submit for review" endpoint** — creating a piece *is* the submission:
- `POST /artworks/` as **multipart/form-data**: required `title`, `latitude`, `longitude`, `image`; optional `description`, `tags` (JSON array, max 10), `artistId`. New artworks start **`verified: false`** → this *is* the prototype's "pending review" state (visible only to you + admins until an admin runs `PATCH /artworks/:id/verify`).
- The wizard's **artist autocomplete** queries `GET /artists/` (and/or `?artist=` on artworks) and sets `artistId`; "no artist credited" omits it.
- The user's "track submission / my pending pieces" = `GET /artworks/?verified=false`.
- **Proposing an edit** to an *existing* piece (not first-time creation) is a separate flow: `POST /artworks/:id/changes` (multipart, any subset of fields). It stays `pending` until an admin reviews it.

### 4.4 Moderation (Admin) — three queues
The prototype's single "flags → before/after diff" screen maps onto the API's moderation surface. Build it as tabs:

1. **Change proposals (the before/after diff UI).** `GET /artworks/changes?status=pending` and `GET /artists/changes?status=pending` (admin only, paged). Each proposal has `{ id, artworkId|artistId, userId, changes{...}, status, createdAt }`. Render the diff by comparing the entity's **current** values (fetch the artwork/artist) against the proposal's **`changes`** — only the keys present in `changes` are edits; tint added/changed values with `diff-add`, the replaced current values with `diff-del`. Decide with `PATCH /artworks/:id/changes/:changeId` (or the artist equivalent) `{ status: "approved" | "rejected" }`. Approving applies the change + records history; 409 if already reviewed or a title/name collides. Then advance to the next pending item.
2. **Reports (abuse queue).** `GET /reports?status=pending` (admin only). Each: `{ id, reporterUserId, targetType: user|artwork|artist, targetId, reason: spam|inappropriate|copyright|harassment|other, details|null, status, createdAt }`. Resolve/dismiss with `PATCH /reports/:id { status: "resolved" | "dismissed" }`. This backs the prototype's **Flag** action: tapping Flag on an artwork files `POST /reports { targetType:"artwork", targetId, reason, details? }` (404 if target gone, 409 if you already have a pending report).
3. **Verification.** Unverified artworks/artists awaiting approval — `PATCH /artworks/:id/verify { verified:true }` and `PATCH /artists/:id/verify { verified:true }` (admin only). This is how a "pending" submission goes live.

### 4.5 Places (geocoding for the Pin step & region filters)
- `GET /places/autocomplete?q=` → typeahead suggestions `{ osmType, osmId, name, lat, lng, boundingBox[] }`. Use for a place search in the Submit **Pin** step and a "jump to neighborhood" search in Browse.
- `GET /places/details?osmType=&osmId=` → full detail incl. a **GeoJSON boundary** (`geojson`) and address hierarchy. Feed the boundary polygon straight into the `GET /artworks?polygon=` filter to scope Browse to a selected area.

> **Photos:** render **real images** from each artwork's `imageUrl` (and camera/library captures during submit) via `expo-image`. Keep the striped placeholder component only as a loading/fallback state (e.g. while `imageUrl` loads or for an artwork with none) — never invent fake imagery.

### 4.6 Reference fixtures (UI shape only — not the live data)
The original prototype shipped these hard-coded values. They are **no longer the data source** — they're a reference for the look/feel and useful for offline storybook/empty states. The live app must read everything from §4.1–4.5. Canonical tag set seen in the proto: `stencil paste mural tag sticker mosaic throwup` (+ `paris` as a location tag) — but treat tags as **open/server-driven**, not a fixed enum.
