import { NextResponse } from "next/server";

import { guardQuranOrExecute } from "@/app/api/quran/_shared";
import { fetchChapterById } from "@/lib/quran/chapters";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, segment: { params: Params }) {
  const { id } = await segment.params;
  const n = Number(id);

  if (!Number.isFinite(n) || n !== Math.floor(n) || n < 1 || n > 114) {
    return NextResponse.json({ error: "Invalid chapter id." }, { status: 400 });
  }

  return guardQuranOrExecute(async () => {
    const chapter = await fetchChapterById(n);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
    }

    return NextResponse.json(
      { chapter },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  });
}
