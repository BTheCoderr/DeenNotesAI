import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Chapter, QuranPublicApiMeta } from "../api/types";

const KEY = "deennotes.mobile.quran.chaptersSnapshot.v1";

type SnapshotV1 = {
  schemaVersion: 1;
  updatedAt: number;
  chapters: Chapter[];
  meta: QuranPublicApiMeta | null;
};

export type ChaptersPayload = {
  chapters: Chapter[];
  meta: QuranPublicApiMeta | null;
};

export async function readChaptersSnapshot(): Promise<SnapshotV1 | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SnapshotV1>;
    if (o.schemaVersion !== 1 || !Array.isArray(o.chapters)) return null;
    return {
      schemaVersion: 1,
      updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : 0,
      chapters: o.chapters as Chapter[],
      meta:
        o.meta && typeof (o.meta as QuranPublicApiMeta).servingMode === "string"
          ? (o.meta as QuranPublicApiMeta)
          : null,
    };
  } catch {
    return null;
  }
}

export async function writeChaptersSnapshot(payload: ChaptersPayload): Promise<void> {
  const row: SnapshotV1 = {
    schemaVersion: 1,
    updatedAt: Date.now(),
    chapters: payload.chapters,
    meta: payload.meta,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(row));
}
