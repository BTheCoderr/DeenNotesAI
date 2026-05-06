/** Client-only — import from `"use client"` modules only */

const MEMORY_VERSION = 1;

const KEYS = {
  continue: `deennotes:quran_continue_v${MEMORY_VERSION}`,
  recentSurahs: `deennotes:quran_recent_surahs_v${MEMORY_VERSION}`,
  ayahHistory: `deennotes:quran_ayah_history_v${MEMORY_VERSION}`,
  listening: `deennotes:quran_listening_v${MEMORY_VERSION}`,
  bookmarks: `deennotes:quran_bookmarks_v${MEMORY_VERSION}`,
  searches: `deennotes:quran_search_recent_v${MEMORY_VERSION}`,
} as const;

export type ContinueReadingState = {
  surah: number;
  ayah: number | null;
  updatedAt: string;
};

export type RecentSurahVisit = {
  surah: number;
  visitedAt: string;
};

export type AyahHistoryEntry = {
  surah: number;
  ayah: number;
  at: string;
};

export type ListeningResumeState = {
  surah: number;
  ayah: number;
  updatedAt: string;
};

/** marker = ribbon, favorite = heart, reflection = note stub, tafsir = tafsir anchor */
export type QuranBookmarkKind = "marker" | "favorite" | "reflection" | "tafsir";

export type QuranBookmarkStored = {
  id: string;
  surah: number;
  ayah: number;
  kind: QuranBookmarkKind;
  reflection: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

function isoNow() {
  return new Date().toISOString();
}

function uid() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback */
  }
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function getContinueReading(): ContinueReadingState | null {
  const v = readJson<ContinueReadingState | null>(KEYS.continue, null);
  if (!v || typeof v.surah !== "number" || v.surah < 1 || v.surah > 114) {
    return null;
  }
  return v;
}

export function setContinueReading(surah: number, ayah: number | null) {
  if (surah < 1 || surah > 114) return;
  const payload: ContinueReadingState = {
    surah,
    ayah: ayah && ayah >= 1 ? ayah : null,
    updatedAt: isoNow(),
  };
  writeJson(KEYS.continue, payload);
}

export function getRecentSurahVisits(max = 8): RecentSurahVisit[] {
  const list = readJson<RecentSurahVisit[]>(KEYS.recentSurahs, []);
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (r) =>
        r &&
        typeof r.surah === "number" &&
        r.surah >= 1 &&
        r.surah <= 114 &&
        typeof r.visitedAt === "string",
    )
    .slice(0, max);
}

export function recordRecentSurahVisit(surah: number) {
  if (surah < 1 || surah > 114) return;
  const cur = readJson<RecentSurahVisit[]>(KEYS.recentSurahs, []);
  const filtered = Array.isArray(cur)
    ? cur.filter((x) => x.surah !== surah)
    : [];
  const next: RecentSurahVisit[] = [
    { surah, visitedAt: isoNow() },
    ...filtered,
  ].slice(0, 16);
  writeJson(KEYS.recentSurahs, next);
}

export function appendAyahHistory(surah: number, ayah: number, max = 48) {
  if (surah < 1 || surah > 114 || ayah < 1) return;
  const cur = readJson<AyahHistoryEntry[]>(KEYS.ayahHistory, []);
  const list = Array.isArray(cur) ? cur : [];
  const stamped: AyahHistoryEntry = {
    surah,
    ayah,
    at: isoNow(),
  };
  const key = `${surah}:${ayah}`;
  const deduped = list.filter((e) => `${e.surah}:${e.ayah}` !== key);
  const next = [stamped, ...deduped].slice(0, max);
  writeJson(KEYS.ayahHistory, next);
}

export function getAyahHistoryPreview(limit = 6): AyahHistoryEntry[] {
  const list = readJson<AyahHistoryEntry[]>(KEYS.ayahHistory, []);
  if (!Array.isArray(list)) return [];
  return list.slice(0, limit);
}

export function syncListeningResume(surah: number, ayah: number) {
  if (surah < 1 || surah > 114 || ayah < 1) return;
  const payload: ListeningResumeState = {
    surah,
    ayah,
    updatedAt: isoNow(),
  };
  writeJson(KEYS.listening, payload);
}

