import "server-only";

import type { VerseKey } from "@quranjs/api";

import {
  defaultVerseReciterId,
  usesOfflineQuranDataset,
} from "./config";
import { logQuranSdkError, withQuranSdk } from "./client";
import { mockRecitations, mockVerseAudio } from "./mock/mock-data";
import { parseVerseKey } from "./verses";
import type { RecitationResourceDto, VerseAudioDto } from "./types";

export { defaultVerseReciterId };

/** Lists recitation presets from Content API registry. */
export async function fetchRecitationResources(): Promise<
  RecitationResourceDto[]
> {
  if (usesOfflineQuranDataset()) return mockRecitations();

  try {
    const list = await withQuranSdk((c) =>
      c.content.v4.resources.recitations.list({}),
    );
    return list.map((r) => ({
      id: r.id,
      reciterName: r.reciterName,
      style: r.style,
      translatedName: r.translatedName?.name,
    }));
  } catch (e) {
    logQuranSdkError("fetchRecitationResources", e);
    throw e;
  }
}

/** Resolves CDN audio URL + format for one ayah — no bearer token returned. */
export async function fetchVerseAudioPayload(
  surah: number,
  ayah: number,
  reciterId: string = defaultVerseReciterId(),
): Promise<VerseAudioDto | null> {
  const keyStr = parseVerseKey(surah, ayah);
  if (!keyStr) return null;

  if (usesOfflineQuranDataset()) {
    return mockVerseAudio(surah, ayah, reciterId);
  }

  try {
    const data = await withQuranSdk((c) =>
      c.content.v4.audio.verseRecitation.byKey(
        keyStr as VerseKey,
        reciterId,
        {},
      ),
    );
    const first = data.audioFiles?.[0];
    const audioUrl = first?.audioUrl;
    if (!audioUrl) return null;

    return {
      verseKey: keyStr,
      reciterId,
      audioUrl,
      format: first?.format,
    };
  } catch (e) {
    logQuranSdkError("fetchVerseAudioPayload", e);
    throw e;
  }
}
