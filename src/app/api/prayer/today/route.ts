import { NextResponse } from "next/server";

import { fetchTodayByCity, fetchTodayByCoords } from "@/lib/prayer/aladhan";

import { parsePrayerQuery } from "../parse-query";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const parsed = parsePrayerQuery(new URL(req.url).searchParams);
  if ("error" in parsed) {
    return NextResponse.json(
      { ok: false, error: parsed.error, code: "INVALID" },
      { status: 400 },
    );
  }

  const adj = parsed.adjustment;

  try {
    let data;
    if (parsed.mode === "coords") {
      data = await fetchTodayByCoords({
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        method: parsed.method,
        school: parsed.school,
        adjustment: adj,
      });
    } else {
      data = await fetchTodayByCity({
        city: parsed.city,
        country: parsed.country,
        method: parsed.method,
        school: parsed.school,
        adjustment: adj,
      });
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Prayer times unavailable.", code: "UPSTREAM" },
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
