import Link from "next/link";

import { QuranBrowseSearchPanel } from "@/features/quran/components/QuranBrowseSearchPanel";

export default function QuranSearchPage() {
  return (
    <div className="space-y-6 pb-24">
      <Link
        href="/app/quran"
        className="text-sm font-semibold text-accent hover:underline"
      >
        ← Back to surahs
      </Link>
      <QuranBrowseSearchPanel variant="page" />
    </div>
  );
}
