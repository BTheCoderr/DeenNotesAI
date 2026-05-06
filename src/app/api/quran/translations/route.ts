import { NextResponse } from "next/server";

import { guardQuranOrExecute } from "@/app/api/quran/_shared";
import { fetchTranslationResources } from "@/lib/quran/tafsir";

export async function GET() {
  return guardQuranOrExecute(async () => {
    const translations = await fetchTranslationResources();
    return NextResponse.json(
      { translations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
