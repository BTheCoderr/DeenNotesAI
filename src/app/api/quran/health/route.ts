import { NextResponse } from "next/server";

import { validateQuranEnvironment } from "@/lib/quran/env";

export const dynamic = "force-dynamic";

/**
 * Operator-facing Quran service probe — booleans, modes, and issue codes only (no secrets; no free-text hints).
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
      /* Issue codes + severity only — never free-text operator hints in the HTTP body. */
      issues: report.issues.map((i) => ({
        code: i.code,
        severity: i.severity,
      })),
    },
    {
      status: report.canServe ? 200 : 503,
      headers: { "Cache-Control": "private, max-age=0, no-store" },
    },
  );
}
