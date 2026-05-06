import { NextResponse } from "next/server";

import { guardQuranEncOrExecute } from "@/app/api/quranenc/_shared";
import { resolveQuranEncAudioPayload } from "@/lib/quranenc/audio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const translationKey =
    searchParams.get("translation_key") ?? searchParams.get("translationKey") ?? "";
  const sura = Number(searchParams.get("sura") ?? searchParams.get("surah"));
  const ayah = Number(searchParams.get("aya") ?? searchParams.get("ayah"));

  if (!translationKey.trim() || !Number.isInteger(sura) || !Number.isInteger(ayah)) {
    return NextResponse.json(
      {
        error:
          "Provide translation_key, sura (1–114), and aya (verse number) identical to QuranEnc CDN layout.",
      },
      { status: 400 },
    );
  }

  if (sura < 1 || sura > 114 || ayah < 1) {
    return NextResponse.json({ error: "Invalid sura or aya." }, { status: 400 });
  }

  return guardQuranEncOrExecute(async () => {
    const payload = resolveQuranEncAudioPayload({
      translationKey: translationKey.trim(),
      sura,
      aya: ayah,
    });
    const available = Boolean(payload.audioUrl.trim());
    return NextResponse.json(
      { ...payload, available },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  });
}
