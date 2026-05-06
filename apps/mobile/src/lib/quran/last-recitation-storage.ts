import AsyncStorage from "@react-native-async-storage/async-storage";

export type LastRecitationPersisted = {
  reciterId: string;
  surahId: number;
  ayah: number;
  positionMillis: number;
  durationMillis?: number;
  updatedAt: number;
  /** Optional mushaf boundary for Prev/Next in mini player after cold start. */
  verseCount?: number;
};

const KEY = "deennotes.mobile.quran.lastRecitation.v1";

export async function readLastRecitation(): Promise<LastRecitationPersisted | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<LastRecitationPersisted>;
    if (typeof o.surahId !== "number" || typeof o.ayah !== "number") return null;
    if (typeof o.reciterId !== "string" || !o.reciterId) return null;
    return {
      reciterId: o.reciterId,
      surahId: o.surahId,
      ayah: o.ayah,
      positionMillis: typeof o.positionMillis === "number" ? o.positionMillis : 0,
      durationMillis: typeof o.durationMillis === "number" ? o.durationMillis : undefined,
      updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : Date.now(),
      verseCount: typeof o.verseCount === "number" ? o.verseCount : undefined,
    };
  } catch {
    return null;
  }
}

export async function writeLastRecitation(next: LastRecitationPersisted): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

/** Clears persisted resume bookmark (call when playback is fully stopped). */
export async function clearLastRecitation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
