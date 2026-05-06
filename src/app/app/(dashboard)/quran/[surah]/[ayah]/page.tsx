import { notFound } from "next/navigation";

import { SurahReaderScreen } from "@/features/quran";
import { maxVerseForChapter } from "@/lib/quran/chapter-verse-counts";

type Props = { params: Promise<{ surah: string; ayah: string }> };

export default async function QuranAyahPage({ params }: Props) {
  const { surah, ayah } = await params;
  const s = Number(surah);
  const a = Number(ayah);
  const max = maxVerseForChapter(s);
  if (!Number.isFinite(s) || s < 1 || s > 114 || max == null) {
    notFound();
  }
  if (!Number.isFinite(a) || a < 1 || a > max) {
    notFound();
  }

  return <SurahReaderScreen surahNumber={s} highlightAyah={a} />;
}
