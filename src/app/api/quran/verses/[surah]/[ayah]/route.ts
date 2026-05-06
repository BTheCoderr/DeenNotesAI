import {
  guardQuranOrExecute,
  parseQueryIdList,
  quranInvalidRequest,
  quranNotFoundResponse,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import { fetchVerseByKey } from "@/lib/quran/verses";

type Params = Promise<{ surah: string; ayah: string }>;

export async function GET(request: Request, segment: { params: Params }) {
  const { surah, ayah } = await segment.params;
  const s = Number(surah);
  const a = Number(ayah);

  if (
    !Number.isFinite(s) ||
    !Number.isFinite(a) ||
    s !== Math.floor(s) ||
    a !== Math.floor(a) ||
    s < 1 ||
    s > 114 ||
    a < 1
  ) {
    return quranInvalidRequest("Invalid surah or ayah.");
  }

  const { searchParams } = new URL(request.url);
  const translationIds =
    parseQueryIdList(searchParams.get("translations")) ??
    parseQueryIdList(searchParams.get("translationIds"));
  const tafsirIds = parseQueryIdList(searchParams.get("tafsirIds"));

  const opts =
    translationIds?.length || tafsirIds?.length
      ? { translationIds, tafsirIds }
      : undefined;

  const res = await guardQuranOrExecute(async () => {
    const verse = await fetchVerseByKey(s, a, opts);
    if (!verse) {
      return quranNotFoundResponse("Ayah not found.");
    }
    return safeQuranApiSuccess(
      { verse },
      {
        headers: {
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      },
    );
  });
  return res;
}
