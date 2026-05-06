const KEY = `deennotes:recent_notes_v1`;
const MAX = 14;

export type RecentNoteSnapshot = {
  id: string;
  title: string;
  openedAt: string;
};

function read(): RecentNoteSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentNoteSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: RecentNoteSnapshot[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function rememberRecentNoteOpen(entry: RecentNoteSnapshot) {
  const safeTitle =
    typeof entry.title === "string" && entry.title.trim()
      ? entry.title.trim().slice(0, 280)
      : "Untitled";
  const id = entry.id;
  const openedAt =
    typeof entry.openedAt === "string" && entry.openedAt.trim()
      ? entry.openedAt.trim()
      : new Date().toISOString();
  const prev = read().filter((n) => n.id !== id);
  const next = [{ id, title: safeTitle, openedAt }, ...prev].slice(0, MAX);
  write(next);
}

export function readRecentNotes(): RecentNoteSnapshot[] {
  return read();
}
