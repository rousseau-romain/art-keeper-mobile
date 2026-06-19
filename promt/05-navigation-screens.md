## 5. Navigation & screens

The prototype is a stack on top of a persistent top nav (desktop) / bottom tab bar (mobile). **Build the mobile model:** a bottom tab bar with **Browse**, a center **+ Submit** FAB, and **Admin**, plus stack-pushed detail screens. Login is a full-screen route shown before the authenticated app.

### 5.1 Login / Auth (`login`)
Full-screen. Left/top: a hero photo (gritty wall) with overlaid display-type caption **"Catalog the walls before they're gone."** Form: ArtKeeper brand + star, tagline "A living map of street art." A segmented **Sign in / Create account** toggle. Create-account mode adds a **Name** field. Fields: Email, Password. Primary button. An "or" divider, then **Continue with Google** (ghost button). Footer links: "forgot password?" and a toggle to switch sign-in/create.
- **Wire to Better Auth:** sign-in → `POST /auth/sign-in/email`; create → `POST /auth/sign-up/email` (`{ name, email, password }`); Google → `POST /auth/sign-in/social`. Capture the `set-auth-token` header, persist it, then route to Browse. Surface API errors (400/401/422 `message`) inline. On launch, `GET /auth/get-session` decides whether to show Login or the app.

### 5.2 Browse (`browse`) — map-first
The home screen. **Two views toggled by a Map/Grid switch:**

