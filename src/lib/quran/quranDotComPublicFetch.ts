/**
 * Public Quran.com REST API v4 (no OAuth).
 * Used when DeenNotes is deployed without Quran Foundation client credentials
 * (e.g. Netlify) so mobile/web clients still receive real scripture + audio URLs.
 *
 * @see https://api.quran.com/api/v4/
 */
import "server-only";

import type { ChapterDto, TranslationLine, VerseAudioDto, VerseDto } from "./types";
import {
  indexUthmaniByVerseKey,
  zipChapterTranslationsOrdered,
  type TranslationRow as ZipTranslationRow,
} from "./quranDotComVerses.merge";
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
  resource_name?: string;
  language_name?: string;
  resourceName?: string;
  languageName?: string;
};

type DotComVerseRow = {
  id: number;
  verse_number: number;
  verse_key: string;
  chapter_id?: number;
  text_uthmani?: string | null;
  text_imlaei?: string | null;
  text_uthmani_simple?: string | null;
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

async function fetchJsonQuiet<T>(url: string): Promise<T | null> {
  try {
    return await fetchJson<T>(url);
  } catch {
    return null;
  }
}

function mapDotComTranslations(
  rows: DotComTranslationRow[] | null | undefined,
): TranslationLine[] {
  const out: TranslationLine[] = [];
  for (const t of rows ?? []) {
    const text = typeof t.text === "string" ? t.text.trim() : "";
    if (!text.length) continue;

    const resourceNameRaw =
      typeof t.resource_name === "string"
        ? t.resource_name.trim()
        : typeof t.resourceName === "string"
          ? t.resourceName.trim()
          : undefined;

    const languageNameRaw =
      typeof t.language_name === "string"
        ? t.language_name.trim()
        : typeof t.languageName === "string"
          ? t.languageName.trim()
          : undefined;

    out.push({
      text,
      resourceId: t.resource_id,
      resourceName: resourceNameRaw,
      languageName: languageNameRaw,
    });
  }
  return out;
}

/** Pages through `GET /verses/by_chapter/:id` (`per_page` max 50). */
async function fetchAllVersesByChapterPrimaryPaged(
  chapterId: number,
  translationId: number,
): Promise<DotComVerseRow[]> {
  const aggregated: DotComVerseRow[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const params = new URLSearchParams({
      language: "en",
      words: "false",
      fields:
        "text_uthmani,text_imlaei,text_uthmani_simple,chapter_id",
      page: String(page),
      per_page: "50",
      translations: String(translationId),
      translation_fields: "resource_name,language_name",
    });
    const url = `${QURAN_DOTCOM_API_V4}/verses/by_chapter/${chapterId}?${params.toString()}`;
    const raw = await fetchJson<{
      verses?: DotComVerseRow[];
      pagination?: { total_pages?: number };
    }>(url);

    const batch = raw.verses ?? [];
    if (page === 1 && batch.length === 0) {
      throw new Error("quran_dotcom_by_chapter_empty");
    }

    if (page === 1) {
      const tp = raw.pagination?.total_pages;
      totalPages = typeof tp === "number" && tp > 0 ? tp : 1;
    }

    aggregated.push(...batch);

    if (batch.length === 0) break;

    page += 1;
  }

  return aggregated;
}

async function fetchUthmaniTextByVerseKey(
  chapterRouteId: number,
): Promise<Map<string, string>> {
  const url = `${QURAN_DOTCOM_API_V4}/quran/verses/uthmani?chapter_number=${chapterRouteId}`;
  const raw = await fetchJsonQuiet<{
    verses?: { verse_key?: string | null; text_uthmani?: string | null }[];
  }>(url);

  const m = indexUthmaniByVerseKey(raw?.verses ?? []);
  const plain = new Map<string, string>();
  for (const [k, r] of m) {
    const t =
      typeof r.text_uthmani === "string" ? r.text_uthmani.trim() : "";
    if (t.length > 0) plain.set(k, t);
  }
  return plain;
}

async function fetchTranslationChapterFallback(
  chapterRouteId: number,
  translationId: number,
): Promise<{ rows: ZipTranslationRow[]; resourceLabel?: string } | null> {
  const url = `${QURAN_DOTCOM_API_V4}/quran/translations/${translationId}?chapter_number=${chapterRouteId}`;
  const raw = await fetchJsonQuiet<{
    translations?: ZipTranslationRow[];
    meta?: { translation_name?: string };
  }>(url);
  const transRows = raw?.translations ?? null;
  if (!transRows?.length) return null;
  const resourceLabel =
    typeof raw?.meta?.translation_name === "string"
      ? raw.meta.translation_name.trim()
      : undefined;
  return { rows: transRows, resourceLabel };
}

function verseDtoFromDotComRow(
  v: DotComVerseRow,
  routeChapterId: number,
): VerseDto {
  const chapterResolved =
    typeof v.chapter_id === "number" &&
    Number.isFinite(v.chapter_id) &&
    v.chapter_id >= 1 &&
    v.chapter_id <= 114
      ? v.chapter_id
      : routeChapterId;

  let uth =
    typeof v.text_uthmani === "string" && v.text_uthmani.trim()
      ? v.text_uthmani.trim()
      : "";

  if (
    !uth.length &&
    typeof v.text_imlaei === "string" &&
    v.text_imlaei.trim()
  ) {
    uth = v.text_imlaei.trim();
  }

  if (
    !uth.length &&
    typeof v.text_uthmani_simple === "string" &&
    v.text_uthmani_simple.trim()
  ) {
    uth = v.text_uthmani_simple.trim();
  }

  return {
    id: v.id,
    verseNumber: v.verse_number,
    verseKey: typeof v.verse_key === "string" ? v.verse_key.trim() : "",
    chapterId: chapterResolved,
    pageNumber:
      typeof v.page_number === "number" ? v.page_number : undefined,
    juzNumber:
      typeof v.juz_number === "number" ? v.juz_number : undefined,
    textUthmani: uth,
    textImlaei:
      typeof v.text_imlaei === "string" && v.text_imlaei.trim()
        ? v.text_imlaei.trim()
        : undefined,
    translations: mapDotComTranslations(v.translations),
  };
}

function applyUthmaniOverlay(
  verses: VerseDto[],
  byKey: Map<string, string>,
): void {
  for (const verse of verses) {
    if (verse.textUthmani.trim().length > 0) continue;
    const vk = verse.verseKey.trim();
    const t = vk.length ? byKey.get(vk) : undefined;
    if (typeof t === "string" && t.trim().length > 0) {
      verse.textUthmani = t.trim();
    }
  }
}

function applyTranslationFallback(
  verses: VerseDto[],
  bundle: { rows: ZipTranslationRow[]; resourceLabel?: string },
): void {
  const sorted = [...verses].sort((a, b) => a.verseNumber - b.verseNumber);
  const verseNums = sorted.map((v) => v.verseNumber);
  const mapByNum = zipChapterTranslationsOrdered(
    verseNums,
    bundle.rows,
  );

  for (const verse of verses) {
    if (verse.translations.length > 0) continue;
    const row = mapByNum.get(verse.verseNumber);
    if (!row) continue;
    const txt = typeof row.text === "string" ? row.text.trim() : "";
    if (!txt.length) continue;

    verse.translations.push({
      text: txt,
      resourceId: row.resource_id ?? undefined,
      resourceName: bundle.resourceLabel ?? "Translation",
      languageName: "english",
    });
  }
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

/**
 * Verses for one surah via Quran.com v4 (`/verses/by_chapter`).
 * Uses `per_page=50`, follows `pagination.total_pages`, and falls back to
 * `/quran/verses/uthmani` and `/quran/translations/:id` when text or translations are missing.
 */
export async function fetchVersesForChapterFromQuranDotComHttp(
  chapterId: number,
  translationId: number = resolvePublicTranslationIdForHttp(),
): Promise<VerseDto[]> {
  const rows = await fetchAllVersesByChapterPrimaryPaged(
    chapterId,
    translationId,
  );

  const verses = rows.map((v) =>
    verseDtoFromDotComRow(v, chapterId),
  );

  verses.sort((a, b) => a.verseNumber - b.verseNumber);
  if (!verses.length) {
    throw new Error("quran_dotcom_verses_empty");
  }

  const needsUthmani = verses.some((v) => !v.textUthmani.trim().length);
  if (needsUthmani) {
    const overlay = await fetchUthmaniTextByVerseKey(chapterId);
    applyUthmaniOverlay(verses, overlay);
  }

  const needsTranslation = verses.some((v) => v.translations.length === 0);
  if (needsTranslation) {
    const bundle = await fetchTranslationChapterFallback(
      chapterId,
      translationId,
    );
    if (bundle) {
      applyTranslationFallback(verses, bundle);
    }
  }

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
