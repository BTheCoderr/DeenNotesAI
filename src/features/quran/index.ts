/**
 * Quran feature surface — import screens & shared UI for web; same paths can be
 * re-used from a future Expo package by aliasing `@/features/quran`.
 */

export { QuranAyahSheet } from "./components/QuranAyahSheet";
export { QuranReferencePills } from "./components/QuranReferencePills";
export { SurahListScreen } from "./screens/SurahListScreen";
export { SurahReaderScreen } from "./screens/SurahReaderScreen";
export { QuranBookmarksScreen } from "./screens/QuranBookmarksScreen";

export {
  useQuranChapters,
  useQuranChapterMeta,
  useQuranVerses,
  useTranslationCatalog,
} from "./hooks/useQuranData";

export type { QuranAyahSheetProps } from "./components/QuranAyahSheet";
export type { QuranAudioTarget } from "./components/QuranStickyPlayer";
