import { guardQuranOrExecute, safeQuranApiSuccess } from "@/app/api/quran/_shared";
import { fetchRecitationResources } from "@/lib/quran/audio";

export async function GET() {
  return guardQuranOrExecute(async () => {
    const recitations = await fetchRecitationResources();
    return safeQuranApiSuccess(
      { recitations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
