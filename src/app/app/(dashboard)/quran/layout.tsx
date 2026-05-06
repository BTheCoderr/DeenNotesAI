import type { Metadata } from "next";

/**
 * Discourages machine translation of Arabic Qur’anic text in supporting browsers
 * and requests Google not to offer translate chrome for this subtree.
 */
export const metadata: Metadata = {
  other: {
    google: "notranslate",
  },
};

export default function QuranSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div translate="no" className="notranslate flex flex-col min-h-0">
      <div className="flex-1 min-h-0">{children}</div>
      <footer className="mx-auto max-w-2xl w-full px-4 py-6 border-t border-black/[0.06] text-[0.65rem] text-muted leading-relaxed">
        DeenNotes is for reflection, organization, and learning support. It does not issue fatwas
        or replace qualified scholars, imams, or local prayer-time authorities.
      </footer>
    </div>
  );
}
