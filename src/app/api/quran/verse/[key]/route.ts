import { NextResponse } from "next/server";

import { guardQuranOrExecute, parseQueryIdList } from "@/app/api/quran/_shared";
import {
  fetchVerseByKey,
  parseVerseKeyString,
} from "@/lib/quran/verses";

type Params = Promise<{ key: string }>;

export async function GET(request: Request, segment: { params: Params }) {
  const { key } = await segment.params;
  const decoded = decodeURIComponent(key).trim();
  const coords = parseVerseKeyString(decoded);

  if (!coords) {
    return NextResponse.json(
      {
        error:
          "Invalid verse key. Use surah:ayah (e.g. 2:255), 2-255, or encode as 2%3A255.",
      },
      { status: 400 },
    );
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
    const verse = await fetchVerseByKey(coords.chapter, coords.ayah, opts);
    if (!verse) {
      return NextResponse.json({ error: "Verse not found." }, { status: 404 });
    }

    return NextResponse.json(
      { verse, key: `${coords.chapter}:${coords.ayah}` },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      },
    );
  });
}
