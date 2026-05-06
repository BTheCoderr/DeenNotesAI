import Link from "next/link";

import { betaFeedbackMailto } from "@/lib/constants";

function FaqAccordion() {
  const items = [
    {
      q: "What is DeenNotes?",
      a: "DeenNotes helps you turn khutbahs, lectures, Qur’an reflections, halaqa notes, and personal reminders into organized summaries, action steps, duas, reflection prompts, study-style notes, and share cards—reflection only, never legal rulings.",
    },
    {
      q: "Is this a fatwa tool?",
      a: "No. DeenNotes is not an imam, scholar, or fatwa service. Outputs are organizational and reflective prompts. Always consult a qualified scholar or imam for religious rulings and major life decisions.",
    },
    {
      q: "How do I create a reflection?",
      a: 'Use the "+" (New DeenNote) menu, choose a capture type—like Paste Notes or Khutbah Notes—paste your rough bullets, then generate your structured reminder. Follow up weekly from your dashboard strip.',
    },
    {
      q: "Can I use khutbah notes?",
      a: "Yes. Paste what you jot down during Jumu’ah and DeenNotes will help shape summaries and weekly reminders. Remember: scholars teach; this app organizes your notes.",
    },
    {
      q: "Can I summarize YouTube or audio?",
      a: "Not yet—you’ll want to jot or paste your own bullets for now. YouTube and audio ingestion are marked coming soon alongside scan and uploads.",
    },
    {
      q: "How do I share a reminder card?",
      a: 'Open any note, switch to the "Share Card" tab, copy the text, save it to your account, or export the styled card PNG on supported browsers.',
    },
    {
      q: "How do I give feedback?",
      a: "Use Feedback in Settings to email the beta team—we read every heartfelt note.",
    },
  ];

  return (
    <div className="space-y-3 pb-20">
      {items.map(({ q, a }) => (
        <details
          key={q}
          className="group rounded-2xl border border-black/[0.06] bg-surface shadow-sm px-4 py-1 open:shadow-card open:border-accent/15"
        >
          <summary className="cursor-pointer list-none py-3.5 flex items-center justify-between gap-4 font-display font-semibold text-ink text-[0.95rem] [&::-webkit-details-marker]:hidden">
            {q}
            <span className="text-accent text-lg leading-none shrink-0 group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <p className="text-sm text-muted leading-relaxed pb-4 border-t border-black/5 mt-2 pt-3">{a}</p>
        </details>
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-3"
        >
          ← Settings
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">FAQ</h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Honest answers about reflection, safety, and what&apos;s next.
        </p>
      </div>
      <FaqAccordion />
      <p className="text-center text-sm text-muted pb-8">
        Still curious?{" "}
        <a className="font-semibold text-accent hover:underline" href={betaFeedbackMailto()}>
          Email feedback
        </a>
      </p>
    </div>
  );
}
