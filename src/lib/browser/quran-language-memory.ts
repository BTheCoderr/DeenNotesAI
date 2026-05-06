import {
  readPreferredQuranEncTranslationKey,
  writePreferredQuranEncTranslationKey,
} from "@/lib/browser/quranenc-preference";

/** Last-opened language section in the QuranEnc selector (ISO-ish code). */
const EXPANDED_LANG_KEY = "deennotes.quran.translation_selector.expanded_lang_iso";

/** Serialized queue of future offline language packs (payload keys). */
const PACK_QUEUE_KEY = "deennotes.quran.language_pack_queue_v1";

/** When true, translation narration uses the same QuranEnc row as the verse overlay. */
const LISTEN_MIRRORS_KEY = "deennotes.quran.listen_mirrors_translation";

export type QueuedLanguagePack = {
  translationKey: string;
  languageIso?: string;
  queuedAt: string;
};

/** Primary multilingual meaning line — backed by QuranEnc `translation_key`. */
export function readPreferredQuranTranslationKey(): string | undefined {
  return readPreferredQuranEncTranslationKey();
}

export function writePreferredQuranTranslationKey(key: string | null) {
  writePreferredQuranEncTranslationKey(key);
}

/** QuranEnc translation audio follows `readPreferredQuranTranslationKey` when true. */
export function readListenMirrorsTranslationPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(LISTEN_MIRRORS_KEY);
    if (v === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export function writeListenMirrorsTranslationPreference(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) localStorage.removeItem(LISTEN_MIRRORS_KEY);
    else localStorage.setItem(LISTEN_MIRRORS_KEY, "0");
  } catch {
    /* ignore */
  }
}

export function readTranslationSelectorExpandedLang(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = localStorage.getItem(EXPANDED_LANG_KEY)?.trim().toLowerCase();
    return v?.length ? v : undefined;
  } catch {
    return undefined;
  }
}

export function writeTranslationSelectorExpandedLang(iso: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!iso?.trim()) localStorage.removeItem(EXPANDED_LANG_KEY);
    else localStorage.setItem(EXPANDED_LANG_KEY, iso.trim().toLowerCase());
  } catch {
    /* ignore */
  }
}

export function readLanguagePackQueue(): QueuedLanguagePack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PACK_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) =>
        row && typeof row === "object"
          ? (row as Partial<QueuedLanguagePack>)
          : null,
      )
      .filter(
        (
          row,
        ): row is QueuedLanguagePack =>
          !!row?.translationKey &&
          typeof row.translationKey === "string" &&
          typeof row.queuedAt === "string",
      )
      .slice(0, 32);
  } catch {
    return [];
  }
}

function persistQueue(entries: QueuedLanguagePack[]) {
  if (typeof window === "undefined") return;
  try {
    if (!entries.length) localStorage.removeItem(PACK_QUEUE_KEY);
    else localStorage.setItem(PACK_QUEUE_KEY, JSON.stringify(entries.slice(0, 32)));
  } catch {
    /* ignore */
  }
}

/** Placeholder for a future downloader — stores user intent locally (Expo + web parity). */
export function queueLanguagePackDownload(
  translationKey: string,
  languageIso?: string,
) {
  const k = translationKey.trim().toLowerCase();
  if (!k) return;
  const cur = readLanguagePackQueue().filter((e) => e.translationKey !== k);
  cur.push({
    translationKey: k,
    languageIso: languageIso?.trim().toLowerCase(),
    queuedAt: new Date().toISOString(),
  });
  persistQueue(cur);
}

export function dequeueLanguagePack(translationKey: string) {
  const k = translationKey.trim().toLowerCase();
  const cur = readLanguagePackQueue().filter((e) => e.translationKey !== k);
  persistQueue(cur);
}
