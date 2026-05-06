import Link from "next/link";

export const metadata = {
  title: "Reflection preferences — DeenNotes",
};

export default function ReflectionPreferencesPage() {
  return (
    <div className="space-y-6 pb-20 max-w-prose">
      <div>
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-4"
        >
          ← Settings
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Reflection preferences</h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Tone, prompts, and language for AI-assisted reflection will live here — same contracts as mobile when
          you connect an account.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-black/15 bg-mint/20 px-5 py-12 text-center">
        <p className="text-sm text-muted leading-relaxed">
          Placeholder: journaling style, reminder cadence, and optional dua prompts — coming soon without
          backend changes.
        </p>
      </div>
    </div>
  );
}
