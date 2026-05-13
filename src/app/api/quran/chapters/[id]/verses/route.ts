import {
  guardQuranOrExecute,
  mergeQuranMobileHeaders,
  parseQueryIdList,
  quranInvalidRequest,
  safeQuranApiFailure,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import {
  isLiveQuranCredentialsConfigured,
  isMockQuranMode,
  isQuranPublicHttpBridgeEnabled,
} from "@/lib/quran/config";
import {
  fetchVersesForChapterFromQuranDotComHttp,
  resolvePublicTranslationIdForHttp,
} from "@/lib/quran/quranDotComPublicFetch";
import { fetchVersesForChapter } from "@/lib/quran/verses";

type Params = Promise<{ id: string }>;

function resolveTranslationIdFromRequest(
  searchParams: URLSearchParams,
): number {
  const list =
    parseQueryIdList(searchParams.get("translations")) ??
    parseQueryIdList(searchParams.get("translationIds"));
  const first = list?.[0];
  if (first === undefined) return resolvePublicTranslationIdForHttp();
  const n = typeof first === "number" ? first : Number(first);
  return Number.isFinite(n) && n > 0 ? n : resolvePublicTranslationIdForHttp();
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: mergeQuranMobileHeaders("none"),
  });
}

export async function GET(request: Request, segment: { params: Params }) {
  const { id } = await segment.params;
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1 || n > 114) {
    return quranInvalidRequest("Invalid surah.");
  }

  const { searchParams } = new URL(request.url);
  const translationIds =
    parseQueryIdList(searchParams.get("translations")) ??
    parseQueryIdList(searchParams.get("translationIds"));
  const tafsirIds = parseQueryIdList(searchParams.get("tafsirIds"));
  const publicTranslationId = resolveTranslationIdFromRequest(searchParams);

  const optsSdk =
    translationIds?.length || tafsirIds?.length
      ? { translationIds, tafsirIds }
      : undefined;

  return guardQuranOrExecute(async () => {
    const longCache = mergeQuranMobileHeaders("long", {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    });

    try {
      if (isMockQuranMode() || isLiveQuranCredentialsConfigured()) {
        const verses = await fetchVersesForChapter(n, optsSdk);
        return safeQuranApiSuccess({ verses }, { headers: longCache });
      }

      if (isQuranPublicHttpBridgeEnabled()) {
        const verses = await fetchVersesForChapterFromQuranDotComHttp(
          n,
          publicTranslationId,
        );
        return safeQuranApiSuccess(
          { verses },
          {
            headers: mergeQuranMobileHeaders("short", {
              "Cache-Control":
                "public, max-age=600, s-maxage=600, stale-while-revalidate=86400",
            }),
          },
        );
      }

      const verses = await fetchVersesForChapter(n, optsSdk);
      return safeQuranApiSuccess({ verses }, { headers: longCache });
    } catch {
      return safeQuranApiFailure(
        {
          message: "We couldn’t load these verses right now. Please try again shortly.",
          code: "QURAN_UPSTREAM_UNAVAILABLE",
          retryable: true,
        },
        502,
        { headers: mergeQuranMobileHeaders("none") },
      );
    }
  });
}
