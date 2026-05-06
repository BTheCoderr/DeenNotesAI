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
    <div translate="no" className="notranslate">
      {children}
    </div>
  );
}