- **Map view (default):** full-bleed `react-native-maps` map centered on Paris 11e with a pin per artwork (featured/`big` pieces get a larger pin). Floating overlays: a horizontal **filter-tag row** (chips: #stencil #paste #mural #mosaic #tag #sticker; tapping filters, plus a "clear ✕"), the **Map/Grid toggle**, and a **+ FAB** (bottom-right) to Submit. Tapping a pin raises a **preview card** (small photo + title + artist credit + close ✕); tapping the card opens the artwork. A **bottom sheet / drawer** lists "{n} pieces in view" — collapsed it's a horizontal photo strip; dragging it up expands to a 2-column masonry grid. The drawer also holds the search field + filters on mobile.
- **Grid view:** header "Browse" + mono subtitle "{n} pieces · Paris 11e", filter row, and a masonry grid of **PieceCard**s.

Search and filters are **server-driven**: tap chips → `tag` params (AND); search box → `title`/`artist` params; the visible map region → a `polygon` (or `lat`+`lng`+`radius`) to fetch "pieces in view". Page with `cursor`/`nextCursor` as the user scrolls the grid/drawer. The "jump to neighborhood" search uses `GET /places/autocomplete` → `/places/details` boundary → `polygon` filter.

### 5.3 Artwork detail (`artwork/[id]`)
- Large cover **photo** at top (respect the piece's aspect ratio).
- Back link → Browse. **Title** (display), tappable **artist credit** (@handle + verified check, links to profile), **tag chips**, the **note** paragraph (if any), and a location line (pin icon + street, mono).
- **Action row:** Like (`POST`/`DELETE /artworks/:id/like`, optimistic toggle of `likedByMe`/`likeCount`), Share (toast "Link copied"), Flag — opens a reason picker (spam / inappropriate / copyright / harassment / other + optional details) and files `POST /reports { targetType:"artwork", targetId, reason, details? }`, then toast "Flag opened for review" (handle 409 "already reported").
- **Context map:** a small `react-native-maps` view centered on this piece's real coords with the piece pinned + a few nearby dots, plus a coordinate/neighborhood chip. A **"Nearby — {n} more pieces within 200m"** row of small photo thumbnails (tappable).
- **More by @artist:** masonry grid of the artist's other pieces, with a "view profile →" link.

### 5.4 Artist profile (`artist/[handle]`)
- Data from `GET /artists/:id`. Header/sidebar: back, large **avatar** (artist's `avatarUrl`, else a colored initials block with a color derived from the id/slug), **name/@slug** + verified check, **description**, stats (derived piece count / `followerCount`), `socialLinks` row, and a **Follow / Following ✓** button (`POST`/`DELETE /artists/:id/follow`, optimistic; toasts "Following …" / "Unfollowed").
- **Cities** list (pin + city + count) — "tap to zoom" the map.
- **Portfolio** with two tabs: **Territory** (a `react-native-maps` view pinning all the artist's pieces) and **All {n}** (masonry grid). Tapping a pin or card opens the artwork.

### 5.5 Submit wizard (`submit`) — 5 steps
A stepper across the top (Photo · Pin · Details · Review · Done) with a "{n}/5" counter and Back/Cancel. Footer holds the primary advance button (disabled until the step is valid).

> **On submit, this calls `POST /artworks/` (multipart: required `title`, `latitude`, `longitude`, `image`; optional `description`, `tags` JSON array ≤10, `artistId`).** The created artwork starts `verified:false` — that *is* "pending review." (The API takes one `image`; if you keep multi-photo UI, the cover is what's uploaded.)

1. **Photo** — "Add a photo / Camera or library. The first photo is the cover." Use **expo-camera / expo-image-picker** for real capture. First photo becomes the cover (uploaded as `image`); additional photos appear as thumbnails with an add (+) tile. After adding, show a line: "GPS found in EXIF — auto-pinned" (pull real EXIF/location where available). Can't advance until ≥1 photo.
2. **Pin** — "Confirm the location / Auto-pinned from your photo. Tap the map to nudge it." A real interactive map; dragging/tapping moves the pin. Show the resolved street (reverse-geocode via expo-location). A **"Use my location"** (globe) button recenters on the device's GPS (toast "Using your location").
3. **Details** — fields: **Title** (required → `title`), **Artist** (autocomplete against `GET /artists/` → sets `artistId`; "no artist credited" omits it), **Tags** (multi-select chips → `tags[]`, no `#` on the wire), **Note** (optional → `description`).
4. **Review** — "Look right?" Summary card (cover thumb + title + artist-or-"no artist credited" + photo count), then editable rows for **Where / Tags / Note** (each "edit" jumps back to its step). A **pledge checkbox**: "I shot or have rights to these photos." — required to submit. Button reads "Submit for review".
5. **Done** — big check mark, "Submitted!", copy: "An admin will review your piece shortly. You'll get a ping when it goes live.", a "status · pending review" tag, and buttons: **Track submission** (opens the just-created unverified artwork), **Submit another** (resets the wizard), and a "back to browse" link. The user's pending pieces are `GET /artworks/?verified=false`.

### 5.6 Admin / Moderate (`admin`) — admin-only tab
Shown only when the session user is an admin. Three queues (tabs), all paged with `cursor`/`nextCursor`:

**A. Change proposals (the prototype's before/after diff).** `GET /artworks/changes?status=pending` + `GET /artists/changes?status=pending`.
- **Queue list:** "Moderation · {n} open", each item shows the target, the proposer, and timestamp — or an "approved"/"rejected" badge once decided. Selecting one loads it.
- **Review panel:** fetch the target entity for its **current** values; compare against the proposal's **`changes`** (only keys present in `changes` are edits). On mobile, a **before/after segmented toggle** (− current / + proposed); on wide screens show both side by side.
- **Diff panels — Current (− before, red) and Proposed (+ after, green):** show the image and changed fields (title, description, tags, artist, lat/lng / name, socialLinks, avatar). Tint changes with `diff-del` / `diff-add`.
- **Footer:** **Reject** (ghost) and **Accept changes** (primary, check). Decide via `PATCH /artworks/:id/changes/:changeId` (or `/artists/:id/changes/:changeId`) `{ status:"approved"|"rejected" }`; handle 409 (already reviewed / slug collision) and 400 (missing artist). Toast ("changes applied" / "rejected") and advance to the next pending item.

**B. Reports (abuse queue).** `GET /reports?status=pending` — each shows reporter, `targetType`/`targetId` (link to the target), `reason`, and `details`. Resolve / dismiss via `PATCH /reports/:id { status:"resolved"|"dismissed" }`.

**C. Verification.** Pending = unverified artworks/artists (`GET /artworks/?verified=false`, `GET /artists/`). Approve to go live with `PATCH /artworks/:id/verify` / `PATCH /artists/:id/verify { verified:true }`; delete offending items with `DELETE`.
