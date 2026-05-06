import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Legacy entry — clients should call `/api/prayer/today`. */
export function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/\/times$/, "/today");
  return NextResponse.redirect(url, 308);
}
