import { ExampleReflectionCard } from "@/components/notes/new/ExampleReflectionCard";
import { ReflectionHeroCta } from "@/components/notes/new/ReflectionHeroCta";
import { NewNoteForm } from "@/components/notes/NewNoteForm";

export default function NewNotePage() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 pb-32">
      <ReflectionHeroCta />
      <ExampleReflectionCard />
      <NewNoteForm />
      <p className="text-center text-xs text-stone-500 leading-relaxed px-1">
        DeenNotes is a reflection tool, not a scholar or fatwa service. For
        religious rulings, consult a qualified imam or scholar.
      </p>
    </div>
  );
}
