# Auth production QA (Supabase + Next.js on Netlify)

Use this checklist to separate **credential errors** (wrong email/password, unconfirmed user) from **session / routing issues** (middleware, cookies, wrong project URL).

## Environment parity

- [ ] **Netlify** `NEXT_PUBLIC_SUPABASE_URL` matches the **Supabase project** you use in the dashboard (Project Settings → API → Project URL).
- [ ] **Netlify** has **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** and/or **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** set to that same project’s **anon / publishable** key (not `service_role`).
- [ ] After changing any `NEXT_PUBLIC_*` variable, trigger a **new deploy** (prefer **Clear cache and deploy**). These values are inlined at build time.
- [ ] Local `.env` (if used) targets the **same project** you expect in production when comparing behavior.

## Fresh user (signup path)

- [ ] Open production `/signup`, create a **new** user with a **known** email and password (e.g. a test alias).
- [ ] In **Supabase Dashboard → Authentication → Users**, confirm the user appears for the **same project** as your env URL.
- [ ] Check **email confirmation**:
  - If **Confirm email** is enabled: user may be **unconfirmed** until they click the link; unconfirmed users can get sign-in errors depending on project settings.
  - If testing quickly, use a confirmed user or disable confirmation in Auth settings for a dev/staging project only.

## Login (password)

- [ ] Open `/login`, sign in with the **exact** email and password for an existing, **confirmed** user.
- [ ] **Invalid login credentials** almost always means: wrong password, wrong email, user does not exist in **this** project, or user not confirmed (policy-dependent)—not a Next.js routing bug.
- [ ] In **development**, failed login logs `[deennotes login]` with `name`, `message`, and `status` (no passwords or tokens).

## Post-login navigation

- [ ] After success, you should land on a path under `/app` (default `/app`, or `?next=` only if it is a safe `/app/...` path).
- [ ] Hit **refresh** on `/app`, `/app/notes`, and `/app/settings`; you should stay signed in (cookies + middleware refresh).

## Protected routes and settings

- [ ] **`/app/settings`**: Same Supabase server client and middleware as other `/app/*` routes; unauthenticated users are sent to `/login?next=/app/settings`.
- [ ] Bottom nav **Settings** link must be `/app/settings` (not `/login`).

## Logout

- [ ] From Settings, **Sign out**; confirm `/app` routes redirect to login when signed out.
- [ ] Confirm you can sign in again with the same user.

## Callback route scope

- [ ] **`GET /auth/callback`** only runs when Supabase redirects with **`code`** (OAuth, magic link, email confirmation with PKCE). It calls `exchangeCodeForSession` and redirects to a **safe** path under `/app`.
- [ ] **Email + password** login does **not** use `/auth/callback`; it uses `signInWithPassword` in the browser. Callback issues do not explain password-only login failures.

## Splitting failure modes

| Symptom | Likely cause |
|--------|----------------|
| Red **Invalid login credentials** on `/login` | Wrong email/password, user missing in project, or confirmation/policy |
| Redirect to `/login` from `/app/*` while browsing | No or expired session cookie; middleware; env/project mismatch after redeploy |
| Works for one email, fails for another | Different accounts or one user not in this Supabase project |

## Reference (code)

- Browser client: `createBrowserClient` + `getSupabaseBrowserConfig()` in [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) and [`src/lib/supabase/env.ts`](../src/lib/supabase/env.ts).
- Login: [`src/components/auth/LoginForm.tsx`](../src/components/auth/LoginForm.tsx) — `signInWithPassword({ email, password })`.
- Signup: [`src/components/auth/SignupForm.tsx`](../src/components/auth/SignupForm.tsx) — `signUp` with `emailRedirectTo` → `/auth/callback`.
- Session refresh: [`src/lib/supabase/middleware.ts`](../src/lib/supabase/middleware.ts) with `@supabase/ssr` `createServerClient`.
- Callback: [`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts).
