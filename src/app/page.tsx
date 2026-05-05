import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-black/5 bg-surface/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <span className="font-display text-xl font-semibold text-ink tracking-tight">
            DeenNotes
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-muted hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-4 py-2 bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 text-center">
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
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
            >
              Create Your First DeenNote
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center rounded-full border border-black/10 bg-surface px-8 py-3.5 text-base font-semibold text-ink hover:border-accent/30 transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-4 md:gap-6">
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
              <h2 className="font-display text-lg font-semibold text-ink">
                {c.title}
              </h2>
              <p className="mt-2 text-muted text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
