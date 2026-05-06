import { NextResponse } from "next/server";

import {
  fetchGregorianCalendarByCity,
  fetchGregorianCalendarByCoords,
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

  const y = Number(sp.get("year"));
  const mo = Number(sp.get("month"));
  const now = new Date();
  const year =
    Number.isFinite(y) && y >= 2000 && y <= 2100 ? Math.trunc(y) : now.getFullYear();
  const month =
    Number.isFinite(mo) && mo >= 1 && mo <= 12 ? Math.trunc(mo) : now.getMonth() + 1;

  try {
    let data;
    if (parsed.mode === "coords") {
      data = await fetchGregorianCalendarByCoords({
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        year,
        month,
        method: parsed.method,
        school: parsed.school,
        adjustment: parsed.adjustment,
      });
    } else {
      data = await fetchGregorianCalendarByCity({
        city: parsed.city,
        country: parsed.country,
        year,
        month,
        method: parsed.method,
        school: parsed.school,
        adjustment: parsed.adjustment,
      });
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Calendar unavailable.", code: "UPSTREAM" },
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
