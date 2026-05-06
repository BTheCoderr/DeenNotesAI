import Link from "next/link";

import { ExampleReflectionCard } from "@/components/notes/new/ExampleReflectionCard";
import { ReflectionHeroCta } from "@/components/notes/new/ReflectionHeroCta";
import { NewNoteForm } from "@/components/notes/NewNoteForm";

import { parseNewNoteQuery, type NewNotePremiumStub } from "@/lib/note-mode-query";

type SearchParams = {
  mode?: string;
  type?: string;
  from?: string;
  verseRef?: string;
};

const STUB_COPY: Record<
  NewNotePremiumStub,
  { title: string; body: string }
> = {
  record_khutbah: {
    title: "Record Khutbah",
    body:
      "Live khutbah capture with gentle structuring is on the roadmap. After Jumu’ah, open Paste Notes or a Personal reminder to jot what moved you.",
  },
  youtube_lecture: {
    title: "YouTube Lecture Link",
    body:
      "Link-based Islamic lectures and reminders are shipping carefully. Paste key reminders and Qur’an references manually for now.",
  },
  upload_audio: {
    title: "Upload Audio",
    body:
      "Uploads for khutbah or halaqa clips stay local-first once ready. Paste words you remember into Paste Notes today.",
  },
  scan_pdf: {
    title: "Scan / Upload PDF",
    body:
      "Halaqa and Ramadan prep PDFs need a respectful pipeline. Capture important lines manually with Paste Notes for now.",
  },
};

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { mode, type, from, verseRef } = await searchParams;
  const resolved = parseNewNoteQuery({ mode, type });

  const fromOnboarding = from === "onboarding";

  let reflectionSeed: string | undefined;
  const ref = verseRef?.trim();
  if (ref) {
    reflectionSeed =
      `[Reflection cue — Qur’an ${decodeURIComponent(ref)}]\nPaste the ayah wording you rely on and your personal thoughts here.` +
      `\n\n`;
  }

  if (resolved?.kind === "premium") {
    const c = STUB_COPY[resolved.stub];
    return (
      <div className="max-w-md mx-auto px-1 py-6 space-y-6 pb-28">
        <div className="rounded-[1.5rem] border border-black/[0.06] bg-[#F9F6F1] px-6 py-8 shadow-sm space-y-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-900/85">
            Coming soon · building with adab
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">{c.title}</h1>
          <p className="text-sm text-muted leading-relaxed">{c.body}</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/app/new?mode=paste_notes"
              className="inline-flex justify-center rounded-2xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-white"
            >
              Use Paste Notes
            </Link>
            <Link
              href="/app"
              className="inline-flex justify-center rounded-2xl border border-black/10 px-6 py-3 text-sm font-semibold text-ink hover:bg-background"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialType = resolved?.kind === "form" ? resolved.noteType : undefined;

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
        DeenNotes organizes reflection only—it isn’t a scholar or fatwa resource. For rulings,
        consult a qualified imam or scholar.
      </p>
    </div>
  );
}
