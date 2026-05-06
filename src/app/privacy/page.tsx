import type { Metadata } from "next";
import Link from "next/link";

import { PublicArticleLayout } from "@/components/marketing/PublicArticleLayout";
import {
  LEGAL_LAST_UPDATED,
  publicPageMeta,
  supportEmail,
} from "@/lib/site";

export const metadata: Metadata = publicPageMeta(
  "/privacy",
  "Privacy Policy",
  "How DeenNotes AI handles your notes, account data, AI features, cookies, and Quran-related integrations.",
);

export default function PrivacyPolicyPage() {
  const email = supportEmail();

  return (
    <PublicArticleLayout narrow>
      <header className="border-b border-black/[0.06] pb-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
          Trust &amp; data
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Privacy policy
        </h1>
        <p className="mt-3 text-sm text-muted">
          Last updated {LEGAL_LAST_UPDATED}. This summary is written to be clear; have qualified counsel review it for your jurisdiction and product changes.
        </p>
      </header>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Who we are
          </h2>
          <p>
            DeenNotes AI (&quot;DeenNotes,&quot; &quot;we,&quot; &quot;us&quot;) provides a web and mobile experience for Muslims to capture, organise, and revisit Islamic learning — including notes from khutbahs, lectures, Qur&apos;an reflection, and personal reminders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Your notes stay yours
          </h2>
          <p>
            You own the content you create in DeenNotes, including your raw notes, summaries, and reflection prompts, subject to the license you grant us to run the service (see our{" "}
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              Terms of Service
            </Link>
            ). We do not sell your personal notes or use them as a product for unrelated third-party marketing lists.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            How we protect access
          </h2>
          <p>
            Accounts are secured with industry-standard authentication (e.g. email magic links or OAuth providers you choose, via our auth partner). Access to your saved notes requires a valid signed-in session. Data is transmitted over encrypted connections (TLS). Stored data is handled on infrastructure designed for authenticated access controls; however, no online service can guarantee absolute security — please use a strong, unique password or provider where applicable and protect your devices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Information we process
          </h2>
          <ul className="list-disc space-y-2 pl-5 marker:text-accent">
            <li>
              <strong className="text-ink">Account &amp; session:</strong> identifiers such as email, user id, authentication tokens/cookies necessary to keep you logged in safely.
            </li>
            <li>
              <strong className="text-ink">Content you submit:</strong> text you enter, uploads you attach (if enabled), structured fields we display in the app (e.g. titles, summaries, Qur&apos;an references surfaced in UI).
            </li>
            <li>
              <strong className="text-ink">AI-generated reflections:</strong> outputs produced when you invoke AI-assisted features — clearly labelled as assists, not rulings — which we process to deliver the feature you requested and to maintain product safety and quality.
            </li>
            <li>
              <strong className="text-ink">Technical &amp; diagnostic data:</strong> limited logs and device/browser metadata to operate, secure, and improve reliability (e.g. error reports, approximate region from IP for abuse prevention where applicable).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Cookies &amp; authentication
          </h2>
          <p>
            We use cookies and similar technologies to maintain sessions, remember preferences, and protect against abuse. Strictly necessary cookies are required for sign-in. You can control non-essential cookies through your browser; disabling necessary cookies may prevent the app from working correctly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Analytics
          </h2>
          <p>
            We may use privacy-conscious, aggregated analytics to understand feature usage and performance (for example, page views or funnels) without building individual advertising profiles. If we introduce new analytics vendors, we will update this policy and, where required, provide appropriate choices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Qur&apos;an Foundation &amp; related APIs
          </h2>
          <p>
            Reading, audio, or metadata features may be powered by Quran Foundation / Quran.com ecosystem APIs. When you only use public verse data inside DeenNotes, requests are made on your behalf from our servers subject to their terms. If you later connect a Quran Foundation account through OAuth, that provider may process account-related data according to its own policies; we will only request the scopes needed to deliver the features you enable and will not sell that connection data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            AI services
          </h2>
          <p>
            AI features rely on model providers under our instructions. We design prompts to minimise unnecessary personal data, but you should avoid pasting highly sensitive information you are not comfortable processing through third-party AI infrastructure. AI output can be wrong or incomplete — always verify with qualified teachers for religious guidance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Retention &amp; deletion
          </h2>
          <p>
            We retain information as long as your account is active and for a reasonable period afterward for backups, legal compliance, and dispute resolution. You may request deletion of your account subject to applicable law; some records may be retained where required.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Children
          </h2>
          <p>
            DeenNotes is not directed at children under 13 (or the minimum age in your region). We do not knowingly collect personal information from children. If you believe we have, contact us and we will promptly investigate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            International users
          </h2>
          <p>
            If you access DeenNotes from outside your home country, your information may be processed in countries where we or our vendors operate. We use safeguards appropriate to the transfer as required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Contact
          </h2>
          <p>
            Questions about this policy:{" "}
            {email ? (
              <a
                className="font-semibold text-accent hover:underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            ) : (
              <span className="text-muted">
                use the contact form on{" "}
                <Link href="/contact" className="font-semibold text-accent hover:underline">
                  /contact
                </Link>{" "}
                once support email is configured.
              </span>
            )}
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-accent/20 bg-mint/25 p-5 text-[0.8rem] text-muted">
          <p>
            <strong className="text-ink">Not legal advice.</strong> This page helps reviewers and users understand our posture; it is not a substitute for counsel or for Quran Foundation&apos;s independent review requirements.
          </p>
        </section>
      </div>
    </PublicArticleLayout>
  );
}
