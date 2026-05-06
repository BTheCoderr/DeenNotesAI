/** Serializable shapes for Quran API responses (avoid leaking SDK internals). */

export type Chapter = {
  id: number;
  versesCount: number;
  revelationPlace: string;
  revelationOrder?: number;
  nameSimple: string;
  nameArabic: string;
  translatedName?: string;
  transliteratedName?: string;
};

export type ChapterDto = Chapter;

export type TranslationLine = {
  text: string;
  resourceId?: number;
  resourceName?: string;
  languageName?: string;
};

export type TafsirLineDto = {
  text: string;
  resourceId?: number;
  resourceName?: string;
};

export type VerseDto = {
  id: number;
  verseNumber: number;
  verseKey: string;
  chapterId: number;
  pageNumber?: number;
  juzNumber?: number;
  textUthmani: string;
  textImlaei?: string;
  translations: TranslationLine[];
  tafsirs?: TafsirLineDto[];
};

export type QuranRef = {
  chapter: number;
  verse: number;
};

/** Content API — translation resource registry */
export type TranslationResourceDto = {
  id?: number;
  name?: string;
  authorName?: string;
  languageName?: string;
  slug?: string;
};

/** Content API — tafsir resource registry */
export type TafsirResourceDto = {
  id?: number;
  name?: string;
  authorName?: string;
  languageName?: string;
};

/** Content API — recitation style listing */
export type RecitationResourceDto = {
  id?: number;
  reciterName?: string;
  style?: string;
  translatedName?: string;
};

/** Public verse audio descriptor (CDN URL — no bearer token). */
export type VerseAudioDto = {
  verseKey: string;
  reciterId: string;
  audioUrl: string;
  format?: string;
};
