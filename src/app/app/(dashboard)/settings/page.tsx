import Link from "next/link";

import { InviteFriendRow } from "@/components/settings/InviteFriendRow";
import { SignOutButton } from "@/components/settings/SignOutButton";
import { APP_DISCLAIMER, betaFeedbackMailto } from "@/lib/constants";

function RowLink({
  href,
  title,
  subtitle,
  external,
}: {
  href: string;
  title: string;
  subtitle?: string;
  external?: boolean;
}) {
  const className =
    "flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]";

  if (external) {
    return (
      <a href={href} className={className}>
        <span>
          <span className="block font-semibold text-ink">{title}</span>
          {subtitle ? (
            <span className="block text-xs text-muted mt-1 leading-snug">{subtitle}</span>
          ) : null}
        </span>
        <span className="text-accent font-semibold text-sm shrink-0">↗</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        {subtitle ? (
          <span className="block text-xs text-muted mt-1 leading-snug">{subtitle}</span>
        ) : null}
      </span>
      <span className="text-accent font-semibold text-sm shrink-0">→</span>
    </Link>
  );
}

export const dynamic = "force-dynamic";

export default function SettingsHubPage() {
  return (
    <div className="space-y-6 pb-24">
      <div>
        <Link
          href="/app"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-5"
        >
          ← Today
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Preferences live here — the bottom bar stays simple: Reflect, Today, New, Quran, Prayer.
        </p>
      </div>

      <div className="space-y-3">
        <RowLink href="/app/settings/account" title="Account" subtitle="Email and profile" />
        <RowLink
          href="/app/prayer/settings"
          title="Prayer preferences"
          subtitle="Location, calculation method, and madhhab"
        />
        <RowLink
          href="/app/prayer/settings?focus=reminders"
          title="Prayer reminders"
          subtitle="Quiet nudges before salah — on this device"
        />
        <RowLink
          href="/app/quran/settings"
          title="Quran preferences"
          subtitle="Language, translation, tafsir, reciter"
        />
        <RowLink
          href="/app/settings/reflection"
          title="Reflection preferences"
          subtitle="Prompts and tone — placeholder"
        />
        <RowLink
          href="/app/settings/share-cards"
          title="Saved share cards"
          subtitle="Reminder cards you saved from notes"
        />
        <RowLink
          href="/app/settings/about"
          title="About DeenNotes"
          subtitle="What this app is for"
        />
        <a
          href={betaFeedbackMailto()}
          className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25"
        >
          <span className="font-semibold text-ink">Feedback</span>
          <span className="text-accent font-semibold text-sm shrink-0">Email</span>
        </a>
        <InviteFriendRow />
        <RowLink href="/privacy" title="Privacy policy" subtitle="How we handle data" external />
        <RowLink href="/terms" title="Terms of use" subtitle="Using DeenNotes" external />
      </div>

      <section className="rounded-2xl border border-black/8 bg-background p-4 text-xs text-muted leading-relaxed">
        {APP_DISCLAIMER}
      </section>

      <SignOutButton />
    </div>
  );
}
