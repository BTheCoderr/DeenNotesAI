/** IndexedDB — khutbah/lecture blobs (Expo: map to filesystem). */

export type RecordingStamp = { id: string; atMs: number; label?: string };

type Row = {
  noteId: string;
  stamps: RecordingStamp[];
  mimeType: string;
  updatedAt: string;
  blobBuf: ArrayBuffer;
};

const DB_NAME = "deennotes_note_media_v1";
const STORE = "recordings";
const DB_VER = 1;

function canUseIdb(): boolean {
  return typeof indexedDB !== "undefined";
}

function req<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IDB abort"));
  });
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const d = indexedDB.open(DB_NAME, DB_VER);
    d.onerror = () => reject(d.error ?? new Error("IDB open"));
    d.onsuccess = () => resolve(d.result);
    d.onupgradeneeded = () => {
      const db = d.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "noteId" });
      }
    };
  });
}

export async function idbPutNoteRecording(
  noteId: string,
  blob: Blob,
  stamps: RecordingStamp[],
): Promise<void> {
  if (!canUseIdb()) return;
  const buf = await blob.arrayBuffer();
  const row: Row = {
    noteId,
    blobBuf: buf,
    mimeType: blob.type || "audio/webm",
    stamps,
    updatedAt: new Date().toISOString(),
  };
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(row);
  await txDone(tx);
}

export async function idbDeleteNoteRecording(noteId: string): Promise<void> {
  if (!canUseIdb()) return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(noteId);
  await txDone(tx);
}

export async function idbLoadNoteRecording(
  noteId: string,
): Promise<{ blob: Blob; stamps: RecordingStamp[] } | null> {
  if (!canUseIdb()) return null;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const getReq = tx.objectStore(STORE).get(noteId);
    const row = (await req(getReq)) as Row | undefined;
    await txDone(tx);
    if (!row?.blobBuf) return null;
    return {
      blob: new Blob([row.blobBuf], { type: row.mimeType }),
      stamps: Array.isArray(row.stamps) ? row.stamps : [],
    };
  } catch {
    return null;
  }
}
