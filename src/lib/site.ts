import type { Metadata } from "next";

/**
 * Canonical site URL for Open Graph, redirects, and legal page metadata.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://your-app.netlify.app).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

/** Shown on legal pages; update when counsel revises documents. */
export const LEGAL_LAST_UPDATED = "May 5, 2026";

export function supportEmail(): string | undefined {
  const e = process.env.NEXT_PUBLIC_BETA_FEEDBACK_EMAIL?.trim();
  return e || undefined;
}

/** SEO bundle for public static routes (canonical + OG + Twitter summary). */
export function publicPageMeta(
  pathname: string,
  titleSegment: string,
  description: string,
): Metadata {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = `${base}${path}`;
  const fullTitle = `${titleSegment} · DeenNotes AI`;
  return {
    title: titleSegment,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website" as const,
      url,
      siteName: "DeenNotes AI",
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
    },
    robots: { index: true, follow: true } as const,
  };
}
