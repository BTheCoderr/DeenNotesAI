import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RecitationResourceDto } from "../api/types";

const KEY = "deennotes.mobile.quran.recitersSnapshot.v1";

export type RecitersSnapshotV1 = {
  schemaVersion: 1;
  updatedAt: number;
  items: RecitationResourceDto[];
};

export async function readRecitersSnapshot(): Promise<RecitersSnapshotV1 | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<RecitersSnapshotV1>;
    if (o.schemaVersion !== 1 || !Array.isArray(o.items)) return null;
    return { schemaVersion: 1, updatedAt: o.updatedAt ?? 0, items: o.items as RecitationResourceDto[] };
  } catch {
    return null;
  }
}

export async function writeRecitersSnapshot(items: RecitationResourceDto[]): Promise<void> {
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify({ schemaVersion: 1, updatedAt: Date.now(), items } satisfies RecitersSnapshotV1),
  );
}
