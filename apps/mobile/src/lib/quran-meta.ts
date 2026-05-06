import type { QuranPublicApiMeta } from "../api/types";

export function offlineReflectionSubtitle(meta: QuranPublicApiMeta | null): string | null {
  if (!meta?.offlineReflectionDataset) return null;
  return "Practice reader — Arabic and translation lines may be layout placeholders until this build is connected to authorized Qur’anic content.";
}
