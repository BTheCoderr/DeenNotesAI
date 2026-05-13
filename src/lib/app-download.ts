/** Mobile app outbound links — safe for Client or Server Components. */

export const SEARCH_INTERIM_FALLBACK_URL =
  "https://apps.apple.com/search?term=DeenNotes+AI" as const;

/**
 * Set `NEXT_PUBLIC_APP_STORE_URL` to your canonical `/us/app/...` permalink (recommended).
 *
 * `@todo(APP_STORE_CONNECT)` Replace `SEARCH_INTERIM_FALLBACK_URL` with permanent URL
 * once listed, **or** keep using env only (`NEXT_PUBLIC_APP_STORE_URL`).
 *
 * Sentinel for repo-wide search until permalink exists:
 */
export const APP_STORE_URL =
  typeof process.env.NEXT_PUBLIC_APP_STORE_URL === "string" &&
  /^https?:\/\//i.test(process.env.NEXT_PUBLIC_APP_STORE_URL.trim())
    ? process.env.NEXT_PUBLIC_APP_STORE_URL.trim()
    : SEARCH_INTERIM_FALLBACK_URL;

/** Same as legacy TODO placeholder — informational only; effective href is {@link APP_STORE_URL}. */
export const APP_STORE_URL_TODO_REPLACE =
  "TODO_REPLACE_WITH_CANONICAL_APP_STORE_PERMALINK" as const;
