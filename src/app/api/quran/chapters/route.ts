import { guardQuranOrExecute, safeQuranApiSuccess } from "@/app/api/quran/_shared";
import { fetchChaptersSorted } from "@/lib/quran/chapters";

export async function GET() {
  const res = await guardQuranOrExecute(async () => {
    const chapters = await fetchChaptersSorted();
    return safeQuranApiSuccess(
      { chapters },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  });
  return res;
}
