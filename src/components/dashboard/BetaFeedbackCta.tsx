import { betaFeedbackMailto } from "@/lib/constants";

export function BetaFeedbackCta({ className }: { className?: string }) {
  return (
    <a
      href={betaFeedbackMailto()}
      className={
        className ??
        "inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
      }
    >
      Testing DeenNotes? Send feedback
    </a>
  );
}
