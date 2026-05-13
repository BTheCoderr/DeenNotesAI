import Link from "next/link";

import { DeenNotesLogo } from "@/components/brand/DeenNotesLogo";
import { DeenNotesTagline } from "@/components/brand/DeenNotesTagline";
import { AppStoreCta } from "@/components/marketing/AppStoreCta";
import { LandingDemoMedia } from "@/components/marketing/LandingDemoMedia";
import { APP_STORE_URL } from "@/lib/app-download";

function LandingReadyToTryCta(props: {
  eyebrow?: string;
  headlineClassName?: string;
  /** Supporting line under “Ready to try it?” */
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 text-center">
      {props.eyebrow ? (
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-accent">
          {props.eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem] ${props.headlineClassName ?? ""}`}
      >
        Ready to try it?
      </h2>
      <p className="mt-2 text-muted text-sm leading-relaxed">
        {props.body ??
          "Reflect, save notes, and receive AI-guided reminders from your phone."}
      </p>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <AppStoreCta
          subtitle={false}
          className="!w-full max-w-[22rem]"
          aria-label="Download DeenNotes on the App Store (opens Apple App Store)"
        >
          <>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/65">
              iPhone · iPad
            </span>
            <span className="mt-1 text-[1.08rem] font-semibold leading-tight">
              Download on the App Store
            </span>
          </>
        </AppStoreCta>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-surface/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 sm:py-4">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-w-0 shrink"
          >
            <DeenNotesLogo size="lg" />
          </Link>
          <div className="flex items-center justify-end gap-1.5 flex-wrap text-sm font-semibold shrink-0 sm:gap-2">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-[#121212] px-3 py-2 text-[11px] sm:text-[13px] text-white whitespace-nowrap shadow-sm ring-1 ring-black/10 transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              App&nbsp;Store
            </a>
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-muted hover:text-ink transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-3 py-2 sm:px-4 bg-accent text-white hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              Get&nbsp;started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
            Islamic learning journal
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] leading-tight text-ink font-semibold">
            Turn khutbahs and Islamic lectures into notes you can actually live
            by.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Organize reflections, extract reminders, and shape gentle next
            steps—without replacing your scholar or imam.
          </p>

          {/* Mobile-first download */}
          <div className="mt-12 rounded-3xl border border-accent/15 bg-gradient-to-b from-accent-soft/[0.28] via-surface to-surface px-6 py-8 sm:p-10 text-center shadow-[0_28px_60px_-32px_rgb(17_92_71/0.45)]">
            <p className="font-display text-xl md:text-[1.45rem] font-semibold tracking-tight text-ink leading-snug">
              Download DeenNotes AI on iPhone
            </p>
            <p className="mt-3 mx-auto max-w-md text-muted text-[0.95rem] md:text-[1.02rem] leading-relaxed">
              Reflect, save notes, and receive AI-guided reminders from your
              phone.
            </p>
            <div className="mt-7 flex justify-center px-2">
              <AppStoreCta
                className="!w-full max-w-[22rem] sm:!w-auto"
                aria-label="Download DeenNotes AI on the App Store (opens in a new tab)"
              >
                <>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/68">
                    On the&nbsp;Store
                  </span>
                  <span className="mt-1 text-[1.02rem] sm:text-[1.1rem] font-semibold tracking-tight">
                    Download on the App Store
                  </span>
                  <span className="mt-1 text-center text-[0.74rem] text-white/62 leading-snug px-4 max-w-[20rem]">
                    Install on iPhone to reflect between visits — same calm design
                    you see on the web.
                  </span>
                </>
              </AppStoreCta>
            </div>
          </div>

          <div className="mt-10 flex justify-center px-4">
            <DeenNotesTagline size="md" variant="subtle" className="max-w-md" />
          </div>

          <div className="mt-11 flex flex-col items-stretch gap-4 max-w-xl mx-auto w-full px-4 sm:px-0">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted font-bold">
              Continue on web
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors touch-manipulation"
              >
                Create Your First DeenNote
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center rounded-full border border-black/10 bg-surface px-8 py-3.5 text-base font-semibold text-ink hover:border-accent/30 transition-colors touch-manipulation"
              >
                I already have an account
              </Link>
            </div>
            <Link
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm font-semibold text-accent hover:text-accent-hover py-3 touch-manipulation"
            >
              Prefer mobile? Grab the iPhone app instead →
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-20 pt-6 border-t border-black/[0.04]">
          <p className="text-center text-[0.72rem] font-bold uppercase tracking-[0.2em] text-accent">
            Watch the demo
          </p>
          <h2 className="mt-3 text-center font-display text-xl sm:text-2xl md:text-[1.7rem] font-semibold tracking-tight text-ink">
            A calm glance at journaling on the&nbsp;move
          </h2>

          <div className="mt-11">
            <LandingDemoMedia />
          </div>

          <div className="mt-12 md:mt-16 lg:mt-20">
            <LandingReadyToTryCta />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-20 grid md:grid-cols-3 gap-4 md:gap-6 md:pb-28">
          {[
            {
              title: "From chaos to clarity",
              body: "Paste rough notes from the masjid or a lecture. DeenNotes helps you summarize what stuck with you.",
            },
            {
              title: "Reflection, not rulings",
              body: "This is not a fatwa tool—just a calm space to journal what you heard and how you want to grow.",
            },
            {
              title: "Share what inspires",
              body: "Each note can include a short reminder card you can copy and share—with care and good adab.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card text-left"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-muted text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
          <div className="md:col-span-3 mt-8 md:mt-10 pt-10 md:pt-12 border-t border-black/[0.06] text-center">
            <p className="text-sm md:text-[0.95rem] font-semibold text-ink">
              Prefer the calm of your lock screen reminders?
            </p>
            <div className="mt-6 flex justify-center px-4">
              <AppStoreCta
                subtitle={false}
                className="!w-full max-w-[22rem]"
                aria-label="Download DeenNotes on the App Store"
              >
                <>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/67">
                    iPhone
                  </span>
                  <span className="mt-1 text-[1.05rem] font-semibold tracking-tight">
                    Download on the App Store
                  </span>
                </>
              </AppStoreCta>
            </div>
          </div>
        </section>

        <section
          aria-label="Install DeenNotes on iPhone"
          className="border-t border-black/[0.05] bg-mint/[0.12] pb-24 pt-16"
        >
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="font-display text-2xl sm:text-[1.77rem] font-semibold tracking-tight text-ink">
              Bring DeenNotes with you wherever you wander.
            </p>
            <p className="mt-4 text-muted text-[0.95rem] md:text-[1.02rem] leading-relaxed mx-auto">
              Download DeenNotes AI on iPhone — reflect offline moments, jot a
              remembrance after salāh, and let gentle AI structure your next dua
              nudge.
            </p>
            <div className="mt-10 flex justify-center px-2">
              <AppStoreCta
                subtitle={false}
                className="!w-full max-w-[22rem]"
                aria-label="Open the App Store to download DeenNotes AI"
              >
                <>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/67">
                    iOS
                  </span>
                  <span className="mt-1 text-[1.06rem] font-semibold tracking-tight">
                    Download on the App Store
                  </span>
                </>
              </AppStoreCta>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
