import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { KhutbahRecordingMeta } from "../contracts/khutbah-recording";

const STORAGE_KEY = "deennotes.mobile.khutbahRecordings.v1";

export function recordingsDir(): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error("documentDirectory unavailable");
  return `${base}khutbah_recordings`;
}

export function permanentRecordingUri(recordingId: string): string {
  return `${recordingsDir()}/${recordingId}.m4a`;
}

export async function ensureRecordingsDir(): Promise<void> {
  const dir = recordingsDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

function sortByCreatedDesc(a: KhutbahRecordingMeta, b: KhutbahRecordingMeta): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

async function readRawList(): Promise<KhutbahRecordingMeta[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: KhutbahRecordingMeta[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Partial<KhutbahRecordingMeta>;
      if (
        typeof o.id === "string" &&
        typeof o.fileUri === "string" &&
        typeof o.durationMillis === "number" &&
        typeof o.createdAt === "string" &&
        o.schemaVersion === 1
      ) {
        out.push({
          schemaVersion: 1,
          id: o.id,
          fileUri: o.fileUri,
          durationMillis: Math.max(0, Math.floor(o.durationMillis)),
          createdAt: o.createdAt,
          title: typeof o.title === "string" ? o.title : undefined,
          linkedReflectionId:
            o.linkedReflectionId === null || o.linkedReflectionId === undefined
              ? o.linkedReflectionId
              : typeof o.linkedReflectionId === "string"
                ? o.linkedReflectionId
                : undefined,
          source: "record_khutbah_session",
        });
      }
    }
    return out.sort(sortByCreatedDesc);
  } catch {
    return [];
  }
}

async function writeRawList(rows: KhutbahRecordingMeta[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows.sort(sortByCreatedDesc)));
}

export async function listKhutbahRecordings(): Promise<KhutbahRecordingMeta[]> {
  return readRawList();
}

export async function getKhutbahRecording(id: string): Promise<KhutbahRecordingMeta | null> {
  const rows = await readRawList();
  return rows.find((r) => r.id === id) ?? null;
}

export function newKhutbahRecordingId(): string {
  return `kb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Persist file from expo-av Recording URI into app documents + append metadata row.
 */
export async function commitKhutbahRecording(input: {
  tempFileUri: string;
  durationMillis: number;
  title?: string;
}): Promise<KhutbahRecordingMeta> {
  await ensureRecordingsDir();
  const id = newKhutbahRecordingId();
  const dest = permanentRecordingUri(id);
  await FileSystem.copyAsync({ from: input.tempFileUri, to: dest });
  const meta: KhutbahRecordingMeta = {
    schemaVersion: 1,
    id,
    fileUri: dest,
    durationMillis: Math.max(0, Math.floor(input.durationMillis)),
    createdAt: new Date().toISOString(),
    title: input.title?.trim() || undefined,
    linkedReflectionId: null,
    source: "record_khutbah_session",
  };
  const prev = await readRawList();
  await writeRawList([meta, ...prev.filter((x) => x.id !== id)]);
  return meta;
}

export async function updateKhutbahRecordingTitle(
  id: string,
  title: string | undefined,
): Promise<void> {
  const rows = await readRawList();
  const next = rows.map((r) =>
    r.id === id ? { ...r, title: title?.trim() || undefined } : r,
  );
  await writeRawList(next);
}

export async function linkKhutbahRecordingToReflection(
  recordingId: string,
  reflectionNoteId: string,
): Promise<void> {
  const rows = await readRawList();
  const next = rows.map((r) =>
    r.id === recordingId ? { ...r, linkedReflectionId: reflectionNoteId } : r,
  );
  await writeRawList(next);
}

export async function findRecordingForReflection(
  reflectionNoteId: string,
): Promise<KhutbahRecordingMeta | null> {
  const rows = await readRawList();
  return rows.find((r) => r.linkedReflectionId === reflectionNoteId) ?? null;
}

export async function deleteKhutbahRecording(id: string): Promise<void> {
  const rows = await readRawList();
  const target = rows.find((r) => r.id === id);
  const rest = rows.filter((r) => r.id !== id);
  await writeRawList(rest);
  if (target) {
    try {
      const info = await FileSystem.getInfoAsync(target.fileUri);
      if (info.exists) await FileSystem.deleteAsync(target.fileUri, { idempotent: true });
    } catch {
      /* ignore */
    }
  }
}
