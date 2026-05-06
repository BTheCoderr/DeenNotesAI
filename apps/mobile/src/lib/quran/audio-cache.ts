import * as FileSystem from "expo-file-system/legacy";

import { preferSkipMobileDownload } from "../network-wifi";

import { fetchVerseAudio } from "../../api/quran";

export const DEFAULT_AUDIO_MAX_CACHE_MB = 200;

export type AudioCacheRowStatus = "idle" | "downloading" | "ready" | "failed";

export type AudioCacheRow = {
  status: AudioCacheRowStatus;
  /** Local file URI once ready */
  localUri?: string;
  bytes?: number;
  updatedAt: number;
  errorMessage?: string;
};

export type QuranAudioCacheIndexV1 = {
  schemaVersion: 1;
  entries: Record<string, AudioCacheRow>;
};

const INDEX_FILENAME = "quran_audio/index.v1.json";
const ACTIVE = new Set<string>();

function sanitizeReciter(reciterId: string): string {
  return encodeURIComponent(reciterId.replace(/\//g, "_"));
}

export function verseAudioDiskKey(reciterId: string, surah: number, ayah: number): string {
  return `${sanitizeReciter(reciterId)}:${surah}:${ayah}`;
}

function indexUri(): string | null {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${INDEX_FILENAME}` : null;
}

async function ensureBaseDir(): Promise<string | null> {
  const base = FileSystem.documentDirectory;
  if (!base) return null;
  const dir = `${base}quran_audio`;
  const inf = await FileSystem.getInfoAsync(dir);
  if (!inf.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export function extFromUrlOrFormat(audioUrl: string, format?: string): string {
  const f = (format ?? "").toLowerCase();
  if (f.includes("opus")) return ".opus";
  if (f.includes("m4a") || f.includes("aac")) return ".m4a";
  if (f.includes("mp3")) return ".mp3";
  try {
    const u = new URL(audioUrl);
    const dot = u.pathname.lastIndexOf(".");
    if (dot >= 0 && dot < u.pathname.length - 2) {
      const ext = u.pathname.slice(dot).slice(0, 8).toLowerCase();
      if (ext.startsWith(".")) return ext.match(/^\.[\w]+$/)?.[0] ?? ".mp3";
    }
  } catch {
    /* ignore */
  }
  return ".mp3";
}

async function readIndex(): Promise<QuranAudioCacheIndexV1> {
  const uri = indexUri();
  if (!uri) return { schemaVersion: 1, entries: {} };
  try {
    const inf = await FileSystem.getInfoAsync(uri);
    if (!inf.exists) return { schemaVersion: 1, entries: {} };
    const raw = await FileSystem.readAsStringAsync(uri);
    const o = JSON.parse(raw) as Partial<QuranAudioCacheIndexV1>;
    if (o.schemaVersion !== 1 || !o.entries || typeof o.entries !== "object") {
      return { schemaVersion: 1, entries: {} };
    }
    return { schemaVersion: 1, entries: { ...o.entries } };
  } catch {
    return { schemaVersion: 1, entries: {} };
  }
}

async function writeIndex(next: QuranAudioCacheIndexV1): Promise<void> {
  const uri = indexUri();
  if (!uri) return;
  const dir = uri.replace(/index\.v1\.json$/, "");
  const inf = await FileSystem.getInfoAsync(dir);
  if (!inf.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(next), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

function localAudioPath(reciterId: string, surah: number, ayah: number, ext: string): string | null {
  const base = FileSystem.documentDirectory;
  if (!base) return null;
  const r = sanitizeReciter(reciterId);
  return `${base}quran_audio/${r}_s${surah}_a${ayah}${ext}`;
}

export async function getAudioCacheRow(
  reciterId: string,
  surah: number,
  ayah: number,
): Promise<AudioCacheRow | null> {
  const idx = await readIndex();
  const k = verseAudioDiskKey(reciterId, surah, ayah);
  return idx.entries[k] ?? null;
}

async function enforceBudget(maxCacheMb: number): Promise<void> {
  const cap = Math.max(32, maxCacheMb) * 1024 * 1024;
  let idx = await readIndex();
  let total = 0;
  const ready: { key: string; updatedAt: number; bytes: number }[] = [];
  for (const [key, row] of Object.entries(idx.entries)) {
    if (row.status !== "ready" || !row.localUri || !row.bytes) continue;
    total += row.bytes;
    ready.push({ key, updatedAt: row.updatedAt, bytes: row.bytes });
  }
  if (total <= cap) return;
  ready.sort((a, b) => a.updatedAt - b.updatedAt);
  for (const item of ready) {
    if (total <= cap) break;
    const row = idx.entries[item.key];
    if (row?.localUri) {
      try {
        const inf = await FileSystem.getInfoAsync(row.localUri);
        if (inf.exists) await FileSystem.deleteAsync(row.localUri, { idempotent: true });
      } catch {
        /* ignore */
      }
    }
    total -= item.bytes;
    delete idx.entries[item.key];
  }
  await writeIndex(idx);
}

/**
 * Downloads verse audio unless Wi‑Fi–only skips, or duplicate in flight.
 * Does not enqueue the full mushaf — caller batches windows only.
 */
export async function cacheVerseAudioIfNeeded(opts: {
  reciterId: string;
  surah: number;
  ayah: number;
  audioWifiOnly?: boolean;
  maxCacheMb: number;
}): Promise<{ ok: boolean; localUri?: string; skippedWifi?: boolean; error?: string }> {
  const { reciterId, surah, ayah } = opts;
  const wifi = opts.audioWifiOnly ?? false;
  const maxMb = opts.maxCacheMb || DEFAULT_AUDIO_MAX_CACHE_MB;

  const k = verseAudioDiskKey(reciterId, surah, ayah);
  let idx = await readIndex();
  const existing = idx.entries[k];
  if (existing?.status === "ready" && existing.localUri) {
    idx.entries[k] = {
      ...existing,
      updatedAt: Date.now(),
    };
    await writeIndex(idx);
    return { ok: true, localUri: existing.localUri };
  }
  if (ACTIVE.has(k)) {
    return { ok: false, error: "in_flight" };
  }

  const gate = await preferSkipMobileDownload(wifi);
  if (gate.skip) {
    return { ok: false, skippedWifi: true };
  }

  let meta: Awaited<ReturnType<typeof fetchVerseAudio>>;
  try {
    meta = await fetchVerseAudio(surah, ayah, reciterId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  const ext = extFromUrlOrFormat(meta.audioUrl, meta.format);
  const dest = localAudioPath(reciterId, surah, ayah, ext);
  if (!dest) return { ok: false, error: "no_document_dir" };

  ACTIVE.add(k);
  idx = await readIndex();
  idx.entries[k] = {
    status: "downloading",
    updatedAt: Date.now(),
  };
  await writeIndex(idx);

  try {
    await ensureBaseDir();
    const dl = await FileSystem.downloadAsync(meta.audioUrl, dest);
    if (typeof dl.status === "number" && dl.status >= 400) {
      throw new Error(`audio_http_${dl.status}`);
    }
    const inf = await FileSystem.getInfoAsync(dl.uri);
    const bytes =
      inf.exists && "size" in inf && typeof (inf as { size?: unknown }).size === "number"
        ? (inf as { size: number }).size
        : undefined;

    idx = await readIndex();
    idx.entries[k] = {
      status: "ready",
      localUri: dl.uri,
      bytes: typeof bytes === "number" && bytes > 0 ? bytes : 0,
      updatedAt: Date.now(),
    };
    await writeIndex(idx);
    await enforceBudget(maxMb);
    return { ok: true, localUri: dl.uri };
  } catch (e) {
    idx = await readIndex();
    idx.entries[k] = {
      status: "failed",
      updatedAt: Date.now(),
      errorMessage: e instanceof Error ? e.message : String(e),
    };
    await writeIndex(idx);
    try {
      const inf = await FileSystem.getInfoAsync(dest);
      if (inf.exists) await FileSystem.deleteAsync(dest, { idempotent: true });
    } catch {
      /* ignore */
    }
    return { ok: false, error: idx.entries[k].errorMessage };
  } finally {
    ACTIVE.delete(k);
  }
}

/** Prefetch a small window of ayāt (caller supplies list). */
export async function prefetchAyahWindow(
  reciterId: string,
  surah: number,
  ayahs: number[],
  opts: { audioWifiOnly?: boolean; maxCacheMb: number },
): Promise<void> {
  for (const ayah of ayahs) {
    void cacheVerseAudioIfNeeded({
      reciterId,
      surah,
      ayah,
      audioWifiOnly: opts.audioWifiOnly,
      maxCacheMb: opts.maxCacheMb,
    });
    await new Promise((r) => setTimeout(r, 40));
  }
}
