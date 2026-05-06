import { NextResponse } from "next/server";

import {
  fetchHijriCalendarByCity,
  fetchHijriCalendarByCoords,
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

  const hy = Number(sp.get("hijriYear"));
  const hm = Number(sp.get("hijriMonth"));
  if (!Number.isFinite(hy) || !Number.isFinite(hm) || hm < 1 || hm > 12) {
    return NextResponse.json(
      { ok: false, error: "Provide hijriYear and hijriMonth (1–12).", code: "INVALID" },
      { status: 400 },
    );
  }

  try {
    let data;
    if (parsed.mode === "coords") {
      data = await fetchHijriCalendarByCoords({
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        hijriYear: Math.trunc(hy),
        hijriMonth: Math.trunc(hm),
        method: parsed.method,
        school: parsed.school,
        adjustment: parsed.adjustment,
      });
    } else {
      data = await fetchHijriCalendarByCity({
        city: parsed.city,
        country: parsed.country,
        hijriYear: Math.trunc(hy),
        hijriMonth: Math.trunc(hm),
        method: parsed.method,
        school: parsed.school,
        adjustment: parsed.adjustment,
      });
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Hijri calendar unavailable.", code: "UPSTREAM" },
        { status: 502 },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upstream error.", code: "UPSTREAM" },
      { status: 502 },
    );
  }
}
