# Before you say “done” (ship to Netlify)

Netlify builds from **GitHub `origin/main`** (or whichever branch the site is pinned to). Changes that only exist on your laptop **never** reach production until they are committed and pushed.

Use this checklist every time you finish a meaningful change.

## 1. Local verification

```bash
git status
npm run lint
npm run build
```

Fix any errors. Ensure `git status` shows only what you intend to ship (review diffs).

## 2. Commit and push

```bash
git add .
git commit -m "describe what changed"
git push origin main
```

Use a branch + PR workflow if your team prefers; the important part is that **Netlify’s build branch matches the commit you expect**.

## 3. Confirm Netlify picked up the commit

In **Netlify → Deploys**: the latest deploy should show the **same commit** as GitHub (`main`). If it doesn’t match, check branch settings or trigger a deploy.

## 4. Route health (production)

Expect **`HTTP/2 200`** (or `HTTP/2 307`/`302` to `/login` for protected routes when checking without cookies—not a silent 404):

```bash
curl -I https://deennotesai.netlify.app/app/onboarding
curl -I https://deennotesai.netlify.app/app
curl -I https://deennotesai.netlify.app/app/new
curl -I https://deennotesai.netlify.app/app/notes
curl -I https://deennotesai.netlify.app/app/settings
curl -I https://deennotesai.netlify.app/app/faq
curl -I https://deennotesai.netlify.app/app/quran
curl -I https://deennotesai.netlify.app/app/quran/2
```

After enabling the Qur’an reader, set **`QURAN_CLIENT_ID`**, **`QURAN_CLIENT_SECRET`**, optional **`QURAN_DEFAULT_TRANSLATION_IDS`**, **`QURAN_DEFAULT_TAFSIR_IDS`**, and **`QURAN_DEFAULT_RECITER_ID`** in Netlify (**server** context). Run Supabase migration **`004_deen_notes_quran_refs.sql`** so new notes can store **`quran_refs`**.

## 5. Browser smoke check

Open [Production onboarding](https://deennotesai.netlify.app/app/onboarding) signed in.

If the UI feels **stale** after a deploy:

1. Netlify → **Deploys → Clear cache and deploy site**
2. Hard refresh Chrome (Shift+reload) or disable cache in DevTools

## Why this matters

A common failure mode is **Phase 1 (or any feature) implemented locally but left untracked or uncommitted**. The route table looks fine on `npm run build`, but production still 404s because Netlify never received those files.
