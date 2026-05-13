import {
  guardQuranOrExecute,
  mergeQuranMobileHeaders,
  safeQuranApiFailure,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import { fetchChaptersSorted } from "@/lib/quran/chapters";
import {
  isLiveQuranCredentialsConfigured,
  isMockQuranMode,
  isQuranPublicHttpBridgeEnabled,
} from "@/lib/quran/config";
import { fetchChaptersFromQuranDotComHttp } from "@/lib/quran/quranDotComPublicFetch";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: mergeQuranMobileHeaders("none"),
  });
}

export async function GET() {
  return guardQuranOrExecute(async () => {
    const longCache = mergeQuranMobileHeaders("long", {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    });

    try {
      if (isMockQuranMode() || isLiveQuranCredentialsConfigured()) {
        const chapters = await fetchChaptersSorted();
        const normalized = chapters.map((c) => ({
          ...c,
          chapterNumber: c.id,
        }));
        return safeQuranApiSuccess({ chapters: normalized }, { headers: longCache });
      }

      if (isQuranPublicHttpBridgeEnabled()) {
        const chapters = await fetchChaptersFromQuranDotComHttp();
        const normalized = chapters.map((c) => ({
          ...c,
          chapterNumber: c.id,
        }));
        return safeQuranApiSuccess(
          { chapters: normalized },
          {
            headers: mergeQuranMobileHeaders("short", {
              "Cache-Control":
                "public, max-age=600, s-maxage=600, stale-while-revalidate=86400",
            }),
          },
        );
      }

      const chapters = await fetchChaptersSorted();
      const normalized = chapters.map((c) => ({
        ...c,
        chapterNumber: c.id,
      }));
      return safeQuranApiSuccess({ chapters: normalized }, { headers: longCache });
    } catch {
      return safeQuranApiFailure(
        {
          message: "We couldn’t load the surah list right now. Please try again shortly.",
          code: "QURAN_UPSTREAM_UNAVAILABLE",
          retryable: true,
        },
        502,
        { headers: mergeQuranMobileHeaders("none") },
      );
    }
  });
}
