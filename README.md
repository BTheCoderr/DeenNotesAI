# DeenNotes AI

Mobile-first web app: turn khutbah notes, lectures, Quran reflections, halaqa notes, and reminders into structured summaries, action steps, and shareable cards—**not** fatwas or rulings.

## Public repo safety

Treat this repo as **safe to make public**: tracked files must not contain database passwords, Supabase **service_role** or **secret** keys, AI provider keys, JWTs, or real **Project Refs**. Clone [`.env.example`](.env.example) to **`.env.local`** (or `.env`), add your values only on your machine, and rely on **`.gitignore`** (`.env*` with an exception for `.env.example`). The Next.js app uses the **anon/publishable** client key with **RLS**; `SUPABASE_SERVICE_ROLE_KEY` is optional and **not** used by app routes—never prefix it with `NEXT_PUBLIC_`.

## Beta launch checklist

Before inviting the first ~10 beta users:

1. **Database** — Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql). If this project ran an older `001` without `short_summary` / `main_reminder`, also run [`supabase/migrations/002_short_summary_main_reminder.sql`](supabase/migrations/002_short_summary_main_reminder.sql). Confirm RLS stays enabled on `profiles`, `deen_notes`, and `saved_share_cards` (see [verification SQL](#verify-schema-and-rls-after-db-push) below).
2. **Supabase Auth** — Site URL and redirect URLs match your deployment (`/auth/callback`). Decide production email confirmation behavior.
3. **Environment** — Set variables from [`.env.example`](.env.example) on the host. Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same value is fine if the dashboard only shows **publishable**). Never put **service_role** in `NEXT_PUBLIC_*`; keep `SUPABASE_SERVICE_ROLE_KEY` server-only and out of the browser bundle.
4. **AI** — Verify `AI_PROVIDER` and API keys; smoke-test note generation in staging.
5. **QA** — Complete and sign off [`docs/MVP_LAUNCH_QA.md`](docs/MVP_LAUNCH_QA.md).
6. **Positioning** — Copy stays humble: journal and reflection, not scholar or fatwa replacement.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS  
- Supabase Auth + Postgres (RLS)  
- Pluggable AI: OpenAI, Anthropic, or Groq (`AI_PROVIDER`)

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An API key for at least one AI provider
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) for `db push`

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

   - **Settings → API**: copy project URL (e.g. `https://YOUR_PROJECT_REF.supabase.co`) and the **anon** and/or **publishable** client key (never the `service_role` key for `NEXT_PUBLIC_*`).
   - **Authentication → URL configuration**: set **Site URL** to `http://localhost:3000` (and your production URL on Vercel).
   - Redirects: `http://localhost:3000/auth/callback` (and `https://your-domain.com/auth/callback` in production).

3. **Database**

   - **Option A — SQL Editor:** run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) and, if needed, [`002_short_summary_main_reminder.sql`](supabase/migrations/002_short_summary_main_reminder.sql).
   - **Option B — CLI:** use [Supabase CLI workflow](#supabase-cli-workflow) and confirm with the [verification SQL](#verify-schema-and-rls-after-db-push).

   If Postgres errors on `execute function` for triggers, use `execute procedure` for the same trigger names (see Supabase/Postgres docs for your version).

4. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in at minimum: `NEXT_PUBLIC_SUPABASE_URL`, one of the client keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), `AI_PROVIDER`, the matching model env (`OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GROQ_MODEL`), and that provider’s API key. Do not commit `.env.local`.

5. **Auth for local dev**

   - Under **Authentication → Providers → Email**, consider disabling **Confirm email** while developing so sign-up can log in immediately. Re-enable for production.

6. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

- Import the repo; set the same env vars in the Vercel project (including optional `SUPABASE_SERVICE_ROLE_KEY` only if you add server jobs that need it—never as a public var).
- Point Supabase **Site URL** and redirect URLs at your Vercel domain.

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
