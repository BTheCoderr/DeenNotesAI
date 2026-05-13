import {
  guardQuranOrExecute,
  mergeQuranMobileHeaders,
  quranInvalidRequest,
  safeQuranApiFailure,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import {
  fetchVerseAudioPayload,
  defaultVerseReciterId,
} from "@/lib/quran/audio";
import {
  isLiveQuranCredentialsConfigured,
  isMockQuranMode,
  isQuranPublicHttpBridgeEnabled,
} from "@/lib/quran/config";
import {
  fetchVerseAudioFromQuranDotComHttp,
  parseAudioQuery,
} from "@/lib/quran/quranDotComPublicFetch";
import { parseVerseKeyString } from "@/lib/quran/verses";

const AUDIO_UNAVAILABLE =
  "Audio is temporarily unavailable for this verse.";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: mergeQuranMobileHeaders("none"),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { verseKey, reciterId } = parseAudioQuery(searchParams);

  if (!verseKey || !parseVerseKeyString(verseKey)) {
    return quranInvalidRequest("Invalid surah, ayah, or verse key.");
  }

  const [surahStr, ayahStr] = verseKey.split(":");
  const surah = Number(surahStr);
  const ayah = Number(ayahStr);

  return guardQuranOrExecute(async () => {
    const noStore = mergeQuranMobileHeaders("none");

    try {
      if (isMockQuranMode() || isLiveQuranCredentialsConfigured()) {
        const payload = await fetchVerseAudioPayload(surah, ayah, reciterId);
        if (!payload) {
          return safeQuranApiFailure(
            { message: AUDIO_UNAVAILABLE, code: "QURAN_NOT_FOUND", retryable: false },
            404,
            { headers: noStore },
          );
        }
        return safeQuranApiSuccess(
          {
            verseKey: payload.verseKey,
            reciterId: String(payload.reciterId),
            audioUrl: payload.audioUrl,
            format: payload.format,
          },
          { headers: noStore },
        );
      }

      if (isQuranPublicHttpBridgeEnabled()) {
        const payload = await fetchVerseAudioFromQuranDotComHttp(
          verseKey,
          reciterId,
        );
        if (!payload) {
          return safeQuranApiFailure(
            { message: AUDIO_UNAVAILABLE, code: "QURAN_NOT_FOUND", retryable: false },
            404,
            { headers: noStore },
          );
        }
        return safeQuranApiSuccess(
          {
            verseKey: payload.verseKey,
            reciterId: String(payload.reciterId),
            audioUrl: payload.audioUrl,
            format: payload.format,
          },
          { headers: noStore },
        );
      }

      const payload = await fetchVerseAudioPayload(
        surah,
        ayah,
        reciterId || defaultVerseReciterId(),
      );
      if (!payload) {
        return safeQuranApiFailure(
          { message: AUDIO_UNAVAILABLE, code: "QURAN_NOT_FOUND", retryable: false },
          404,
          { headers: noStore },
        );
      }
      return safeQuranApiSuccess(
        {
          verseKey: payload.verseKey,
          reciterId: String(payload.reciterId),
          audioUrl: payload.audioUrl,
          format: payload.format,
        },
        { headers: noStore },
      );
    } catch {
      return safeQuranApiFailure(
        {
          message: AUDIO_UNAVAILABLE,
          code: "QURAN_NOT_FOUND",
          retryable: false,
        },
        404,
        { headers: noStore },
      );
    }
  });
}
