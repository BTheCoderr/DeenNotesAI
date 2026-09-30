# DeenNotes AI

<p align="center">
  <img src="docs/reference/screenshots/github-social-preview.jpg" alt="DeenNotes AI product overview" width="100%" />
</p>


<p>
  <img src="apps/mobile/assets/icon.png" alt="DeenNotes AI app icon" width="96" />
</p>

[![CI](https://github.com/BTheCoderr/DeenNotesAI/actions/workflows/ci.yml/badge.svg)](https://github.com/BTheCoderr/DeenNotesAI/actions/workflows/ci.yml)
![App Store](https://img.shields.io/badge/App%20Store-Live-000000?logo=apple)
![iOS](https://img.shields.io/badge/iOS-1.0.4-000000?logo=apple)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

**App Store:** https://apps.apple.com/us/app/deennotes-ai/id6767057471 · **Web companion:** https://deennotesai.netlify.app/


<!-- repo-intro:start -->
**Project snapshot:** DeenNotes AI is a shipped iPhone/iPad app for Islamic reflection, Quran study, prayer planning, journaling, reminders, and AI-assisted note organization. The product is intentionally scoped as a reflection and productivity companion—not a source of fatwas or religious rulings.

**Current product:** App Store version **1.0.4** · React Native / Expo mobile app · Next.js web companion/API · Supabase Auth/Postgres/RLS · RevenueCat subscriptions · pluggable AI providers.

**What it demonstrates:** shipping a real consumer mobile product end-to-end: native app UX, authentication, subscriptions, Quran/audio features, prayer utilities, AI-assisted structured output, privacy/security hardening, and App Store release operations.
<!-- repo-intro:end -->

<!-- portfolio-refresh:start -->
## Shipped product

**DeenNotes AI is live on the Apple App Store.**

- **App Store:** https://apps.apple.com/us/app/deennotes-ai/id6767057471
- **Web companion:** https://deennotesai.netlify.app/
- **Current mobile source version:** 1.0.4
- **Platforms:** iPhone and iPad

### Core experience

1. Capture khutbah, lecture, Quran reflection, halaqa, reminder, or personal journal notes.
2. Turn rough notes into structured reflections, summaries, reminders, takeaways, and action steps.
3. Read Quran with Arabic ayahs, translations, and audio support.
4. Organize the day with prayer tools, Salah Planner, reminders, Qibla, and beginner-friendly Learning Mode.
5. Save account-owned reflections securely with Supabase Auth + RLS.
6. Unlock premium features through RevenueCat-backed App Store subscriptions.

## Architecture

```text
iPhone / iPad (React Native + Expo)
              │
              ├──────────────► RevenueCat ─────► App Store subscriptions
              │
              ▼
        Next.js web/API
          │     │     │
          ▼     ▼     ▼
      Supabase  AI   Quran services
      Auth/DB   providers/content/audio
       + RLS
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system boundaries and production responsibilities.

## Repository guide

- [CHANGELOG.md](CHANGELOG.md) — production release history
- [ROADMAP.md](ROADMAP.md) — shipped, improving, and exploring
- [docs/README.md](docs/README.md) — current vs. historical product documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) — development and review expectations
- [SECURITY.md](SECURITY.md) — vulnerability and secret-handling policy
- [.github/workflows/ci.yml](.github/workflows/ci.yml) — automated web/mobile verification

## Engineering highlights

- React Native + Expo Router mobile app in `apps/mobile`
- Next.js companion web app and server routes
- Supabase Auth + owner-scoped Postgres RLS
- RevenueCat iOS subscription integration
- pluggable AI provider selection instead of one hard-coded model vendor
- structured AI output validation for predictable reflections
- Quran reading/audio, local recording, prayer reminders, Qibla, and Salah Planner flows
- public-repo secret hygiene and deployment checks
- product guardrail: reflection/organization support, **not fatwas or rulings**

The technical challenge is broader than summarization: DeenNotes combines mobile product UX, faith-sensitive scope, subscriptions, account security, audio/device capabilities, and reliable AI output in one shipped consumer app.
<!-- portfolio-refresh:end -->

DeenNotes AI is mobile-first: the shipped React Native / Expo app is the primary product, with a Next.js web companion and API supporting the broader experience.

## Public repo safety

Treat this repo as **safe to make public**: tracked files must not contain database passwords, Supabase **service_role** or **secret** keys, AI provider keys, JWTs, or real **Project Refs**. Clone [`.env.example`](.env.example) to **`.env.local`** (or `.env`), add your values only on your machine, and rely on **`.gitignore`** (`.env*` with an exception for `.env.example`). The Next.js app uses the **anon/publishable** client key with **RLS**; `SUPABASE_SERVICE_ROLE_KEY` is optional and **not** used by app routes—never prefix it with `NEXT_PUBLIC_`.

## Repository quality gates

Every pull request is set up to run GitHub CI for:

- root TypeScript verification
- Vitest tests
- mobile TypeScript verification
- a production-style Next.js build using safe CI placeholder configuration

Dependency update PRs are managed by Dependabot. Pull requests and issues use repository templates, and CODEOWNERS routes changes to the maintainer.

**Deployment is deliberately separate from CI.** A passing GitHub check or merged pull request is not treated as permission to publish a Netlify or App Store release.

## Production / release checklist

For ongoing releases and maintenance:

1. **Database** — Keep Supabase migrations in `supabase/migrations/` as the source of truth and verify RLS remains enabled on account-owned tables.
2. **Auth** — Keep Supabase Site URL and redirect allowlists aligned with the production web companion and mobile deep-link flow.
3. **Environment** — Keep public/publishable Supabase values client-safe and all service-role / AI provider secrets server-side.
4. **AI** — Smoke-test structured reflection generation after provider or prompt changes.
5. **Mobile** — Run the Expo typecheck/doctor flow and verify sign-in, Reflect, Quran/audio, Prayer/Salah Planner, Premium/restore, and Settings before an App Store submission.
6. **Positioning** — Keep product copy scoped to journaling, reflection, study, and productivity support rather than religious rulings.

## Stack

### Mobile
- React Native + Expo 54
- Expo Router
- TypeScript
- Supabase Auth/Postgres
- RevenueCat
- Sentry

### Web / server
- Next.js App Router
- TypeScript + Tailwind CSS
- Supabase Auth + Postgres (RLS)
- Pluggable AI: OpenAI, Anthropic, or Groq (`AI_PROVIDER`)
- Netlify

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An API key for at least one AI provider
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) for `db push`
- Optional: [Netlify CLI](https://docs.netlify.com/cli/get-started/) (installed in this repo as a dev dependency — use `npm run ntl -- …` from the repo root)

## Netlify CLI

From the repo root, the CLI is available without a global install:

```bash
npm run ntl -- --version
npm run ntl -- status
npm run ntl -- link
npm run netlify:deploy
npm run netlify:deploy:prod
```

For **non-interactive** use (agents, CI, scripts), set `NETLIFY_AUTH_TOKEN` in `.env.local` (create a personal access token under [Netlify → User settings → Applications](https://app.netlify.com/user/applications#oauth)). For a one-time interactive login on your machine: `npm run ntl -- login`.

## Supabase CLI workflow

From the repo root (after [installing the CLI](https://supabase.com/docs/guides/cli/getting-started)):

> **For this project, use your Supabase dashboard Project Ref when linking locally.** Find it under **Project Settings → General** (not the full database password).

```bash
supabase login
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

- `supabase init` creates `supabase/config.toml` if you do not already have it; keep migration SQL in `supabase/migrations/` as the source of truth.

**If `supabase db push` fails with “already exists”** (you already ran `001_init.sql` in the SQL Editor), the remote DB matches that migration but Supabase’s history does not yet. Mark it applied, then push again:

```bash
supabase migration repair 001 --status applied --linked
supabase db push
```

Use `002` instead of `001` if only the second migration was applied manually. Run `supabase migration list` to see local vs remote status.

### Verify schema and RLS after `db push`

Run in **SQL Editor** (or `supabase db execute`):

```sql
-- Tables exist in public schema
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'deen_notes', 'saved_share_cards')
order by table_name;

-- RLS enabled (relrowsecurity should be true for each)
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('profiles', 'deen_notes', 'saved_share_cards')
order by 1;
```

Expect three rows in the first query and `rls_enabled = true` for all three in the second. Policies in the migrations scope access by `auth.uid()` for tenant-owned rows.

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Configure Supabase**

   - **Settings → API**: copy project URL (e.g. `https://YOUR_PROJECT_REF.supabase.co`) and the **publishable** client key (or legacy **anon** key — same permission level; never the `service_role` key for `NEXT_PUBLIC_*`).
   - **Authentication → URL configuration**: set local development redirects for `http://localhost:3000` and production redirects for `https://deennotesai.netlify.app` plus the mobile deep-link/callback flow.
   - Redirects: `http://localhost:3000/auth/callback` (and `https://your-domain.com/auth/callback` in production).

3. **Database**

   - **Option A — SQL Editor:** run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) and, if needed, [`002_short_summary_main_reminder.sql`](supabase/migrations/002_short_summary_main_reminder.sql).
   - **Option B — CLI:** use [Supabase CLI workflow](#supabase-cli-workflow) and confirm with the [verification SQL](#verify-schema-and-rls-after-db-push).

   If Postgres errors on `execute function` for triggers, use `execute procedure` for the same trigger names (see Supabase/Postgres docs for your version).

4. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in at minimum: `NEXT_PUBLIC_SUPABASE_URL`, **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** (preferred) or `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AI_PROVIDER`, the matching model env (`OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GROQ_MODEL`), and that provider’s API key. Do not commit `.env.local`.

5. **Auth for local dev**

   - Under **Authentication → Providers → Email**, consider disabling **Confirm email** while developing so sign-up can log in immediately. Re-enable for production.

6. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy the web companion on Netlify

- The production web companion is hosted at `https://deennotesai.netlify.app`.
- Configure the Netlify project with the same required server/client environment variables documented in `.env.example`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and never expose it through a `NEXT_PUBLIC_*` variable.
- Keep Supabase Site URL / redirect allowlists synchronized with the Netlify production URL.
- Documentation-only commits can use `[skip netlify]` to avoid unnecessary production builds.

## Deploy on Netlify

Before closing out a release, follow **[docs/DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md)** (commit/push → confirm Netlify commit → curl route health).

1. In the site’s **Environment variables**, set **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** for your Supabase project.
2. If **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** might be wrong or from another project, **remove it**. The app uses **publishable first** when it is non-empty, but deleting a bad anon avoids confusion and mistaken “which key is live?” during rollouts.
3. Run **Deploys → Clear cache and deploy site** after any `NEXT_PUBLIC_*` change so the new values are inlined into the client bundle.
4. After deploy, **hard refresh** the site and **sign in again** so session cookies match the deployed URL and keys.

From the repo you can also use **`npm run netlify:deploy:prod`** (see [Netlify CLI](#netlify-cli)); env vars are still managed in the Netlify UI or via `npm run ntl -- env:set …` when authenticated.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Dev server         |
| `npm run build`| Production build   |
| `npm run start`| Start production   |
| `npm run lint` | ESLint             |
| `npm run test` | Vitest (AI schema) |

## Product disclaimer

DeenNotes is for organizing Islamic learning and personal reflection. It does not provide fatwas or religious rulings. Users should consult a qualified scholar or imam for religious decisions.

## License

Copyright © 2026 Baheem Ferrell. All rights reserved. This public repository is viewable for portfolio, review, and collaboration purposes; it is **not** released under an open-source license. See [LICENSE](LICENSE).

