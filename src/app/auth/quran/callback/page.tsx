import type { Metadata } from "next";
import Link from "next/link";

import { QuranOAuthCallbackClient } from "@/components/auth/QuranOAuthCallbackClient";
import { getSiteUrl } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Quran Foundation / Quran.com OAuth callback landing.
 * Register: https://&lt;your-domain&gt;/auth/quran/callback
 */
export const metadata: Metadata = {
  title: "Quran account",
  description:
    "OAuth callback for connecting DeenNotes AI to Quran Foundation — secure redirect handler.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${getSiteUrl().replace(/\/$/, "")}/auth/quran/callback`,
  },
};

export default async function QuranAuthCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = await searchParams;
  const code = typeof q.code === "string" ? q.code : undefined;
  const err = typeof q.error === "string" ? q.error : undefined;

  const ok = Boolean(code) && !err;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background via-mint/20 to-background px-4 py-12 flex flex-col items-center justify-center">
      <p className="mb-6 text-center">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:underline"
        >
          DeenNotes AI
        </Link>
      </p>
      <QuranOAuthCallbackClient ok={ok} errorLabel={err} />
    </div>
  );
}
