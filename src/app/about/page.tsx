import type { Metadata } from "next";
import Link from "next/link";

import { PublicArticleLayout } from "@/components/marketing/PublicArticleLayout";
import { publicPageMeta } from "@/lib/site";

export const metadata: Metadata = publicPageMeta(
  "/about",
  "About",
  "DeenNotes AI helps Muslims turn reminders into organised reflection — khutbahs, Qur'an study, lectures, and daily consistency without replacing scholars.",
);

export default function AboutPage() {
  return (
    <PublicArticleLayout>
      <header className="text-center">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-accent">
          DeenNotes AI
        </p>
        <h1 className="mt-4 font-display text-[1.65rem] font-semibold leading-tight tracking-tight text-ink sm:text-4xl sm:leading-[1.15]">
          Helping Muslims turn reminders into action.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted leading-relaxed">
          A calm place to capture what moved you — then revisit it with structure, adab, and clarity.
        </p>
      </header>

      <div className="mt-12 space-y-12 text-sm leading-relaxed text-ink/90">
        <section className="rounded-2xl border border-black/[0.06] bg-gradient-to-br from-mint/40 via-surface to-accent-soft/30 p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            What we do
          </h2>
          <p className="mt-4">
            DeenNotes AI helps Muslims organise what they hear and read — khutbahs, lectures, circles, and Qur&apos;an reflection — into notes, reminders, dua prompts, and shareable cards. The focus is <strong className="text-ink">reflection, organisation, and spiritual consistency</strong>, not drowning in scattered screenshots or unfinished drafts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Mission
          </h2>
          <p>
            We exist to honour the fleeting moment of understanding: when an ayah clicks, when a khutbah names your struggle, when a lecturer offers a dua you don&apos;t want to forget. We want that barakah-backed insight to survive the commute home — and return to you on purpose, not by accident.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Product philosophy
          </h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-accent">·</span>
              <span>
                <strong className="text-ink">Tranquil craft:</strong> typography, emerald-and-stone calm, motion that respects distraction-free reading.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent">·</span>
              <span>
                <strong className="text-ink">AI as scribe &amp; study partner—not muftī:</strong> helpful drafts and prompts, clearly bounded; not a jurist&apos;s podium.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent">·</span>
              <span>
                <strong className="text-ink">Mobile-first mirror:</strong> web and future native apps share the same feature shapes so your habit travels with you.
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-accent/15 bg-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Not a replacement for scholars &amp; imams
          </h2>
          <p>
            DeenNotes does not issue fatāwa or formal religious verdicts. For rulings and sensitive matters of creed or practice, rely on trustworthy, qualified scholars and teachers in your community and tradition.
          </p>
          <p className="text-muted text-[0.8rem]">
            See also our{" "}
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              Terms of Service
            </Link>
            {" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Where we&apos;re headed
          </h2>
          <p>
            Today: richer note capture tied to Qur&apos;an navigation, graceful offline habits, thoughtful collaboration for study circles — always with adab and safety in mind.
          </p>
          <p className="text-muted">
            We build in public humility: ship, listen, refine. If DeenNotes helps you carry one sincere reminder farther, our day is fulfilled.
          </p>
        </section>
      </div>
    </PublicArticleLayout>
  );
}
