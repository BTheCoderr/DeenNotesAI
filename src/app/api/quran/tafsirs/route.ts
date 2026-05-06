import { NextResponse } from "next/server";

import { guardQuranOrExecute } from "@/app/api/quran/_shared";
import { fetchTafsirResources } from "@/lib/quran/tafsir";

export async function GET() {
  return guardQuranOrExecute(async () => {
    const tafsirs = await fetchTafsirResources();
    return NextResponse.json(
      { tafsirs },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
