import {
  guardQuranOrExecute,
  quranInvalidRequest,
  quranNotFoundResponse,
  safeQuranApiSuccess,
} from "@/app/api/quran/_shared";
import { fetchChapterById } from "@/lib/quran/chapters";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, segment: { params: Params }) {
  const { id } = await segment.params;
  const n = Number(id);

  if (!Number.isFinite(n) || n !== Math.floor(n) || n < 1 || n > 114) {
    return quranInvalidRequest("Invalid chapter id.");
  }

  return guardQuranOrExecute(async () => {
    const chapter = await fetchChapterById(n);
    if (!chapter) {
      return quranNotFoundResponse("Chapter not found.");
    }

    return safeQuranApiSuccess(
      { chapter },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  });
}
