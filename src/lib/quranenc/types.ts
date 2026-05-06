/**
 * QuranEnc API DTOs — shapes follow https://quranenc.com/en/home/api
 * Do not programmatically mutate `translation` or `footnotes` payloads.
 */

/** GET /api/v1/translations/list/... entry */
export type QuranEncTranslationListItemDto = {
  key: string;
  language_iso_code: string;
  version?: string | null;
  last_update?: string | number | null;
  title?: string | null;
  description?: string | null;
};

/** QuranEnc catalog entries grouped by `language_iso_code` (server-derived). */
export type QuranEncLanguageGroupDto = {
  languageIso: string;
  languageLabel: string;
  translations: QuranEncTranslationListItemDto[];
};

/** Single ayah translation line from sura / aya endpoints */
export type QuranEncAyaTranslationDto = {
  sura: number;
  aya: number;
  translation: string;
  footnotes?: string | null;
};

/** Sura bulk response mirrors array of verse rows */
export type QuranEncSuraTranslationPayloadDto = QuranEncAyaTranslationDto[];

/** Server → client verse overlay (attached beside Quran Foundation verses) */
export type QuranEncVerseOverlayPayloadDto = {
  translationKey: string;
  translationTitle?: string | null;
  translationVersion?: string | null;
  languageIso?: string | null;
  verses: QuranEncAyaTranslationDto[];
};

/** Audio URL resolver output (CDN is public MP3 — no bearer). */
export type QuranEncAudioResolveDto = {
  audioUrl: string;
  translationKey: string;
  sura: number;
  aya: number;
  contentType?: "audio/mpeg";
  /** True when an MP3 URL is present (mock / blocked builds may omit). */
  available?: boolean;
  /** Helps clients satisfy attribution without additional round-trips */
  attributionLine: typeof QURANENC_ATTRIBUTION_LINE;
};

/** Short legal line — expand in UI/footer with Terms link */
export const QURANENC_ATTRIBUTION_LINE =
  'Translation content and audio courtesy of QuranEnc (“Encyclopedia of the Noble Qur’an”).';

export const QURANENC_TERMS_URL = "https://quranenc.com/terms";
export const QURANENC_HOME_URL = "https://quranenc.com";
