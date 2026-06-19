## 2. The design system (port this exactly)

ArtKeeper ships **three visual "skins"** crossed with **light/dark** themes and a selectable **accent color**. The prototype drives everything off semantic tokens — do the same in RN with a `ThemeProvider` exposing a typed token object. Never hard-code a color or font in a component; always read from the active theme.

### Skins
| Skin | Personality | Display font | Body font | Mono font | Corners | Shadow | Display style |
|------|-------------|--------------|-----------|-----------|---------|--------|---------------|
| `sketch` | low-fi wireframe, hand-drawn | **Patrick Hand** | **Hanken Grotesk** | **JetBrains Mono** | 7/12px | hard offset `3px 3px 0` | normal weight |
| `gritty` | urban editorial, concrete + spray | **Archivo** (800 wt) | **Hanken Grotesk** | **Space Mono** | 2/3px (sharp) | none | UPPERCASE, heavy, tight tracking |
| `gallery` | clean museum white | **Spectral** (serif) | **Hanken Grotesk** | **JetBrains Mono** | 10/18px | soft `0 10px 30px` | medium weight |

**Default skin is `gritty`, default theme is `dark`.**

### Token values (per skin × theme)

Define these as the theme object. Values below are the canonical hex from the prototype.

```
BASE TOKENS (semantic names): bg, surface, surface-2, ink, ink-soft, ink-mute,
line, hair, accent, accent-ink, accent-soft, diff-add-bg, diff-add,
diff-del-bg, diff-del. Plus: radius, radius-lg, border-weight, shadow,
display-weight, display-spacing (letter-spacing), display-transform.

SKETCH · light: bg #efece4, surface #f7f5ee, surface-2 #e6e2d7, ink #181818,
  ink-soft #4a4946, ink-mute #8a8780, line #1a1a1a, hair #c5c1b4,
  accent #e8482a, accent-ink #f7f5ee, accent-soft #f5d8cd
SKETCH · dark: bg #14130f, surface #1f1d18, surface-2 #1b1a16, ink #efece4,
  ink-soft #c4c0b3, ink-mute #7a766c, line #efece4, hair #3a3833,
  accent #ff5a3a, accent-ink #14130f, accent-soft #3a201a

GRITTY · dark (DEFAULT): bg #0e0e0f, surface #19191b, surface-2 #212124,
  ink #f2f0ea, ink-soft #b4b1a8, ink-mute #6d6a63, line #3a3a3e, hair #2a2a2d,
  accent #ff5b1f, accent-ink #0e0e0f, accent-soft #2a1a10,
  diff-add-bg #16241a, diff-add #5fd07f, diff-del-bg #2a1614, diff-del #ff6a4d
GRITTY · light: bg #d9d6cf, surface #eceae3, surface-2 #e0ddd4, ink #16160f,
  ink-soft #43423a, ink-mute #7d7a70, line #16160f, hair #b6b2a6,
  accent #e8421a, accent-ink #f4f2ea, accent-soft #f2d6c9

GALLERY · light: bg #f4f2ed, surface #fefdfb, surface-2 #eceae3, ink #1c1a16,
  ink-soft #56524a, ink-mute #9a958a, line #dcd8cf, hair #e6e2da,
  accent #b8543a, accent-ink #fefdfb, accent-soft #f0ddd4
GALLERY · dark: bg #161512, surface #201e1a, surface-2 #262420, ink #f1efe9,
  ink-soft #bdb8ac, ink-mute #827d72, line #34312b, hair #2b2925,
  accent #d98a5f, accent-ink #161512, accent-soft #33241c
```

### Selectable accents
A settings control lets the user override `accent`: **Auto** (skin default), **Spray** `#ff5b1f`, **Acid** `#b6cf00`, **Cobalt** `#3b82f6`, **Magenta** `#e0218a`.

### Typography roles
- **Display** (`--font-display`): screen titles, artwork titles, brand. Weight/spacing/transform per skin (gritty = uppercase 800; gallery = serif 500; sketch = hand 400).
- **Body** (`--font-body`, always Hanken Grotesk): paragraphs, UI labels, buttons.
- **Mono** (`--font-mono`): metadata, coordinates, counts, timestamps, small captions, tags-as-data.

> The skin/theme/accent switcher in the prototype is a dev "Tweaks" panel. In the app, surface these as a real **Settings / Appearance** screen so users can pick a skin, toggle dark mode, and choose an accent.
