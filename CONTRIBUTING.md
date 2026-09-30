# Contributing to DeenNotes AI

DeenNotes AI is a shipped mobile product with an Expo/React Native client, a Next.js web companion/API, Supabase-backed accounts, RevenueCat subscriptions, Quran/audio features, prayer utilities, and AI-assisted reflection organization.

## Product scope

Contributions should support the product's role as a reflection, study, journaling, and productivity companion. AI-generated content must not be presented as a fatwa, authoritative religious ruling, or substitute for qualified scholarship.

## Before opening a pull request

1. Create a focused branch.
2. Keep secrets out of tracked files. Use the documented environment-variable examples.
3. Run:
   ```bash
   npm ci
   npm run typecheck
   npm test
   npm run mobile:typecheck
   ```
4. If web/server behavior changed, also run:
   ```bash
   npm run build
   ```
5. Test the product surface you changed.

## Pull requests

Keep PRs small enough to review. Explain what changed, why it changed, and how it was verified. A merged code change does not automatically mean it should be deployed to production.

## Security

Do not open a public issue containing credentials, tokens, personal journal content, or a vulnerability that could expose user data. See [SECURITY.md](SECURITY.md).

## Database changes

Treat `supabase/migrations/` as the source of truth. Preserve RLS on account-owned data and avoid broad grants to public roles.

## Mobile releases

For App Store changes, follow the current mobile and release documentation under [docs/](docs/README.md). Versioned mobile configuration lives under `apps/mobile/`.
