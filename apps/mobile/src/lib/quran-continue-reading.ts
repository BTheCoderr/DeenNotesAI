import AsyncStorage from "@react-native-async-storage/async-storage";

export type PreferredReadingSlice = "daily" | "taraweeh";

export type ContinueReadingState = {
  surahId: number;
  ayah: number;
  updatedAt: number;
  /** Ramadan immersion prep: reading context only (no challenge UI yet). */
  preferredReadingSlice?: PreferredReadingSlice;
};

const KEY = "deennotes.mobile.quran.continue.v1";

export async function readContinueReading(): Promise<ContinueReadingState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<ContinueReadingState>;
    const surahId = Number(o.surahId);
    const ayah = Number(o.ayah);
    if (!Number.isFinite(surahId) || surahId < 1) return null;
    if (!Number.isFinite(ayah) || ayah < 1) return null;
    const slice = o.preferredReadingSlice === "taraweeh" ? "taraweeh" : "daily";
    return {
      surahId: Math.trunc(surahId),
      ayah: Math.trunc(ayah),
      updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : Date.now(),
      preferredReadingSlice: o.preferredReadingSlice !== undefined ? slice : undefined,
    };
  } catch {
    return null;
  }
}

export async function writeContinueReading(
  next: Omit<ContinueReadingState, "updatedAt"> & Partial<Pick<ContinueReadingState, "preferredReadingSlice">>,
) {
  const prev = await readContinueReading();
  const payload: ContinueReadingState = {
    surahId: next.surahId,
    ayah: next.ayah,
    preferredReadingSlice: next.preferredReadingSlice ?? prev?.preferredReadingSlice,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function writePreferredReadingSlice(slice: PreferredReadingSlice) {
  const prev = await readContinueReading();
  if (!prev) return;
  await writeContinueReading({
    surahId: prev.surahId,
    ayah: prev.ayah,
    preferredReadingSlice: slice,
  });
}
