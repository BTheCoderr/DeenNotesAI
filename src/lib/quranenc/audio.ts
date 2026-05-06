import "server-only";

import type { QuranEncAudioResolveDto } from "./types";
import { QURANENC_ATTRIBUTION_LINE } from "./types";
import { isMockQuranEncMode, quranEncAudioCdnOrigin } from "./config";
import { assertSafeTranslationKey } from "./client";

/**
 * QuranEnc publishes verse-synced **translation narration** MP3s on `d.quranenc.com`.
 * Clients should resolve URLs via `/api/quranenc/audio` (server asserts safe keys — never forge paths in untrusted bundles).
 */

/** Deterministic QuranEnc narration URL per public documentation */
export function buildQuranEncAudioMp3Url(
  translationKey: string,
  sura: number,
  aya: number,
): string {
  const k = translationKey.trim();
  assertSafeTranslationKey(k);
  if (!Number.isInteger(sura) || sura < 1 || sura > 114) {
    throw new Error("Invalid sura");
  }
  if (!Number.isInteger(aya) || aya < 1 || aya > 286) {
    throw new Error("Invalid aya");
  }

  const s = String(sura).padStart(3, "0");
  const a = String(aya).padStart(3, "0");
  const base = quranEncAudioCdnOrigin();
  return `${base}/data/audio/${k}/${s}${a}.mp3`;
}

export function resolveQuranEncAudioPayload(params: {
  translationKey: string;
  sura: number;
  aya: number;
}): QuranEncAudioResolveDto {
  if (isMockQuranEncMode()) {
    const key = assertSafeTranslationKey(params.translationKey);
    return {
      translationKey: key,
      sura: params.sura,
      aya: params.aya,
      audioUrl: "",
      contentType: "audio/mpeg",
      attributionLine: QURANENC_ATTRIBUTION_LINE,
    };
  }
  const translationKey = assertSafeTranslationKey(params.translationKey);
  const audioUrl = buildQuranEncAudioMp3Url(
    translationKey,
    params.sura,
    params.aya,
  );
  return {
    translationKey,
    sura: params.sura,
    aya: params.aya,
    audioUrl,
    contentType: "audio/mpeg",
    attributionLine: QURANENC_ATTRIBUTION_LINE,
  };
}
