import Link from "next/link";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

type Props = {
  children: React.ReactNode;
  /** Optional narrower measure for dense legal prose */
  narrow?: boolean;
};

/**
 * Shared shell for public marketing / legal routes — aligns with emerald–stone branding and mobile-first readability.
 */
export function PublicArticleLayout({ children, narrow }: Props) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,520px)] bg-gradient-to-b from-mint/50 via-accent-soft/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[20%] top-24 h-72 w-72 rounded-full bg-accent/12 blur-[100px] motion-reduce:opacity-60"
        aria-hidden
      />
      <header className="relative z-10 border-b border-black/[0.05] bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink hover:text-accent transition-colors"
          >
            DeenNotes AI
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-accent/90 hover:text-accent hover:underline underline-offset-4"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto px-4 py-10 sm:py-14",
          narrow ? "max-w-2xl" : "max-w-3xl",
        )}
      >
        <article
          className={cn(
            "rounded-[1.65rem] border border-black/[0.06] bg-surface/90 p-6 shadow-[0_20px_60px_-24px_rgba(18,122,99,0.25)] backdrop-blur-sm sm:p-10",
            "motion-safe:animate-quran-soft-in motion-reduce:animate-none",
          )}
        >
          {children}
        </article>

        <footer className="mt-10 pb-12 text-center text-[0.7rem] text-muted leading-relaxed">
          <p>
            Reflection and organisation — not rulings.&nbsp;
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              Terms
            </Link>
            &nbsp;·&nbsp;
            <Link href="/privacy" className="font-semibold text-accent hover:underline">
              Privacy
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/app" className="font-semibold text-accent hover:underline">
              Open app
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
