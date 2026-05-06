import { NextResponse } from "next/server";

import {
  fetchRamadanGregorianWindow,
  fetchTodayByCity,
  fetchTodayByCoords,
} from "@/lib/prayer/aladhan";

import { parsePrayerQuery } from "../parse-query";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const parsed = parsePrayerQuery(sp);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const hyParam = sp.get("hijriYear");
  let hijriYear =
    hyParam != null && hyParam.trim() !== "" ? Math.trunc(Number(hyParam)) : NaN;

  try {
    if (!Number.isFinite(hijriYear)) {
      const today =
        parsed.mode === "coords"
          ? await fetchTodayByCoords({
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              method: parsed.method,
              school: parsed.school,
              adjustment: parsed.adjustment,
            })
          : await fetchTodayByCity({
              city: parsed.city,
              country: parsed.country,
              method: parsed.method,
              school: parsed.school,
              adjustment: parsed.adjustment,
            });
      const y = Number(today?.hijriYear);
      hijriYear = Number.isFinite(y) ? Math.trunc(y) : new Date().getFullYear() - 622;
    }

    const pack =
      parsed.mode === "coords"
        ? await fetchRamadanGregorianWindow({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            hijriYear,
            method: parsed.method,
            school: parsed.school,
            adjustment: parsed.adjustment,
          })
        : await fetchRamadanGregorianWindow({
            city: parsed.city,
            country: parsed.country,
            hijriYear,
            method: parsed.method,
            school: parsed.school,
            adjustment: parsed.adjustment,
          });

    if (!pack.hijriRamadan && !pack.calendar) {
      return NextResponse.json(
        { ok: false, error: "Ramadan data unavailable.", code: "UPSTREAM" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      hijriYear,
      gregorianMonth: pack.calendar?.month ?? null,
      gregorianYear: pack.calendar?.year ?? null,
      hijriRamadan: pack.hijriRamadan,
      gregorianOverlap: pack.calendar,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upstream error.", code: "UPSTREAM" },
      { status: 502 },
    );
  }
}
