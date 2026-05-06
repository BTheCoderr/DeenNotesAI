import Link from "next/link";

import { APP_DISCLAIMER } from "@/lib/constants";

export const metadata = {
  title: "About DeenNotes — Settings",
};

export default function AboutSettingsPage() {
  return (
    <div className="space-y-6 pb-20 max-w-prose">
      <div>
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-4"
        >
          ← Settings
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">About DeenNotes</h1>
        <p className="text-accent text-xs font-semibold uppercase tracking-wider mt-2">
          Beta — DeenNotes AI
        </p>
      </div>
      <p className="text-sm text-muted leading-relaxed">
        DeenNotes is a reflective journal companion for Muslims. We help listeners turn what they heard into summaries, dua prompts, reminders, study notes, and shareable cards—all while staying clear we are neither scholars nor jurists.
      </p>
      <section className="rounded-2xl border border-accent/20 bg-mint/30 p-5 text-sm text-ink leading-relaxed">
        {APP_DISCLAIMER}
      </section>
      <p className="text-xs text-muted">
        Lovingly crafted mobile-first UX with emerald (#127A63), mint (#CFE8E0), stone (#F6F4F0), and calm serif headlines.
      </p>
    </div>
  );
}
