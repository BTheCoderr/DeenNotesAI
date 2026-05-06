import { NextResponse } from "next/server";

import { guardQuranOrExecute } from "@/app/api/quran/_shared";
import { fetchRecitationResources } from "@/lib/quran/audio";

export async function GET() {
  return guardQuranOrExecute(async () => {
    const recitations = await fetchRecitationResources();
    return NextResponse.json(
      { recitations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
