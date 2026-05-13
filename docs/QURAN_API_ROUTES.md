# Quran API routes (`/api/quran/*`)

The Next.js app lives at the **repository root** (`package.json`, `next.config.*`, `src/app/`). Quran endpoints are **App Router** handlers under `src/app/api/quran/`.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/quran/chapters` | Surah index (normalized for mobile/web). |
| `GET` | `/api/quran/chapters/:id/verses` | Ayāt for surah `:id` (1–114). |
| `GET` | `/api/quran/audio` | Resolved CDN mp3 URL for one ayah. |
| `OPTIONS` | Same as above | CORS preflight (`204`, `Access-Control-*`). |

Serving priority (**chapters** & **audio**):

1. **`MOCK_QURAN_API=true`** → offline scaffold dataset (development / QA).
2. **Quran Foundation OAuth configured** (`QURAN_CLIENT_ID` + `QURAN_CLIENT_SECRET` or legacy alias env keys) → `@quranjs/api` Content API.
3. **Public Quran.com v4 bridge (default when OAuth absent)** → read-only **[Quran.com API v4](https://api.quran.com/api/v4/)** from the server (no OAuth).
4. If **`QURAN_DISABLE_PUBLIC_HTTP_BRIDGE=true`** and credentials are absent → graceful mock scaffold when **`QURAN_GRACEFUL_MOCK_FALLBACK`** is enabled, else **`503`** `QURAN_BLOCKED`.

**`/api/quran/chapters/:id/verses`:** Unless **`MOCK_QURAN_API=true`**, verses are fetched **only via Quran.com v4 HTTPS** (not `@quranjs/api`). This avoids OAuth/SDK payloads that lacked Arabic text. Primary source: **`/verses/by_chapter`** with **`per_page=50`** (max server allows) repeated through **`pagination.total_pages`**. If needed: merge **`GET /v4/quran/verses/uthmani?chapter_number=:id`** by `verse_key`, and **`GET /v4/quran/translations/:id?chapter_number=:id`** zipped by verse order for missing translation lines.

### Upstream verse route (HTTPS, base `https://api.quran.com/api/v4`)

| Step | Path |
|------|------|
| Primary (paginated) | `/verses/by_chapter/:id?language=en&words=false&fields=text_uthmani,text_imlaei,text_uthmani_simple,chapter_id&translations={id}&translation_fields=resource_name,language_name&per_page=50&page=N` |
| Arabic fallback | `/quran/verses/uthmani?chapter_number=:id` |
| Translation fallback | `/quran/translations/:resourceId?chapter_number=:id` |

### Other routes (HTTPS when public bridge applies)

| DeenNotes route | Quran.com v4 upstream |
|-----------------|----------------------|
| `GET /api/quran/chapters` | `GET /chapters` |
| `GET /api/quran/audio` | `GET /recitations/:reciterId/by_ayah/:verseKey` → path joined with **`https://verses.quran.com/`** |

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

# Expect 7 verses, chapterId 1, Arabic + ≥1 translation for 1:1
curl -sS "http://localhost:3000/api/quran/chapters/1/verses" | python3 -c "import json,sys; r=json.load(sys.stdin); v=r['verses'][0]; print(len(r['verses']), v['chapterId'], v['verseKey'], len(v.get('textUthmani','')), len(v.get('translations') or []))"

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
      "translations": [{ "text": "…", "resourceName": "M.A.S. Abdel Haleem", "resourceId": 85, "languageName": "english" }]
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
- `src/lib/quran/quranDotComPublicFetch.ts` (verse paging + Arabic/translation fallbacks)
- `src/lib/quran/quranDotComVerses.merge.ts` + **`quranDotComVerses.merge.test.ts`** (pure merge helpers — `npx vitest run src/lib/quran/quranDotComVerses.merge.test.ts`)
- `src/lib/quran/env.ts` (serving mode + `canServeQuranApiRoutes`)

## Risks

- **Quran.com availability / rate limits** — verse payloads depend on `api.quran.com` whenever **`MOCK_QURAN_API` is unset/false**.
- **Translation ZIP fallback** — `/quran/translations/:id?chapter_number=…` returns lines in ascending verse order with no verse key; mismatched lengths vs `/verses/by_chapter` would skip attaches (detected safely).
