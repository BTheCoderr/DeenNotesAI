import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Client-side reflection rows; replace with Supabase list when session + RLS land.
 * Shape aligns loosely with web note list DTOs for future swap-in.
 */
export type ReflectionLibraryItem = {
  id: string;
  title: string;
  short_summary: string | null;
  /** For list cards (Supabase synced) */
  main_reminder: string | null;
  note_type: string | null;
  created_at: string;
  /** Where the row was created before cloud sync */
  source: "local" | "supabase";
};

const KEY = "deennotes.mobile.reflectionLibrary.v1";

function sortByDateDesc(a: ReflectionLibraryItem, b: ReflectionLibraryItem): number {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export async function readReflectionLibrary(): Promise<ReflectionLibraryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: ReflectionLibraryItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Partial<ReflectionLibraryItem>;
      if (
        typeof o.id === "string" &&
        typeof o.title === "string" &&
        typeof o.created_at === "string"
      ) {
        out.push({
          id: o.id,
          title: o.title,
          short_summary:
            typeof o.short_summary === "string" || o.short_summary === null
              ? o.short_summary
              : null,
          main_reminder:
            typeof o.main_reminder === "string" || o.main_reminder === null
              ? o.main_reminder
              : null,
          note_type: typeof o.note_type === "string" ? o.note_type : null,
          created_at: o.created_at,
          source: o.source === "supabase" ? "supabase" : "local",
        });
      }
    }
    return out.sort(sortByDateDesc);
  } catch {
    return [];
  }
}

export async function writeReflectionLibrary(next: ReflectionLibraryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

/** Optional: append a local draft when compose saves (future). */
export async function appendLocalReflection(
  item: Omit<ReflectionLibraryItem, "source" | "id"> & { id?: string },
): Promise<ReflectionLibraryItem> {
  const list = await readReflectionLibrary();
  const row: ReflectionLibraryItem = {
    id: item.id ?? `local_${Date.now().toString(36)}`,
    title: item.title,
    short_summary: item.short_summary ?? null,
    main_reminder: item.main_reminder ?? null,
    note_type: item.note_type ?? null,
    created_at: item.created_at,
    source: "local",
  };
  await writeReflectionLibrary([row, ...list.filter((x) => x.id !== row.id)].sort(sortByDateDesc));
  return row;
}
