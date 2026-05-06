import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { PublicArticleLayout } from "@/components/marketing/PublicArticleLayout";
import { publicPageMeta, supportEmail } from "@/lib/site";

export const metadata: Metadata = publicPageMeta(
  "/contact",
  "Contact",
  "Reach the DeenNotes AI team — feedback, partnerships, and Quran API integration questions.",
);

export default function ContactPage() {
  const email = supportEmail();

  return (
    <PublicArticleLayout narrow>
      <header className="border-b border-black/[0.06] pb-8 text-center sm:text-left">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
          Hello
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          We&apos;d love to hear from you.
        </h1>
        <p className="mt-4 text-sm text-muted leading-relaxed max-w-lg mx-auto sm:mx-0">
          Share beta feedback, ask about Quran Foundation onboarding, or say salām — every thoughtful message informs the roadmap.
        </p>
      </header>

      <div className="mt-10 text-sm leading-relaxed text-ink/90">
        <section className="rounded-2xl border border-accent/20 bg-gradient-to-br from-mint/35 to-surface p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Email</h2>
          {email ? (
            <p className="mt-3">
              <a
                href={`mailto:${email}`}
                className="break-all font-semibold text-accent text-base hover:underline"
              >
                {email}
              </a>
            </p>
          ) : (
            <p className="mt-3 text-muted">
              Set{" "}
              <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_BETA_FEEDBACK_EMAIL
              </code>{" "}
              in your deployment environment so this field displays publicly.
            </p>
          )}
        </section>

        <h2 className="mt-10 font-display text-lg font-semibold text-ink">
          Feedback
        </h2>
        <p className="mt-2 text-muted text-[0.8rem]">
          The form prepares an email draft in your mail app — no message is stored on our servers from this step alone.
        </p>

        <ContactForm supportEmail={email} />
      </div>
    </PublicArticleLayout>
  );
}
