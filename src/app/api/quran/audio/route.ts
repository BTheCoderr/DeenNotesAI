import {
  guardQuranOrExecute,
  quranInvalidRequest,
  quranNotFoundResponse,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import {
  fetchVerseAudioPayload,
  defaultVerseReciterId,
} from "@/lib/quran/audio";
import { parseVerseKey } from "@/lib/quran/verses";

/** Returns public CDN audio URL for one ayah — no OAuth token in payload. */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surah = Number(searchParams.get("surah"));
  const ayah = Number(searchParams.get("ayah"));
  const reciterId =
    searchParams.get("reciter")?.trim() || defaultVerseReciterId();

  if (!parseVerseKey(surah, ayah)) {
    return quranInvalidRequest("Invalid surah or ayah.");
  }

  return guardQuranOrExecute(async () => {
    const payload = await fetchVerseAudioPayload(surah, ayah, reciterId);
    if (!payload) {
      return quranNotFoundResponse("No audio URL for this recitation.");
    }

    return safeQuranApiSuccess({
      verseKey: payload.verseKey,
      reciterId: payload.reciterId,
      audioUrl: payload.audioUrl,
      format: payload.format,
    });
  });
}
