import type { Metadata } from "next";
import Link from "next/link";

import { PublicArticleLayout } from "@/components/marketing/PublicArticleLayout";
import {
  LEGAL_LAST_UPDATED,
  publicPageMeta,
  supportEmail,
} from "@/lib/site";

export const metadata: Metadata = publicPageMeta(
  "/terms",
  "Terms of Service",
  "Educational reflection only — no fatwas. Responsible use of DeenNotes AI, accounts, acceptable use, AI limitations, warranties, and third-party Quran APIs.",
);

export default function TermsOfServicePage() {
  const email = supportEmail();

  return (
    <PublicArticleLayout narrow>
      <header className="border-b border-black/[0.06] pb-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
          Legal
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Terms of service
        </h1>
        <p className="mt-3 text-sm text-muted">
          Last updated {LEGAL_LAST_UPDATED}. Reading these Terms does not waive your statutory rights where they cannot legally be waived.
        </p>
      </header>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/90">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Acceptance
          </h2>
          <p>
            By accessing DeenNotes AI (the &quot;Service&quot;) on the web or in future companion apps, you agree to these Terms and our{" "}
            <Link href="/privacy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            . If you disagree, discontinue use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            What DeenNotes is for
          </h2>
          <p>
            DeenNotes helps Muslims organise khutbahs, lectures, Qur&apos;an reflections, and personal reminders into structured notes. The Service is for <strong className="text-ink">reflection and educational organisation</strong> only. It does <strong className="text-ink">not</strong> provide religious rulings (fatwa), legal advice, medical advice, or substitute for qualified scholars, imams, or teachers.
          </p>
          <p>
            <strong className="text-ink">You are responsible</strong> for how you interpret and act on anything in the app — including AI-generated text — and for verifying matters of faith and practice with appropriate, qualified guidance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            AI outputs
          </h2>
          <p>
            Features that use artificial intelligence may produce summaries, prompts, or suggestions that are <strong className="text-ink">incomplete, inaccurate, or unsuitable</strong> for your situation. AI output does not necessarily reflect our views. You agree to exercise sound judgment and not to rely on the Service as an authoritative religious or legal authority.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Accounts &amp; security
          </h2>
          <p>
            You are responsible for safeguarding your credentials and for activity under your account. Notify us promptly of suspected unauthorised access using the contact method below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5 marker:text-accent">
            <li>harass, threaten, abuse, or harm others;</li>
            <li>upload or generate unlawful, hateful, exploitative, or violative content;</li>
            <li>attempt to break, overload, scrape, or reverse engineer the Service except where law forbids such a restriction;</li>
            <li>access or attempt to access another user&apos;s data;</li>
            <li>misrepresent your identity or affiliation;</li>
            <li>use the Service to build competing model training sets from our or others&apos; protected content without permission.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Enforcement &amp; termination
          </h2>
          <p>
            We may suspend or terminate access — with or without notice — if we reasonably believe you violated these Terms, created risk, or must comply with law. You may stop using the Service at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Third-party services &amp; Qur&apos;an APIs
          </h2>
          <p>
            The Service may call Quran Foundation / Quran.com APIs or similar providers under their licences and developer rules. Separate OAuth flows may apply. Your use of those features is additionally subject to{" "}
            <strong className="text-ink">the third party&apos;s terms</strong>. Register production redirect URIs (for example{" "}
            <code className="rounded bg-mint/60 px-1.5 py-0.5 text-[0.75rem]">
              /auth/quran/callback
            </code>
            ) exactly as deployed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Intellectual property
          </h2>
          <p>
            We retain rights in the DeenNotes software, branding, and materials. You retain rights in your original content, granting us the licence described in our Privacy Policy / product flows needed to host and improve the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Disclaimers
          </h2>
          <p>
            THE SERVICE IS PROVIDED <strong className="text-ink">&quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot;</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Limitation of liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE (AND OUR TEAM, CONTRACTORS, AND SUPPLIERS) WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, GOODWILL, OR REPUTATION, ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE SIX MONTHS BEFORE THE CLAIM OR (B) FIFTY US DOLLARS (IF YOU HAVE NOT PAID US). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE CASES, LIMITS APPLY ONLY TO THE EXTENT ALLOWED.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Changes
          </h2>
          <p>
            We may revise these Terms. Material changes may be communicated in-product or via email where appropriate. Continued use after changes means acceptance of the updated Terms (except where your local law requires otherwise).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">
            Contact
          </h2>
          <p>
            {email ? (
              <>
                Reach us at{" "}
                <a
                  className="font-semibold text-accent hover:underline"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
                .
              </>
            ) : (
              <>
                Reach us via the form on{" "}
                <Link href="/contact" className="font-semibold text-accent hover:underline">
                  /contact
                </Link>{" "}
                once support email is configured.
              </>
            )}
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-accent/20 bg-mint/25 p-5 text-[0.8rem] text-muted">
          <p>
            Drafted for OAuth and marketplace review drafts — engage qualified counsel before relying on these Terms commercially.
          </p>
        </section>
      </div>
    </PublicArticleLayout>
  );
}
