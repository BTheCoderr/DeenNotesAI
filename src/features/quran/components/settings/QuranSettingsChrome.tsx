import Link from "next/link";

import { APP_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/app/quran/settings/translation", label: "Translation" },
  { href: "/app/quran/settings/tafsir", label: "Tafsir" },
  { href: "/app/quran/settings/reciter", label: "Reciter" },
  { href: "/app/quran/settings/language", label: "Language" },
] as const;

export function QuranSettingsPrinciple() {
  return (
    <section className="rounded-2xl border border-black/[0.07] bg-[#F9F6F1]/90 p-5 space-y-3 shadow-sm">
      <h1 className="font-display text-lg font-semibold text-ink leading-snug">
        The Quran is one.
      </h1>
      <p className="text-sm text-muted leading-relaxed">
        These settings change translation, tafsir, recitation, and display language — not the
        Quranic text itself.
      </p>
      <p className="text-[0.72rem] text-muted leading-relaxed border-t border-black/5 pt-3">
        {APP_DISCLAIMER}
      </p>
    </section>
  );
}

export function QuranSettingsSubnav({ active }: { active: (typeof LINKS)[number]["href"] }) {
  return (
    <nav
      aria-label="Quran preferences"
      className="flex flex-wrap gap-2 text-[0.72rem] font-semibold"
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-full border px-3 py-1.5 transition-colors",
            l.href === active
              ? "border-emerald-900/35 bg-emerald-950/10 text-emerald-950"
              : "border-black/[0.07] text-muted hover:text-ink hover:border-emerald-900/20",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
