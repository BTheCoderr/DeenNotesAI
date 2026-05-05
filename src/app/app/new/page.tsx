import { NewNoteForm } from "@/components/notes/NewNoteForm";

export default function NewNotePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        New DeenNote
      </h1>
      <p className="text-muted mt-2 mb-8 leading-relaxed">
        Choose a note type, paste what you captured, then generate a structured
        reflection you can revisit. Try a sample prompt below, or write your
        own—DeenNotes stays a journal, not a scholar or fatwa service.
      </p>
      <NewNoteForm />
    </div>
  );
}
