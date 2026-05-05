# DeenNotes AI — brand system

Reference for designers and engineers. Keep the product **calm**, **premium**, and **non-authoritative** (reflection journal, not fatwa or scholarship).

## Logo types

| Asset | Component | When to use |
| ----- | --------- | ----------- |
| Primary wordmark + taper | `DeenNotesLogo` | Landing, login/signup hero, desktop app shell header |
| Wordmark row only (no taper) | `DeenNotesWordmark` | Share surfaces, tight cards, dense UI |
| Compact (no “AI”) | `DeenNotesCompactLogo` | Mobile top bars, space-constrained chrome |
| App symbol | `DeenNotesAppIcon` (`light` / `dark`) | Empty states, splash-style moments, marketing grids |
| Secondary mark | `DeenNotesSecondaryMark` | Onboarding, share cards (corner), empty states — **never** as primary nav logo |
| Tagline | `DeenNotesTagline` | **Landing and marketing hero only** — not auth pages or global chrome |

## Colors (locked)

| Token | Hex | Role |
| ----- | --- | ---- |
| Primary emerald | `#127A63` | Wordmarks, buttons, key accents (`accent` in Tailwind) |
| Soft mint | `#CFE8E0` | Soft fills, borders, secondary-mark sparkle (`mint`, `accent-soft`) |
| Warm stone | `#F6F4F0` | Page background (`background`, `stoneWarm`) |
| Muted brand | `#7A756C` | Tagline, soft labels (`stoneMuted`) — body copy still uses `muted` |

Do **not** introduce additional greens or off-palette neutrals for brand marks without updating this file.

## Typography

- **Brand / headlines:** Fraunces (`font-display`) — editorial, warm.
- **UI + “AI” suffix + tagline:** Inter (`font-sans`) — clean, neutral.

Use **serif for brand moments**, **sans for functional UI** and the small **AI** suffix.

## Implementation

- Logos are **SVG / JSX** under `src/components/brand/`. Prefer these components over raster logos in UI.
- Tailwind tokens live in `tailwind.config.ts` (`accent`, `mint`, `background`, `stoneMuted`, etc.).

## Misuse (do not)

- Do not **stretch**, rotate, or re-color logos arbitrarily.
- Do not use **random greens** — only the palette above.
- Do not place the **tagline** on login/signup, in global app chrome (sidebars, settings), or on every screen.
- Do not use **`DeenNotesSecondaryMark`** as the main product logo in nav or auth.
- Do not **stack** primary logo + app icon + secondary mark + tagline in one small header — pick **one** primary anchor.

## Favicon / PWA

- **Single strategy:** static **`src/app/icon.svg`** only (Next.js serves `/icon.svg`). Do **not** add `app/icon.tsx` / `ImageResponse` unless you deliberately switch approaches.
- **Web app manifest:** `src/app/manifest.ts` (`theme_color`, `icons` → `/icon.svg`).
- **Future:** Export **1024×1024** PNG (and 192/512) for iOS/Android; extend `manifest.ts` `icons` when ready.

## Positioning copy (product)

DeenNotes AI is a **reflection and journaling** tool. It is **not** a religious authority and **not** a fatwa tool. Brand and UI should never imply otherwise.
