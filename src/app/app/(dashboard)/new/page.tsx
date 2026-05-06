import { ExampleReflectionCard } from "@/components/notes/new/ExampleReflectionCard";
import { ReflectionHeroCta } from "@/components/notes/new/ReflectionHeroCta";
import { NewNoteForm } from "@/components/notes/NewNoteForm";
import { parseNoteTypeQuery } from "@/lib/note-type-query";

type SearchParams = { type?: string; from?: string; verseRef?: string };

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type, from, verseRef } = await searchParams;
  const initialType = parseNoteTypeQuery(type);
  const fromOnboarding = from === "onboarding";

  let reflectionSeed: string | undefined;
  const ref = verseRef?.trim();
  if (ref) {
    reflectionSeed =
      `[Reflection cue — Quran ${decodeURIComponent(ref)}]\nPaste your ayah wording and personal thoughts here.` +
      `\n\n`;
  }

  return (
    <div className="max-w-md mx-auto px-0 py-4 space-y-6 pb-32 md:pb-10">
      <ReflectionHeroCta />
      <ExampleReflectionCard />
      <NewNoteForm
        initialNoteType={initialType}
        showOnboardingHint={fromOnboarding}
        reflectionSeed={reflectionSeed}
      />
      <p className="text-center text-xs text-muted leading-relaxed px-1 pb-8">
        DeenNotes organizes reflection only—it isn’t a scholar or fatwa resource.
        For rulings, consult a qualified imam or scholar.
      </p>
    </div>
  );
}
