import { NextResponse } from "next/server";

import { validateQuranEnvironment } from "@/lib/quran/env";

export const dynamic = "force-dynamic";

/**
 * Operator-facing Quran service probe — returns booleans and issue codes only (no secrets).
 */
export async function GET() {
  const report = validateQuranEnvironment();
  return NextResponse.json(
    {
      schema: "deennotes.quran.health.v1",
      checkedAt: new Date().toISOString(),
      canServe: report.canServe,
      mode: report.mode,
      offlineDataset: report.usesOfflineDataset,
      issues: report.issues.map((i) => ({
        code: i.code,
        severity: i.severity,
        hint: i.hint,
      })),
    },
    {
      status: report.canServe ? 200 : 503,
      headers: { "Cache-Control": "private, max-age=0, no-store" },
    },
  );
}
