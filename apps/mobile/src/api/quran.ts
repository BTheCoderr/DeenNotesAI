import { apiUrl } from "../lib/apiBase";

import {
  splitQuranApiJson,
  type Chapter,
  type ChapterVersesResponse,
  type ChaptersResponse,
  type RecitationResourceDto,
  type RecitationsListResponse,
  type VerseAudioApiResponse,
} from "./types";

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

export async function fetchChapterVerses(chapterId: number): Promise<ChapterVersesResponse> {
  const url = apiUrl(`/api/quran/chapters/${chapterId}/verses`);
  const res = await fetch(url);
  const raw: unknown = await res.json();
  const { data } = splitQuranApiJson<ChapterVersesResponse>(raw);
  if (!res.ok) {
    const err =
      raw && typeof raw === "object" && "error" in raw
        ? String((raw as { error?: string }).error)
        : "Could not load verses.";
    throw new Error(err);
  }
  if (!Array.isArray(data.verses)) {
    throw new Error("Unexpected verses response");
  }
  return data;
}

export async function fetchVerseAudio(
  surah: number,
  ayah: number,
  reciterId: string,
): Promise<VerseAudioApiResponse> {
  const u = new URL(apiUrl("/api/quran/audio"));
  u.searchParams.set("surah", String(surah));
  u.searchParams.set("ayah", String(ayah));
  u.searchParams.set("reciter", reciterId);
  const res = await fetch(u.toString());
  const raw: unknown = await res.json();
  const { data } = splitQuranApiJson<VerseAudioApiResponse>(raw);
  if (!res.ok) {
    const err =
      raw && typeof raw === "object" && "error" in raw
        ? String((raw as { error?: string }).error)
        : "Could not load recitation.";
    throw new Error(err);
  }
  if (
    typeof data.audioUrl !== "string" ||
    !data.audioUrl.length ||
    typeof data.reciterId !== "string"
  ) {
    throw new Error("Unexpected verse audio payload");
  }
  return data;
}

export async function fetchRecitations(): Promise<RecitationResourceDto[]> {
  const res = await fetch(apiUrl("/api/quran/recitations"));
  const raw: unknown = await res.json();
  const { data } = splitQuranApiJson<RecitationsListResponse>(raw);
  if (!res.ok) {
    const err =
      raw && typeof raw === "object" && "error" in raw
        ? String((raw as { error?: string }).error)
        : "Could not load reciters.";
    throw new Error(err);
  }
  if (!Array.isArray(data.recitations)) throw new Error("Unexpected recitations");
  return data.recitations;
}

export const FALLBACK_MOBILE_RECITER_ID = "7";
