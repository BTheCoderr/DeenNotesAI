import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { ChapterVersesResponse } from "../api/types";

const INDEX_KEY = "deennotes.mobile.quran.offlineIndex.v1";

type IndexRow = {
  schemaVersion: 1;
  chapters: { chapterId: number; updatedAt: number }[];
};

export function offlineVersesFile(chapterId: number): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error("documentDirectory unavailable");
  return `${base}quran_offline/chapter_${chapterId}.json`;
}

async function readIndex(): Promise<IndexRow> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) return { schemaVersion: 1, chapters: [] };
    const o = JSON.parse(raw) as Partial<IndexRow>;
    if (!Array.isArray(o.chapters)) return { schemaVersion: 1, chapters: [] };
    return {
      schemaVersion: 1,
      chapters: o.chapters.filter((x) => x && typeof x.chapterId === "number"),
    };
  } catch {
    return { schemaVersion: 1, chapters: [] };
  }
}

async function writeIndex(next: IndexRow): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(next));
}

async function ensureDir(): Promise<void> {
  const base = FileSystem.documentDirectory;
  if (!base) return;
  const dir = `${base}quran_offline`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function trimIndexToMax(
  chapters: { chapterId: number; updatedAt: number }[],
  max: number,
): { chapterId: number; updatedAt: number }[] {
  const cap = Math.max(1, Math.min(32, max));
  return [...chapters].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, cap);
}

/** Persist chapter verses JSON for offline glance (LRU by last touch). */
export async function cacheChapterVersesResponse(
  chapterId: number,
  payload: ChapterVersesResponse,
  maxChapters: number,
): Promise<void> {
  if (!FileSystem.documentDirectory || !maxChapters) return;
  await ensureDir();
  const uri = offlineVersesFile(chapterId);
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const row = await readIndex();
  const without = row.chapters.filter((c) => c.chapterId !== chapterId);
  const nextList = trimIndexToMax(
    [{ chapterId, updatedAt: Date.now() }, ...without],
    maxChapters,
  );
  await writeIndex({ schemaVersion: 1, chapters: nextList });

  const keep = new Set(nextList.map((c) => c.chapterId));
  for (const c of without) {
    if (keep.has(c.chapterId)) continue;
    try {
      const p = offlineVersesFile(c.chapterId);
      const inf = await FileSystem.getInfoAsync(p);
      if (inf.exists) await FileSystem.deleteAsync(p, { idempotent: true });
    } catch {
      /* ignore */
    }
  }
}

export async function readCachedChapterVerses(
  chapterId: number,
): Promise<ChapterVersesResponse | null> {
  try {
    const uri = offlineVersesFile(chapterId);
    const inf = await FileSystem.getInfoAsync(uri);
    if (!inf.exists) return null;
    const raw = await FileSystem.readAsStringAsync(uri);
    const o = JSON.parse(raw) as ChapterVersesResponse;
    if (!o || !Array.isArray(o.verses)) return null;
    return o;
  } catch {
    return null;
  }
}

export function verseGlanceFromCache(
  ayah: number,
  data: ChapterVersesResponse | null,
): { arabic?: string; translation?: string } {
  if (!data?.verses?.length) return {};
  const v = data.verses.find((x) => x.verseNumber === ayah);
  if (!v) return {};
  const arabic = typeof v.textUthmani === "string" ? v.textUthmani.trim() : "";
  const trans = v.translations?.[0]?.text?.trim() ?? "";
  return {
    arabic: arabic || undefined,
    translation: trans || undefined,
  };
}