export function clearListeningResume() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEYS.listening);
  } catch {
    /* ignore */
  }
}

export function getListeningResume(): ListeningResumeState | null {
  const v = readJson<ListeningResumeState | null>(KEYS.listening, null);
  if (!v || typeof v.surah !== "number" || typeof v.ayah !== "number") {
    return null;
  }
  return v;
}

export function listQuranBookmarks(): QuranBookmarkStored[] {
  const list = readJson<QuranBookmarkStored[]>(KEYS.bookmarks, []);
  if (!Array.isArray(list)) return [];
  return list
    .filter(
      (b) =>
        b &&
        typeof b.id === "string" &&
        typeof b.surah === "number" &&
        typeof b.ayah === "number" &&
        b.surah >= 1 &&
        b.surah <= 114,
    )
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export type AddBookmarkInput = {
  surah: number;
  ayah: number;
  kind: QuranBookmarkKind;
  reflection?: string;
  tags?: string[];
};

export function addOrUpdateBookmark(input: AddBookmarkInput): QuranBookmarkStored {
  const now = isoNow();
  const list = listQuranBookmarks();
  const refl = (input.reflection ?? "").slice(0, 2000);
  const tags = (input.tags ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);

  const keyMatch = (
    b: QuranBookmarkStored,
    k: QuranBookmarkKind,
    s: number,
    a: number,
  ) => b.surah === s && b.ayah === a && b.kind === k;

  const existing = list.find((b) =>
    keyMatch(b, input.kind, input.surah, input.ayah),
  );

  let nextRecord: QuranBookmarkStored;
  if (existing) {
    nextRecord = {
      ...existing,
      reflection: refl || existing.reflection,
      tags: tags.length ? tags : existing.tags,
      updatedAt: now,
    };
    const rest = list.filter((b) => b.id !== existing.id);
    writeJson(KEYS.bookmarks, [nextRecord, ...rest]);
    return nextRecord;
  }

  nextRecord = {
    id: uid(),
    surah: input.surah,
    ayah: input.ayah,
    kind: input.kind,
    reflection: refl,
    tags,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(KEYS.bookmarks, [nextRecord, ...list].slice(0, 240));
  return nextRecord;
}

export function removeQuranBookmark(id: string) {
  const list = listQuranBookmarks();
  writeJson(
    KEYS.bookmarks,
    list.filter((b) => b.id !== id),
  );
}

export function isAyahBookmarked(
  surah: number,
  ayah: number,
  kind: QuranBookmarkKind,
): boolean {
  return listQuranBookmarks().some(
    (b) => b.surah === surah && b.ayah === ayah && b.kind === kind,
  );
}

export function toggleFavoriteAyah(surah: number, ayah: number): boolean {
  if (isAyahBookmarked(surah, ayah, "favorite")) {
    const id = listQuranBookmarks().find(
      (b) =>
        b.surah === surah && b.ayah === ayah && b.kind === "favorite",
    )?.id;
    if (id) removeQuranBookmark(id);
    return false;
  }
  addOrUpdateBookmark({ surah, ayah, kind: "favorite" });
  return true;
}

export function toggleMarkerAyah(surah: number, ayah: number): boolean {
  if (isAyahBookmarked(surah, ayah, "marker")) {
    const id = listQuranBookmarks().find(
      (b) =>
        b.surah === surah && b.ayah === ayah && b.kind === "marker",
    )?.id;
    if (id) removeQuranBookmark(id);
    return false;
  }
  addOrUpdateBookmark({ surah, ayah, kind: "marker" });
  return true;
}

/** Until server search exists — remembers gentle browse intents. Max 12. */
export function recordQuranBrowseQuery(query: string) {
  const q = query.trim();
  if (q.length < 1 || q.length > 80) return;
  const cur = readJson<string[]>(KEYS.searches, []);
  const list = Array.isArray(cur) ? cur : [];
  const next = [q, ...list.filter((x) => x !== q)].slice(0, 12);
  writeJson(KEYS.searches, next);
}

export function getRecentQuranQueries(): string[] {
  const list = readJson<string[]>(KEYS.searches, []);
  return Array.isArray(list) ? list.slice(0, 12) : [];
}
