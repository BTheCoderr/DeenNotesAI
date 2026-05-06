# Quran Foundation + Netlify environment (production QA)

Server-only variables. **Never** prefix these with `NEXT_PUBLIC_`. Never commit real values to Git.

## Canonical credential names (recommended)

| Variable | Required for **live** Quran.com Content API |
|----------|---------------------------------------------|
| `QURAN_CLIENT_ID` | Yes (unless using mock — see below) |
| `QURAN_CLIENT_SECRET` | Yes |

**Aliases** (same semantics, checked after the canonical names):

- ID: `Client_ID`, `ClientID`, `CLIENT_ID`
- Secret: `Client_Secret`, `CLIENT_SECRET`

Scopes on Netlify should include **Build**, **Functions**, and **Runtime** so App Router server routes can read them.

## Mode A — **Production / live scripture**

1. Set **`QURAN_CLIENT_ID`** and **`QURAN_CLIENT_SECRET`** (or the aliases above).
2. Set **`MOCK_QURAN_API=false`** (or leave unset / not `true`).
3. Set **`QURAN_GRACEFUL_MOCK_FALLBACK=false`** if you want production to **never** serve scaffold text when credentials are missing (strict 503). If unset while credentials are absent, graceful scaffold is **on** by default.
4. Optional tuning (defaults exist in code / `.env.example`):

   - `QF_ENV=production`
   - `QURAN_GATEWAY_URL`, `QURAN_OAUTH_BASE_URL`, `QURAN_TOKEN_HOST` (only if Quran Foundation directs you away from SDK defaults)
   - `QURAN_DEFAULT_TRANSLATION_IDS`, `QURAN_DEFAULT_TAFSIR_IDS`, `QURAN_DEFAULT_RECITER_ID`

Health check (**no secrets** in body; hints omitted from JSON):

`GET /api/quran/health`

## Mode B — **Demo / scaffold (no OAuth)**

Use when credentials are **not** on Netlify yet.

1. **Either** `MOCK_QURAN_API=true` **or** omit OAuth and leave **`QURAN_GRACEFUL_MOCK_FALLBACK` unset** (defaults to scaffold when credentials are missing).
2. The reader labels **practice / placeholder** copy; scaffold Arabic explicitly states it is **not** manuscript Qur’an.

**Strict QA:** Set **`QURAN_GRACEFUL_MOCK_FALLBACK=false`** with **no** credentials and **no** `MOCK_QURAN_API=true` → scripture routes respond with **503** (`QURAN_BLOCKED`).

## Quick verification checklist

```bash
# Expect JSON schema deennotes.quran.health.v1 — booleans/modes/issue codes only
curl -sS https://<your-site>/api/quran/health | jq .

# Smoke (replace host)
curl -I https://<your-site>/app/quran
curl -I https://<your-site>/app/quran/1
curl -I https://<your-site>/app/quran/2/255
curl -I https://<your-site>/app/quran/search
curl -I https://<your-site>/app/quran/bookmarks
```
