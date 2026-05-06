import Link from "next/link";

import { InviteFriendRow } from "@/components/settings/InviteFriendRow";
import { SignOutButton } from "@/components/settings/SignOutButton";
import { APP_DISCLAIMER, betaFeedbackMailto } from "@/lib/constants";

function RowLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25 active:scale-[0.995]"
    >
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
          ← Home
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Gentle controls for reflection—never a shortcut around qualified teachers.
        </p>
      </div>

      <div className="space-y-3">
        <RowLink href="/app/settings/account" title="Account" subtitle="Email and display name" />
        <RowLink
          href="/app/settings/share-cards"
          title="Saved share cards"
          subtitle="Reminder cards you've saved"
        />
        <a
          href={betaFeedbackMailto()}
          className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 shadow-sm transition hover:border-accent/25"
        >
          <span className="font-semibold text-ink">Feedback</span>
          <span className="text-accent font-semibold text-sm shrink-0">Email</span>
        </a>
        <InviteFriendRow />
        <RowLink href="/app/faq" title="FAQ" subtitle="Safety, reflections, roadmap" />
        <RowLink href="/app/settings/about" title="About" subtitle="What DeenNotes is" />
      </div>

      <section className="rounded-2xl border border-black/8 bg-background p-4 text-xs text-muted leading-relaxed">
        {APP_DISCLAIMER}
      </section>

      <SignOutButton />
    </div>
  );
}
