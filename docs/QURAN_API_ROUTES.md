# Quran API routes (`/api/quran/*`)

The Next.js app lives at the **repository root** (`package.json`, `next.config.*`, `src/app/`). Quran endpoints are **App Router** handlers under `src/app/api/quran/`.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/quran/chapters` | Surah index (normalized for mobile/web). |
| `GET` | `/api/quran/chapters/:id/verses` | Ayāt for surah `:id` (1–114). |
| `GET` | `/api/quran/audio` | Resolved CDN mp3 URL for one ayah. |
| `OPTIONS` | Same as above | CORS preflight (`204`, `Access-Control-*`). |

Serving priority (each route):

1. **`MOCK_QURAN_API=true`** → offline scaffold dataset (development / QA).
2. **Quran Foundation OAuth configured** (`QURAN_CLIENT_ID` + `QURAN_CLIENT_SECRET` or legacy alias env keys) → `@quranjs/api` Content API.
3. **Public bridge (default)** → read-only **[Quran.com API v4](https://api.quran.com/api/v4/)** from the server (no OAuth).
4. If **`QURAN_DISABLE_PUBLIC_HTTP_BRIDGE=true`** and credentials are absent → graceful mock scaffold when **`QURAN_GRACEFUL_MOCK_FALLBACK`** is enabled, else **`503`** `QURAN_BLOCKED`.

### Upstream (public bridge only)

| DeenNotes route | Quran.com v4 upstream |
|-----------------|----------------------|
| `GET /api/quran/chapters` | `GET https://api.quran.com/api/v4/chapters` |
| `GET /api/quran/chapters/:id/verses` | `GET https://api.quran.com/api/v4/verses/by_chapter/:id` with `language=en`, `words=false`, `per_page=300`, `fields=text_uthmani,text_imlaei`, `translations={id}` |
| `GET /api/quran/audio` | `GET https://api.quran.com/api/v4/recitations/:reciterId/by_ayah/:verseKey` → audio path joined to **`https://verses.quran.com/`** |

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `QURAN_PUBLIC_TRANSLATION_ID` | No | Quran.com translation **resource** id for the public verses bridge. Defaults to **`85`**. |
| `QURAN_DEFAULT_RECITER_ID` | No | Default reciter for `/api/quran/audio` when `reciter` is omitted. Defaults to **`7`**. |
| `QURAN_DISABLE_PUBLIC_HTTP_BRIDGE` | No | Set to `true` to disable Quran.com HTTP from the server (falls back to mock/blocked logic). |
| `QURAN_CLIENT_ID`, `QURAN_CLIENT_SECRET` | For OAuth path only | Quran Foundation Content API credentials. |

**Mobile (Expo / EAS):** no secrets required for Quran text. Ensure production builds expose only the public site origin:

- `EXPO_PUBLIC_NEXT_ORIGIN=https://deennotesai.netlify.app`

(Optionally mirror translation id client-side via `EXPO_PUBLIC_QURAN_PUBLIC_TRANSLATION_ID` for offline/public fallbacks inside the app — see `apps/mobile/src/services/quranFoundationClient.ts`.)

## Response envelope

Successful JSON bodies include a `_quran` meta field (`servingMode`, `offlineReflectionDataset`). Errors use `{ error, code, retryable, hint?, _quran }`. Upstream Quran.com failures are never passed through verbatim.

## Caching & CORS

- Responses include permissive **`Access-Control-Allow-Origin: *`** for `GET`/`OPTIONS`.
- Chapter and verse responses use short-to-medium CDN cache hints; audio uses **`no-store`**.

## Test locally

```bash
npm run dev
```

```bash
curl -sS "http://localhost:3000/api/quran/chapters" | head -c 600
curl -sS "http://localhost:3000/api/quran/chapters/1/verses" | head -c 800
curl -sS "http://localhost:3000/api/quran/audio?verseKey=1:1"
curl -sS "http://localhost:3000/api/quran/audio?chapter=1&verse=1&reciter=7"
```

## Test on Netlify

Replace the host with your deploy URL, for example:

```bash
curl -sS "https://deennotesai.netlify.app/api/quran/chapters" | head -c 400
curl -sS "https://deennotesai.netlify.app/api/quran/chapters/1/verses" | head -c 400
curl -sS "https://deennotesai.netlify.app/api/quran/audio?verseKey=1:1"
```

## Example success shapes

**Chapters** (each item includes `chapterNumber` equal to `id` for mobile convenience):

```json
{
  "chapters": [
    {
      "id": 1,
      "chapterNumber": 1,
      "versesCount": 7,
      "revelationPlace": "makkah",
      "nameSimple": "Al-Fatihah",
      "nameArabic": "الفاتحة"
    }
  ],
  "_quran": { "servingMode": "public_http", "offlineReflectionDataset": false }
}
```

**Verses:**

```json
{
  "verses": [
    {
      "id": 1,
      "verseNumber": 1,
      "verseKey": "1:1",
      "chapterId": 1,
      "textUthmani": "…",
      "textImlaei": "…",
      "translations": [{ "text": "…", "resourceName": "Translation", "resourceId": 85, "languageName": "english" }]
    }
  ],
  "_quran": { "servingMode": "public_http", "offlineReflectionDataset": false }
}
```

**Audio:**

```json
{
  "verseKey": "1:1",
  "reciterId": "7",
  "audioUrl": "https://verses.quran.com/Alafasy/mp3/001001.mp3",
  "format": "mp3",
  "_quran": { "servingMode": "public_http", "offlineReflectionDataset": false }
}
```

**Audio unavailable (404):**

```json
{
  "error": "Audio is temporarily unavailable for this verse.",
  "code": "QURAN_NOT_FOUND",
  "retryable": false,
  "_quran": { "servingMode": "public_http", "offlineReflectionDataset": false }
}
```

## Implementation files

- `src/app/api/quran/chapters/route.ts`
- `src/app/api/quran/chapters/[id]/verses/route.ts`
- `src/app/api/quran/audio/route.ts`
- `src/lib/quran/quranDotComPublicFetch.ts`
- `src/lib/quran/env.ts` (serving mode + `canServeQuranApiRoutes`)

## Risks

- **Quran.com availability / rate limits** — all public-bridge traffic depends on `api.quran.com` and `verses.quran.com`.
- **Long surahs** — verses are requested with `per_page=300` (sufficient for every surah today; if limits change, implement pagination).
- **Translation naming** — the public bridge sets a generic `resourceName` unless you switch to the OAuth-backed SDK path with full resource metadata.
