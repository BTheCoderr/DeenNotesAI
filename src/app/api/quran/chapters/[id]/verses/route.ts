import { NextResponse } from "next/server";

import { guardQuranOrExecute, parseQueryIdList } from "@/app/api/quran/_shared";
import { fetchVersesForChapter } from "@/lib/quran/verses";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, segment: { params: Params }) {
  const { id } = await segment.params;
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1 || n > 114) {
    return NextResponse.json({ error: "Invalid surah." }, { status: 400 });
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

  return guardQuranOrExecute(async () => {
    const verses = await fetchVersesForChapter(n, opts);
    return NextResponse.json(
      { verses },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      },
    );
  });
}
