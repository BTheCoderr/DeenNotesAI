import { ExampleReflectionCard } from "@/components/notes/new/ExampleReflectionCard";
import { ReflectionHeroCta } from "@/components/notes/new/ReflectionHeroCta";
import { NewNoteForm } from "@/components/notes/NewNoteForm";
import { parseNoteTypeQuery } from "@/lib/note-type-query";

type SearchParams = { type?: string; from?: string };

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type, from } = await searchParams;
  const initialType = parseNoteTypeQuery(type);
  const fromOnboarding = from === "onboarding";

  return (
    <div className="max-w-md mx-auto px-0 py-4 space-y-6 pb-32 md:pb-10">
      <ReflectionHeroCta />
      <ExampleReflectionCard />
      <NewNoteForm
        initialNoteType={initialType}
        showOnboardingHint={fromOnboarding}
      />
      <p className="text-center text-xs text-muted leading-relaxed px-1 pb-8">
        DeenNotes organizes reflection only—it isn’t a scholar or fatwa resource.
        For rulings, consult a qualified imam or scholar.
      </p>
    </div>
  );
}
