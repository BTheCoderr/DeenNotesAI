import "server-only";

import { CHAPTER_VERSE_COUNTS } from "../chapter-verse-counts";
import type {
  ChapterDto,
  RecitationResourceDto,
  TafsirLineDto,
  TafsirResourceDto,
  TranslationLine,
  TranslationResourceDto,
  VerseAudioDto,
  VerseDto,
} from "../types";

const MOCK_AR = "مَوْك تَجْرِيبِيٌّ — لَا يَتَضَمَّنُ نَصًّا قُرْآنِيًّا حَقِيقِيًّا.";

/** Deterministic faux surah titles for scaffolding (not authoritative naming). */
const MOCK_NAME_SIMPLE = [
  "Al-Fatihah",
  "Al-Baqarah",
  "Ali 'Imran",
  "An-Nisa'",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra'",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya'",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara'",
  "An-Naml",
  "Al-Qasas",
  "Al-'Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba'",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadila",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saff",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba'",
  "An-Nazi'at",
  "'Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duha",
  "Ash-Sharh",
  "At-Tin",
  "Al-'Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-'Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-'Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

export function mockChaptersSorted(): ChapterDto[] {
  return CHAPTER_VERSE_COUNTS.map((versesCount, i) => {
    const id = i + 1;
    const makki = id <= 48 || [49, 62, 64, 77, 78, 79, 82, 84, 90, 92, 95, 97].includes(id);
    return {
      id,
      versesCount,
      revelationPlace: makki ? "makkah" : "madinah",
      revelationOrder: id,
      nameSimple: MOCK_NAME_SIMPLE[i] ?? `Surah ${id}`,
      nameArabic: "سُورَة",
      translatedName: "Mock dataset",
      transliteratedName: MOCK_NAME_SIMPLE[i] ?? `Surah_${id}`,
    };
  });
}

export function mockChapterById(chapterId: number): ChapterDto | null {
  if (chapterId < 1 || chapterId > 114) return null;
  return mockChaptersSorted()[chapterId - 1];
}

function translationLines(chapterId: number, verseNumber: number): TranslationLine[] {
  return [
    {
      text: `[Mock translation] Surah ${chapterId}, verse ${verseNumber}. Replace with Quran Foundation Content API.`,
      resourceId: 91001,
      resourceName: "Mock English",
      languageName: "english",
    },
  ];
}

function tafsirLines(chapterId: number, verseNumber: number): TafsirLineDto[] {
  return [
    {
      text:
        `[Mock tafsir preview] Ayah ${chapterId}:${verseNumber}. For education only—not scholarly tafsir. Request live credentials + QURAN_DEFAULT_TAFSIR_IDS.`,
      resourceId: 92001,
      resourceName: "Mock Tafsir",
    },
  ];
}

export function mockVerse(
  chapterId: number,
  verseNumber: number,
  includeTafsirInPayload = true,
): VerseDto {
  const key = `${chapterId}:${verseNumber}`;
  return {
    id: chapterId * 1000 + verseNumber,
    verseNumber,
    verseKey: key,
    chapterId,
    pageNumber: 1,
    juzNumber: 1,
    textUthmani: `${MOCK_AR} [${chapterId}:${verseNumber}]`,
    textImlaei: undefined,
    translations: translationLines(chapterId, verseNumber),
    tafsirs: includeTafsirInPayload
      ? tafsirLines(chapterId, verseNumber)
      : undefined,
  };
}

export function mockVersesForChapter(chapterId: number): VerseDto[] {
  const n = CHAPTER_VERSE_COUNTS[chapterId - 1];
  if (!n || chapterId < 1 || chapterId > 114) return [];
  const out: VerseDto[] = [];
  for (let v = 1; v <= n; v++) {
    out.push(mockVerse(chapterId, v));
  }
  return out;
}

export function mockTranslationResources(): TranslationResourceDto[] {
  return [
    {
      id: 91001,
      name: "Mock English Translation",
      authorName: "DeenNotes (mock)",
      languageName: "english",
      slug: "mock-en",
    },
  ];
}

export function mockTafsirResources(): TafsirResourceDto[] {
  return [
    {
      id: 92001,
      name: "Mock Tafsir Commentary",
      authorName: "DeenNotes (mock)",
      languageName: "english",
    },
  ];
}

export function mockRecitations(): RecitationResourceDto[] {
  return [
    { id: 7, reciterName: "Mock Reciter A", style: "Murattal" },
    { id: 8, reciterName: "Mock Reciter B", style: "Mujawwad" },
  ];
}

export function mockVerseAudio(
  chapter: number,
  ayah: number,
  reciterId: string,
): VerseAudioDto | null {
  const max = CHAPTER_VERSE_COUNTS[chapter - 1];
  if (!max || ayah < 1 || ayah > max || chapter < 1 || chapter > 114)
    return null;
  /* Deliberately inert placeholder — satisfies UI wiring without a real CDN. */
  return {
    verseKey: `${chapter}:${ayah}`,
    reciterId,
    audioUrl: `https://example.com/mock-quran/${reciterId}/${chapter}_${ayah}.mp3`,
    format: "mp3",
  };
}
