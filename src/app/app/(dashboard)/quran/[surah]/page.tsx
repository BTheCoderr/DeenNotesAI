import { notFound } from "next/navigation";

import { SurahReaderScreen } from "@/features/quran";

type Props = { params: Promise<{ surah: string }> };

export default async function QuranSurahPage({ params }: Props) {
  const { surah } = await params;
  const n = Number(surah);
  if (!Number.isFinite(n) || n < 1 || n > 114) {
    notFound();
  }

  return <SurahReaderScreen surahNumber={n} />;
}
