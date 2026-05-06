import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedShareCardsSettingsPage() {
  const supabase = await createClient();
  const { data: cards, error } = await supabase
    .from("saved_share_cards")
    .select("id, share_card_text, created_at, deen_note_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-accent hover:underline inline-block mb-4"
        >
          ← Settings
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Saved share cards
        </h1>
        <p className="text-muted text-sm mt-2 leading-relaxed">
          Lightweight copies of reminders you saved from notes.
        </p>
      </div>

      {error ? (
        <p className="text-red-700 text-sm bg-red-50 px-4 py-3 rounded-xl">
          Couldn&apos;t load cards. Refresh and try again.
        </p>
      ) : !cards?.length ? (
        <div className="rounded-3xl border border-dashed border-black/12 px-6 py-14 text-center bg-surface/80">
          <p className="font-semibold text-ink">Nothing saved yet</p>
          <p className="text-sm text-muted mt-3 max-w-sm mx-auto leading-relaxed">
            Open a reflection, preview the reminder card, and tap Save to keep it here alongside your originals.
          </p>
          <Link
            href="/app/notes"
            className="inline-flex mt-8 rounded-full bg-accent text-white px-6 py-2.5 font-semibold text-sm hover:bg-accent-hover"
          >
            Browse notes
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cards.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-black/[0.06] bg-surface p-5 shadow-sm"
            >
              {c.deen_note_id ? (
                <Link
                  href={`/app/notes/${c.deen_note_id}`}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Open source note →
                </Link>
              ) : (
                <p className="text-xs text-muted">Standalone card</p>
              )}
              <p className="text-sm text-ink/90 mt-3 whitespace-pre-wrap leading-relaxed line-clamp-6">
                {c.share_card_text}
              </p>
              <p className="text-xs text-muted mt-4">
                {new Date(c.created_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
