import Link from "next/link";

export default function NoteNotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Note not found
      </h1>
      <p className="text-muted mt-2">
        This note may have been removed or you don&apos;t have access.
      </p>
      <Link
        href="/app/notes"
        className="inline-block mt-8 text-accent font-semibold hover:underline"
      >
        Back to notes
      </Link>
    </div>
  );
}
