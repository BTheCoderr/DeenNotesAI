import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quran settings — DeenNotes",
};

export default function QuranSettingsHubPage() {
  return (
    <div className="space-y-6 pb-24">
      <div>
        <Link
          href="/app/quran"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-4"
        >
          ← Quran
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Quran preferences</h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Reading language, translation, tafsir, and reciter — aligned with the in-app reader.
        </p>
      </div>

      <ul className="space-y-3">
        <li>
          <Link
            href="/app/quran/settings/language"
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]"
          >
            <span className="font-semibold text-ink">Meaning language</span>
            <span className="text-accent font-semibold text-sm shrink-0">→</span>
          </Link>
        </li>
        <li>
          <Link
            href="/app/quran/settings/translation"
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]"
          >
            <span className="font-semibold text-ink">Translation</span>
            <span className="text-accent font-semibold text-sm shrink-0">→</span>
          </Link>
        </li>
        <li>
          <Link
            href="/app/quran/settings/tafsir"
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]"
          >
            <span className="font-semibold text-ink">Tafsir</span>
            <span className="text-accent font-semibold text-sm shrink-0">→</span>
          </Link>
        </li>
        <li>
          <Link
            href="/app/quran/settings/reciter"
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]"
          >
            <span className="font-semibold text-ink">Reciter</span>
            <span className="text-accent font-semibold text-sm shrink-0">→</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
