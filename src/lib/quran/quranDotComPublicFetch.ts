/**
 * Public Quran.com REST API v4 (no OAuth).
 * Used when DeenNotes is deployed without Quran Foundation client credentials
 * (e.g. Netlify) so mobile/web clients still receive real scripture + audio URLs.
 *
 * @see https://api.quran.com/api/v4/
 */
import "server-only";

import type { ChapterDto, VerseAudioDto, VerseDto } from "./types";
import { parseVerseKeyString } from "./verses";

export const QURAN_DOTCOM_API_V4 = "https://api.quran.com/api/v4";
export const QURAN_DOTCOM_VERSES_CDN_BASE = "https://verses.quran.com/";

export function resolvePublicTranslationIdForHttp(): number {
  const raw = process.env.QURAN_PUBLIC_TRANSLATION_ID?.trim();
  if (!raw) return 85;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 85;
}

type DotComChapterRow = {
  id: number;
  revelation_place?: string;
  revelation_order?: number;
  name_simple?: string;
  name_arabic?: string;
  verses_count?: number;
  translated_name?: { name?: string };
};

type DotComTranslationRow = {
  resource_id?: number;
  text?: string;
};

type DotComVerseRow = {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani?: string | null;
  text_imlaei?: string | null;
  page_number?: number;
  juz_number?: number;
  translations?: DotComTranslationRow[] | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`quran_dotcom_http_${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** List chapters (114) from api.quran.com/v4/chapters → ChapterDto[] */
export async function fetchChaptersFromQuranDotComHttp(): Promise<ChapterDto[]> {
  const url = `${QURAN_DOTCOM_API_V4}/chapters`;
  const raw = await fetchJson<{ chapters?: DotComChapterRow[] }>(url);
  const rows = raw.chapters ?? [];
  const out: ChapterDto[] = [];
  for (const c of rows) {
    if (
      typeof c.id !== "number" ||
      typeof c.name_simple !== "string" ||
      typeof c.name_arabic !== "string" ||
      typeof c.verses_count !== "number"
    ) {
      continue;
    }
    out.push({
      id: c.id,
      versesCount: c.verses_count,
      revelationPlace:
        typeof c.revelation_place === "string"
          ? c.revelation_place.toLowerCase()
          : "unknown",
      revelationOrder:
        typeof c.revelation_order === "number" ? c.revelation_order : undefined,
      nameSimple: c.name_simple,
      nameArabic: c.name_arabic,
      translatedName:
        typeof c.translated_name?.name === "string"
          ? c.translated_name.name.trim()
          : undefined,
      transliteratedName: undefined,
    });
  }
  out.sort((a, b) => a.id - b.id);
  if (out.length < 1) throw new Error("quran_dotcom_chapters_empty");
  return out;
}

/** Verses for one surah; `translationId` is Quran.com translation resource id. */
export async function fetchVersesForChapterFromQuranDotComHttp(
  chapterId: number,
  translationId: number = resolvePublicTranslationIdForHttp(),
): Promise<VerseDto[]> {
  const params = new URLSearchParams({
    language: "en",
    words: "false",
    per_page: "300",
    page: "1",
    fields: "text_uthmani,text_imlaei",
    translations: String(translationId),
  });
  const url = `${QURAN_DOTCOM_API_V4}/verses/by_chapter/${chapterId}?${params.toString()}`;
  const raw = await fetchJson<{ verses?: DotComVerseRow[] }>(url);
  const rows = raw.verses ?? [];
  const verses: VerseDto[] = rows.map((v) => {
    const first = v.translations?.[0];
    const translations =
      typeof first?.text === "string" && first.text.trim()
        ? [
            {
              text: first.text.trim(),
              resourceId: first.resource_id,
              resourceName: "Translation",
              languageName: "english",
            },
          ]
        : [];

    const uth =
      typeof v.text_uthmani === "string" && v.text_uthmani.trim()
        ? v.text_uthmani.trim()
        : typeof v.text_imlaei === "string" && v.text_imlaei.trim()
          ? v.text_imlaei.trim()
          : "";

    return {
      id: v.id,
      verseNumber: v.verse_number,
      verseKey: v.verse_key,
      chapterId,
      pageNumber:
        typeof v.page_number === "number" ? v.page_number : undefined,
      juzNumber:
        typeof v.juz_number === "number" ? v.juz_number : undefined,
      textUthmani: uth,
      textImlaei:
        typeof v.text_imlaei === "string" && v.text_imlaei.trim()
          ? v.text_imlaei.trim()
          : undefined,
      translations,
    };
  });

  verses.sort((a, b) => a.verseNumber - b.verseNumber);
  if (!verses.length) throw new Error("quran_dotcom_verses_empty");
  return verses;
}

/**
 * Resolve `verse_key` (e.g. 1:1) + recitation id → CDN mp3 URL on verses.quran.com.
 */
export async function fetchVerseAudioFromQuranDotComHttp(
  verseKey: string,
  reciterId: string,
): Promise<VerseAudioDto | null> {
  const trimmed = verseKey.trim();
  const encoded = encodeURIComponent(trimmed);
  const url = `${QURAN_DOTCOM_API_V4}/recitations/${encodeURIComponent(reciterId)}/by_ayah/${encoded}`;
  let raw: { audio_files?: { verse_key?: string; url?: string }[] };
  try {
    raw = await fetchJson<typeof raw>(url);
  } catch {
    return null;
  }
  const row = raw.audio_files?.find(
    (a) =>
      typeof a?.url === "string" &&
      a.url.length > 0 &&
      typeof a.verse_key === "string",
  );
  const rel = row?.url;
  if (!rel) return null;

  const path = rel.replace(/^\/+/, "");
  const audioUrl = `${QURAN_DOTCOM_VERSES_CDN_BASE}${path}`;

  return {
    verseKey: trimmed,
    reciterId,
    audioUrl,
    format: path.toLowerCase().endsWith(".mp3") ? "mp3" : undefined,
  };
}

/** Normalize audio query from surah/ayah aliases + verseKey. */
export function parseAudioQuery(searchParams: URLSearchParams): {
  verseKey: string | null;
  reciterId: string;
} {
  const verseKeyRaw = searchParams.get("verseKey")?.trim();
  if (verseKeyRaw) {
    const vk = verseKeyRaw;
    const reciter =
      searchParams.get("reciter")?.trim() ||
      process.env.QURAN_DEFAULT_RECITER_ID?.trim() ||
      "7";
    return { verseKey: vk.replace(/_/g, ":"), reciterId: reciter };
  }

  const surah = Number(
    searchParams.get("surah") ?? searchParams.get("chapter"),
  );
  const ayah = Number(
    searchParams.get("ayah") ?? searchParams.get("verse"),
  );
  const reciter =
    searchParams.get("reciter")?.trim() ||
    process.env.QURAN_DEFAULT_RECITER_ID?.trim() ||
    "7";

  const parsed =
    Number.isFinite(surah) && Number.isFinite(ayah)
      ? parseVerseKeyString(`${surah}:${ayah}`)
      : null;
  if (!parsed) return { verseKey: null, reciterId: reciter };
  return {
    verseKey: `${parsed.chapter}:${parsed.ayah}`,
    reciterId: reciter,
  };
}

export type QuranMobileRouteCacheMode = "long" | "short" | "none";

/** CORS-safe defaults for RN / Expo and short edge caching on public bridge. */
export function quranMobilePublicRouteHeaders(
  mode: QuranMobileRouteCacheMode,
): HeadersInit {
  const cors: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  switch (mode) {
    case "long":
      return {
        ...cors,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      };
    case "short":
      return {
        ...cors,
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=7200",
      };
    default:
      return {
        ...cors,
        "Cache-Control": "no-store",
      };
  }
}
