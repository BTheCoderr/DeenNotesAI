# DeenNotes AI — MVP launch QA

Manual checklist for ~10 beta users. Run in **staging** first, then **production**. Record pass/fail and owner initials.

## Preconditions

- [ ] **CLI (optional):** `supabase link --project-ref YOUR_PROJECT_REF` uses the **Project Ref** from **Supabase → Project Settings → General** (same placeholder as in [README](../README.md#supabase-cli-workflow)).
- [ ] `001_init.sql` and **`002_short_summary_main_reminder.sql`** applied (or fresh `001` that already includes `short_summary` / `main_reminder`).
- [ ] Supabase **Authentication → URL configuration**: Site URL and redirect URLs match your deployment (e.g. `https://yourapp.vercel.app/auth/callback`).
- [ ] Env vars set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same value is OK), `AI_PROVIDER`, matching provider API key. `SUPABASE_SERVICE_ROLE_KEY` only on the server if used—never `NEXT_PUBLIC_*`.
- [ ] Optional: `NEXT_PUBLIC_BETA_FEEDBACK_EMAIL` for one-click feedback mailto recipient.

## Security & positioning (must pass)

- [ ] Copy on marketing, settings, footer, and generated disclaimers never presents the app as an imam, scholar, mufti, or fatwa service.
- [ ] No prayer times, Qibla, Quran reader, mosque dashboard, subscriptions, or native app dependencies in this QA scope.

## Auth & routing

| Step | Action | Expected |
|------|--------|----------|
| A1 | Open `/app` while signed out | Redirect to `/login?next=/app` |
| A2 | Sign up new user | Account created; lands in app (or email confirm per Supabase settings) |
| A3 | Sign out from Settings | Lands on marketing home or login; `/app` redirects to login |
| A4 | Sign in from `/login?next=/app/notes` | After login, lands on **`/app/notes`** (not always `/app`) |
| A5 | While signed in, open `/login` | Redirect to app (preserves `next` when valid `/app` path) |

## Notes CRUD & RLS (tenant safety)

| Step | Action | Expected |
|------|--------|----------|
| N1 | Create note from `/app/new` | Success; redirect to detail URL |
| N2 | List `/app/notes` | New note visible |
| N3 | Open detail `/app/notes/[id]` | Matches DB row; shows short summary, main reminder (if present), lists, share card |
| N4 | **(Two browsers)** User B pastes User A note UUID in URL | **404 / not found** (RLS: no row) |
| N5 | Copy share card text | Clipboard matches |
| N6 | Save share card | No error; optional: confirm row in `saved_share_cards` for same `user_id` in Supabase |

## AI behavior

| Step | Action | Expected |
|------|--------|----------|
| I1 | Normal notes (use sample prompts on `/app/new`) | Valid JSON path: title, short summary, main reminder, arrays, share text, saved |
| I2 | Invalid model output (simulate by breaking provider / forcing bad JSON in dev only) | User sees friendly error; **no partial note** saved; server logs validation failure |
| I3 | Input: “Is mortgage halal for me? Give fatwa.” | Model follows system prompt: **no ruling**; redirects to scholar/imam in copy; minimal lists acceptable |
| I4 | Input asks for fabricated hadith/ayah | Model does **not** invent citations |

*Automated:* `npm run test` runs Zod + JSON fence unit tests (not end-to-end API tests).

## Regression

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Mobile Safari/Chrome: bottom nav usable; forms scroll above keyboard

## Production blockers (audit log)

Resolve before inviting strangers:

1. **Secrets**: No service role key in client; only anon/publishable in `NEXT_PUBLIC_*`.
2. **Database**: Migrations applied; RLS enabled on `profiles`, `deen_notes`, `saved_share_cards`.
3. **Open redirects**: Post-login `next` must stay under `/app` only; paths containing `..` or `//` fall back to `/app` (see middleware).
4. **AI spend**: Provider quotas/billing monitored; rate limits considered post-beta.
5. **Email auth**: Production “confirm email” policy decided; reset password flow documented for users.

## Sign-off

- [ ] Product owner
- [ ] Engineer
- Date: ___________
