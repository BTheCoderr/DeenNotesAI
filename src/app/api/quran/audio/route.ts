import { NextResponse } from "next/server";

import { guardQuranOrExecute } from "@/app/api/quran/_shared";
import {
  fetchVerseAudioPayload,
  defaultVerseReciterId,
} from "@/lib/quran/audio";
import { parseVerseKey } from "@/lib/quran/verses";

/** Returns public CDN audio URL for one ayah — no OAuth token in payload. */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surah = Number(searchParams.get("surah"));
  const ayah = Number(searchParams.get("ayah"));
  const reciterId =
    searchParams.get("reciter")?.trim() || defaultVerseReciterId();

  if (!parseVerseKey(surah, ayah)) {
    return NextResponse.json({ error: "Invalid surah or ayah." }, { status: 400 });
  }

  return guardQuranOrExecute(async () => {
    const payload = await fetchVerseAudioPayload(surah, ayah, reciterId);
    if (!payload) {
      return NextResponse.json(
        { error: "No audio URL for this recitation." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      verseKey: payload.verseKey,
      reciterId: payload.reciterId,
      audioUrl: payload.audioUrl,
      format: payload.format,
    });
  });
}
