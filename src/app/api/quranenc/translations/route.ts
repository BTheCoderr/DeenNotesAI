import { NextResponse } from "next/server";

import { guardQuranEncOrExecute } from "@/app/api/quranenc/_shared";
import {
  fetchQuranEncSuraTranslation,
  fetchQuranEncAllTranslations,
  fetchQuranEncTranslationList,
} from "@/lib/quranenc/translations";
import { groupQuranEncTranslationsByLanguage } from "@/lib/quranenc/languages";

/**
 * QuranEnc translations API (pass-through catalogue + verse packs).
 *
 * Catalogue: ?list=1[&grouped=1][&localization=en][&locale=en UI labels]
 * Narrow list: ?list=1&language=en[&localization=en]
 * Sura overlay: ?sura=2&translation_key=english_saheeh
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const list = searchParams.get("list");

  return guardQuranEncOrExecute(async () => {
    if (list === "1") {
      const grouped = searchParams.get("grouped") === "1";
      const localization = searchParams.get("localization");
      const locale =
        searchParams.get("locale")?.trim().slice(0, 24) || "en";
      const catalog = grouped
        ? await fetchQuranEncAllTranslations(localization)
        : await fetchQuranEncTranslationList({
            language: searchParams.get("language"),
            localization,
          });
      const body = grouped
        ? {
            translations: catalog,
            languages:
              groupQuranEncTranslationsByLanguage(catalog, locale),
          }
        : { translations: catalog };
      return NextResponse.json(body, {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      });
    }

    const suraRaw = searchParams.get("sura") ?? searchParams.get("chapter");
    const translationKey =
      searchParams.get("translation_key") ?? searchParams.get("translationKey");
    const sura = Number(suraRaw);

    if (!translationKey?.trim() || suraRaw == null || !Number.isInteger(sura)) {
      return NextResponse.json(
        {
          error:
            "Specify list=1 for catalog, or include sura (1–114) and translation_key (e.g. english_saheeh).",
        },
        { status: 400 },
      );
    }

    if (sura < 1 || sura > 114) {
      return NextResponse.json({ error: "Invalid sura." }, { status: 400 });
    }

    const overlay = await fetchQuranEncSuraTranslation({
      translationKey: translationKey.trim(),
      sura,
    });

    return NextResponse.json(overlay, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  });
}
