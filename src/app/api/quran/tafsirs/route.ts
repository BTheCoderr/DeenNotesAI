import { guardQuranOrExecute, safeQuranApiSuccess } from "@/app/api/quran/_shared";
import { fetchTafsirResources } from "@/lib/quran/tafsir";

export async function GET() {
  return guardQuranOrExecute(async () => {
    const tafsirs = await fetchTafsirResources();
    return safeQuranApiSuccess(
      { tafsirs },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
