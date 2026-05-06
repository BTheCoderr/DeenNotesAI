# DeenNotes AI — brand (product)

**Visual kit:** open **`/brand`** in the running app ([`src/app/brand/page.tsx`](../src/app/brand/page.tsx)) — primary wordmark, light/dark app icons, secondary note mark. No tagline on the sheet; use copy only where the product needs it (e.g. landing).

## What ships in the product

| What | Where in code |
| ---- | ------------- |
| Primary wordmark + taper | `DeenNotesLogo` |
| Wordmark row only | `DeenNotesWordmark` |
| Compact “DeenNotes” | `DeenNotesCompactLogo` |
| App symbol (light / dark) | `DeenNotesAppIcon` |
| Secondary note mark | `DeenNotesSecondaryMark` |
| Tagline (optional, landing-only) | `DeenNotesTagline` |

**Core colors:** emerald `#127A63`, stone `#F6F4F0`, mint `#CFE8E0` for UI accents (see `tailwind.config.ts`). Tagline / soft labels: `stoneMuted` `#7A756C`.

**Fonts:** Fraunces for brand wordmark; Inter for UI and the small `AI` suffix.

**Icon file:** `src/app/icon.svg` → `/icon.svg`. Manifest: `src/app/manifest.ts`.

**Product / UX references (screenshots):** place non-shipping reference captures in [`docs/reference/screenshots/`](reference/screenshots/) — see [`README.md`](reference/screenshots/README.md) there for naming and git notes.

## Rules

- Do not stretch or recolor marks arbitrarily. Do not use the secondary mark as the main nav logo.
- DeenNotes is a **reflection journal**, not a scholar or fatwa channel — keep tone calm and non-authoritative.
