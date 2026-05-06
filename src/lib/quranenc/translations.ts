import "server-only";

import type {
  QuranEncSuraTranslationPayloadDto,
  QuranEncTranslationListItemDto,
  QuranEncVerseOverlayPayloadDto,
} from "./types";
import { isMockQuranEncMode } from "./config";
import { assertSafeTranslationKey, fetchQuranEncJson } from "./client";

const MOCK_TRANSLATIONS: QuranEncTranslationListItemDto[] = [
  {
    key: "english_saheeh",
    language_iso_code: "en",
    version: "mock",
    title: "Saheeh International (mock)",
    description: "Flip MOCK_QURANENC_API to reach live QuranEnc.",
  },
  {
    key: "arabic_muyassar",
    language_iso_code: "ar",
    version: "mock",
    title: "Arabic — Muyassar (mock row)",
    description: "Demonstrates multilingual grouping.",
  },
  {
    key: "urdu_jalandhry",
    language_iso_code: "ur",
    version: "mock",
    title: "Urdu Jalandhry (mock)",
    description: "Second language group in mock builds.",
  },
];

function dedupeTranslationsByKey(
  rows: QuranEncTranslationListItemDto[],
): QuranEncTranslationListItemDto[] {
  const m = new Map<string, QuranEncTranslationListItemDto>();
  for (const row of rows) {
    const k = row.key.trim().toLowerCase();
    if (!m.has(k)) m.set(k, row);
  }
  return [...m.values()];
}

/**
 * QuranEnc translation catalog — full list when `language` omitted.
 * Deduped by `key`; responses are ISR-friendly via callers’ `fetch`/`revalidate`.
 */
export async function fetchQuranEncTranslationList(params: {
  language?: string | null;
  localization?: string | null;
}): Promise<QuranEncTranslationListItemDto[]> {
  if (isMockQuranEncMode()) {
    let list = [...MOCK_TRANSLATIONS];
    const lang = params.language?.trim().toLowerCase();
    if (lang) {
      list = list.filter((t) => t.language_iso_code === lang);
    }
    return dedupeTranslationsByKey(list);
  }

  const loc = params.localization?.trim().toLowerCase() || "en";
  const pathSeg = params.language?.trim()
    ? `/api/v1/translations/list/${encodeURIComponent(params.language.trim())}?localization=${encodeURIComponent(loc)}`
    : `/api/v1/translations/list/?localization=${encodeURIComponent(loc)}`;

  const raw = await fetchQuranEncJson<QuranEncTranslationListItemDto[]>(
    pathSeg,
    {
      next: { revalidate: 86_400 },
    },
  );
  const arr = Array.isArray(raw) ? raw : [];
  return dedupeTranslationsByKey(arr);
}

/** Convenience: entire multilingual catalog with default UI localization facet. */
export async function fetchQuranEncAllTranslations(
  localization?: string | null,
): Promise<QuranEncTranslationListItemDto[]> {
  return fetchQuranEncTranslationList({
    language: null,
    localization,
  });
}

export async function fetchQuranEncSuraTranslation(params: {
  translationKey: string;
  sura: number;
}): Promise<QuranEncVerseOverlayPayloadDto> {
  const safeKey = assertSafeTranslationKey(params.translationKey);
  const sura = params.sura;
  if (!Number.isInteger(sura) || sura < 1 || sura > 114) {
    throw new Error("Invalid sura");
  }

  if (isMockQuranEncMode()) {
    const meta = MOCK_TRANSLATIONS.find((t) => t.key === safeKey) ?? MOCK_TRANSLATIONS[0];
    const cap = Math.min(sura === 1 ? 7 : 5, 12);
    const verses: QuranEncSuraTranslationPayloadDto = [];
    for (let aya = 1; aya <= cap; aya += 1) {
      verses.push({
        sura,
        aya,
        translation: `[QuranEnc mock · ${safeKey}] Surah ${sura}:${aya}`,
        footnotes: null,
      });
    }
    return {
      translationKey: safeKey,
      translationTitle: meta?.title ?? safeKey,
      translationVersion: meta?.version ?? "mock",
      languageIso: meta?.language_iso_code ?? "en",
      verses,
    };
  }

  const path = `/api/v1/translation/sura/${safeKey}/${sura}`;
  const raw = await fetchQuranEncJson<QuranEncSuraTranslationPayloadDto>(path, {
    next: { revalidate: 3600 },
  });

  return {
    translationKey: safeKey,
    translationTitle: null,
    translationVersion: null,
    languageIso: null,
    verses: Array.isArray(raw) ? raw : [],
  };
}
