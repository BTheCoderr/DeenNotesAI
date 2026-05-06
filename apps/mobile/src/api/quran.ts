import { apiUrl } from "../lib/apiBase";

import { splitQuranApiJson, type Chapter, type ChaptersResponse } from "./types";

export async function fetchChapters(): Promise<{
  chapters: Chapter[];
  meta: ReturnType<typeof splitQuranApiJson<ChaptersResponse>>["meta"];
}> {
  const res = await fetch(apiUrl("/api/quran/chapters"));
  const raw: unknown = await res.json();
  const { data, meta } = splitQuranApiJson<ChaptersResponse>(raw);
  if (!res.ok) {
    const err =
      raw && typeof raw === "object" && "error" in raw
        ? String((raw as { error?: string }).error)
        : "Could not load surahs.";
    throw new Error(err);
  }
  if (!Array.isArray(data.chapters)) {
    throw new Error("Unexpected chapters response");
  }
  return { chapters: data.chapters, meta };
}
